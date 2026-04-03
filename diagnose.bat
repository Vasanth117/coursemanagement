@echo off
echo ========================================
echo   Learning Management System Diagnostics
echo ========================================
echo.

echo 1. Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo 2. Checking npm installation...
npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

echo.
echo 3. Checking MongoDB connection...
cd backend
node test-db.js
if %errorlevel% neq 0 (
    echo ERROR: MongoDB connection failed
    echo Please ensure MongoDB is running on localhost:27017
    echo Or update MONGO_URI in backend/.env
    pause
    exit /b 1
)

echo.
echo 4. Checking for port conflicts...
netstat -ano | findstr :5002
if %errorlevel% equ 0 (
    echo WARNING: Port 5002 is in use
    echo Attempting to free port 5002...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5002') do (
        taskkill /PID %%a /F >nul 2>&1
    )
)

netstat -ano | findstr :3000
if %errorlevel% equ 0 (
    echo WARNING: Port 3000 is in use
    echo Attempting to free port 3000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /PID %%a /F >nul 2>&1
    )
)

echo.
echo 5. Checking backend dependencies...
cd ..\backend
if not exist node_modules (
    echo Installing backend dependencies...
    npm install
)

echo.
echo 6. Checking frontend dependencies...
cd ..\frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    npm install
)

echo.
echo 7. Testing backend server startup...
cd ..\backend
echo Starting backend server for 10 seconds...
start /min cmd /c "npm run dev"
timeout /t 10 /nobreak > nul

echo Testing backend health endpoint...
curl -s http://localhost:5002/health
if %errorlevel% neq 0 (
    echo ERROR: Backend server is not responding
    echo Check backend console for errors
)

echo.
echo ========================================
echo   Diagnostics Complete
echo ========================================
echo.
echo If all checks passed, run start-dev.bat to start the application
echo.
pause