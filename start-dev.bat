@echo off
echo ========================================
echo   Learning Management System Startup
echo ========================================
echo.

echo Checking for port conflicts...
echo.

REM Kill processes on ports 5002 and 3000 if they exist
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5002') do (
    echo Killing process on port 5002 (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing process on port 3000 (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo Starting Backend Server (Port 5002)...
start "Backend Server" cmd /k "cd backend && echo Backend starting... && npm run dev"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd frontend && echo Frontend starting... && npm start"

echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo Backend API: http://localhost:5002
echo Frontend:   http://localhost:3000
echo Health:     http://localhost:5002/health
echo API Docs:   http://localhost:5002/api/v1
echo ========================================
echo.
echo Press any key to close this window...
pause >nul