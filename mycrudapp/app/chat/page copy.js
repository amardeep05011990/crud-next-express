"use client"
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
const apiUrl = process.env.NEXT_PUBLIC_URL;
const socket = io(`${apiUrl}`);

export default function Home() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  let device, sendTransport, recvTransport, producer;
  let producerExists = false; // ✅ Prevent multiple producers


  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("newProducer", async ({ producerId }) => {
      if (device && device.loaded) {
        consume(producerId);
      }
    });

    socket.on("produce", (data) => {
        console.log("produce")
      });

      socket.on("consume", (data) => {
        console.log("consume")
      });

    startMedia();
  }, []);

  async function startMedia() {
    console.log("🎥 Requesting media...");

    if (!device) {
        device = new mediasoupClient.Device();
    } else if (device.loaded) {
        console.warn("⚠️ Device is already loaded, skipping...");
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = stream;

        socket.emit("getRtpCapabilities", (response) => {
            if (response.error) {
                console.error("❌ Error getting RTP Capabilities:", response.error);
                return;
            }

            device.load({ routerRtpCapabilities: response.rtpCapabilities })
                .then(async () => {
                    console.log("✅ RTP Capabilities Loaded");

                    sendTransport = await createTransport("send");
                    recvTransport = await createTransport("receive");

                    // 🛠️ ✅ FIX: Ensure producer is only created ONCE
                    if (!producerExists) {
                        producerExists = true;
                        const producer = await sendTransport.produce({
                            track: stream.getVideoTracks()[0],
                        });

                        console.log("📡 Producer created:", producer.id);
                        socket.emit("produce", { kind: "video", rtpParameters: producer.rtpParameters });
                        
                    }
                })
                .catch(err => console.error("❌ Error loading RTP Capabilities:", err));
        });
    } catch (error) {
        console.error("❌ Error getting user media:", error);
    }
    // sendTransport = await createTransport("send");
    // recvTransport = await createTransport("receive");
    // producer = await sendTransport.produce({ track: stream.getVideoTracks()[0] });
    // socket.emit("produce", { kind: "video", rtpParameters: producer.rtpParameters });
  }

//   async function createTransport(type) {
//     return new Promise((resolve) => {
//       socket.emit("createTransport", {}, (data) => {
//         console.log("createTransport")
//         const transport = type === "send"
//           ? device.createSendTransport(data)
//           : device.createRecvTransport(data);

//         transport.on("connect", ({ dtlsParameters }, callback) => {
//           socket.emit("connectTransport", { dtlsParameters });
//           callback();
//         });

//         resolve(transport);
//       });
//     });
//   }

async function createTransport(direction) {
    return new Promise((resolve) => {
        socket.emit("createTransport", { direction }, (data) => {
            if (data.error) {
                console.error("❌ Transport creation error:", data.error);
                return;
            }

            const transport = direction === "send"
                ? device.createSendTransport(data)
                : device.createRecvTransport(data);

            transport.on("connect", ({ dtlsParameters }, callback) => {
                console.log(`🔗 Connecting ${direction} transport...`);
                socket.emit("connectTransport", { dtlsParameters });
                callback();
            });

            // 🛠️ ✅ Fix: Set the "produce" listener (ONLY for send transport)
            if (direction === "send") {
                transport.on("produce", ({ kind, rtpParameters }, callback) => {
                    console.log(`📡 Producing ${kind}...`);
                    socket.emit("produce", { kind, rtpParameters }, ({ id }) => {
                        callback({ id });
                    });
                });
            }

            console.log(`✅ Transport Created: ${direction}`);
            resolve(transport);
        });
    });
}


//   async function consume(producerId) {
//     socket.emit("consume", { producerId, rtpCapabilities: device.rtpCapabilities }, (data) => {
//         if (data.error) {
//             console.error("Error consuming:", data.error);
//             return;
//         }
//         console.log("consume=========>>>>>>>>>>>")
//       const consumer = recvTransport.consume({
//         id: data.id,
//         producerId: data.producerId,
//         kind: data.kind,
//         rtpParameters: data.rtpParameters,
//       });

//       const stream = new MediaStream();
//       stream.addTrack(consumer.track);
//       remoteVideoRef.current.srcObject = stream;
//     });
//   }

async function consume(producerId) {
    socket.emit("consume", { producerId, rtpCapabilities: device.rtpCapabilities }, async (data) => {
        if (data.error) {
            console.error("❌ Error consuming:", data.error);
            return;
        }

        // 🛠️ ✅ FIX: Ensure track is valid before adding it
        if (!data.rtpParameters) {
            console.error("❌ No RTP Parameters received for consumer.");
            return;
        }

        const consumer = await recvTransport.consume({
            id: data.id,
            producerId: data.producerId,
            kind: data.kind,
            rtpParameters: data.rtpParameters,
        });

        if (!consumer.track) {
            console.error("❌ Consumer track is undefined!");
            return;
        }

        console.log(`✅ Consumer Created: ${consumer.id} - Kind: ${consumer.kind}`);

        const stream = new MediaStream();
        stream.addTrack(consumer.track); // ✅ Add valid track only

        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play(); // Ensure video starts playing
    });
}


  function sendMessage() {
    socket.emit("message", message);
    setMessage("");
  }

  return (
    <div>
      <h2>Video Chat with Text Chat</h2>
      <div style={{ display: "flex", gap: "20px" }}>
        <video ref={localVideoRef} autoPlay playsInline width="300" />
        <video ref={remoteVideoRef} autoPlay playsInline width="300" />
      </div>
      <div>
        <h3>Chat</h3>
        <div style={{ border: "1px solid #ccc", height: "200px", overflow: "auto" }}>
          {messages.map((msg, index) => (
            <p key={index}><b>{msg.user}:</b> {msg.text}</p>
          ))}
        </div>
        input <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
