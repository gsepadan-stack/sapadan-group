# Test Login API
Write-Host "Testing login API..." -ForegroundColor Yellow
Write-Host ""

$body = @{
    email = "owner@sapadan.com"
    password = "password123"
} | ConvertTo-Json

Write-Host "Request body:" -ForegroundColor Cyan
Write-Host $body
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
    Write-Host "Token:" -ForegroundColor Yellow
    Write-Host $response.token
} catch {
    Write-Host "✗ Login failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message
    Write-Host ""
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Details:" -ForegroundColor Yellow
        $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 10
    }
}
