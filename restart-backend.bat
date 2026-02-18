@echo off
echo Restarting Backend Server...

REM Kill existing backend process
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5002') do (
    echo Stopping backend server (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

echo Waiting 2 seconds...
timeout /t 2 /nobreak > nul

echo Starting backend server...
cd backend
start "Backend Server" cmd /k "npm run dev"

echo Backend server restarted on port 5002
pause