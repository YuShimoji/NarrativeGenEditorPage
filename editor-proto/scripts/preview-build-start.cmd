@echo off
setlocal
set PORT=5194
set "NODE=C:\Program Files\nodejs\node.exe"
set VITE=.\node_modules\vite\bin\vite.js
set ROOT=%~dp0\..
pushd "%ROOT%"

echo [1/5] Clean and build with Vite...
if exist "dist" rmdir /s /q "dist"
"%NODE%" "%VITE%" build --clearScreen false --force
if errorlevel 1 (
  echo Build failed. Aborting.
  popd
  exit /b 1
)

echo [2/5] Force stop all processes on port %PORT% ...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
  echo Killing process %%a on port %PORT%
  taskkill /PID %%a /F >NUL 2>&1
)
timeout /t 2 /nobreak > nul

echo [3/5] Install serve package if needed...
npm list -g serve >NUL 2>&1
if errorlevel 1 (
  echo Installing serve package globally...
  npm install -g serve
)

echo [4/5] Start server on port %PORT% ...
cd /d "%ROOT%\dist"
start /B cmd /c "npx serve -s . -l %PORT% --no-clipboard --silent > \"%ROOT%\serve-simple-%PORT%.log\" 2>&1"

echo [5/5] Wait for server and open browser...
set /a _retries=15
:WAIT
netstat -ano | findstr :%PORT% | findstr LISTENING >NUL 2>&1
if %errorlevel%==0 goto :OPEN
set /a _retries-=1
if %_retries% LEQ 0 (
  echo Server failed to start. Check serve-simple-%PORT%.log
  goto :END
)
timeout /t 1 >NUL
goto :WAIT

:OPEN
echo Server is running. Opening browser http://127.0.0.1:%PORT%
start http://127.0.0.1:%PORT%
goto :END

:END
popd
endlocal
