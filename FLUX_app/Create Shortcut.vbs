' Creates a desktop shortcut for FLUX.2 Klein.
' Double-click this file to create the shortcut.
Set fso = CreateObject("Scripting.FileSystemObject")
Set WshShell = CreateObject("WScript.Shell")
folder = fso.GetParentFolderName(WScript.ScriptFullName)
desktop = WshShell.SpecialFolders("Desktop")

shortcutPath = desktop & "\FLUX.2 Klein.lnk"
Set shortcut = WshShell.CreateShortcut(shortcutPath)
shortcut.TargetPath = folder & "\Launch FLUX.vbs"
shortcut.WorkingDirectory = folder
shortcut.Description = "FLUX.2 Klein — Image Generator"

' Use icon if present
iconPath = folder & "\flux_engine.ico"
If fso.FileExists(iconPath) Then
    shortcut.IconLocation = iconPath
End If

shortcut.Save

MsgBox "Desktop shortcut created!" & vbCrLf & vbCrLf & _
       "You can now launch FLUX.2 Klein from your desktop.", _
       vbInformation, "FLUX.2 Klein"
