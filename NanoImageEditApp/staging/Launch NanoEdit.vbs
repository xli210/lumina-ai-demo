' Double-click this file to start Nano ImageEdit (no command window).
' If the environment is not yet downloaded, runs Launch NanoEdit.bat
' which handles first-time setup with a visible window.
Set fso = CreateObject("Scripting.FileSystemObject")
Set WshShell = CreateObject("WScript.Shell")
folder = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = folder

' Check if the environment has been set up
pythonExe = folder & "\pythonw312.exe"
pythonExeFallback = folder & "\python312.exe"

If fso.FileExists(pythonExe) Or fso.FileExists(pythonExeFallback) Then
  ' Environment exists — launch directly (no console window)
  If fso.FileExists(pythonExe) Then
    cmd = """" & pythonExe & """ flux_app.py"
  Else
    cmd = """" & pythonExeFallback & """ flux_app.py"
  End If
  WshShell.Run cmd, 0, False
Else
  ' Environment not found — run the batch file for first-time setup
  batFile = folder & "\Launch NanoEdit.bat"
  If fso.FileExists(batFile) Then
    WshShell.Run """" & batFile & """", 1, False
  Else
    MsgBox "python312.exe and Launch NanoEdit.bat not found." & vbCrLf & vbCrLf & _
           "Please ensure the application was installed correctly.", _
           vbExclamation, "Nano ImageEdit"
    WScript.Quit 1
  End If
End If
