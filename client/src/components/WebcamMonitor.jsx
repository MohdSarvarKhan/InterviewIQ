import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

function WebcamMonitor({ onEmotionDetected }) {
  const videoRef = useRef();
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setIsModelsLoaded(true);
      } catch (err) {
        console.error("Error loading face-api models:", err);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (isModelsLoaded) {
      startVideo();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isModelsLoaded]);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
      });
  };

  const handleVideoPlay = () => {
    setInterval(async () => {
      if (videoRef.current && isModelsLoaded) {
        const detections = await faceapi.detectSingleFace(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceExpressions();

        if (detections) {
          // Get the dominant expression
          const expressions = detections.expressions;
          const dominantExpression = Object.keys(expressions).reduce((a, b) => 
            expressions[a] > expressions[b] ? a : b
          );
          
          if (onEmotionDetected) {
            onEmotionDetected(dominantExpression);
          }
        }
      }
    }, 2000); // Check every 2 seconds
  };

  return (
    <div className="relative w-48 h-36 rounded-xl overflow-hidden shadow-lg border-2 border-emerald-500 bg-black">
      {!isModelsLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
          Loading AI Models...
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        muted
        onPlay={handleVideoPlay}
        className="w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }} // Mirror the video
      />
      <div className="absolute bottom-1 left-1 right-1 text-center bg-black/50 text-white text-[10px] rounded-full py-0.5 backdrop-blur-sm">
        Webcam Monitor Active
      </div>
    </div>
  );
}

export default WebcamMonitor;
