from flask import Flask, request, jsonify, render_template
from deepface import DeepFace
import cv2
import numpy as np
import base64
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/detect-emotion', methods=['POST'])
def detect_emotion():
    try:
        data = request.json
        
        if 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400

        img_str = data['image']
 
        if ',' in img_str:
            img_str = img_str.split(',')[1]

        img_data = base64.b64decode(img_str)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({'error': 'Invalid image data'}), 400

        result = DeepFace.analyze(img, actions=['emotion'], enforce_detection=False)
        emotion = result[0]['dominant_emotion']

 
        with open("emotion_log.txt", "a") as log_file:
            log_file.write(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - {emotion}\n")

        return jsonify({'emotion': emotion})
    
    except Exception as e:
        print("Error:", e)
        return jsonify({'error': 'Failed to process image or detect emotion'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
