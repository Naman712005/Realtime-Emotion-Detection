const video = document.getElementById('video');
const emotionText = document.getElementById('emotion-text');
const emotionIcon = document.getElementById('emotion-icon');
const spinner = document.getElementById('spinner');
const emotionQuote = document.getElementById('emotion-quote');
const canvas = document.createElement('canvas');


const emojiMap = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  surprise: "😲",
  fear: "😨",
  disgust: "🤢",
  neutral: "😐"
};


particlesJS('particles-js', {
  particles: {
    number: { value: 80 },
    size: { value: 3 },
    color: { value: "#ffffff" },
    line_linked: { enable: true, opacity: 0.2 },
    move: { speed: 1 }
  },
  interactivity: {
    events: { onhover: { enable: true, mode: 'repulse' } }
  }
});


const emotionHistory = [];
const maxHistory = 10;

const ctx = document.getElementById('emotionChart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      label: 'Emotions Over Time',
      data: [],
      backgroundColor: 'rgba(3, 204, 107, 0.8)', 
      borderColor: 'rgba(0, 255, 170, 1)',
      borderWidth: 2,
    }]
  },
  options: {
    plugins: {
      legend: {
        labels: {
          color: '#ffffff', 
          font: {
            size: 14,
            family: 'Poppins',
            weight: 'normal'
          }
        }
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0, stepSize: 1 } }
    }
  }
});


const emotionQuotes = {
  happy: "Keep smiling! 😊",
  sad: "It's okay to feel down sometimes. 🌧️",
  angry: "Take a deep breath. You're in control. 😌",
  surprise: "Wow! That was unexpected. 🎉",
  fear: "Courage doesn't mean you don't feel fear. 💪",
  disgust: "Something's off? Trust your gut. 🤔",
  neutral: "Stay centered and calm. 🧘"
};


navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("Webcam access error:", err);
    emotionText.textContent = "Camera Error";
    spinner.style.display = "none";
  });


function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}


function updateChart(emotion) {
  emotionHistory.push(emotion);
  if (emotionHistory.length > maxHistory) emotionHistory.shift();

  const freqMap = {};
  for (let emo of emotionHistory) {
    freqMap[emo] = (freqMap[emo] || 0) + 1;
  }

  chart.data.labels = Object.keys(freqMap);
  chart.data.datasets[0].data = Object.values(freqMap);
  chart.update();
}

function showQuote(emotion) {
  emotionQuote.textContent = emotionQuotes[emotion.toLowerCase()] || "Stay tuned...";
}


function captureAndSend() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = canvas.toDataURL('image/jpeg');

  spinner.style.display = "inline-block";
  emotionText.textContent = "Detecting...";
  emotionIcon.textContent = "";

  fetch('http://127.0.0.1:5000/detect-emotion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageData })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      }

      const emotion = data.emotion;
      emotionText.textContent = emotion.charAt(0).toUpperCase() + emotion.slice(1);
      emotionIcon.textContent = emojiMap[emotion.toLowerCase()] || "❓";
      spinner.style.display = "none";
      speak(emotion);
      showQuote(emotion);
      updateChart(emotion);
    })
    .catch(err => {
      console.error("Detection error:", err);
      emotionText.textContent = "Error";
      emotionIcon.textContent = "❌";
      spinner.style.display = "none";
      emotionQuote.textContent = "Detection failed. Try again.";
    });
}


setInterval(captureAndSend, 3000);



document.getElementById('snapshotBtn').addEventListener('click', () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);

  const link = document.createElement('a');
  link.download = `snapshot_${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});
