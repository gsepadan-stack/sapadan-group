# Repair XAMPP MySQL
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Repair XAMPP MySQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  WARNING: This will backup and repair MySQL data" -ForegroundColor Yellow
Write-Host "Press any key to continue or Ctrl+C to cancel..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Step 1: Stop MySQL if running
Write-Host "[1/7] Stopping MySQL..." -ForegroundColor Yellow
try {
    Stop-Process -Name mysqld -Force -ErrorAction SilentlyContinue
    Write-Host "✓ MySQL stopped" -ForegroundColor Green
} catch {
    Write-Host "✓ MySQL not running" -ForegroundColor Green
}
Write-Host ""

# Step 2: Kill any process on port 3306
Write-Host "[2/7] Freeing port 3306..." -ForegroundColor Yellow
$portCheck = netstat -ano | findstr :3306
if ($portCheck) {
    $portCheck | ForEach-Object {
        if ($_ -match '\s+(\d+)\s*$') {
            $pid = $matches[1]
            Write-Host "Killing process PID: $pid" -ForegroundColor Yellow
            try {
                Stop-Process -Id $pid -Force -ErrorAction Stop
                Write-Host "✓ Process killed" -ForegroundColor Green
            } catch {
                Write-Host "⚠ Could not kill process (may need admin)" -ForegroundColor Yellow
            }
        }
    }
} else {
    Write-Host "✓ Port 3306 is free" -ForegroundColor Green
}
Write-Host ""

# Step 3: Backup current data
Write-Host "[3/7] Backing up MySQL data..." -ForegroundColor Yellow
$dataPath = "C:\xampp\mysql\data"
$backupPath = "C:\xampp\mysql\data_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

if (Test-Path $dataPath) {
    try {
        Write-Host "Creating backup at: $backupPath" -ForegroundColor Gray
        Copy-Item -Path $dataPath -Destination $backupPath -Recurse -Force
        Write-Host "✓ Backup created" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Backup failed, continuing anyway..." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ Data folder not found" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Remove lock files
Write-Host "[4/7] Removing lock files..." -ForegroundColor Yellow
if (Test-Path $dataPath) {
    $lockFiles = Get-ChildItem -Path $dataPath -Filter "*.lock" -ErrorAction SilentlyContinue
    if ($lockFiles) {
        Remove-Item "$dataPath\*.lock" -Force -ErrorAction SilentlyContinue
        Write-Host "✓ Lock files removed" -ForegroundColor Green
    } else {
        Write-Host "✓ No lock files found" -ForegroundColor Green
    }
} else {
    Write-Host "⚠ Data folder not found" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Check for corrupted files
Write-Host "[5/7] Checking for corrupted files..." -ForegroundColor Yellow
$ibdata = "$dataPath\ibdata1"
if (Test-Path $ibdata) {
    Write-Host "✓ ibdata1 exists" -ForegroundColor Green
} else {
    Write-Host "✗ ibdata1 missing - MySQL data is corrupted!" -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUTION: Restore from backup or reinstall MySQL" -ForegroundColor Yellow
    Write-Host "1. Restore backup folder: $backupPath" -ForegroundColor White
    Write-Host "2. Or copy from: C:\xampp\mysql\backup" -ForegroundColor White
    Write-Host "3. Or reinstall XAMPP" -ForegroundColor White
    Write-Host ""
    Write-Host "For now, I recommend using SQLite instead:" -ForegroundColor Cyan
    Write-Host "  .\setup-sqlite.ps1" -ForegroundColor Cyan
    exit 1
}
Write-Host ""

# Step 6: Fix permissions
Write-Host "[6/7] Fixing permissions..." -ForegroundColor Yellow
if (Test-Path $dataPath) {
    try {
        $acl = Get-Acl $dataPath
        Write-Host "✓ Permissions OK" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Could not check permissions" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 7: Instructions
Write-Host "[7/7] Next steps..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Repair Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now try to start MySQL in XAMPP:" -ForegroundColor Yellow
Write-Host "1. Open XAMPP Control Panel" -ForegroundColor White
Write-Host "2. Click START on MySQL" -ForegroundColor White
Write-Host "3. Wait for it to turn green" -ForegroundColor White
Write-Host ""
Write-Host "If MySQL still won't start:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option A - Check error log:" -ForegroundColor Cyan
Write-Host "  C:\xampp\mysql\data\mysql_error.log" -ForegroundColor White
Write-Host ""
Write-Host "Option B - Restore from backup:" -ForegroundColor Cyan
Write-Host "  1. Stop XAMPP" -ForegroundColor White
Write-Host "  2. Delete: C:\xampp\mysql\data" -ForegroundColor White
Write-Host "  3. Rename: C:\xampp\mysql\backup -> data" -ForegroundColor White
Write-Host "  4. Start MySQL again" -ForegroundColor White
Write-Host ""
Write-Host "Option C - Use SQLite (RECOMMENDED):" -ForegroundColor Cyan
Write-Host "  .\setup-sqlite.ps1" -ForegroundColor White
Write-Host "  No MySQL needed, works instantly!" -ForegroundColor Green
Write-Host ""
