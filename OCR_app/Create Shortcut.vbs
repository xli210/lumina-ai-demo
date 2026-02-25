' Creates a desktop shortcut for OCR Engine with the app icon.
' Double-click this file to create the shortcut.
Set fso = CreateObject("Scripting.FileSystemObject")
Set WshShell = CreateObject("WScript.Shell")
folder = fso.GetParentFolderName(WScript.ScriptFullName)

pythonExe = folder & "\python312.exe"
If Not fso.FileExists(pythonExe) Then
  MsgBox "python312.exe not found." & vbCrLf & vbCrLf & _
         "Run BUILD.bat first to set up the environment.", _
         vbExclamation, "OCR Engine"
  WScript.Quit 1
End If

desktopPath = WshShell.SpecialFolders("Desktop")
shortcutPath = desktopPath & "\OCR Engine.lnk"

Set shortcut = WshShell.CreateShortcut(shortcutPath)
shortcut.TargetPath = pythonExe
shortcut.Arguments = "launch_app.py"
shortcut.WorkingDirectory = folder
shortcut.Description = "OCR Engine - Portable OCR Application"
shortcut.WindowStyle = 1

iconPath = folder & "\ocr_engine.ico"
If fso.FileExists(iconPath) Then
  shortcut.IconLocation = iconPath
End If

shortcut.Save

MsgBox "Desktop shortcut created!" & vbCrLf & vbCrLf & _
       "You can now double-click 'OCR Engine' on your desktop.", _
       vbInformation, "OCR Engine"
