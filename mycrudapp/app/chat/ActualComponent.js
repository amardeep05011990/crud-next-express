"use client";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
// import dynamic from "next/dynamic";

const apiUrl = process.env.NEXT_PUBLIC_URL;
// const socket = io(`${apiUrl}`);
const socket = io(`${apiUrl}`, {
  transports: ["websocket"],  // ✅ Force WebSockets
  upgrade: false,             // ✅ Prevents fallback to polling
});

 function ActualComponent() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  let device, sendTransport, recvTransport, producer;
  let producerExists = false;
  let transportCreated = false;

  useEffect(() => {
  if (typeof window === "undefined") return; // ✅ Prevent SSR issues
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("newProducer", async ({ producerId }) => {
      console.log(`🆕 New Producer Available: ${producerId}`);
      consume(producerId);
    });

        // ✅ Handle ICE Candidates from Server
        socket.on("iceCandidate", (candidate) => {
            console.log("📡 Received ICE Candidate:", candidate);
            if (recvTransport) {
                recvTransport.addIceCandidate(candidate)
                    .then(() => console.log("✅ ICE Candidate added successfully"))
                    .catch(err => console.error("❌ Error adding ICE Candidate:", err));
            }
        });

    // startMedia();
    if (typeof window !== "undefined") {  // ✅ Fix Hydration Mismatch
      startMedia();
    }
  }, []);

  // async function startMedia() {
  //   console.log("🎥 Requesting media...");

  //   if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  //     console.error("❌ `getUserMedia` is not supported in this browser.");
  //     // alert("Your browser does not support WebRTC or camera/microphone access is blocked.");
  //     return;
  // }

  //   if (!device) {
  //     device = new mediasoupClient.Device();
  //   } else if (device.loaded) {
  //     console.warn("⚠️ Device is already loaded, skipping...");
  //     return;
  //   }

  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  //     localVideoRef.current.srcObject = stream;

  //     socket.emit("getRtpCapabilities", async (response) => {
  //       if (response.error) {
  //         console.error("❌ Error getting RTP Capabilities:", response.error);
  //         return;
  //       }

  //       await device.load({ routerRtpCapabilities: response.rtpCapabilities });
  //       console.log("✅ RTP Capabilities Loaded");

  //       if (!transportCreated) {
  //         sendTransport = await createTransport("send");
  //         recvTransport = await createTransport("receive");
  //         transportCreated = true;
  //       }

  //       // ✅ Ensure producer is created only once
  //       if (!producerExists) {
  //         producerExists = true;
  //         producer = await sendTransport.produce({
  //           track: stream.getVideoTracks()[0],
  //         });

  //         console.log("📡 Producer created:", producer.id);
  //         socket.emit("produce", { kind: "video", rtpParameters: producer.rtpParameters });

  //         // ✅ Manually request all producers
  //         setTimeout(() => {
  //           socket.emit("requestProducers");
  //         }, 1000);
  //       }
  //     });
  //   } catch (error) {
  //     console.error("❌ Error getting user media:", error);
  //   }
  // }

  // async function createTransport(direction) {
  //   return new Promise((resolve) => {
  //     socket.emit("createTransport", { direction }, (data) => {
  //       if (data.error) {
  //         console.error("❌ Transport creation error:", data.error);
  //         return;
  //       }

  //       const transport = direction === "send"
  //         ? device.createSendTransport(data)
  //         : device.createRecvTransport(data);

  //       transport.on("connect", ({ dtlsParameters }, callback) => {
  //         console.log(`🔗 Connecting ${direction} transport...`);
  //         socket.emit("connectTransport", { dtlsParameters });
  //         callback();
  //       });

  //       if (direction === "send") {
  //         transport.on("produce", ({ kind, rtpParameters }, callback) => {
  //           console.log(`📡 Producing ${kind}...`);
  //           socket.emit("produce", { kind, rtpParameters }, ({ id }) => {
  //             callback({ id });
  //           });
  //         });
  //       }

  //       console.log(`✅ Transport Created: ${direction}`);
  //       resolve(transport);
  //     });
  //   });
  // }

  async function startMedia() {
    console.log("🎥 Requesting media...");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("❌ `getUserMedia` is not supported in this browser.");
        return;
    }

    if (!device) {
        device = new mediasoupClient.Device(); // ✅ Create device only if it doesn't exist
    } else if (device.loaded) {
        console.warn("⚠️ Device is already loaded, skipping...");
        return; // ✅ Skip loading again if already loaded
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = stream;
        if(!device.loaded){
            socket.emit("getRtpCapabilities", async (response) => {
                if (response.error) {
                    console.error("❌ Error getting RTP Capabilities:", response.error);
                    return;
                }

                if (!device.loaded) {
                    await device.load({ routerRtpCapabilities: response.rtpCapabilities });
                    console.log("✅ RTP Capabilities Loaded");
                } else {
                    console.warn("⚠️ Skipping `device.load()`, already loaded!");
                }

                if (!transportCreated) {
                    sendTransport = await createTransport("send");
                    recvTransport = await createTransport("receive");
                    transportCreated = true;
                }

                if (!producerExists) {
                    producerExists = true;
                    producer = await sendTransport.produce({
                        track: stream.getVideoTracks()[0],
                    });

                    console.log("📡 Producer created:", producer.id);
                    socket.emit("produce", { kind: "video", rtpParameters: producer.rtpParameters });

                    setTimeout(() => {
                        socket.emit("requestProducers");
                    }, 1000);
                }
            });
        }

    } catch (error) {
        console.error("❌ Error getting user media:", error);
    }
}



  async function createTransport(direction) {
    return new Promise((resolve) => {
        socket.emit("createTransport", { direction }, (data) => {
            if (data.error) {
                console.error("❌ Transport creation error:", data.error);
                return;
            }

            // ✅ Create send/receive transport (Equivalent to PeerConnection)
            const transport = direction === "send"
                ? device.createSendTransport(data)
                : device.createRecvTransport(data);

        transport.on("connect", ({ dtlsParameters }, callback) => {
          console.log(`🔗 Connecting ${direction} transport...`);
          socket.emit("connectTransport", { dtlsParameters });
          callback();
        });
            // // ✅ Ensure ICE and DTLS connection is handled
            // transport.on("connect", ({ dtlsParameters }, callback, errback) => {
            //     console.log(`🔗 Connecting ${direction} transport with DTLS...`);
            //     socket.emit("connectTransport", { transportId: data.id, dtlsParameters }, (response) => {
            //         console.log("response connectTransport=====>>>>>>", response)
            //         if (response.error) {
            //             console.error("❌ DTLS Connection Error:", response.error);
            //             errback(response.error);
            //         } else {
            //             callback();
            //         }
            //     });
            // });

            // ✅ Send Transport produces media (equivalent to adding a track)
            if (direction === "send") {
                transport.on("produce", ({ kind, rtpParameters }, callback) => {
                    console.log(`📡 Producing ${kind}...`);
                    socket.emit("produce", { transportId: data.id, kind, rtpParameters }, ({ id }) => {
                        callback({ id });
                    });
                });
            }

            console.log(`✅ Transport Created: ${direction}`);
            resolve(transport);
        });
    });
}


  // async function consume(producerId) {
  //   console.log(`👀 Trying to consume producer: ${producerId}`);

  //   socket.emit("consume", { producerId, rtpCapabilities: device.rtpCapabilities }, async (data) => {
  //     if (data.error) {
  //       console.error("❌ Error consuming:", data.error);
  //       return;
  //     }

  //     if (!data.rtpParameters) {
  //       console.error("❌ No RTP Parameters received for consumer.");
  //       return;
  //     }

  //     const consumer = await recvTransport.consume({
  //       id: data.id,
  //       producerId: data.producerId,
  //       kind: data.kind,
  //       rtpParameters: data.rtpParameters,
  //     });
  //     console.log(" consumer:", consumer);

  //     if (!consumer.track) {
  //       console.error("❌ Consumer track is undefined!");
  //       return;
  //     }

  //     console.log(`✅ Consumer Created: ${consumer.id} - Kind: ${consumer.kind}`);

  //     const stream = new MediaStream();
  //     stream.addTrack(consumer.track);
  //     // console.log(stream)

  //     // remoteVideoRef.current.srcObject = stream;
  //     // remoteVideoRef.current.play();

  //     console.log("📡 Received Stream:", stream);

  //     // ✅ FIX: Ensure the video element is ready before setting the stream
  //     remoteVideoRef.current.srcObject = stream;
  //     remoteVideoRef.current.onloadedmetadata = () => {
  //         console.log("🎥 Video metadata loaded, playing stream...");
  //         remoteVideoRef.current.play()
  //             .then(() => console.log("✅ Video playback started"))
  //             .catch(error => console.error("❌ Play error:", error));
  //     };

  //     remoteVideoRef.current.onplaying = () => {
  //         console.log("🎥 Video is playing successfully!");
  //     };
  //   });
  // }
  async function consume(producerId) {
    console.log(`👀 Trying to consume producer: ${producerId}`);

    if (!recvTransport) {
        console.error("❌ Receive transport is not ready!");
        return;
    }

    socket.emit("consume", { producerId, rtpCapabilities: device.rtpCapabilities }, async (data) => {
        if (data.error) {
            console.error("❌ Error consuming:", data.error);
            return;
        }

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

        // ✅ Ensure track is unmuted
        consumer.track.enabled = true;
        consumer.track.onmute = () => {
            console.warn("⚠️ Consumer track is muted, trying to unmute...");
            consumer.track.enabled = true;
            consumer.resume();
        };

        consumer.track.onunmute = () => {
            console.log("🎥 Consumer track is now unmuted.");
        };

        // ✅ Fix: Ensure track is added to the video element
        const stream = new MediaStream();
        stream.addTrack(consumer.track);
        remoteVideoRef.current.srcObject = stream;

        // ✅ Debugging
        console.log("📡 Received Stream:", stream);
        console.log("📡 Stream Tracks:", stream.getTracks());

        remoteVideoRef.current.onloadedmetadata = () => {
            console.log("🎥 Video metadata loaded, playing stream...");
            remoteVideoRef.current.play()
                .then(() => console.log("✅ Video playback started"))
                .catch(error => console.error("❌ Play error:", error));
        };

        remoteVideoRef.current.onplaying = () => {
            console.log("🎥 Video is playing successfully!");
        };
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
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}



// ✅ Wrap with `dynamic()` to prevent SSR issues
// const Home = dynamic(() => Promise.resolve(ActualComponent), { ssr: false });

export default ActualComponent;