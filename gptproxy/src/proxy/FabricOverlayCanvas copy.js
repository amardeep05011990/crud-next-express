import React, { useEffect, useRef } from "react";
import { Canvas, PencilBrush, util } from "fabric";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_API_URL);

export default function FabricOverlayCanvas({ messageId }) {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = new Canvas(canvasRef.current, {
      width: 500,
      height: 80,
      selection: false,
    });

    // ✅ Set the drawing brush
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 2;
    canvas.freeDrawingBrush.color = "#ff0000";

    // ✅ Enable drawing mode
    canvas.isDrawingMode = true;

    // 🔁 Listen for drawing updates
    socket.on("draw-event", (data) => {
      if (data.messageId === messageId) {
        util.enlivenObjects([data.object], (objects) => {
          objects.forEach((obj) => canvas.add(obj));
        });
      }
    });

    // ✏️ Emit drawing path
    canvas.on("path:created", (e) => {
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
  }, [messageId]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "auto",
        zIndex: 1,
        background: "transparent",
      }}
    />
  );
}
