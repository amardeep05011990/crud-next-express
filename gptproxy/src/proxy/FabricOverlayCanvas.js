import React, { useEffect, useRef } from "react";
import { Canvas, PencilBrush, util } from "fabric";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_API_URL);

export default function FabricOverlayCanvas({
  messageId,
  height = 120,
  isDraw,
  brushType = "pencil",      // "pencil" or "highlighter"
  brushColor = "#ff0000"     // "#ff0000", "#00ff00", "#ffff00"
}) {
  const canvasRef = useRef();
  const fabricCanvasRef = useRef();

  useEffect(() => {
    const canvas = new Canvas(canvasRef.current, {
      width: canvasRef.current?.parentElement?.offsetWidth || 500,
      height,
      selection: false,
    });
    fabricCanvasRef.current = canvas;

    const brush = new PencilBrush(canvas);
    brush.width = 2;
    brush.color = brushColor;
    canvas.freeDrawingBrush = brush;
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

  function hexToRGBA(hex, opacity) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

  // ✅ Update brush type, color, and mode
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const brush = new PencilBrush(canvas);

    // Use RGBA for opacity (especially for highlighter)
    const color =
      brushType === "highlighter"
        ? hexToRGBA(brushColor, 0.3)
        : brushColor;
    brush.color = color;
    brush.width = brushType === "highlighter" ? 12 : 2;
    // brush.opacity = brushType === "highlighter" ? 0.3 : 0.3;

    canvas.freeDrawingBrush = brush;
    canvas.isDrawingMode = isDraw;

    const canvasEl = canvasRef.current;
    if (canvasEl) {
      canvasEl.style.pointerEvents = isDraw ? "auto" : "none";
      canvasEl.style.touchAction = isDraw ? "none" : "auto";
      canvasEl.style.userSelect = isDraw ? "none" : "auto";
    }
  }, [isDraw, brushType, brushColor]);

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
      }}
    />
  );
}
