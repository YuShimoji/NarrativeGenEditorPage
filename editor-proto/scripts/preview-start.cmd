@echo off
setlocal
set PORT=5194
set "NODE=C:\Program Files\nodejs\node.exe"
set SCRIPT=%~dp0serve-simple.cjs
pushd "%~dp0\.."

set HEALTH=http://127.0.0.1:%PORT%/healthz

REM If already running, just open browser
powershell -NoProfile -Command "try{$r=Invoke-WebRequest -UseBasicParsing '%HEALTH%'; if($r.StatusCode -eq 200 -and $r.Content -match '^ok'){exit 0}else{exit 1}}catch{exit 1}"
if %errorlevel%==0 goto :OPEN

echo Starting preview server on %PORT% ...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$node='%NODE%'; $script='%SCRIPT%'; $port='%PORT%'; $out='.\serve-simple-' + $port + '.log'; $err='.\serve-simple-' + $port + '.err'; $args=('\"{0}\" {1}' -f $script, $port); Start-Process -FilePath $node -ArgumentList $args -WorkingDirectory '.' -RedirectStandardOutput $out -RedirectStandardError $err -WindowStyle Hidden"

REM wait for health up to 30s
set /a _retries=30
:WAIT
powershell -NoProfile -Command "try{$r=Invoke-WebRequest -UseBasicParsing '%HEALTH%'; if($r.StatusCode -eq 200 -and $r.Content -match '^ok'){exit 0}else{exit 1}}catch{exit 1}"
if %errorlevel%==0 goto :OPEN
set /a _retries-=1
if %_retries% LEQ 0 goto :TIMEOUT
timeout /t 1 >NUL
goto :WAIT

:TIMEOUT
echo Timed out waiting for server at %HEALTH%.
goto :OPEN

:OPEN
echo Opening browser http://127.0.0.1:%PORT%
start "" http://127.0.0.1:%PORT%

popd
endlocal
