# Setup SQLite Database (No MySQL needed!)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup SQLite - Sapadan Fishery" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ No MySQL needed!" -ForegroundColor Green
Write-Host "✓ No XAMPP needed!" -ForegroundColor Green
Write-Host "✓ Everything runs locally!" -ForegroundColor Green
Write-Host ""

Set-Location backend

# Create .env
Write-Host "[1/5] Creating .env..." -ForegroundColor Yellow
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✓ .env created" -ForegroundColor Green
} else {
    Write-Host "✓ .env already exists" -ForegroundColor Green
}
Write-Host ""

# Generate Prisma Client
Write-Host "[2/5] Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✓ Prisma Client generated" -ForegroundColor Green
Write-Host ""

# Create database and run migrations
Write-Host "[3/5] Creating database..." -ForegroundColor Yellow
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✓ Database created" -ForegroundColor Green
Write-Host ""

# Seed database
Write-Host "[4/5] Seeding database..." -ForegroundColor Yellow
npx tsx prisma/seed.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✓ Database seeded" -ForegroundColor Green
Write-Host ""

# Done
Write-Host "[5/5] Setup complete!" -ForegroundColor Yellow
Write-Host ""

Set-Location ..

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ SQLite database created" -ForegroundColor Green
Write-Host "✓ Tables created" -ForegroundColor Green
Write-Host "✓ Users seeded" -ForegroundColor Green
Write-Host ""
Write-Host "Login Credentials:" -ForegroundColor Yellow
Write-Host "  Email:    owner@sapadan.com" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "To start the app:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then open: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
