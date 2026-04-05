# 🚚 Sapadan Driver App

Mobile web app untuk driver dengan GPS tracking real-time menggunakan browser geolocation API.

## Fitur

✅ **Login Driver** - Autentikasi dengan backend  
✅ **GPS Tracking Real-time** - Menggunakan browser geolocation API  
✅ **Auto Send Location** - Kirim lokasi otomatis ke server setiap update  
✅ **Trip Management** - Start/End trip  
✅ **Speed Monitor** - Tampilkan kecepatan real-time  
✅ **Mobile Optimized** - Responsive design untuk smartphone  

## Cara Install

```bash
cd driver-app
npm install
```

## Cara Menjalankan

```bash
npm run dev
```

App akan jalan di: **http://localhost:3001**

## Akses dari HP

1. Pastikan HP dan laptop di jaringan WiFi yang sama
2. Cek IP laptop: `ipconfig` (Windows) atau `ifconfig` (Mac/Linux)
3. Buka di HP: `http://[IP-LAPTOP]:3001`
   Contoh: `http://192.168.1.100:3001`

## Login

Gunakan akun karyawan yang sudah terdaftar:
- Email: (email karyawan)
- Password: password123

## Cara Kerja GPS Tracking

1. **Driver Login** - Masuk dengan akun karyawan
2. **Admin Start Trip** - Admin memulai trip dari dashboard
3. **GPS Auto Start** - App otomatis mulai tracking GPS
4. **Send Location** - Lokasi dikirim ke server setiap GPS update
5. **End Trip** - Driver mengakhiri trip dan input KM akhir

## Teknologi

- **React + TypeScript** - Frontend framework
- **Vite** - Build tool
- **Browser Geolocation API** - GPS tracking
- **Axios** - HTTP client
- **CSS3** - Styling

## API Endpoints

- `POST /api/auth/login` - Login driver
- `GET /api/driver/trip/active` - Get active trip
- `POST /api/driver/location` - Send location update
- `POST /api/driver/trip/:id/end` - End trip

## Browser Support

✅ Chrome (Android/iOS)  
✅ Safari (iOS)  
✅ Firefox (Android)  
✅ Edge (Android)  

**Note:** GPS hanya bekerja di HTTPS atau localhost

## Production Deployment

Untuk production, deploy dengan HTTPS:
- Vercel
- Netlify
- Firebase Hosting
- AWS Amplify

## Keuntungan vs GPS Device

✅ **Murah** - Tidak perlu beli hardware GPS  
✅ **Mudah** - Cukup buka browser  
✅ **Akurat** - Menggunakan GPS smartphone  
✅ **Real-time** - Update lokasi otomatis  
✅ **Maintenance Free** - Tidak perlu charge/ganti baterai  

## Troubleshooting

### GPS tidak bekerja
- Pastikan location permission diizinkan di browser
- Pastikan GPS aktif di HP
- Coba refresh halaman

### Tidak bisa login
- Pastikan backend jalan di http://localhost:5000
- Cek email dan password

### Lokasi tidak akurat
- Pastikan di area terbuka (bukan dalam gedung)
- Tunggu beberapa saat untuk GPS lock

## Future Enhancements

- 🗺️ Tampilkan peta dengan Leaflet/Google Maps
- 📊 Statistik perjalanan
- 📸 Upload foto bukti pengiriman
- 🔔 Push notifications
- 📱 Install as PWA (Progressive Web App)
- 🌐 Offline mode
