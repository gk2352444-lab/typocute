@echo off
chcp 65001 >nul
echo 🌸 TypoCute Desktop Shortcut Setup...
set VBS_SCRIPT="%TEMP%\create_typocute_shortcut.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") > %VBS_SCRIPT%
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\TypoCute Typing Master.lnk" >> %VBS_SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %VBS_SCRIPT%
echo oLink.TargetPath = "%~dp0TypoCute.exe" >> %VBS_SCRIPT%
echo oLink.WorkingDirectory = "%~dp0" >> %VBS_SCRIPT%
echo oLink.Description = "TypoCute English Typing Master (Duolingo Edition)" >> %VBS_SCRIPT%
echo oLink.Save >> %VBS_SCRIPT%
cscript /nologo %VBS_SCRIPT%
del %VBS_SCRIPT%
echo ✅ Shaabash! Aapke Desktop par "TypoCute Typing Master" shortcut ban chuka hai! 🌸
echo Ab aap bas Desktop ke us icon par double-click karke typing shuru kar sakte hain! ✨
pause
