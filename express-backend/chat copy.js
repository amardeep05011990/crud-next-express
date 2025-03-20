const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mediasoup = require("mediasoup");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

let worker, router;
// let transports = [];
// let producers = [];
// let consumers = [];


const transports = {}; // Store transports per socket.id
const producers = {};  // Store producers per socket.id
const consumers = {};  // Store consumers per socket.id


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
  console.log("New user connected:", socket.id);

socket.on("createTransport", async ({ direction }, callback) => {
    try {
        console.log(`🔄 Creating ${direction} transport for ${socket.id}...`);

        const transport = await router.createWebRtcTransport({
            listenIps: [{ ip: "0.0.0.0", announcedIp: "2aa7c3dec752823d1cab75ddcab02e2c.serveo.net" }], 
            enableUdp: true,  
            enableTcp: true,  
        });

        // 🛠️ ✅ Fix: Store transport by socket.id
        if (!transports[socket.id]) {
            transports[socket.id] = {};
        }
        transports[socket.id][direction] = transport;

        console.log(`✅ Transport Created: ${direction} - ${transport.id} for ${socket.id}`);

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


// socket.on("createTransport", async ({ direction }, callback) => {
//     try {
//     console.log("createTransport=====")

//         const transport = await router.createWebRtcTransport({
//             listenIps: [{ ip: "0.0.0.0", announcedIp: "c612c113d3708950fd01eee3cc6ba8c7.serveo.net" }], // Change to your server IP
//             enableUdp: true,  // WebRTC prefers UDP (but Serveo might block it)
//             enableTcp: true,  // Ensure TCP fallback
//         });

//         transports[socket.id] = transport;

//         console.log("Transport created successfully:", transport.id);

//         transport.on("dtlsstatechange", (state) => {
//             if (state === "closed") {
//                 transport.close();
//             }
//         });

//         callback({
//             id: transport.id,
//             iceParameters: transport.iceParameters,
//             iceCandidates: transport.iceCandidates,
//             dtlsParameters: transport.dtlsParameters,
//         });
//     } catch (error) {
//         console.error("Error creating transport:", error);
//         callback({ error: error.message });
//     }
// });

socket.on("getRtpCapabilities", (callback) => {
  if (!router) return callback({ error: "Router not initialized" });
  callback({ rtpCapabilities: router.rtpCapabilities });
});

// socket.on("produce", async ({ kind, rtpParameters }, callback) => {
//   try {
//       console.log(`📡 Producing ${kind} for ${socket.id}...`);

//       if (!transports[socket.id] || !transports[socket.id].send) {
//           console.error("❌ No send transport found for", socket.id);
//           return callback({ error: "Send transport not found" });
//       }

//       // 🛠️ ✅ Fix: Access correct transport for this socket
//       const producer = await transports[socket.id].send.produce({ kind, rtpParameters });

//       // Store producer per socket
//       if (!producers[socket.id]) producers[socket.id] = [];
//       producers[socket.id].push(producer);

//       console.log(`✅ Producer Created: ${producer.id} for ${socket.id}`);

//       callback({ id: producer.id });

//       socket.broadcast.emit("newProducer", { producerId: producer.id });
//   } catch (error) {
//       console.error("❌ Error producing:", error);
//       callback({ error: error.message });
//   }
// });

socket.on("produce", async ({ kind, rtpParameters }, callback = () => {}) => {
  try {
      console.log(`📡 Producing ${kind} for ${socket.id}...`);

      if (!transports[socket.id] || !transports[socket.id].send) {
          console.error("❌ No send transport found for", socket.id);
          return callback({ error: "Send transport not found" });
      }

      // ✅ FIX: Prevent multiple producers for the same kind
      if (producers[socket.id] && producers[socket.id].some(p => p.kind === kind)) {
          console.warn(`⚠️ Producer for ${kind} already exists for ${socket.id}, skipping...`);
          return callback({ error: `Producer for ${kind} already exists` });
      }

      // Create producer
      const producer = await transports[socket.id].send.produce({ kind, rtpParameters });

      if (!producers[socket.id]) producers[socket.id] = [];
      producers[socket.id].push(producer);

      console.log(`✅ Producer Created: ${producer.id} for ${socket.id}`);

      callback({ id: producer.id });

      socket.broadcast.emit("newProducer", { producerId: producer.id });
  } catch (error) {
      console.error("❌ Error producing:", error);
      callback({ error: error.message });
  }
});


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

      consumer.resume();
  } catch (error) {
      console.error("❌ Error consuming:", error);
      callback({ error: error.message });
  }
});


  // socket.on("produce", async ({ kind, rtpParameters }, callback) => {
  //   console.log("produce=====")

  //   const producer = await transports[0].produce({ kind, rtpParameters });
  //   producers.push(producer);
  //   callback({ id: producer.id });
  //   socket.broadcast.emit("newProducer", { producerId: producer.id });
  // });

  // socket.on("consume", async ({ producerId, rtpCapabilities }, callback) => {
  //   console.log("consume=====")

  //   if (!router.canConsume({ producerId, rtpCapabilities })) {
  //     return callback({ error: "Cannot consume" });
  //   }

    // const consumer = await transports[0].consume({
    //   producerId,
    //   rtpCapabilities,
    //   paused: false,
    // });

    // consumers.push(consumer);
    // callback({
    //   id: consumer.id,
    //   producerId,
    //   kind: consumer.kind,
    //   rtpParameters: consumer.rtpParameters,
    // });
  // });


  socket.on("message", (msg) => {
    console.log("get message", msg)
    io.emit("message", { user: socket.id, text: msg });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
