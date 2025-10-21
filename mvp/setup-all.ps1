# OneLinks - Complete Setup Script (Angular Version)

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   OneLinks - Angular + Express Setup   " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$currentDir = Get-Location

# Step 1: Setup Backend
Write-Host "[STEP 1/2] Setting up Backend (Express + Prisma)..." -ForegroundColor Yellow
Write-Host ""
Set-Location "$currentDir\backend"

if (Test-Path ".\setup.ps1") {
    .\setup.ps1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Backend setup failed!" -ForegroundColor Red
        Set-Location $currentDir
        exit 1
    }
} else {
    Write-Host "[ERROR] Backend setup script not found!" -ForegroundColor Red
    Set-Location $currentDir
    exit 1
}

Write-Host ""
Write-Host ""

# Step 2: Setup Frontend
Write-Host "[STEP 2/2] Setting up Frontend (Angular 18)..." -ForegroundColor Yellow
Write-Host ""
Set-Location "$currentDir\frontend"

if (Test-Path ".\setup.ps1") {
    .\setup.ps1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Frontend setup failed!" -ForegroundColor Red
        Set-Location $currentDir
        exit 1
    }
} else {
    Write-Host "[ERROR] Frontend setup script not found!" -ForegroundColor Red
    Set-Location $currentDir
    exit 1
}

Set-Location $currentDir

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "     Setup Complete! What's Next?       " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Configure Backend:" -ForegroundColor Yellow
Write-Host "   - Edit backend\.env with your credentials" -ForegroundColor White
Write-Host "   - Setup Railway database (DATABASE_URL)" -ForegroundColor White
Write-Host "   - Setup Google OAuth (CLIENT_ID, CLIENT_SECRET)" -ForegroundColor White
Write-Host "   - Generate JWT_SECRET" -ForegroundColor White
Write-Host ""
Write-Host "2. Initialize Database:" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run db:generate" -ForegroundColor White
Write-Host "   npm run db:push" -ForegroundColor White
Write-Host ""
Write-Host "3. Start Development:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Terminal 1 (Backend):" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 2 (Frontend):" -ForegroundColor Cyan
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "4. Open Browser:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:4200" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Read ANGULAR_SETUP_COMPLETE.md for detailed guide!" -ForegroundColor Cyan
Write-Host "Read QUICK_START_ANGULAR.md for quick reference!" -ForegroundColor Cyan
Write-Host ""
