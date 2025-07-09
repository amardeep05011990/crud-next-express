import { useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000"); // Make sure backend socket is ready

export default function VoiceStreamer() {
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    async function startStreaming() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          socket.emit("audio_chunk", event.data);
        };

        mediaRecorder.start(1000); // Send every 1 second

        socket.on("transcription", (text) => {
          console.log("Received text:", text);
          // You can update state to display live transcriptions
        });

      } catch (err) {
        console.error("Mic access error:", err);
      }
    }

    startStreaming();

    // return () => {
    //   mediaRecorderRef.current?.stop();
    //   socket.disconnect();
    // };
  }, []);

  return <div>🎤 Live audio streaming enabled</div>;
}
