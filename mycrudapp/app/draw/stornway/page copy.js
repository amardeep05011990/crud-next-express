"use client";

import React, { useEffect, useRef } from "react";

export default function VideoFlowEditor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    let fabricInstance;
    import("fabric").then((mod) => {
      const fabric = mod.fabric || mod;

      const canvas = new fabric.Canvas("flow-canvas", {
        width: 1000,
        height: 600,
        backgroundColor: "#f7f7f7",
      });

      canvasRef.current = canvas;

      const addNode = (left, top, title = "Video Node") => {
        const rect = new fabric.Rect({
          width: 150,
          height: 80,
          fill: "#fff",
          stroke: "#000",
          strokeWidth: 1,
          rx: 10,
          ry: 10,
        });

        const label = new fabric.Text(title, {
          fontSize: 16,
          originX: "center",
          originY: "center",
        });

        const group = new fabric.Group([rect, label], {
          left,
          top,
          hasControls: true,
          lockScalingFlip: true,
        });

        canvas.add(group);
        return group;
      };

      // Add two nodes
      const nodeA = addNode(150, 150, "Intro");
      const nodeB = addNode(400, 300, "Branch A");

      // Draw line between nodes
      const connectNodes = (from, to) => {
        const fromCenter = from.getCenterPoint();
        const toCenter = to.getCenterPoint();

        const line = new fabric.Line(
          [fromCenter.x, fromCenter.y, toCenter.x, toCenter.y],
          {
            stroke: "#666",
            strokeWidth: 2,
            selectable: false,
            evented: false,
          }
        );

        canvas.add(line);
        canvas.sendToBack(line);
      };

      connectNodes(nodeA, nodeB);
    });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>🎬 Stornaway-style Video Flow Editor</h2>
      <canvas id="flow-canvas" />
    </div>
  );
}
