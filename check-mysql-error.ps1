# Check MySQL Error Log
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MySQL Error Log Checker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check error log
$errorLog = "C:\xampp\mysql\data\mysql_error.log"
if (Test-Path $errorLog) {
    Write-Host "Reading last 30 lines of error log..." -ForegroundColor Yellow
    Write-Host ""
    Get-Content $errorLog -Tail 30
} else {
    Write-Host "Error log not found at: $errorLog" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if mysqld.exe exists
Write-Host "Checking MySQL executable..." -ForegroundColor Yellow
if (Test-Path "C:\xampp\mysql\bin\mysqld.exe") {
    Write-Host "✓ mysqld.exe found" -ForegroundColor Green
} else {
    Write-Host "✗ mysqld.exe not found!" -ForegroundColor Red
}
Write-Host ""

# Check my.ini
Write-Host "Checking my.ini configuration..." -ForegroundColor Yellow
$myini = "C:\xampp\mysql\bin\my.ini"
if (Test-Path $myini) {
    Write-Host "✓ my.ini found" -ForegroundColor Green
    Write-Host ""
    Write-Host "Port configuration:" -ForegroundColor Yellow
    Get-Content $myini | Select-String "port" | Select-Object -First 5
} else {
    Write-Host "✗ my.ini not found!" -ForegroundColor Red
}
Write-Host ""

# Check data directory
Write-Host "Checking data directory..." -ForegroundColor Yellow
if (Test-Path "C:\xampp\mysql\data") {
    Write-Host "✓ Data directory exists" -ForegroundColor Green
    
    # Check for important files
    $ibdata = "C:\xampp\mysql\data\ibdata1"
    if (Test-Path $ibdata) {
        Write-Host "✓ ibdata1 exists" -ForegroundColor Green
    } else {
        Write-Host "✗ ibdata1 missing (MySQL data corrupted!)" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Data directory not found!" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Common Solutions:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Port already in use:" -ForegroundColor White
Write-Host "   - Check XAMPP Control Panel logs" -ForegroundColor Gray
Write-Host "   - Change port in my.ini" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Data corruption:" -ForegroundColor White
Write-Host "   - Backup C:\xampp\mysql\data" -ForegroundColor Gray
Write-Host "   - Restore from backup or reinstall" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Permission issues:" -ForegroundColor White
Write-Host "   - Run XAMPP as Administrator" -ForegroundColor Gray
Write-Host ""
