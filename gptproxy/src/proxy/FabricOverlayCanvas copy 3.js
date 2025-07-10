import React, { useEffect, useRef } from "react";
import { Canvas, PencilBrush, util } from "fabric";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_API_URL);

export default function FabricOverlayCanvas({ messageId, height = 120, isDraw }) {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = new Canvas(canvasRef.current, {
      width: canvasRef.current?.parentElement?.offsetWidth || 500,
      height,
      selection: false,
    });

    // ✅ Set brush for drawing
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 2;
    canvas.freeDrawingBrush.color = "#ff0000";
    canvas.isDrawingMode = isDraw;

    // 🔁 Receive remote drawing
    socket.on("draw-event", async (data) => {
      console.log("draw event data ==>>> ", data)
      if (data.messageId === messageId) {
    util.enlivenObjects([data.object])
          .then((objects) => {
      console.log("draw event objects ==>>> ", objects)

          objects.forEach((obj) => canvas.add(obj));
        })
      }
    });

    // ✏️ Broadcast path on draw
    canvas.on("path:created", (e) => {
      console.log("convas draw data", e.path)
      console.log("e.path.toObject()", e.path.toObject([
          "type",
          "left",
          "top",
          "path",
          "stroke",
          "strokeWidth",
        ]))
      socket.emit("draw-event", {
        messageId,
        object: e.path.toObject([
          "type",
          "left",
          "top",
          "path",
          "stroke",
          "strokeWidth",
        ]),
      });
    });

    return () => {
      canvas.dispose();
      socket.off("draw-event");
    };
  }, [messageId, height, isDraw]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "auto",
        zIndex: 2,
        backgroundColor: "transparent",
        width: "100%",
        height: `${height}px`,
      }}
    />
  );
}
