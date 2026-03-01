; Inno Setup Script for Nano ImageEdit
; Creates a professional Windows installer

#define MyAppName "Nano ImageEdit"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Image Crescent"
#define MyAppExeName "NanoImageEdit.exe"
#define MyAppURL "https://imagecrescent.com"

#define SourceBase "..\flux2klein_package"
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

; Python app files
Source: "{#SourceBase}\runner.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourceBase}\launch_app.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourceBase}\flux_app.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourceBase}\engine_crypto.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourceBase}\model_setup.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourceBase}\machine_lock.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourceBase}\test.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourceBase}\local_models.yaml"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourceBase}\sitecustomize.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourceBase}\requirements.txt"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourceBase}\README.md"; DestDir: "{app}"; Flags: ignoreversion

; First-time setup script (downloads env)
Source: "{#SourceBase}\first_time_setup.ps1"; DestDir: "{app}"; Flags: ignoreversion

; Launcher stubs for compiled modules
Source: "{#SourceBase}\run_runner.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourceBase}\run_app.py"; DestDir: "{app}"; Flags: ignoreversion

; New security module
Source: "{#SourceBase}\key_vault.py"; DestDir: "{app}"; Flags: ignoreversion

; Batch launchers (fallback)
Source: "{#SourceBase}\Launch NanoEdit.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourceBase}\Launch NanoEdit.vbs"; DestDir: "{app}"; Flags: ignoreversion

; Web UI (exclude temp files and cache)
Source: "{#SourceBase}\webbbbbbb\*.py"; DestDir: "{app}\webbbbbbb"; Flags: ignoreversion
Source: "{#SourceBase}\webbbbbbb\*.html"; DestDir: "{app}\webbbbbbb"; Flags: ignoreversion

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
