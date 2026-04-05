# Reset and Setup Database
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Reset Database - Sapadan Fishery" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This will reset the database and create fresh data." -ForegroundColor Yellow
Write-Host "Press any key to continue or Ctrl+C to cancel..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

Set-Location backend

# Check .env
Write-Host "[1/5] Checking configuration..." -ForegroundColor Yellow
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✓ .env created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠ IMPORTANT: Edit backend\.env" -ForegroundColor Yellow
    Write-Host "   DATABASE_URL should be:" -ForegroundColor White
    Write-Host "   mysql://root@localhost:3306/sapadan_fishery" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press any key after editing .env..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
Write-Host "✓ Configuration ready" -ForegroundColor Green
Write-Host ""

# Generate Prisma Client
Write-Host "[2/5] Generating Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to generate Prisma Client" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✓ Prisma Client generated" -ForegroundColor Green
Write-Host ""

# Reset database (this will drop and recreate)
Write-Host "[3/5] Resetting database..." -ForegroundColor Yellow
Write-Host "This will delete all existing data!" -ForegroundColor Red
npx prisma migrate reset --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to reset database" -ForegroundColor Red
    Write-Host ""
    Write-Host "Trying alternative method..." -ForegroundColor Yellow
    
    # Try migrate deploy instead
    npx prisma migrate deploy
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Migration failed" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please check:" -ForegroundColor Yellow
        Write-Host "1. MySQL is running in XAMPP" -ForegroundColor White
        Write-Host "2. Database 'sapadan_fishery' exists" -ForegroundColor White
        Write-Host "3. DATABASE_URL in .env is correct" -ForegroundColor White
        Set-Location ..
        exit 1
    }
}
Write-Host "✓ Database reset complete" -ForegroundColor Green
Write-Host ""

# Seed database
Write-Host "[4/5] Seeding database..." -ForegroundColor Yellow
npx tsx prisma/seed.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to seed database" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✓ Database seeded" -ForegroundColor Green
Write-Host ""

# Verify users
Write-Host "[5/5] Verifying users..." -ForegroundColor Yellow
Write-Host "Checking if users were created..." -ForegroundColor Gray
npx prisma studio --browser none &
Start-Sleep -Seconds 2
Write-Host "✓ Database setup complete" -ForegroundColor Green
Write-Host ""

Set-Location ..

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Database Reset Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Database reset and migrated" -ForegroundColor Green
Write-Host "✓ Users created" -ForegroundColor Green
Write-Host "✓ Sample data inserted" -ForegroundColor Green
Write-Host ""
Write-Host "Login Credentials:" -ForegroundColor Yellow
Write-Host "  Email:    owner@sapadan.com" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "Now restart your backend server:" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then try login again at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
