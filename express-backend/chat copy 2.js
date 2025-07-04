const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mediasoup = require("mediasoup");
const cors = require("cors");

const app = express();
app.use(cors());

// // ✅ **Get All Forms**
app.get("/api", async (req, res) => {
  try {
    // const forms = await Form.find();
    res.json({ status: "success", data: "API working fine" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: { origin: "*" }
// });

const io = socketIo(server, {
  cors: { origin: "*" },
  transports: ["websocket"], // ✅ Force WebSockets
  allowEIO3: true, // ✅ Ensure compatibility with older clients
});

let worker, router;
const transports = {};
const producers = {};
const consumers = {};

(async () => {
  worker = await mediasoup.createWorker();
  router = await worker.createRouter({
    mediaCodecs: [
      { kind: "audio", mimeType: "audio/opus", clockRate: 48000, channels: 2 },
      { kind: "video", mimeType: "video/VP8", clockRate: 90000 }
    ]
  });
})();

io.on("connection", async (socket) => {
  console.log("🟢 New user connected:", socket.id);

  // socket.on("createTransport", async ({ direction }, callback) => {
  //   try {
  //     console.log(`🔄 Creating ${direction} transport for ${socket.id}...`);

  //     const transport = await router.createWebRtcTransport({
  //       listenIps: [{ ip: "0.0.0.0", announcedIp: "newport-budapest-organised-nirvana.trycloudflare.com" }], 
  //       enableUdp: true,  
  //       enableTcp: true,  
  //     });

  //     if (!transports[socket.id]) {
  //       transports[socket.id] = {};
  //     }
  //     transports[socket.id][direction] = transport;

  //     console.log(`✅ Transport Created: ${direction} - ${transport.id} for ${socket.id}`);

  //     callback({
  //       id: transport.id,
  //       iceParameters: transport.iceParameters,
  //       iceCandidates: transport.iceCandidates,
  //       dtlsParameters: transport.dtlsParameters,
  //     });
  //   } catch (error) {
  //     console.error("❌ Error creating transport:", error);
  //     callback({ error: error.message });
  //   }
  // });

  socket.on("createTransport", async ({ direction }, callback) => {
    try {
        console.log(`🔄 Creating ${direction} transport for ${socket.id}...`);

        const transport = await router.createWebRtcTransport({
          listenIps: [{ ip: "0.0.0.0", announcedIp: "newport-budapest-organised-nirvana.trycloudflare.com" }], 
          enableUdp: true,
          enableTcp: true,
          preferUdp: true,
          iceServers: [
              { urls: "stun:stun.l.google.com:19302" }, // ✅ Google's Public STUN Server
              {
                  urls: "turn:turn.anyfirewall.com:3478?transport=udp",
                  username: "webrtc",
                  credential: "webrtc"
              }
          ]
      });

        if (!transports[socket.id]) {
            transports[socket.id] = {};
        }
        transports[socket.id][direction] = transport;

        console.log(`✅ Transport Created: ${direction} - ${transport.id} for ${socket.id}`);

        // ✅ Fix ICE gathering issue
        transport.on("icecandidate", (candidate) => {
            console.log("📡 ICE Candidate:", candidate);
            socket.emit("iceCandidate", candidate);
        });

        transport.on("icestatechange", (state) => {
          console.log(`🌍 ICE State Change: ${state} for ${socket.id}`);
      });
      
      transport.on("dtlsstatechange", (state) => {
          console.log(`🔒 DTLS State Change: ${state} for ${socket.id}`);
      });

        callback({
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
        });
    } catch (error) {
        console.error("❌ Error creating transport:", error);
        callback({ error: error.message });
    }
});

  socket.on("getRtpCapabilities", (callback) => {
    if (!router) return callback({ error: "Router not initialized" });
    callback({ rtpCapabilities: router.rtpCapabilities });
  });

  socket.on("produce", async ({ kind, rtpParameters }, callback = () => {}) => {
    try {
      console.log(`📡 Producing ${kind} for ${socket.id}...`);

      if (!transports[socket.id] || !transports[socket.id].send) {
        console.error("❌ No send transport found for", socket.id);
        return callback({ error: "Send transport not found" });
      }

      if (producers[socket.id] && producers[socket.id].some(p => p.kind === kind)) {
        console.warn(`⚠️ Producer for ${kind} already exists for ${socket.id}, skipping...`);
        return callback({ error: `Producer for ${kind} already exists` });
      }

      const producer = await transports[socket.id].send.produce({ kind, rtpParameters });

      if (!producers[socket.id]) producers[socket.id] = [];
      producers[socket.id].push(producer);

      console.log(`✅ Producer Created: ${producer.id} for ${socket.id}`);

      callback({ id: producer.id });

      // 🔥 FIX: Broadcast new producer immediately
      io.emit("newProducer", { producerId: producer.id });
    } catch (error) {
      console.error("❌ Error producing:", error);
      callback({ error: error.message });
    }
  });

  // socket.on("consume", async ({ producerId, rtpCapabilities }, callback) => {
  //   try {
  //     console.log(`👀 Consuming producer ${producerId} for ${socket.id}...`);

  //     if (!router.canConsume({ producerId, rtpCapabilities })) {
  //       console.error("❌ Cannot consume this producer", producerId);
  //       return callback({ error: "Cannot consume" });
  //     }

  //     if (!transports[socket.id] || !transports[socket.id].receive) {
  //       console.error("❌ No receive transport found for", socket.id);
  //       return callback({ error: "Receive transport not found" });
  //     }

  //     const consumer = await transports[socket.id].receive.consume({
  //       producerId,
  //       rtpCapabilities,
  //       paused: false,
  //     });

  //     if (!consumers[socket.id]) consumers[socket.id] = [];
  //     consumers[socket.id].push(consumer);

  //     console.log(`✅ Consumer Created: ${consumer.id} for ${socket.id}`);

  //     callback({
  //       id: consumer.id,
  //       producerId,
  //       kind: consumer.kind,
  //       rtpParameters: consumer.rtpParameters,
  //     });

  //     consumer.resume();
  //   } catch (error) {
  //     console.error("❌ Error consuming:", error);
  //     callback({ error: error.message });
  //   }
  // });

  socket.on("consume", async ({ producerId, rtpCapabilities }, callback) => {
    try {
        console.log(`👀 Consuming producer ${producerId} for ${socket.id}...`);

        if (!router.canConsume({ producerId, rtpCapabilities })) {
            console.error("❌ Cannot consume this producer", producerId);
            return callback({ error: "Cannot consume" });
        }

        if (!transports[socket.id] || !transports[socket.id].receive) {
            console.error("❌ No receive transport found for", socket.id);
            return callback({ error: "Receive transport not found" });
        }

        const consumer = await transports[socket.id].receive.consume({
            producerId,
            rtpCapabilities,
            paused: false,
        });

        if (!consumers[socket.id]) consumers[socket.id] = [];
        consumers[socket.id].push(consumer);

        console.log(`✅ Consumer Created: ${consumer.id} for ${socket.id}`);

        callback({
            id: consumer.id,
            producerId,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
        });

        // ✅ Ensure consumer track is unmuted
        setTimeout(() => {
            consumer.resume();
            console.log(`▶️ Consumer ${consumer.id} resumed!`);
        }, 500);
    } catch (error) {
        console.error("❌ Error consuming:", error);
        callback({ error: error.message });
    }
});

  socket.on("requestProducers", () => {
    console.log(`🔄 ${socket.id} requested all producers...`);
    for (const userId in producers) {
      producers[userId].forEach((producer) => {
        socket.emit("newProducer", { producerId: producer.id });
      });
    }
  });

  socket.on("message", (msg) => {
    console.log("💬 New message:", msg);
    io.emit("message", { user: socket.id, text: msg });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// server.listen(5000, () => console.log("🚀 Server running on port 5000"));
const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

