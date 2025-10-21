# Backend Setup Script

Write-Host "[INFO] OneLinks Backend - Setup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "[CHECK] Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Node.js version: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check npm
Write-Host "[CHECK] Checking npm installation..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] npm version: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "[ERROR] npm is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "[STEP 1] Installing dependencies..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "[STEP 2] Setting up environment..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "[OK] .env file created from template" -ForegroundColor Green
    Write-Host "[WARN] Please update .env with your actual values!" -ForegroundColor Yellow
} else {
    Write-Host "[INFO] .env file already exists" -ForegroundColor Blue
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Backend setup complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Edit .env file with your credentials" -ForegroundColor White
Write-Host "  2. Setup Railway database and update DATABASE_URL" -ForegroundColor White
Write-Host "  3. Setup Google OAuth credentials" -ForegroundColor White
Write-Host "  4. Run: npm run db:generate" -ForegroundColor White
Write-Host "  5. Run: npm run db:push" -ForegroundColor White
Write-Host "  6. Run: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Server will run on: http://localhost:5000" -ForegroundColor Green
Write-Host ""
