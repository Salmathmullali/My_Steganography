# AI Engine Classifier (CNN)

This directory contains a PyTorch implementation for training a CNN to classify screenshots from different AI engines.

## Prerequisites

1.  **Python 3.8+**
2.  **Dependencies**: Install the required libraries:
    ```bash
    pip install -r requirements.txt
    ```

## Dataset Organization

Organize your images into the following folder structure:

```text
dataset/
├── train/
│   ├── chatgpt/
│   ├── gemini/
│   ├── meta_ai/
│   └── midjourney/
└── val/
    ├── chatgpt/
    ├── gemini/
    ├── meta_ai/
    └── midjourney/
```

- Each subfolder should contain `.jpg`, `.png`, or `.webp` screenshots.
- The `val` folder should contain images the model hasn't seen during training to evaluate its performance.

## Training

To start training, run:

```bash
python train_cnn.py
```

The script will automatically detect if you have a GPU (CUDA) available, otherwise it will use the CPU.

## Outputs

- `best_model.pth`: The model weights that achieved the highest accuracy on the validation set.
- `final_model.pth`: The model weights after the last epoch of training.

## Next Steps

Once the model is trained, you can:
1.  **Export to TorchScript/ONNX**: For deployment in high-performance environments.
2.  **Edge Function Integration**: Upload the model to Supabase storage and load it within a Python-based server (or use a framework like FastAPI to serve it).
