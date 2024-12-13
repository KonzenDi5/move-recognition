import React, { useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';

function App() {
  useEffect(() => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let facePositions = [];
    let savedFaces = JSON.parse(localStorage.getItem('faces')) || [];

    const MAX_FACES = 10;

    function isDuplicateFace(currentFace) {
      const threshold = 100;
      return savedFaces.some(savedFace => {
        const diffX = Math.abs(savedFace.x - currentFace.x);
        const diffY = Math.abs(savedFace.y - currentFace.y);
        return diffX < threshold && diffY < threshold;
      });
    }

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
        video.onloadedmetadata = async () => {
          video.play();

          const width = video.videoWidth;
          const height = video.videoHeight;
          canvas.width = width;
          canvas.height = height;

          const faceModel = await faceLandmarksDetection.createDetector(
            faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
            {
              runtime: 'mediapipe',
              solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh'
            }
          );

          const handModel = await handPoseDetection.createDetector(
            handPoseDetection.SupportedModels.MediaPipeHands,
            {
              runtime: 'mediapipe',
              solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands'
            }
          );

          async function detectFaceAndHands() {
            const facePredictions = await faceModel.estimateFaces(video);
            const handPredictions = await handModel.estimateHands(video);

            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(video, 0, 0, width, height);

            if (facePredictions.length > 0) {
              facePredictions.forEach(prediction => {
                const keypoints = prediction.keypoints;

                ctx.strokeStyle = 'green';
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.moveTo(keypoints[10].x, keypoints[10].y);
                ctx.lineTo(keypoints[338].x, keypoints[338].y);
                ctx.lineTo(keypoints[297].x, keypoints[297].y);
                ctx.lineTo(keypoints[332].x, keypoints[332].y);
                ctx.lineTo(keypoints[284].x, keypoints[284].y);
                ctx.lineTo(keypoints[251].x, keypoints[251].y);
                ctx.lineTo(keypoints[389].x, keypoints[389].y);
                ctx.lineTo(keypoints[356].x, keypoints[356].y);
                ctx.lineTo(keypoints[454].x, keypoints[454].y);
                ctx.lineTo(keypoints[323].x, keypoints[323].y);
                ctx.lineTo(keypoints[361].x, keypoints[361].y);
                ctx.lineTo(keypoints[288].x, keypoints[288].y);
                ctx.lineTo(keypoints[397].x, keypoints[397].y);
                ctx.lineTo(keypoints[365].x, keypoints[365].y);
                ctx.lineTo(keypoints[379].x, keypoints[379].y);
                ctx.lineTo(keypoints[378].x, keypoints[378].y);
                ctx.lineTo(keypoints[400].x, keypoints[400].y);
                ctx.lineTo(keypoints[377].x, keypoints[377].y);
                ctx.lineTo(keypoints[152].x, keypoints[152].y);
                ctx.closePath();
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(keypoints[33].x, keypoints[33].y);
                ctx.lineTo(keypoints[133].x, keypoints[133].y);
                ctx.lineTo(keypoints[160].x, keypoints[160].y);
                ctx.lineTo(keypoints[158].x, keypoints[158].y);
                ctx.lineTo(keypoints[153].x, keypoints[153].y);
                ctx.lineTo(keypoints[144].x, keypoints[144].y);
                ctx.lineTo(keypoints[163].x, keypoints[163].y);
                ctx.lineTo(keypoints[7].x, keypoints[7].y);
                ctx.closePath();
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(keypoints[362].x, keypoints[362].y);
                ctx.lineTo(keypoints[263].x, keypoints[263].y);
                ctx.lineTo(keypoints[387].x, keypoints[387].y);
                ctx.lineTo(keypoints[373].x, keypoints[373].y);
                ctx.lineTo(keypoints[380].x, keypoints[380].y);
                ctx.lineTo(keypoints[374].x, keypoints[374].y);
                ctx.lineTo(keypoints[381].x, keypoints[381].y);
                ctx.lineTo(keypoints[382].x, keypoints[382].y);
                ctx.closePath();
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(keypoints[78].x, keypoints[78].y);
                ctx.lineTo(keypoints[95].x, keypoints[95].y);
                ctx.lineTo(keypoints[88].x, keypoints[88].y);
                ctx.lineTo(keypoints[178].x, keypoints[178].y);
                ctx.lineTo(keypoints[87].x, keypoints[87].y);
                ctx.lineTo(keypoints[14].x, keypoints[14].y);
                ctx.lineTo(keypoints[317].x, keypoints[317].y);
                ctx.lineTo(keypoints[402].x, keypoints[402].y);
                ctx.lineTo(keypoints[318].x, keypoints[318].y);
                ctx.lineTo(keypoints[324].x, keypoints[324].y);
                ctx.lineTo(keypoints[308].x, keypoints[308].y);
                ctx.lineTo(keypoints[415].x, keypoints[415].y);
                ctx.lineTo(keypoints[310].x, keypoints[310].y);
                ctx.lineTo(keypoints[311].x, keypoints[311].y);
                ctx.lineTo(keypoints[312].x, keypoints[312].y);
                ctx.lineTo(keypoints[13].x, keypoints[13].y);
                ctx.closePath();
                ctx.stroke();

                const currentFace = { x: keypoints[10].x, y: keypoints[10].y };
                if (!isDuplicateFace(currentFace)) {
                  if (savedFaces.length >= MAX_FACES) {
                    savedFaces.shift();
                  }
                  savedFaces.push(currentFace);
                  localStorage.setItem('faces', JSON.stringify(savedFaces));
                }
              });
            }

            if (handPredictions.length > 0) {
              handPredictions.forEach(prediction => {
                const keypoints = prediction.keypoints;

                ctx.strokeStyle = 'blue';
                ctx.lineWidth = 2;

                keypoints.forEach(keypoint => {
                  ctx.beginPath();
                  ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
                  ctx.stroke();
                });
              });
            }

            requestAnimationFrame(detectFaceAndHands);
          }

          detectFaceAndHands();
        };
      })
      .catch(err => console.error('Erro ao acessar a webcam:', err));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div id="container" style={{ position: 'relative' }}>
          <video id="video" width="720" height="560" autoPlay muted style={{ position: 'absolute', top: 0, left: 0 }}></video>
          <canvas id="canvas" style={{ position: 'absolute', top: 0, left: 0 }}></canvas>
        </div>
      </header>
    </div>
  );
}

export default App;