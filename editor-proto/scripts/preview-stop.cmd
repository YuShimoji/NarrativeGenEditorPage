@echo off
setlocal
set PORT=%1
if "%PORT%"=="" set PORT=5194

set ROOT=%~dp0\..
set PIDFILE=%ROOT%\serve-simple-%PORT%.pid
set READYFILE=%ROOT%\serve-simple-%PORT%.ready
set HBFILE=%ROOT%\serve-simple-%PORT%.hb

echo Stopping preview server on port %PORT% ...
set _killed=0
if exist "%PIDFILE%" (
  set /p _pid=<"%PIDFILE%"
  if not "%_pid%"=="" (
    echo Killing PID %_pid% from pidfile
    taskkill /PID %_pid% /F >NUL 2>&1
    set _killed=1
  )
)

if %_killed%==0 (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
    echo Killing PID %%a from netstat
    taskkill /PID %%a /F >NUL 2>&1
    set _killed=1
  )
)

del /q "%PIDFILE%" 2>NUL
del /q "%READYFILE%" 2>NUL
del /q "%HBFILE%" 2>NUL
echo Done.
endlocal
