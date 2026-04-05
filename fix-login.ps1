# Fix Login Issues
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fixing Login Issues" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "[1/5] Checking backend..." -ForegroundColor Yellow
$backendRunning = netstat -ano | findstr :5000
if (-not $backendRunning) {
    Write-Host "✗ Backend is not running!" -ForegroundColor Red
    Write-Host "Please start backend first:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    exit 1
}
Write-Host "✓ Backend is running" -ForegroundColor Green
Write-Host ""

# Check backend health
Write-Host "[2/5] Checking backend health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing
    Write-Host "✓ Backend is healthy" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend is not responding!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check database connection
Write-Host "[3/5] Checking database..." -ForegroundColor Yellow
if (-not (Test-Path "backend\.env")) {
    Write-Host "✗ Backend .env not found!" -ForegroundColor Red
    Write-Host "Run: .\setup-database.ps1" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Backend .env exists" -ForegroundColor Green
Write-Host ""

# Check if users exist in database
Write-Host "[4/5] Checking users in database..." -ForegroundColor Yellow
Write-Host "Attempting to seed database..." -ForegroundColor Yellow
Set-Location backend
try {
    npx tsx prisma/seed.ts
    Write-Host "✓ Database seeded successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠ Seed may have already run (this is OK)" -ForegroundColor Yellow
}
Set-Location ..
Write-Host ""

# Test login
Write-Host "[5/5] Testing login..." -ForegroundColor Yellow
Write-Host "Attempting login with owner@sapadan.com..." -ForegroundColor Yellow
try {
    $body = @{
        email = "owner@sapadan.com"
        password = "password123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -UseBasicParsing

    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "✗ Login failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error details:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Credentials to use:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Email:    owner@sapadan.com" -ForegroundColor White
Write-Host "Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "Or:" -ForegroundColor Gray
Write-Host "Email:    admin@sapadan.com" -ForegroundColor White
Write-Host "Password: password123" -ForegroundColor White
Write-Host ""
