# Mysteganography

[![React Native](https://img.shields.io/badge/Frontend-React%20Native%20%2F%20Expo-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Python](https://img.shields.io/badge/Backend-Python%20%2F%20Django-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/AI%2FML-PyTorch-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org/)

> **Hiding data in plain sight.** StegaShield is an end-to-end full-stack security application that hides encrypted data payloads within digital images and leverages an advanced deep learning framework to scan, analyze, and classify hidden data at the device level.

Unlike traditional encryption which flags to attackers that a secret message exists, **StegaShield** ensures complete deniability by utilizing digital steganography and deep-learning-based steganalysis.

---

## System Architecture

The project is built as a modular ecosystem splitting heavy tensor processing from low-latency mobile user interactions:

📱 React Native / Expo Frontend  ──(Image Tensors)──> 🚀 Python Backend
│ (Inference Pipeline)
▼
🔥 PyTorch CNN Model


*   **Frontend (Mobile Client):** Built with **React Native** and **Expo**. Features native mobile camera hooks, biometric authentication layout infrastructure, and a custom interactive canvas screen (`SignatureScreen.tsx`) for signing and embedding tracking variables.
*   **Backend (Inference Engine):** A robust **Python** processing pipeline that ingests user-uploaded mobile image layers, maps them into numeric matrices, and feeds them into the neural network without blocking the main runtime thread.
*   **AI Core (Convolutional Neural Network):** An 8-layer deep **PyTorch** CNN trained locally (`train_cnn.py`) to catch microscopic noise artifacts and structural anomalies left behind by data-embedding software. Weights are exported to `final_model.pth`.

---

## 📁 Repository Roadmap

```bash
├── ml/
│   ├── train_cnn.py         # PyTorch 8-layer CNN training pipeline
│   ├── extract_features.py  # High-pass filter preprocessing (SRM kernels)
│   └── final_model.pth      # Optimized deep learning model weights
├── screens/                 # React Native / Expo UI views
│   ├── CameraScreen.tsx     # Native device camera interface
│   ├── ScannerScreen.tsx    # Live payload scanning screen
│   └── SignatureScreen.tsx  # Dynamic drawing canvas & vector processing
├── app.json                 # Expo bundle configuration
├── package.json             # Frontend node modules
└── requirements.txt         # Python ML dependencies
🧠 Deep Learning & AI Detection Pipeline
Standard computer vision networks look for spatial content (e.g., shapes, textures, objects). Steganography alters pixels at a microscopic level that is completely invisible to standard models. To bypass this, StegaShield uses an intentional AI Steganalysis Core:

High-Pass Filtering Custom Layer: The input pipeline doesn't just read raw pixel RGB arrays. It utilizes custom weights initialized via Spatial Rich Models (SRM) kernels. This suppresses the visual content of the image and amplifies high-frequency noise components.

8-Layer CNN Classifier: The core architecture processes the residual noise maps through 8 sequential convolutional layers paired with Batch Normalization and LeakyReLU activations. This isolates localized architectural adjustments made by typical LSB (Least Significant Bit) steganographic tools.

Softmax Logits: The final fully connected network returns clear probabilistic metrics defining whether an image is clean (cover) or secretly carrying an adversarial data payload (stego).

🛠️ Local Development Setup
1. Fire up the Machine Learning Backend
Ensure you have Python installed, then spin up the backend dependencies:<br><br>
<img width="1050" height="827" alt="Screenshot 2026-06-26 203912" src="https://github.com/user-attachments/assets/08abf099-49b9-43fb-b4c8-996b9a4a7586" /><br><br>


Bash
pip install -r requirements.txt
# Run your Django/Python processing server
python main.py 
2. Launch the Mobile Client
Install dependencies and initialize the Expo bundler:

Bash
npm install
npx expo start
Scan the generated QR code using the Expo Go app on your Android or iOS device to view the interface live!

⚡ The Hardest Engineering Hurdles Solved
Tensor vs. Mobile Latency: Bridging heavy PyTorch image matrix operations with mobile frame rates meant standard processing would cause massive network timeouts. Optimized the image transformations using structured data arrays before passing them to the CNN.

Adversarial Noise Isolation: Digital steganography mimics natural image noise and sensor grain. Designing custom preprocessing scripts that can successfully extract high-frequency noise maps without mistaking normal camera sensor artifacting for a payload was the single biggest breakthrough.

🛡️ Built from scratch with absolute dedication to end-to-end software craftsmanship.
