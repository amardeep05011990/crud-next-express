import React, { useEffect, useRef } from "react";
import { Canvas, PencilBrush, util } from "fabric";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_API_URL);

export default function FabricOverlayCanvas({ messageId, height = 120, isDraw }) {
  const canvasRef = useRef();
  const fabricCanvasRef = useRef();

  useEffect(() => {
    const canvas = new Canvas(canvasRef.current, {
      width: canvasRef.current?.parentElement?.offsetWidth || 500,
      height,
      selection: false,
    });
    fabricCanvasRef.current = canvas;

    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 2;
    canvas.freeDrawingBrush.color = "#ff0000";
    canvas.isDrawingMode = isDraw;

    socket.on("draw-event", async (data) => {
      if (data.messageId === messageId) {
        util.enlivenObjects([data.object]).then((objects) => {
          objects.forEach((obj) => canvas.add(obj));
        });
      }
    });

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
  }, [messageId, height]);

  // ✅ Update drawing mode and pointer styles
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = isDraw;
    }

    // Update canvas DOM element styles directly
    const canvasEl = canvasRef.current;
    if (canvasEl) {
    canvasEl.style.pointerEvents = isDraw ? "auto" : "none";
    canvasEl.style.touchAction = isDraw ? "none" : "auto"; // Allow scrolling on mobile
    canvasEl.style.userSelect = isDraw ? "none" : "auto";  // Allow text selection
    }
  }, [isDraw]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 2,
        width: "100%",
        height: `${height}px`,
        backgroundColor: "transparent",
        // pointerEvents: isDraw ? "auto" : "none",
        // touchAction: isDraw ? "none" : "auto",
        // userSelect: "none",
      }}
    />
  );
}
