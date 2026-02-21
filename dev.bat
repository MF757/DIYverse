@echo off
REM Run dev server without npm.ps1 (avoids PowerShell ExecutionPolicy errors).
REM In PowerShell run: .\dev.bat   (prefix required). In cmd or Explorer: dev.bat
node node_modules\vite\bin\vite.js
