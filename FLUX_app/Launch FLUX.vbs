' Double-click this file to start FLUX.2 Klein (no command window).
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
         "Run setup first to set up the environment.", _
         vbExclamation, "FLUX.2 Klein"
  WScript.Quit 1
End If

cmd = """" & pythonExe & """ flux_app.py"
WshShell.Run cmd, 0, False
