Write-Host "=========================================================" -ForegroundColor Green
Write-Host "      AGRIBHARAT - STARTING ALL 4 SERVICES" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
Write-Host ""

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

Write-Host "[1/4] Starting ML Crop Disease Detection Service (Port 8000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\crop-disease'; Write-Host '--- ML ENGINE (Port 8000) ---' -ForegroundColor Green; python main.py"

Start-Sleep -Seconds 2

Write-Host "[2/4] Starting Chatbot & Voice Service (Port 8001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\crop-disease'; Write-Host '--- AI CHATBOT (Port 8001) ---' -ForegroundColor Yellow; python faq_bot.py"

Start-Sleep -Seconds 2

Write-Host "[3/4] Starting Express Backend (Port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; Write-Host '--- BACKEND (Port 5000) ---' -ForegroundColor Magenta; npm run dev"

Start-Sleep -Seconds 2

Write-Host "[4/4] Starting Next.js Frontend (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; Write-Host '--- FRONTEND (Port 3000) ---' -ForegroundColor Blue; npm run dev"

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Green
Write-Host "  ALL 4 SERVICES LAUNCHED IN SEPARATE TERMINALS:" -ForegroundColor Green
Write-Host "  - Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  - Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "  - ML Engine: http://localhost:8000" -ForegroundColor White
Write-Host "  - Chatbot:   http://localhost:8001" -ForegroundColor White
Write-Host "=========================================================" -ForegroundColor Green
