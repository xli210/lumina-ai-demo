' Double-click this file to start OCR Engine (no command window).
' Uses the bundled pythonw312.exe (or python312.exe) in this folder.
Set fso = CreateObject("Scripting.FileSystemObject")
Set WshShell = CreateObject("WScript.Shell")
folder = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = folder

' Prefer pythonw (no console), fall back to python
pythonExe = folder & "\pythonw312.exe"
If Not fso.FileExists(pythonExe) Then
  pythonExe = folder & "\python312.exe"
End If

If Not fso.FileExists(pythonExe) Then
  MsgBox "python312.exe not found." & vbCrLf & vbCrLf & _
         "Run BUILD.bat first to set up the environment.", _
         vbExclamation, "OCR Engine"
  WScript.Quit 1
End If

cmd = """" & pythonExe & """ ocr_app.py"
WshShell.Run cmd, 0, False
