// components/dragDrop.js
// export const addDropTarget = (fabric, canvas) => {
//     const target = new fabric.Rect({
//       left: 500,
//       top: 100,
//       width: 150,
//       height: 80,
//       fill: "#f8d7da",
//       stroke: "#c00",
//       strokeWidth: 2,
//       hasControls: false,
//       hasBorders: false,
//       lockMovementX: true,
//       lockMovementY: true,
//       selectable: false,
//     });
  
//     target.quizType = "dropTarget";
//     target.correctId = "answer1";
  
//     canvas.add(target);
//   };

export const addDropTarget = (fabric, canvas, correctId = "answer1") => {
    const target = new fabric.Rect({
      left: 400 + Math.random() * 100, // Random position to avoid overlap
      top: 100 + Math.random() * 100,
      width: 150,
      height: 80,
      fill: "#f8d7da",
      stroke: "#c00",
      strokeWidth: 2,
      hasControls: true,
      hasBorders: true,
    //   lockMovementX: true,
    //   lockMovementY: true,
      selectable: true,
    });
  
    target.quizType = "dropTarget";
    target.correctId = correctId;
  
    canvas.add(target);
  };
  
  
  export const addDraggableOption = (fabric, canvas, text = "Drop Me", id = "answer1") => {
    const option = new fabric.Textbox(text, {
      left: 100,
      top: 200 + canvas.getObjects().length * 40,
      width: 100,
      fontSize: 16,
      fill: "#000",
      backgroundColor: "#cce5ff",
    });
  
    option.quizType = "draggable";
    option.answerId = id;
  
    canvas.add(option);
  };
  
//   export const setupDropDetection = (fabric, canvas, updateScore = () => {}) => {
//     canvas.on("mouse:up", (e) => {
//       const obj = e.target;
  
//       if (obj?.quizType === "draggable") {
//         const target = canvas.getObjects().find(o => o.quizType === "dropTarget");
  
//         if (target) {
//           const objBounds = obj.getBoundingRect();
//           const tgtBounds = target.getBoundingRect();
  
//           const isInside =
//             objBounds.left > tgtBounds.left &&
//             objBounds.top > tgtBounds.top &&
//             objBounds.left + objBounds.width < tgtBounds.left + tgtBounds.width &&
//             objBounds.top + objBounds.height < tgtBounds.top + tgtBounds.height;
  
//           if (isInside) {
//             const correct = obj.answerId === target.correctId;
  
//             target.set("fill", correct ? "#d4edda" : "#f8d7da");
//             canvas.renderAll();
  
//             if (correct) {
//               alert("✅ Correct Drop!");
//               updateScore();
//             } else {
//               alert("❌ Wrong Drop!");
//             }
//           }
//         }
//       }
//     });
//   };
  

export const setupDropDetection = (fabric, canvas, getPlayModeRef, updateScore = () => {}) => {
    canvas.on("mouse:up", (e) => {
      if (!getPlayModeRef()?.current) return; // ✅ check playModeRef
  
      const obj = e.target;
  
      if (obj?.quizType === "draggable") {
        
      //   const target = canvas.getObjects().find(o => o.quizType === "dropTarget");

      //   console.log("🧠 Drag answerId: setupDropDetection", obj.answerId);
      // console.log("🎯 Drop correctId:setupDropDetection", target.correctId);

      //   if (target) {
      //     const objBounds = obj.getBoundingRect();
      //     const tgtBounds = target.getBoundingRect();
  
      //     const isInside =
      //       objBounds.left > tgtBounds.left &&
      //       objBounds.top > tgtBounds.top &&
      //       objBounds.left + objBounds.width < tgtBounds.left + tgtBounds.width &&
      //       objBounds.top + objBounds.height < tgtBounds.top + tgtBounds.height;
  
      //     if (isInside) {
      //       console.log("🧠 Drag answerId:", obj.answerId);
      //       console.log("🎯 Drop correctId:", target.correctId);
      //       const correct = obj.answerId === target.correctId;
  
      //       target.set("fill", correct ? "#d4edda" : "#f8d7da");
      //       canvas.renderAll();
  
      //       if (correct) {
      //         alert("✅ Correct Drop!");
      //         updateScore();
      //       } else {
      //         alert("❌ Wrong Drop!");
      //       }
      //     }
      //   }

      const allTargets = canvas.getObjects().filter(o => o.quizType === "dropTarget");

      for (let target of allTargets) {
        const objBounds = obj.getBoundingRect();
        const tgtBounds = target.getBoundingRect();

        const isInside =
          objBounds.left > tgtBounds.left &&
          objBounds.top > tgtBounds.top &&
          objBounds.left + objBounds.width < tgtBounds.left + tgtBounds.width &&
          objBounds.top + objBounds.height < tgtBounds.top + tgtBounds.height;

        if (isInside) {
          const correct = obj.answerId === target.correctId;

          console.log("🧠 Drag answerId:", obj.answerId);
          console.log("🎯 Drop correctId:", target.correctId);

          target.set("fill", correct ? "#d4edda" : "#f8d7da");
          canvas.renderAll();

          if (correct) {
            alert("✅ Correct Drop!");
            updateScore();
          } else {
            alert("❌ Wrong Drop!");
          }

          break; // exit loop once matched
        }
      }

      }
    });
  };
  