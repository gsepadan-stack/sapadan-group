# Setup Database Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Database - Sapadan Fishery" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is running
Write-Host "Checking MySQL status..." -ForegroundColor Yellow
$mysqlRunning = netstat -ano | findstr :3306
if (-not $mysqlRunning) {
    Write-Host "✗ MySQL is not running!" -ForegroundColor Red
    Write-Host "Please run: .\fix-mysql.ps1 first" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ MySQL is running" -ForegroundColor Green
Write-Host ""

# Create database
Write-Host "Creating database..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Please create database manually:" -ForegroundColor Cyan
Write-Host "Option A - phpMyAdmin (Recommended):" -ForegroundColor White
Write-Host "  1. Open: http://localhost/phpmyadmin" -ForegroundColor Gray
Write-Host "  2. Click SQL tab" -ForegroundColor Gray
Write-Host "  3. Paste and run:" -ForegroundColor Gray
Write-Host "     CREATE DATABASE sapadan_fishery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option B - Command Line:" -ForegroundColor White
Write-Host "  cd C:\xampp\mysql\bin" -ForegroundColor Gray
Write-Host "  .\mysql -u root" -ForegroundColor Gray
Write-Host "  CREATE DATABASE sapadan_fishery;" -ForegroundColor Yellow
Write-Host "  exit;" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key after database is created..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm run install:all
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Setup backend .env
Write-Host "Setting up backend environment..." -ForegroundColor Yellow
Set-Location backend
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✓ Created .env file" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠ IMPORTANT: Check backend\.env file" -ForegroundColor Yellow
    Write-Host "   DATABASE_URL should be: mysql://root@localhost:3306/sapadan_fishery" -ForegroundColor Cyan
    Write-Host "   (Add password if needed: mysql://root:password@localhost:3306/sapadan_fishery)" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}
Write-Host ""

# Generate Prisma Client
Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to generate Prisma Client" -ForegroundColor Red
    Write-Host "   Check if DATABASE_URL in .env is correct" -ForegroundColor Yellow
    Set-Location ..
    exit 1
}
Write-Host "✓ Prisma Client generated" -ForegroundColor Green
Write-Host ""

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
npm run prisma:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to run migrations" -ForegroundColor Red
    Write-Host "   Check if database exists and DATABASE_URL is correct" -ForegroundColor Yellow
    Set-Location ..
    exit 1
}
Write-Host "✓ Migrations completed" -ForegroundColor Green
Write-Host ""

# Seed database
Write-Host "Seeding database..." -ForegroundColor Yellow
npx tsx prisma/seed.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to seed database" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✓ Database seeded" -ForegroundColor Green
Write-Host ""

Set-Location ..

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ MySQL configured" -ForegroundColor Green
Write-Host "✓ Database created and migrated" -ForegroundColor Green
Write-Host "✓ Sample data inserted" -ForegroundColor Green
Write-Host ""
Write-Host "Default Login:" -ForegroundColor Yellow
Write-Host "  Email: owner@sapadan.com" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "To start development:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then open: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
