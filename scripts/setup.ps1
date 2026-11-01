# ==============================================================================
# CivicPulse — Madurai Spatial Lakehouse: Setup Script (Windows PowerShell)
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " CIVICPULSE — MADURAI SPATIAL LAKEHOUSE SETUP" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check Python
$pythonVer = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Python 3.11+ is required but not found." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Detected: $pythonVer" -ForegroundColor Green

# 2. Check Node
$nodeVer = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Node.js 18+ is required but not found." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Detected Node: $nodeVer" -ForegroundColor Green

# 3. Create .env if missing
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "[OK] Created .env from .env.example" -ForegroundColor Green
}

# 4. Install backend dependencies
Write-Host "Installing backend Python packages..." -ForegroundColor Yellow
python -m pip install -r backend/requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install Python dependencies." -ForegroundColor Red
    exit 1
}

# 5. Install frontend dependencies
Write-Host "Installing frontend npm packages..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

# 6. Validate environment
Write-Host "Validating spatial lakehouse fixtures..." -ForegroundColor Yellow
python scripts/validate_environment.py

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "To start the application:" -ForegroundColor White
Write-Host "  Backend:  cd backend; python -m uvicorn app.main:app --reload --port 8000" -ForegroundColor Cyan
Write-Host "  Frontend: cd frontend; npm run dev" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
