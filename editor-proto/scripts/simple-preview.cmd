@echo off
setlocal
set PORT=5194
set "NODE=C:\Program Files\nodejs\node.exe"
set VITE=.\node_modules\vite\bin\vite.js
set ROOT=%~dp0\..
pushd "%ROOT%"

echo Building with Vite...
"%NODE%" "%VITE%" build --clearScreen false
if errorlevel 1 (
  echo Build failed. Aborting.
  popd
  exit /b 1
)

echo Starting development server...
"%NODE%" "%VITE%" preview --port %PORT% --host 127.0.0.1 --open

popd
endlocal
