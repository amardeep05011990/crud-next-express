"use client";

import React, { useEffect, useRef, useState } from "react";

export default function StornawayFlowEditor() {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const [nodeCount, setNodeCount] = useState(1);
  const fromPortRef = useRef(null);
  const lineRef = useRef(null);
  const connectionsRef = useRef([]);

  useEffect(() => {
    import("fabric").then((mod) => {
      const fabric = mod.fabric || mod;
      fabricRef.current = fabric;

      if (canvasRef.current) canvasRef.current.dispose();

      const canvas = new fabric.Canvas("flow-canvas", {
        width: 1000,
        height: 600,
        backgroundColor: "#f9f9f9",
      });

      canvasRef.current = canvas;

      canvas.on("mouse:move", (opt) => {
        if (lineRef.current) {
          const pointer = canvas.getPointer(opt.e);
          lineRef.current.set({ x2: pointer.x, y2: pointer.y });
          canvas.renderAll();
        }
      });

      canvas.on("mouse:up", (opt) => {
        if (lineRef.current && opt.target && opt.target.nodeType === "node") {
          const toNode = opt.target;
          const fromPort = fromPortRef.current;
          const fromNode = fromPort.parent;

          const fromCenter = fromPort.getCenterPoint();
          const toCenter = toNode.getCenterPoint();

          lineRef.current.set({
            x1: fromCenter.x,
            y1: fromCenter.y,
            x2: toCenter.x,
            y2: toCenter.y,
          });

          lineRef.current.from = fromNode;
          lineRef.current.to = toNode;

          connectionsRef.current.push(lineRef.current);
          canvas.sendToBack(lineRef.current);
          lineRef.current = null;
          fromPortRef.current = null;
        } else {
          canvas.remove(lineRef.current);
          lineRef.current = null;
          fromPortRef.current = null;
        }
        canvas.renderAll();
      });

      canvas.on("object:moving", (e) => {
        const moved = e.target;
        if (moved.nodeType !== "node") return;
        connectionsRef.current.forEach((line) => {
          const fromCenter = line.from.getCenterPoint();
          const toCenter = line.to.getCenterPoint();
          line.set({
            x1: fromCenter.x,
            y1: fromCenter.y,
            x2: toCenter.x,
            y2: toCenter.y,
          });
        });
        canvas.renderAll();
      });
    });
  }, []);

  const addNode = () => {
    const fabric = fabricRef.current;
    const canvas = canvasRef.current;
    const id = `Node ${nodeCount}`;
    setNodeCount((prev) => prev + 1);

    const rect = new fabric.Rect({
      width: 150,
      height: 80,
      fill: "#fff",
      stroke: "#333",
      rx: 10,
      ry: 10,
    });

    const label = new fabric.Text(id, {
      fontSize: 16,
      originX: "center",
      originY: "center",
    });

    const port = new fabric.Circle({
      radius: 6,
      fill: "blue",
      left: 140,
      top: 35,
      originX: "center",
      originY: "center",
      hasControls: false,
      hasBorders: false,
      selectable: false,
    });

    const group = new fabric.Group([rect, label, port], {
      left: 100 + Math.random() * 600,
      top: 100 + Math.random() * 300,
      hasControls: true,
      lockScalingFlip: true,
      objectCaching: false,
    });

    group.nodeType = "node";
    port.nodeType = "port";
    port.parent = group;

    port.on("mousedown", (opt) => {
      const canvas = canvasRef.current;
      const fromCenter = port.getCenterPoint();
      const line = new fabric.Line(
        [fromCenter.x, fromCenter.y, fromCenter.x, fromCenter.y],
        {
          stroke: "#666",
          strokeWidth: 2,
          selectable: false,
          evented: false,
        }
      );

      lineRef.current = line;
      fromPortRef.current = port;
      canvas.add(line);
    });

    canvas.add(group);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>🎥 Stornaway-style Flow Builder</h2>
      <div style={{ marginBottom: 10, textAlign: "center" }}>
        <button onClick={addNode}>➕ Add Node</button>
        <p style={{ fontSize: 14, color: "#555" }}>
          Drag from blue dot to connect nodes.
        </p>
      </div>
      <canvas id="flow-canvas" />
    </div>
  );
}
