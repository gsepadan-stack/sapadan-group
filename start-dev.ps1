# Start Development Servers
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Development Servers" -ForegroundColor Cyan
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

# Check if database exists
Write-Host "Checking database setup..." -ForegroundColor Yellow
if (-not (Test-Path backend\.env)) {
    Write-Host "✗ Backend .env not found!" -ForegroundColor Red
    Write-Host "Please run: .\setup-database.ps1 first" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Backend configured" -ForegroundColor Green
Write-Host ""

Write-Host "Starting servers..." -ForegroundColor Yellow
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop servers" -ForegroundColor Gray
Write-Host ""

# Start development
npm run dev
