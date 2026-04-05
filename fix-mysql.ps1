# Fix MySQL XAMPP Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fix MySQL XAMPP - Sapadan Fishery" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check port
Write-Host "[1/5] Checking port 3306..." -ForegroundColor Yellow
$portCheck = netstat -ano | findstr :3306
if ($portCheck) {
    Write-Host "Port 3306 is in use. Attempting to free it..." -ForegroundColor Red
    
    # Extract PID and kill
    $portCheck | ForEach-Object {
        if ($_ -match '\s+(\d+)\s*$') {
            $pid = $matches[1]
            Write-Host "Killing process PID: $pid" -ForegroundColor Yellow
            try {
                Stop-Process -Id $pid -Force -ErrorAction Stop
                Write-Host "✓ Process killed successfully" -ForegroundColor Green
            } catch {
                Write-Host "✗ Could not kill process (might need admin rights)" -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "✓ Port 3306 is free" -ForegroundColor Green
}
Write-Host ""

# Step 2: Kill any mysqld processes
Write-Host "[2/5] Stopping MySQL processes..." -ForegroundColor Yellow
try {
    Get-Process mysqld -ErrorAction Stop | Stop-Process -Force
    Write-Host "✓ MySQL processes stopped" -ForegroundColor Green
} catch {
    Write-Host "✓ No MySQL processes running" -ForegroundColor Green
}
Write-Host ""

# Step 3: Remove lock files
Write-Host "[3/5] Removing lock files..." -ForegroundColor Yellow
$lockPath = "C:\xampp\mysql\data\*.lock"
if (Test-Path "C:\xampp\mysql\data") {
    $lockFiles = Get-ChildItem -Path "C:\xampp\mysql\data" -Filter "*.lock" -ErrorAction SilentlyContinue
    if ($lockFiles) {
        Remove-Item $lockPath -Force -ErrorAction SilentlyContinue
        Write-Host "✓ Lock files removed" -ForegroundColor Green
    } else {
        Write-Host "✓ No lock files found" -ForegroundColor Green
    }
} else {
    Write-Host "⚠ XAMPP mysql data folder not found at C:\xampp\mysql\data" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Start MySQL
Write-Host "[4/5] Starting MySQL..." -ForegroundColor Yellow
Write-Host "Please start MySQL manually in XAMPP Control Panel" -ForegroundColor Cyan
Write-Host "1. Open XAMPP Control Panel" -ForegroundColor White
Write-Host "2. Click START button next to MySQL" -ForegroundColor White
Write-Host "3. Wait until it turns green" -ForegroundColor White
Write-Host ""
Write-Host "Press any key after MySQL is started..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Step 5: Verify
Write-Host "[5/5] Verifying MySQL is running..." -ForegroundColor Yellow
$mysqlRunning = netstat -ano | findstr :3306
if ($mysqlRunning) {
    Write-Host "✓ MySQL is running on port 3306!" -ForegroundColor Green
} else {
    Write-Host "✗ MySQL is not running. Please check XAMPP Control Panel" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MySQL Fix Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: .\setup-database.ps1" -ForegroundColor White
Write-Host "   OR" -ForegroundColor White
Write-Host "2. Create database manually in phpMyAdmin" -ForegroundColor White
Write-Host "   http://localhost/phpmyadmin" -ForegroundColor Cyan
Write-Host ""
