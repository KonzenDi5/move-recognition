import React, { useEffect } from 'react'; 
import * as faceapi from 'face-api.js'; // importando a biblioteca face-api.js

function App() {
  useEffect(() => { // usando o hook useEffect para executar uma função após o componente ser montado
    const video = document.getElementById('video') // pegando o elemento de vídeo

    // carregando os modelos da face-api.js
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models')
    ]).then(startVideo) // após carregar os modelos, inicia o vídeo

    function startVideo() { // função para iniciar o vídeo
      navigator.mediaDevices.getUserMedia(
        { video: {} },
      )
      .then(stream => {
        video.srcObject = stream; // definindo a fonte do vídeo para a stream da webcam
      })
      .catch(err => console.error(err)); // logando qualquer erro
    }

    video.addEventListener('play', () => { // adicionando um ouvinte de evento quando o vídeo começar a tocar
      const canvas = faceapi.createCanvasFromMedia(video) // criando um canvas a partir do vídeo
      const container = document.getElementById('container') // pegando o elemento container
      container.append(canvas) // adicionando o canvas ao container
      const displaySize = { width: video.videoWidth, height: video.videoHeight } // definindo o tamanho de exibição
      faceapi.matchDimensions(canvas, displaySize) // combinando as dimensões do canvas com o tamanho de exibição
      setInterval(async () => { // definindo um intervalo para executar a detecção de rosto
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions() // detectando todas as faces no vídeo
        const resizedDetections = faceapi.resizeResults(detections, displaySize) // redimensionando os resultados para o tamanho de exibição
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height) // limpando o canvas
        if (resizedDetections.length > 0) { // se houver detecções
          const detection = resizedDetections.reduce((bestDetection, currentDetection) => { // pegando a melhor detecção
            return currentDetection.detection.score > bestDetection.detection.score ? currentDetection : bestDetection
          })
          faceapi.draw.drawDetections(canvas, detection) // desenhando a detecção no canvas

          faceapi.draw.drawFaceExpressions(canvas, detection) // desenhando as expressões faciais no canvas
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
