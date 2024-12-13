import React, { useEffect } from 'react';

function App() {
  useEffect(() => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let previousFrame = null;
    let positions = []; // Para armazenar posições e estabilizar o rastreamento

    // Acessar a webcam
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();

          const width = video.videoWidth;
          const height = video.videoHeight;
          canvas.width = width;
          canvas.height = height;

          function detectFaceAndHands() {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
              ctx.drawImage(video, 0, 0, width, height);
              const currentFrame = ctx.getImageData(0, 0, width, height);

              if (previousFrame) {
                const threshold = 25;
                const length = currentFrame.data.length / 4;
                let movementPoints = [];

                for (let i = 0; i < length; i++) {
                  const r1 = previousFrame.data[i * 4];
                  const g1 = previousFrame.data[i * 4 + 1];
                  const b1 = previousFrame.data[i * 4 + 2];

                  const r2 = currentFrame.data[i * 4];
                  const g2 = currentFrame.data[i * 4 + 1];
                  const b2 = currentFrame.data[i * 4 + 2];

                  const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);

                  if (diff > threshold) {
                    const x = i % width;
                    const y = Math.floor(i / width);
                    movementPoints.push({ x, y });
                  }
                }

                if (movementPoints.length > 0) {
                  let sumX = 0;
                  let sumY = 0;
                  movementPoints.forEach(point => {
                    sumX += point.x;
                    sumY += point.y;
                  });

                  const avgX = sumX / movementPoints.length;
                  const avgY = sumY / movementPoints.length;

                  // Armazenar a posição para estabilização
                  positions.push({ x: avgX, y: avgY });
                  if (positions.length > 10) positions.shift();

                  // Calcular a média das últimas posições para estabilizar
                  const stabilizedX = positions.reduce((sum, p) => sum + p.x, 0) / positions.length;
                  const stabilizedY = positions.reduce((sum, p) => sum + p.y, 0) / positions.length;

                  // Limpar o canvas antes de desenhar
                  ctx.clearRect(0, 0, width, height);
                  ctx.drawImage(video, 0, 0, width, height);

                  // Desenhar o retângulo estabilizado
                  ctx.strokeStyle = 'red';
                  ctx.lineWidth = 2;
                  ctx.strokeRect(stabilizedX - 50, stabilizedY - 50, 100, 100);

                  // Desenhar olhos e boca de forma aproximada
                  ctx.strokeStyle = 'blue';
                  ctx.strokeRect(stabilizedX - 25, stabilizedY - 60, 20, 10); // Olho esquerdo
                  ctx.strokeRect(stabilizedX + 5, stabilizedY - 60, 20, 10);  // Olho direito
                  ctx.strokeRect(stabilizedX - 15, stabilizedY - 30, 30, 10); // Boca

                  // Desenhar esqueleto da mão de forma aproximada
                  ctx.strokeStyle = 'green';
                  ctx.beginPath();
                  ctx.moveTo(stabilizedX, stabilizedY);
                  ctx.lineTo(stabilizedX - 20, stabilizedY + 50); // Ponto 1
                  ctx.lineTo(stabilizedX + 20, stabilizedY + 50); // Ponto 2
                  ctx.lineTo(stabilizedX, stabilizedY); // Voltar ao ponto inicial
                  ctx.stroke();
                }
              }

              previousFrame = currentFrame;
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