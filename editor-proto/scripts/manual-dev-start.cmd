@echo off
setlocal
set "NODE=C:\Program Files\nodejs\node.exe"
set VITE=.\node_modules\vite\bin\vite.js
set ROOT=%~dp0\..
pushd "%ROOT%"

echo Starting Vite development server...
echo Open http://localhost:5173 in your browser
"%NODE%" "%VITE%" --port 5173 --host 127.0.0.1

popd
endlocal
