@echo off
setlocal
set PORT=5194
set "NODE=C:\Program Files\nodejs\node.exe"
set VITE=.\node_modules\vite\bin\vite.js
set ROOT=%~dp0\..
pushd "%ROOT%"

echo [1/4] Build with Vite...
"%NODE%" "%VITE%" build --clearScreen false
if errorlevel 1 (
  echo Build failed. Aborting.
  popd
  exit /b 1
)

echo [2/4] Stop existing preview on %PORT% ...
call "%~dp0preview-stop.cmd" %PORT% >NUL 2>&1

echo [3/4] Start simple server on %PORT% ...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$node='%NODE%'; $script='%~dp0serve-simple.cjs'; $port='%PORT%'; $args=('\"{0}\" {1}' -f $script, $port); Start-Process -FilePath $node -ArgumentList $args -WorkingDirectory '.' -RedirectStandardOutput ('.\\serve-simple-' + $port + '.log') -RedirectStandardError ('.\\serve-simple-' + $port + '.err') -WindowStyle Hidden"

set HEALTH=http://127.0.0.1:%PORT%/healthz
echo [4/4] Wait for health and open browser: %HEALTH%
set /a _retries=30
:WAIT
powershell -NoProfile -Command "try{$r=Invoke-WebRequest -UseBasicParsing '%HEALTH%'; if($r.StatusCode -eq 200 -and $r.Content -match '^ok'){exit 0}else{exit 1}}catch{exit 1}"
if %errorlevel%==0 goto :OPEN
set /a _retries-=1
if %_retries% LEQ 0 goto :OPEN
timeout /t 1 >NUL
goto :WAIT

:OPEN
echo Opening browser http://127.0.0.1:%PORT%
start "" http://127.0.0.1:%PORT%

popd
endlocal
