@echo off
echo ==============================
echo   Starting OpenSEC...
echo ==============================
echo.

cd /d "%~dp0"

echo [1/2] Starting backend server...
cd backend
start /b python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
cd ..

timeout /t 3 /nobreak >nul

echo [2/2] Starting frontend server...
cd frontend
start /b npx vite --host 127.0.0.1 --port 3000
cd ..

timeout /t 3 /nobreak >nul

echo.
echo ==============================
echo.
echo   OpenSEC is running!
echo.
echo   Open your browser and go to:
echo.
echo     http://localhost:3000
echo.
echo   Close this window to stop.
echo.
echo ==============================
echo.
pause
