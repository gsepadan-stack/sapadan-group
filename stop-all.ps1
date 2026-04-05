# Stop all Node.js processes
Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow

Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "✓ All Node.js processes stopped" -ForegroundColor Green
Write-Host ""
Write-Host "Now you can run: .\setup-sqlite.ps1" -ForegroundColor Cyan
