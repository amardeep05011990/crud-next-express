// components/addVideo.js
export const addVideoToCanvas = (fabric, canvas, videoURL) => {
    if (!fabric || !canvas) return;
  
    const video = document.createElement("video");
    video.src = videoURL;
    video.crossOrigin = "anonymous";
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
  
    video.style.display = "none";
    document.body.appendChild(video); // necessary for some browsers
  
    video.addEventListener("loadeddata", () => {
        console.log(video.readyState)
    //   const fabricVideo = new fabric.Image(video, {
    //     left: 150,
    //     top: 150,
    //     scaleX: 0.5,
    //     scaleY: 0.5,
    //     hasControls: true,
    //     hasBorders: true,
    //   });

        video.play(); // force play just in case

        // Set size explicitly
        video.width = 320;
        video.height = 180;

        // Add to canvas with full dimensions
        const videoImage = new fabric.Image(video, {
        left: 50,
        top: 50,
        scaleX: 1,
        scaleY: 1,
        });
  
        videoImage.quizType = "video";
      canvas.add(videoImage);
      canvas.renderAll();
      console.log("video.playing?", !video.paused);
      console.log("video width/height", video.videoWidth, video.videoHeight);
      // Keep refreshing the canvas so video appears as it's playing
      const renderLoop = () => {
        canvas.requestRenderAll();
        requestAnimationFrame(renderLoop);
      };
      renderLoop();
    });
  
    video.load();
  };
  