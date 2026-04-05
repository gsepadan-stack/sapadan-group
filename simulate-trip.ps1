# Simulasi Trip Kendaraan dengan GPS Tracking
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Simulasi Trip Kendaraan" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Login sebagai driver
Write-Host "[1/5] Login driver..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method POST -Body (@{
    email = 'driver@sapadan.com'
    password = 'password123'
} | ConvertTo-Json) -ContentType 'application/json'

$token = $loginResponse.token
Write-Host "✓ Login berhasil" -ForegroundColor Green
Write-Host ""

# Get vehicle ID (ambil kendaraan pertama)
Write-Host "[2/5] Ambil data kendaraan..." -ForegroundColor Yellow
$vehicles = Invoke-RestMethod -Uri 'http://localhost:5000/api/vehicles' -Headers @{
    Authorization = "Bearer $token"
}
$vehicleId = $vehicles[0].id
$platNomor = $vehicles[0].platNomor
Write-Host "✓ Kendaraan: $platNomor" -ForegroundColor Green
Write-Host ""

# Start trip
Write-Host "[3/5] Memulai perjalanan..." -ForegroundColor Yellow
$trip = Invoke-RestMethod -Uri 'http://localhost:5000/api/driver/trip/start' -Method POST -Headers @{
    Authorization = "Bearer $token"
} -Body (@{
    vehicleId = $vehicleId
    tujuan = "Pasar Ikan Muara Baru"
    kmAwal = 12500
    muatan = "Ikan Lele 500 Kg"
} | ConvertTo-Json) -ContentType 'application/json'

$tripId = $trip.id
Write-Host "✓ Trip dimulai: $($trip.tujuan)" -ForegroundColor Green
Write-Host "  Trip ID: $tripId" -ForegroundColor Gray
Write-Host ""

# Simulasi GPS tracking (10 titik lokasi)
Write-Host "[4/5] Simulasi GPS tracking..." -ForegroundColor Yellow
Write-Host "  Mengirim lokasi setiap 2 detik..." -ForegroundColor Gray
Write-Host ""

# Koordinat Jakarta (simulasi rute)
$locations = @(
    @{ lat = -6.2088; lng = 106.8456; speed = 0 },      # Start
    @{ lat = -6.2078; lng = 106.8466; speed = 20 },     # Jalan
    @{ lat = -6.2068; lng = 106.8476; speed = 35 },     # Jalan
    @{ lat = -6.2058; lng = 106.8486; speed = 40 },     # Jalan
    @{ lat = -6.2048; lng = 106.8496; speed = 45 },     # Jalan
    @{ lat = -6.2038; lng = 106.8506; speed = 30 },     # Melambat
    @{ lat = -6.2028; lng = 106.8516; speed = 25 },     # Melambat
    @{ lat = -6.2018; lng = 106.8526; speed = 15 },     # Hampir sampai
    @{ lat = -6.2008; lng = 106.8536; speed = 10 },     # Hampir sampai
    @{ lat = -6.2000; lng = 106.8546; speed = 0 }       # Sampai
)

$count = 1
foreach ($loc in $locations) {
    try {
        $response = Invoke-RestMethod -Uri 'http://localhost:5000/api/driver/location' -Method POST -Headers @{
            Authorization = "Bearer $token"
        } -Body (@{
            tripLogId = $tripId
            latitude = $loc.lat
            longitude = $loc.lng
            accuracy = 10
            speed = $loc.speed
        } | ConvertTo-Json) -ContentType 'application/json'
        
        Write-Host "  [$count/10] Lokasi: $($loc.lat), $($loc.lng) | Kecepatan: $($loc.speed) km/h" -ForegroundColor Cyan
        $count++
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "  ✗ Error mengirim lokasi: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✓ GPS tracking selesai" -ForegroundColor Green
Write-Host ""

# End trip
Write-Host "[5/5] Mengakhiri perjalanan..." -ForegroundColor Yellow
$endTrip = Invoke-RestMethod -Uri "http://localhost:5000/api/driver/trip/$tripId/end" -Method POST -Headers @{
    Authorization = "Bearer $token"
} -Body (@{
    kmAkhir = 12520
    catatan = "Pengiriman selesai tepat waktu"
} | ConvertTo-Json) -ContentType 'application/json'

Write-Host "✓ Trip selesai" -ForegroundColor Green
Write-Host "  Total KM: $($endTrip.totalKm) km" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Simulasi Selesai!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Hasil:" -ForegroundColor Yellow
Write-Host "  - Kendaraan: $platNomor" -ForegroundColor White
Write-Host "  - Tujuan: $($trip.tujuan)" -ForegroundColor White
Write-Host "  - Muatan: $($trip.muatan)" -ForegroundColor White
Write-Host "  - Total KM: $($endTrip.totalKm) km" -ForegroundColor White
Write-Host "  - Lokasi terkirim: 10 titik" -ForegroundColor White
Write-Host ""
Write-Host "Lihat hasil di dashboard:" -ForegroundColor Yellow
Write-Host "  http://localhost:3000/fleet" -ForegroundColor Cyan
Write-Host ""
