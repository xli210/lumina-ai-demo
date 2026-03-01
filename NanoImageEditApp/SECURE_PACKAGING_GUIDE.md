# Secure App Packaging Guide

A reusable playbook for wrapping Python + C++ desktop apps into a safe, distributable `.exe` installer. Based on the NanoImageEdit project.

---

## Architecture Overview

```
User gets: NanoImageEdit_Setup.exe (Inno Setup installer)
  └── Installs:
      ├── NanoImageEdit.exe          ← C++ native GUI (compiled, stripped)
      ├── *.cp312-win_amd64.pyd      ← Python modules (Nuitka-compiled, NOT .py)
      ├── run_runner.py / run_app.py  ← Minimal stubs (just `import X; X.main()`)
      ├── first_time_setup.ps1        ← Downloads Python env + activates license
      ├── webbbbbbb/                  ← Web UI (if applicable)
      └── support files               ← config, requirements, etc.
```

---

## Step-by-Step Packaging Process

### Prerequisites

| Tool | Purpose | Install |
|------|---------|---------|
| Python 3.12 | Runtime | Already bundled for end users |
| Nuitka | Compile .py → .pyd | `pip install nuitka` |
| MinGW g++ | Compile C++ | Auto-downloaded by Nuitka, or install manually |
| Inno Setup 6 | Build .exe installer | https://jrsoftware.org/isinfo.php |

---

### Phase 1: Identify Sensitive vs Non-Sensitive Files

**Must compile (contain proprietary logic or secrets):**
- Core pipeline code (inference, model loading, custom algorithms)
- Streaming/optimization techniques (e.g., custom transformer wrappers)
- Encryption/decryption logic
- License validation and key management
- Any file containing API keys, server URLs, or secret salts

**Safe to ship as plaintext:**
- Minimal launcher stubs (2-line `import X; X.main()`)
- Config files (YAML, JSON — no secrets)
- Requirements.txt, README
- Static web UI files (HTML/CSS/JS)
- HTTP proxy servers (no business logic, just request forwarding)
- Setup scripts (with URLs obfuscated)

---

### Phase 2: Obfuscate Secrets in Source Code

Before compiling, replace all plaintext secrets with runtime-decoded equivalents:

**Technique 1: Base85 encoding (for strings)**
```python
# BEFORE (visible in binary):
MODEL_SOURCE = "username/model-name"

# AFTER (hidden):
def _ms():
    import base64
    return base64.b85decode(b'<encoded>').decode()
MODEL_SOURCE = _ms()
```

Generate the encoding: `python -c "import base64; print(base64.b85encode(b'your-secret'))"`

**Technique 2: Byte arrays (for URLs)**
```python
# BEFORE:
SERVER_URL = "https://api.example.com"

# AFTER:
_SRV = [0x68,0x74,0x74,0x70,0x73,0x3a,0x2f,0x2f,...]
SERVER_URL = bytes(_SRV).decode()
```

**Technique 3: Base64 in PowerShell**
```powershell
# BEFORE:
$URL = "https://api.example.com"

# AFTER:
$URL = [System.Text.Encoding]::UTF8.GetString(
    [Convert]::FromBase64String("aHR0cHM6Ly9hcGkuZXhhbXBsZS5jb20="))
```

**Important:** Simple `bytes([...])` arrays get optimized into literals by Nuitka. Use `base64.b85decode()` inside a function for reliable obfuscation.

---

### Phase 3: Compile Python to .pyd with Nuitka

```powershell
# For each sensitive module:
python -m nuitka --module --assume-yes-for-downloads `
    --output-dir="$BuildDir" "path/to/module.py"
```

**Key gotchas:**
1. Copy source files to an isolated build directory first — Nuitka may refuse to compile files it thinks are in the standard library
2. Use `--assume-yes-for-downloads` to avoid interactive prompts for gcc download
3. The output is `module.cp312-win_amd64.pyd` — keep the full name including the Python version tag
4. Verify secrets are hidden: search the `.pyd` binary for your secret strings

**Verification script:**
```powershell
$bytes = [System.IO.File]::ReadAllBytes("module.pyd")
$text = [System.Text.Encoding]::ASCII.GetString($bytes)
if ($text.Contains("your-secret")) {
    Write-Host "FAIL: Secret visible!" -ForegroundColor Red
} else {
    Write-Host "PASS: Secret hidden" -ForegroundColor Green
}
```

---

### Phase 4: Create Launcher Stubs

Since `.pyd` files can't be executed directly, create minimal `.py` stubs:

```python
# run_runner.py (30 bytes — nothing proprietary)
import runner; runner.main()
```

```python
# run_app.py
import flux_app; flux_app.main()
```

---

### Phase 5: Secure Key Storage (DPAPI)

Create a `key_vault.py` module that uses Windows DPAPI to encrypt/decrypt keys at rest:

```python
# key_vault.py — uses ctypes to call CryptProtectData/CryptUnprotectData
# Keys are tied to the Windows user account and machine
# Even if .machine_lock file is copied, keys can't be decrypted on another machine
```

This replaces storing plaintext keys in JSON files.

---

### Phase 6: Build the C++ Frontend

```powershell
# Find gcc (Nuitka caches one automatically)
$gpp = Get-ChildItem "$env:LOCALAPPDATA\Nuitka\Nuitka\Cache\downloads\gcc" `
    -Recurse -Filter "g++.exe" | Select-Object -First 1

# Compile with -municode for wWinMain entry point
& $gpp.FullName -std=c++17 -O2 -DNDEBUG -mwindows -municode -static `
    src\main.cpp build\app_res.o -o build\App.exe `
    -lcomctl32 -lwininet -lgdiplus -lshell32 -lole32 -luxtheme -lcomdlg32 `
    -Wl,--gc-sections -s
```

**Security checks in C++ frontend:**
- Validate license file contains required encrypted fields (not just file existence)
- Reference compiled launcher stubs (`run_runner.py`) not raw source files
- Strip debug symbols (`-s` flag)

---

### Phase 7: Build the Installer (Inno Setup)

Create `installer_secure.iss`:
- Ship `.pyd` files, NOT `.py` source files
- Include launcher stubs and support files
- Define cleanup rules for all generated files in `[UninstallDelete]`
- Use `lzma2/ultra64` compression

```powershell
& "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" installer_secure.iss
```

---

### Phase 8: Verify Everything

Run this checklist before distributing:

| # | Check | How |
|---|-------|-----|
| 1 | No `.py` source for sensitive modules in staging | `ls staging/*.py` should only show stubs + non-sensitive files |
| 2 | All 8 `.pyd` files present | `ls staging/*.pyd` (engine_crypto, machine_lock, key_vault, runner, model_setup, flux_app, launch_app, test) |
| 3 | Server URL not visible in binaries | Search `.pyd` files for URL string |
| 4 | Model source not visible | Search for HuggingFace repo name |
| 5 | Verification plaintext not visible | Search for crypto verification string |
| 6 | C++ exe validates encrypted key field | Search exe for `master_key_enc` |
| 7 | C++ exe references stub launcher | Search exe for `run_runner.py` |
| 8 | Setup script URLs are obfuscated | Check for Base64 decoding in `.ps1` |
| 9 | Installer builds without errors | Check Inno Setup output |
| 10 | Final `.exe` size is reasonable | Should be > 2 MB with all `.pyd` files |

---

## Security Layers Summary

| Layer | What it Protects | Mechanism |
|-------|-----------------|-----------|
| Nuitka compilation | App source code + trade secrets | Python → C → native binary (8 modules) |
| String obfuscation | URLs, model IDs, secrets | Base85/byte-array encoding |
| DPAPI key vault | License keys at rest | Windows user-bound encryption |
| Transport key hardening | Key during activation | Salt + pepper + PBKDF2 |
| Secure temp dirs | Models during inference | ACL-restricted temp folders |
| Secure file wipe | Temp files after use | Zero-fill before delete |
| C++ license validation | App startup | Multi-field JSON validation |
| Online activation | License enforcement | Server-side verification |

---

## Adapting for a New Project

1. **Copy the template structure:**
   ```
   YourProject/
   ├── src/main.cpp              ← C++ frontend (adapt UI)
   ├── res/app.rc + app.manifest ← Windows resources
   ├── build_secure.ps1          ← Build script (update module list)
   ├── installer_secure.iss      ← Installer script (update file list)
   └── your_package/
       ├── key_vault.py          ← Reuse as-is
       ├── machine_lock.py       ← Reuse, update SERVER_URL + PRODUCT_ID
       ├── engine_crypto.py      ← Reuse as-is (model encryption)
       ├── your_pipeline.py      ← Your proprietary code
       ├── your_inference.py     ← Any trade-secret techniques (streaming, optimization, etc.)
       └── ...
   ```

2. **Update `build_secure.ps1`:** Change the `$pythonModules` array to list your sensitive files.

3. **Update `installer_secure.iss`:** Change file references to match your module names.

4. **Update `machine_lock.py`:** Set your license server URL and product ID.

5. **Obfuscate your secrets:** Apply Base85/byte-array encoding to any new secrets.

6. **Run the build:** `powershell -ExecutionPolicy Bypass -File build_secure.ps1`

7. **Verify:** Run the security checklist above.

---

## One-Command Build

```powershell
cd YourProject
powershell -ExecutionPolicy Bypass -File build_secure.ps1
# Output: dist/YourApp_Setup.exe
```

To skip individual steps:
```powershell
# Skip Nuitka (reuse existing .pyd files):
.\build_secure.ps1 -SkipNuitka

# Skip C++ (reuse existing .exe):
.\build_secure.ps1 -SkipCpp

# Only rebuild installer:
.\build_secure.ps1 -SkipNuitka -SkipCpp
```
