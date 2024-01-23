import React, { useEffect } from 'react';
import * as faceapi from 'face-api.js';

function App() {
  useEffect(() => {
    const video = document.getElementById('video')

    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models')
    ]).then(startVideo)

    function startVideo() {
      navigator.mediaDevices.getUserMedia(
        { video: {} },
      )
      .then(stream => {
        video.srcObject = stream;
      })
      .catch(err => console.error(err));
    }

    video.addEventListener('play', () => {
      const canvas = faceapi.createCanvasFromMedia(video)
      const container = document.getElementById('container')
      container.append(canvas)
      const displaySize = { width: video.videoWidth, height: video.videoHeight }
      faceapi.matchDimensions(canvas, displaySize)
      setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        if (resizedDetections.length > 0) {
          const detection = resizedDetections.reduce((bestDetection, currentDetection) => {
            return currentDetection.detection.score > bestDetection.detection.score ? currentDetection : bestDetection
          })
          faceapi.draw.drawDetections(canvas, detection)

          faceapi.draw.drawFaceExpressions(canvas, detection)
        }
      }, 100)      
    })
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <div id="container">
          <video id="video" width="720" height="560" autoPlay muted></video>
        </div>
      </header>
    </div>
  );
}

export default App;
