@echo off
setlocal
set PORT=5194
set "NODE=C:\Program Files\nodejs\node.exe"
pushd "%~dp0\.."

echo [foreground] Starting: %NODE% .\scripts\serve-simple.cjs %PORT%
"%NODE%" .\scripts\serve-simple.cjs %PORT%

echo [foreground] Server exited with code %errorlevel%.
pause
popd
endlocal
