; Inno Setup Script for Nano ImageEdit (Secure Build)
; Ships compiled .pyd modules instead of plaintext .py

#define MyAppName "Nano ImageEdit"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Image Crescent"
#define MyAppExeName "NanoImageEdit.exe"
#define MyAppURL "https://imagecrescent.com"

#define StagingDir "staging"
#define BuildDir "build"

[Setup]
AppId={{8F3D2A1B-5E7C-4D9F-A6B8-1C2E3F4D5A6B}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={userdocs}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
DisableDirPage=no
OutputDir=dist
OutputBaseFilename=NanoImageEdit_Setup
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
LicenseFile=
SetupIconFile=
UninstallDisplayName={#MyAppName}
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
WizardImageFile=
WizardSmallImageFile=

; Modern look
WizardSizePercent=120
DisableWelcomePage=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Main executable (C++ native app)
Source: "{#BuildDir}\NanoImageEdit.exe"; DestDir: "{app}"; Flags: ignoreversion

; Compiled Python modules (.pyd) — source code is NOT shipped
Source: "{#StagingDir}\engine_crypto*.pyd"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#StagingDir}\machine_lock*.pyd"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#StagingDir}\key_vault*.pyd"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#StagingDir}\runner*.pyd"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#StagingDir}\model_setup*.pyd"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#StagingDir}\flux_app*.pyd"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#StagingDir}\launch_app*.pyd"; DestDir: "{app}"; Flags: ignoreversion

; Compiled inference module (trade secret)
Source: "{#StagingDir}\test*.pyd"; DestDir: "{app}"; Flags: ignoreversion

; Non-sensitive support files
Source: "{#StagingDir}\sitecustomize.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#StagingDir}\local_models.yaml"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#StagingDir}\requirements.txt"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#StagingDir}\README.md"; DestDir: "{app}"; Flags: ignoreversion

; First-time setup script
Source: "{#StagingDir}\first_time_setup.ps1"; DestDir: "{app}"; Flags: ignoreversion

; Batch launchers (fallback)
Source: "{#StagingDir}\Launch NanoEdit.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#StagingDir}\Launch NanoEdit.vbs"; DestDir: "{app}"; Flags: ignoreversion

; Web UI
Source: "{#StagingDir}\webbbbbbb\*.py"; DestDir: "{app}\webbbbbbb"; Flags: ignoreversion
Source: "{#StagingDir}\webbbbbbb\*.html"; DestDir: "{app}\webbbbbbb"; Flags: ignoreversion

; Launcher stub (needed because .pyd modules can't be run directly)
; This tiny .py file just imports and runs the compiled module
Source: "{#StagingDir}\run_runner.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#StagingDir}\run_app.py"; DestDir: "{app}"; Flags: ignoreversion

; Create empty directories
[Dirs]
Name: "{app}\models"
Name: "{app}\outputs"
Name: "{app}\logs"

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}\outputs"
Type: filesandordirs; Name: "{app}\models"
Type: filesandordirs; Name: "{app}\logs"
Type: filesandordirs; Name: "{app}\app_temp"
Type: filesandordirs; Name: "{app}\.engine"
Type: filesandordirs; Name: "{app}\.engine_enc"
Type: files; Name: "{app}\.machine_lock"
Type: files; Name: "{app}\.key_validated"
Type: files; Name: "{app}\.download_status"
Type: files; Name: "{app}\.setup_state"
Type: files; Name: "{app}\nano_edit.log"
Type: files; Name: "{app}\flux_engine.log"
Type: files; Name: "{app}\model_download.log"
Type: files; Name: "{app}\model_download_err.log"
