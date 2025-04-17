"use client";

import React, { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";

const CanvasEditor = () => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const pageRefs = useRef([]);

  const thumbnailCanvases = useRef([]);


  const [drawingMode, setDrawingMode] = useState(true);
  const [transparent, setTransparent] = useState(false);
  const [color, setColor] = useState("#000000");
  const [canvasReady, setCanvasReady] = useState(false);


  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const gridSize = 20;


  const [pages, setPages] = useState([{ id: 1, json: null }]);
const [activePage, setActivePage] = useState(0); // index of current page

const [history, setHistory] = useState([]);
const [redoStack, setRedoStack] = useState([]);


  useEffect(() => {
    import("fabric").then((mod) => {
      const fabric = mod.fabric || mod;
      fabricRef.current = fabric;

      if (canvasRef.current) {
        canvasRef.current.dispose();
      }

      const canvas = new fabric.Canvas("my-canvas", {
        width: 800,
        height: 500,
        // backgroundColor: "#fff",
      backgroundColor: transparent ? "transparent" : "#fff",

      });

      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = 3;
    //   canvas.setBackgroundColor(transparent ? "transparent" : "#fff", () => {});
    //   canvas.renderAll();
    setCanvasReady(true); // ✅ mark canvas as ready
    
      canvasRef.current = canvas;

      canvas.on("object:modified", saveHistory);
canvas.on("object:added", saveHistory);
canvas.on("object:removed", saveHistory);

      canvas.on("mouse:wheel", function (opt) {
        const delta = opt.e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
      
        zoom = Math.max(0.2, Math.min(zoom, 4)); // limit zoom range
        canvas.setZoom(zoom);
      
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });

      
    // // Pan with Ctrl + Drag
    // let isDragging = false;
    // let lastPosX = 0;
    // let lastPosY = 0;

    // canvas.on("mouse:down", function (opt) {
    // const evt = opt.e;
    // if (evt.ctrlKey === true) {
    //     isDragging = true;
    //     canvas.selection = false;
    //     lastPosX = evt.clientX;
    //     lastPosY = evt.clientY;
    // }
    // });

    // canvas.on("mouse:move", function (opt) {
    // if (isDragging) {
    //     const e = opt.e;
    //     const vpt = canvas.viewportTransform;
    //     vpt[4] += e.clientX - lastPosX;
    //     vpt[5] += e.clientY - lastPosY;
    //     canvas.requestRenderAll();
    //     lastPosX = e.clientX;
    //     lastPosY = e.clientY;
    // }
    // });

    // canvas.on("mouse:up", function () {
    // isDragging = false;
    // canvas.selection = true;
    // });
      

      if (snapToGrid) {
        canvas.on("object:moving", (e) => {
          const obj = e.target;
          obj.set({
            left: Math.round(obj.left / gridSize) * gridSize,
            top: Math.round(obj.top / gridSize) * gridSize,
          });
        });
      }

      if (showGrid) drawGrid(canvas);
      
    });

    return () => {
      if (canvasRef.current) {
        canvasRef.current.dispose();
        canvasRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
    }
  }, [color]);

  const toggleDrawing = () => {
    const canvas = canvasRef.current;
    canvas.isDrawingMode = !canvas.isDrawingMode;
    setDrawingMode(canvas.isDrawingMode);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas.clear();
    // canvas.setBackgroundColor("#fff", () => {});
    canvas.setBackgroundColor(transparent ? "transparent" : "#fff", () => {});
    canvas.renderAll();
  };

  const addText = () => {
    const fabric = fabricRef.current;
    const canvas = canvasRef.current;
    const text = new fabric.Textbox("Type here", {
      left: 100,
      top: 100,
      fontSize: 20,
      fill: color,
    });
    canvas.add(text);
  };

  const saveJSON = () => {
    const canvas = canvasRef.current;
    const json = canvas.toJSON();
    localStorage.setItem("fabricCanvas", JSON.stringify(json));
    alert("Canvas saved to localStorage!");
  };

  const loadJSON = () => {
    const canvas = canvasRef.current;
    const saved = localStorage.getItem("fabricCanvas");
    if (saved) {
      canvas.loadFromJSON(saved, () => {
        canvas.renderAll();
        // alert("Canvas loaded from localStorage!");
      });
    }
  };

  const exportPNG = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL({ format: "png" });
    const link = document.createElement("a");
    link.download = "canvas.png";
    link.href = dataURL;
    link.click();
  };

  const exportTransparentPNG = () => {
    const canvas = canvasRef.current;
  
    if (!canvas || typeof canvas.toDataURL !== "function") {
      console.warn("Canvas not ready or invalid!");
      return;
    }
  
    const currentBg = canvas.backgroundColor;
  
    if (transparent) {
      // Temporarily remove background for transparent export
      canvas.setBackgroundColor(null, () => {
        canvas.renderAll();
  
        const dataURL = canvas.toDataURL({ format: "png" });
  
        // Restore original background
        canvas.setBackgroundColor(currentBg, () => {
          canvas.renderAll();
  
          // Trigger download
          triggerDownload(dataURL);
        });
      });
    } else {
      const dataURL = canvas.toDataURL({ format: "png" });
      triggerDownload(dataURL);
    }
  };
  
  
  
  const triggerDownload = (dataURL) => {
    const link = document.createElement("a");
    link.download = "canvas.png";
    link.href = dataURL;
    link.click();
  };
  
  const drawGrid = (canvas) => {
    for (let i = 0; i < canvas.width / gridSize; i++) {
      canvas.add(
        new fabricRef.current.Line([i * gridSize, 0, i * gridSize, canvas.height], {
          stroke: "#eee",
          selectable: false,
          evented: false,
        })
      );
    }

    for (let i = 0; i < canvas.height / gridSize; i++) {
      canvas.add(
        new fabricRef.current.Line([0, i * gridSize, canvas.width, i * gridSize], {
          stroke: "#eee",
          selectable: false,
          evented: false,
        })
      );
    }

    canvas.renderAll();
  };

//   const uploadImage = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // const reader = new FileReader();
//     // reader.onload = function (f) {
//     //   const data = f.target.result;
//     //   fabricRef.current.Image.fromURL(data, (img) => {
//     //     img.set({ left: 50, top: 50, scaleX: 0.5, scaleY: 0.5 });
//     //     canvasRef.current.add(img);
//     //   });
//     // };

    
//   const reader = new FileReader();

//   reader.onload = function (event) {
//     const dataUrl = event.target.result;
//     const fabric = fabricRef.current;
//     const canvas = canvasRef.current;

//         // Use Image constructor directly
//         fabric.Image.fromURL(dataUrl, (img) => {
//             img.set({
//               left: 50,
//               top: 50,
//               scaleX: 0.5,
//               scaleY: 0.5,
//             });
//             canvas.add(img);
//             canvas.renderAll();
//           }, { crossOrigin: 'anonymous' }); // Needed in some setups
      
//   };
//     reader.readAsDataURL(file);
//   };

// const uploadImage = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
  
//     const reader = new FileReader();
  
//     reader.onload = (event) => {
//       const dataUrl = event.target.result;
//       const fabric = fabricRef.current;
//       const canvas = canvasRef.current;
  
//       // Load image manually using util.loadImage
//       fabric.util.loadImage(dataUrl, (img) => {
//         if (!img) {
//           alert("Failed to load image.");
//           return;
//         }
  
//         const fabricImg = new fabric.Image(img, {
//           left: 50,
//           top: 50,
//           scaleX: 0.5,
//           scaleY: 0.5,
//         });
  
//         canvas.add(fabricImg);
//         canvas.renderAll();
//       }, null, 'anonymous'); // 'anonymous' to prevent CORS issues
//     };
  
//     reader.readAsDataURL(file);
//   };


// const uploadImage = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
  
//     const reader = new FileReader();
  
//     reader.onload = async function (event) {
//       const dataUrl = event.target.result;
  
//       try {
//         const mod = await import("fabric");
//         const fabric = mod.fabric || mod;
//         const canvas = canvasRef.current;
  
//         console.log("DataURL loaded:", dataUrl.slice(0, 50)); // confirm base64
//         console.log("Fabric?", !!fabric.Image);
  
//         fabric.util.loadImage(dataUrl, (imgEl) => {
//           if (!imgEl) {
//             console.error("Image load failed (null image)");
//             return;
//           }
  
//           const fabricImg = new fabric.Image(imgEl, {
//             left: 50,
//             top: 50,
//             scaleX: 0.5,
//             scaleY: 0.5,
//           });
  
//           canvas.add(fabricImg);
//           canvas.renderAll();
//         }, null, 'anonymous');
  
//       } catch (err) {
//         console.error("Image load error:", err);
//       }
//     };
  
//     reader.readAsDataURL(file);
//   };

const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
  
    reader.onload = async function (event) {
      const dataUrl = event.target.result;
  
      const mod = await import("fabric");
      const fabric = mod.fabric || mod;
      const canvas = canvasRef.current;
  
      const img = new Image();
      img.onload = function () {
        const fabricImg = new fabric.Image(img, {
          left: 50,
          top: 50,
          scaleX: 0.5,
          scaleY: 0.5,
        });
  
        canvas.add(fabricImg);
        canvas.renderAll();
      };
      img.onerror = function (err) {
        console.error("Image failed to load:", err);
      };
  
      img.crossOrigin = "anonymous"; // important
      img.src = dataUrl;
    };
  
    reader.readAsDataURL(file);
  };
  
  const zoomCanvas = (factor) => {
    const canvas = canvasRef.current;
    let zoom = canvas.getZoom();
    zoom *= factor;
    zoom = Math.max(0.2, Math.min(zoom, 4)); // clamp zoom
    canvas.setZoom(zoom);
  };

  const resetZoom = () => {
    const canvas = canvasRef.current;
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]); // identity matrix
    canvas.setZoom(1);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    const shape = e.dataTransfer.getData("shape");
    const canvas = canvasRef.current;
    const fabric = fabricRef.current;
  
    const rect = canvas.upperCanvasEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
  
    let obj;
  
    switch (shape) {
      case "rect":
        obj = new fabric.Rect({
          width: 100,
          height: 60,
          fill: "lightblue",
          left: x,
          top: y,
        });
        break;
      case "circle":
        obj = new fabric.Circle({
          radius: 40,
          fill: "pink",
          left: x,
          top: y,
        });
        break;
      case "triangle":
        obj = new fabric.Triangle({
          width: 80,
          height: 80,
          fill: "lightgreen",
          left: x,
          top: y,
        });
        break;
      default:
        return;
    }
  
    canvas.add(obj);
    canvas.renderAll();
  };


  const switchPage = (index) => {
    const canvas = canvasRef.current;
  
    // Save current page
    const updatedPages = [...pages];
    updatedPages[activePage].json = canvas.toJSON();
  
    // Clear canvas and load new one
    canvas.clear();
    if (updatedPages[index].json) {
      canvas.loadFromJSON(updatedPages[index].json, () => {
        canvas.renderAll();
      });
    }
  
    setPages(updatedPages);
    setActivePage(index);

    renderAllThumbnails();

  };
  
  const addPage = () => {
    const newId = pages.length + 1;
    const updatedPages = [...pages];
  
    // Save current
    updatedPages[activePage].json = canvasRef.current.toJSON();
  
    updatedPages.push({ id: newId, json: null });
    setPages(updatedPages);
    setActivePage(updatedPages.length - 1);
  
    // Clear canvas for new page
    canvasRef.current.clear();
    canvasRef.current.renderAll();

    renderAllThumbnails();

  };
  
  const removePage = () => {
    const canvas = canvasRef.current;
    const updated = [...pages];
  
    updated.splice(activePage, 1);
    const newIndex = Math.max(0, activePage - 1);
  
    // Load new page
    canvas.clear();
    if (updated[newIndex].json) {
      canvas.loadFromJSON(updated[newIndex].json, () => canvas.renderAll());
    }
  
    setPages(updated);
    setActivePage(newIndex);
    renderAllThumbnails();

  };
  

const exportAllPages = async () => {
  const canvas = canvasRef.current;
  const fabric = fabricRef.current;

  const images = [];

  for (let i = 0; i < pages.length; i++) {
    // Save current page JSON
    if (i === activePage) {
      pages[i].json = canvas.toJSON();
    }

    // Load each page's canvas JSON
    await new Promise((resolve) => {
      canvas.clear();
      if (pages[i].json) {
        canvas.loadFromJSON(pages[i].json, () => {
          canvas.renderAll();
          // Delay to ensure render
          setTimeout(() => {
            const dataUrl = canvas.toDataURL({ format: "png" });
            images.push(dataUrl);
            resolve();
          }, 300);
        });
      } else {
        // Blank page
        const dataUrl = canvas.toDataURL({ format: "png" });
        images.push(dataUrl);
        resolve();
      }
    });
  }

  // Export all images as PNG download links
  images.forEach((img, idx) => {
    const a = document.createElement("a");
    a.href = img;
    a.download = `page-${idx + 1}.png`;
    a.click();
  });

  // OR: Combine into a PDF
  const pdf = new jsPDF("landscape", "px", [canvas.width, canvas.height]);

  images.forEach((img, i) => {
    if (i !== 0) pdf.addPage();
    pdf.addImage(img, "PNG", 0, 0, canvas.width, canvas.height);
  });

  pdf.save("all-pages.pdf");
  renderAllThumbnails();

};


// const renderAllThumbnails = () => {
//     const fabric = fabricRef.current;
  
//     pages.forEach((page, i) => {
//       const thumbCanvasEl = pageRefs.current[i];
//       if (!thumbCanvasEl) return;
  
//       const thumb = new fabric.StaticCanvas(thumbCanvasEl, {
//         width: 120,
//         height: 75,
//       });
  
//       if (page.json) {
//         thumb.loadFromJSON(page.json, () => {
//           thumb.renderAll();
//         });
//       } else {
//         thumb.clear();
//       }
//     });
//   };

const renderAllThumbnails = () => {
    const fabric = fabricRef.current;
  
    pages.forEach((page, i) => {
      const thumbCanvasEl = pageRefs.current[i];
      if (!thumbCanvasEl) return;
  
      let thumb = thumbnailCanvases.current[i];
  
      if (!thumb) {
        // Only create StaticCanvas once per thumbnail
        thumb = new fabric.StaticCanvas(thumbCanvasEl, {
          width: 120,
          height: 75,
        });
        thumbnailCanvases.current[i] = thumb;
      }
  
      thumb.clear(); // clear old content
  
      if (page.json) {
        thumb.loadFromJSON(page.json, () => {
          thumb.renderAll();
        });
      }
    });
  };

  
  const saveProjectToFile = () => {
    const canvas = canvasRef.current;
  
    // Save current active page
    const updatedPages = [...pages];
    updatedPages[activePage].json = canvas.toJSON();
  
    const dataStr = JSON.stringify(updatedPages);
    const blob = new Blob([dataStr], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "fabric-project.json";
    link.click();
  };

  const loadProjectFromFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!Array.isArray(parsed)) throw new Error("Invalid format");
  
        setPages(parsed);
        setActivePage(0);
  
        // Load first page
        const canvas = canvasRef.current;
        canvas.clear();
        if (parsed[0].json) {
          canvas.loadFromJSON(parsed[0].json, () => {
            canvas.renderAll();
            renderAllThumbnails(); // Refresh thumbs
          });
        }
      } catch (err) {
        alert("Failed to load project: " + err.message);
      }
    };
  
    reader.readAsText(file);
  };
  
  const clearAllPages = () => {
    const updated = pages.map((p) => ({ ...p, json: null }));
    canvasRef.current.clear();
    setPages(updated);
    setActivePage(0);
    renderAllThumbnails();
  };
  

  const saveHistory = () => {
    const json = canvasRef.current.toJSON();
    setHistory((prev) => [...prev, json]);
    setRedoStack([]);
  };
  
  const undo = () => {
    if (history.length === 0) return;
    const prev = [...history];
    const last = prev.pop();
    setHistory(prev);
    setRedoStack((r) => [canvasRef.current.toJSON(), ...r]);
  
    canvasRef.current.loadFromJSON(last, () => canvasRef.current.renderAll());
  };
  
  const redo = () => {
    if (redoStack.length === 0) return;
    const next = [...redoStack];
    const first = next.shift();
    setRedoStack(next);
    setHistory((h) => [...h, canvasRef.current.toJSON()]);
  
    canvasRef.current.loadFromJSON(first, () => canvasRef.current.renderAll());
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      const updated = [...pages];
      updated[activePage].json = canvasRef.current.toJSON();
      localStorage.setItem("autosave", JSON.stringify(updated));
    }, 5000);
  
    return () => clearInterval(interval);
  }, [pages, activePage]);

  
  useEffect(() => {
    if (!canvasReady) return; // wait until fabric canvas is set
  
    const saved = localStorage.getItem("autosave");
    if (saved) {
      const parsed = JSON.parse(saved);
      setPages(parsed);
      setActivePage(0);
  
      const canvas = canvasRef.current;
      if (parsed[0]?.json && canvas) {
        canvas.clear();
        canvas.loadFromJSON(parsed[0].json, () => {
          canvas.renderAll();
          renderAllThumbnails();
        });
      }
    }
  }, [canvasReady]);
  

  return (
    <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 10, display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <button onClick={toggleDrawing}>
            {drawingMode ? "Disable Pencil" : "Enable Pencil"}
            </button>
            <button onClick={clearCanvas}>Clear</button>
            <button onClick={addText}>Add Text</button>
            <button onClick={saveJSON}>💾 Save</button>
            <button onClick={loadJSON}>📥 Load</button>
            <button onClick={exportPNG}>📸 Export PNG</button>
            <button onClick={exportTransparentPNG}   disabled={!canvasReady}        >📸 Export Transparent PNG</button>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            <input type="file" accept="image/*" onChange={uploadImage} />
                <input
                type="checkbox"
                checked={transparent}
                onChange={(e) => setTransparent(e.target.checked)}
                />
                <label style={{ marginLeft: 4 }}>Transparent Background</label>

                <button onClick={() => zoomCanvas(1.1)}>➕ Zoom In</button>
                <button onClick={() => zoomCanvas(0.9)}>➖ Zoom Out</button>
                <button onClick={resetZoom}>🔁 Reset Zoom</button>


                <div style={{ marginBottom: 10 }}>
                {pages.map((page, idx) => (
                    <button
                    key={page.id}
                    style={{ fontWeight: activePage === idx ? "bold" : "normal", marginRight: 8 }}
                    onClick={() => switchPage(idx)}
                    >
                    Page {idx + 1}
                    </button>
                ))}
                <button onClick={addPage}>➕ Add Page</button>
                {pages.length > 1 && <button onClick={removePage}>🗑️ Delete Page</button>}
                </div>

                <button onClick={exportAllPages}>📁 Export All Pages</button>

                <button onClick={saveProjectToFile}>💾 Save Project</button>
                <input type="file" accept=".json" onChange={loadProjectFromFile} />

                <button onClick={clearAllPages}>🧼 Clear All Pages</button>

                <button onClick={undo}>↩️ Undo</button>
                <button onClick={redo}>↪️ Redo</button>



        </div>



        <div style={{ display: "flex", marginBottom: 10, gap: 10 }}>

            <div style={{ width: 120, border: "1px solid #ccc", padding: 10 }}>
                <p><strong>Shapes</strong></p>
                <div draggable onDragStart={(e) => e.dataTransfer.setData("shape", "rect")}>🟦 Rectangle</div>
                <div draggable onDragStart={(e) => e.dataTransfer.setData("shape", "circle")}>⚪ Circle</div>
                <div draggable onDragStart={(e) => e.dataTransfer.setData("shape", "triangle")}>🔺 Triangle</div>
            </div>
            
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                style={{ border: "2px dashed #aaa", marginLeft: 20 }}
            >
                <canvas id="my-canvas" />
            </div>
        {/* <canvas id="my-canvas" /> */}
        
                {/* 🖼 Thumbnails Sidebar */}
                <div style={{ width: 160 }}>
                    <p><strong>Slides</strong></p>
                    {pages.map((page, idx) => (
                    <canvas
                        key={page.id}
                        width={120}
                        height={75}
                        style={{
                        border: activePage === idx ? "2px solid blue" : "1px solid #ccc",
                        marginBottom: 10,
                        cursor: "pointer",
                        }}
                        onClick={() => switchPage(idx)}
                        ref={(el) => (pageRefs.current[idx] = el)}
                    />
                    ))}
                </div>
      </div>

    </div>
  );
};

export default CanvasEditor;
