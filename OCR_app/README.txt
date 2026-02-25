============================================================
        OCR Engine — Portable Deployment
============================================================

WHAT THIS IS:
  A fully self-contained OCR Engine. After building,
  users just unzip and click — no Python, no pip,
  no internet, no installs of any kind.

============================================================
  STEP 1 — BUILD (you do this once, on YOUR machine)
============================================================

  1. Open this folder in Explorer
  2. Double-click BUILD.bat
  3. Wait ~20-30 min (downloads ~5 GB)
  4. Done. This folder is now fully self-contained.

  To choose GPU compatibility (edit BUILD.bat if needed):

    cu124  — NVIDIA driver 550+ (default, most modern GPUs)
    cu121  — NVIDIA driver 525+ (BROADEST support, recommended)
    cu118  — NVIDIA driver 520+ (very old GPUs)
    cpu    — No GPU at all (very slow, but always works)

    RECOMMENDATION: Change cu124 to cu121 in BUILD.bat
    for maximum compatibility across different machines.

============================================================
  STEP 2 — DISTRIBUTE (share with other machines)
============================================================

  After building, you have TWO options:

  OPTION A: Copy the whole folder
    - Copy the entire OCR_Portable folder (~7 GB)
    - Works immediately on the target machine

  OPTION B: Use the 3 zip files (in dist/ folder)
    - dist/OCR_env.zip     — Python + all packages
    - dist/OCR_models.zip  — OCR model files
    - dist/OCR_app.zip     — App scripts + web UI
    - Send all 3 to the other machine
    - They unzip all 3 into ONE folder

============================================================
  STEP 3 — RUN (on any target Windows machine)
============================================================

  1. If using zips: create a folder, unzip all 3 into it
  2. Double-click "Launch OCR.bat"
  3. The native desktop app opens (no browser needed!)
  4. Wait 30-120 seconds for model to load
  5. Upload image, choose task, get OCR results

  OPTIONAL: Create a desktop shortcut with the app icon:
    Double-click "Create Shortcut.vbs"

  LEGACY WEB MODE (opens in browser instead):
    Open a command prompt in this folder and run:
      python312.exe launch_app.py --web

  WHAT THE TARGET MACHINE NEEDS:
    - Windows 10 or 11 (64-bit)
    - NVIDIA display driver (for GPU mode)

  WHAT IT DOES NOT NEED:
    - Python           (bundled)
    - pip              (not needed)
    - Internet         (not needed)
    - CUDA Toolkit     (bundled with PyTorch)
    - cuDNN            (bundled with PyTorch)
    - Visual C++       (bundled)
    - Any other software

============================================================
  GPU COMPATIBILITY
============================================================

  The engine auto-detects GPU type and uses the best mode:

    GPU Type               Precision     Examples
    ────────────────────   ──────────    ──────────────────
    Ampere+ (newest)       bfloat16      RTX 3060-3090
                           (fastest)     RTX 4060-4090
                                         A100, L40

    Turing/Volta           float16       RTX 2060-2080
                                         GTX 1650/1660

    Pascal                 float16       GTX 1060-1080

    No GPU                 float32       Any CPU
                           (slow)

  This is AUTOMATIC — no configuration needed.

============================================================
  NVIDIA DRIVER CHECK
============================================================

  Open Command Prompt and type:   nvidia-smi
  Look for "Driver Version: XXX.XX"

    cu124 needs driver 550+
    cu121 needs driver 525+
    cu118 needs driver 520+

============================================================
  TROUBLESHOOTING
============================================================

  "python312.exe not found"
    → Run BUILD.bat first

  "Runner failed to start"
    → Check nvidia-smi works
    → Try rebuilding with cu121 or cpu

  "CUDA out of memory"
    → Model needs ~4 GB VRAM
    → Close other GPU programs

  Browser doesn't open
    → Go to http://127.0.0.1:8765

============================================================
  FOLDER STRUCTURE (after build)
============================================================

  OCR_Portable/
  ├── python312.exe        Python executable (bundled)
  ├── python312.dll        Python core
  ├── python312.zip        Standard library
  ├── python312._pth       Path configuration
  ├── Lib/site-packages/   ALL packages (torch etc.)
  ├── models/              Encrypted OCR model
  ├── ocr_app.py           Native desktop GUI app
  ├── ocr_engine.ico       App icon
  ├── ocr_engine.log       Runtime log (auto-created)
  ├── web/server.py        Web server (legacy mode)
  ├── web/index.html       Frontend UI (legacy mode)
  ├── runner.py            Inference backend
  ├── launch_app.py        Orchestrator
  ├── engine_crypto.py     Decryption library
  ├── .license             License key
  ├── Launch OCR.bat       ← CLICK THIS TO RUN
  ├── Launch OCR.vbs       Silent launcher
  ├── Create Shortcut.vbs  Creates desktop shortcut with icon
  ├── BUILD.bat            Build script (run once)
  └── dist/                Distribution zips
      ├── OCR_env.zip
      ├── OCR_models.zip
      └── OCR_app.zip

  LOG FILE:
    The app writes detailed logs to ocr_engine.log in the
    app folder. This file is not shown to users but can be
    checked for debugging and diagnostics.

============================================================
