// App.jsx
import React, { useState, useRef } from "react";

export default function AudioToText({audioToText}) {
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    setTranscript("");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice.webm");

      const res = await fetch("http://localhost:4000/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setTranscript(data.text || "No text returned");
      audioToText(data.text)
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div style={{ padding: 20 }}>
      {/* <h1>🎤 Voice to Text (Whisper)</h1> */}
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? "🛑 Stop Recording" : "🎙️ Start Recording"}
      </button>
      <p>
        <strong>Transcript:</strong> {transcript}
      </p>
    </div>
  );
}
