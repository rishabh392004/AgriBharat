@echo off
title AgriBharat All-in-One Launcher
echo =========================================================
echo       AGRIBHARAT - STARTING ALL 4 SERVICES
echo =========================================================
echo.
echo [1/4] Starting ML Crop Disease Detection Service (Port 8000)...
start "AgriBharat - 1. ML Engine (Port 8000)" cmd /k "cd /d %~dp0crop-disease && python main.py"

timeout /t 3 /nobreak >nul

echo [2/4] Starting Chatbot & Voice Service (Port 8001)...
start "AgriBharat - 2. AI Chatbot (Port 8001)" cmd /k "cd /d %~dp0crop-disease && python faq_bot.py"

timeout /t 2 /nobreak >nul

echo [3/4] Starting Express Backend (Port 5000)...
start "AgriBharat - 3. Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 2 /nobreak >nul

echo [4/4] Starting Next.js Frontend (Port 3000)...
start "AgriBharat - 4. Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =========================================================
echo   ALL 4 SERVICES LAUNCHED IN DEDICATED WINDOWS:
echo   - Frontend:  http://localhost:3000
echo   - Backend:   http://localhost:5000
echo   - ML Engine: http://localhost:8000
echo   - Chatbot:   http://localhost:8001
echo =========================================================
echo You can close this launcher window or keep it open.
pause
