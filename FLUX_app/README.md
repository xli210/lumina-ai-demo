# FLUX.2 Klein 4B - Portable Package

Streaming DiT inference for the FLUX.2 Klein 4B model. Supports any NVIDIA GPU with CUDA.

## Contents

```
flux2klein_package/
├── test.py                 # Main inference script
├── requirements.txt        # Python dependencies
├── setup.sh                # One-click environment setup
├── README.md               # This file
└── model_weights/          # Pre-downloaded model weights (~15GB)
    ├── model_index.json
    ├── scheduler/
    ├── text_encoder/
    ├── tokenizer/
    ├── transformer/
    └── vae/
```

## Quick Start

### 1. Setup Environment (one-time)

```bash
# Requires: conda (Miniconda/Anaconda), NVIDIA GPU + CUDA driver
chmod +x setup.sh
./setup.sh
```

This auto-detects your CUDA version and installs the matching PyTorch.

### 2. Run Inference

```bash
conda activate flux2klein

# Text-to-image (streaming mode, low VRAM ~3-4GB):
python test.py --mode streaming --model ./model_weights

# Image-to-image:
python test.py --mode streaming --model ./model_weights --image photo.jpg --prompt "oil painting style"

# Standard mode (needs ~8-9GB VRAM):
python test.py --mode standard --model ./model_weights

# Compare both modes:
python test.py --mode compare --model ./model_weights
```

### 3. Custom Parameters

```bash
python test.py --mode streaming --model ./model_weights \
    --prompt "A beautiful sunset over mountains" \
    --height 768 --width 768 \
    --steps 8 --seed 42
```

## Modes

| Mode | VRAM Usage | Speed | Description |
|------|-----------|-------|-------------|
| `streaming` | ~3-4 GB | Slower | Streams transformer blocks through GPU. Works on low-VRAM GPUs. |
| `standard` | ~8-9 GB | Faster | Full model on GPU via cpu_offload. Needs more VRAM. |
| `compare` | Both | Both | Runs both modes and prints comparison. |

## Requirements

- NVIDIA GPU with CUDA support (any recent GPU: RTX 20xx/30xx/40xx/50xx, Tesla, A100, etc.)
- CUDA driver installed (check with `nvidia-smi`)
- conda (Miniconda or Anaconda)
- ~20GB disk space (model weights + environment)
- ~16GB+ system RAM recommended (for CPU offloading)
