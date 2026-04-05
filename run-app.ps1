# Run Application - Complete Setup
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Sapadan Fishery System - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is running
Write-Host "Checking MySQL..." -ForegroundColor Yellow
$mysqlRunning = netstat -ano | findstr :3306
if (-not $mysqlRunning) {
    Write-Host "✗ MySQL is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Open XAMPP Control Panel" -ForegroundColor White
    Write-Host "2. Click START on MySQL" -ForegroundColor White
    Write-Host "3. Wait until it's green" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Or run: .\fix-mysql.ps1" -ForegroundColor Cyan
    exit 1
}
Write-Host "✓ MySQL is running" -ForegroundColor Green
Write-Host ""

# Check if dependencies are installed
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm run install:all
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Dependencies ready" -ForegroundColor Green
Write-Host ""

# Check if database is setup
Write-Host "Checking database..." -ForegroundColor Yellow
if (-not (Test-Path "backend\.env")) {
    Write-Host "Setting up database..." -ForegroundColor Yellow
    .\setup-database.ps1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to setup database" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Database ready" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Application..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Login Credentials:" -ForegroundColor Yellow
Write-Host "  Email:    owner@sapadan.com" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop servers" -ForegroundColor Gray
Write-Host ""

# Start development
npm run dev
