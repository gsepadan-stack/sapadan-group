# Panduan Deployment

## Stack
- **Backend**: Express.js + Prisma + PostgreSQL → **Render.com**
- **Frontend**: Vite + React → **Vercel**
- **Driver App**: Vite + React → **Vercel**
- **Database**: PostgreSQL → **Neon** (free) atau Render Postgres

---

## 1. Setup Database PostgreSQL (Neon - Gratis)

1. Buka [https://neon.tech](https://neon.tech) → Sign up / Login
2. Klik **"New Project"**
3. Isi nama project (contoh: `sapadan-db`)
4. Pilih region terdekat (Singapore)
5. Setelah selesai, copy **Connection String** yang formatnya:
   ```
   postgresql://user:password@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

---

## 2. Deploy Backend ke Render.com

1. Push kode ke GitHub terlebih dahulu
2. Buka [https://render.com](https://render.com) → Sign up / Login dengan GitHub
3. Klik **"New +"** → **"Web Service"**
4. Connect ke repository GitHub kamu
5. Konfigurasi:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy && npx tsx prisma/seed.ts`
   - **Start Command**: `node dist/server.js`
   - **Environment**: Node
6. Tambah **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Connection string dari Neon |
   | `JWT_SECRET` | String random panjang (min 32 karakter) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
7. Klik **Deploy**
8. Setelah selesai, catat URL backend (contoh: `https://sapadan-backend.onrender.com`)

---

## 3. Deploy Frontend ke Vercel

1. Buka [https://vercel.com](https://vercel.com) → Sign up / Login dengan GitHub
2. Klik **"New Project"** → Import repository
3. Konfigurasi:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Tambah **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://sapadan-backend.onrender.com/api` |
   | `VITE_APP_NAME` | `Sapadan Fishery System` |
5. Klik **Deploy**

---

## 4. Deploy Driver App ke Vercel

1. Di Vercel, klik **"New Project"** lagi → Import repository yang sama
2. Konfigurasi:
   - **Root Directory**: `driver-app`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Tambah **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://sapadan-backend.onrender.com/api` |
4. Klik **Deploy**

---

## 5. Test Deployment

Setelah semua deploy, test:
1. Buka URL frontend → Login dengan akun admin
2. Buka URL driver-app → Login dengan akun driver
3. Cek semua fitur berjalan normal

---

## Catatan Penting

- **Render free tier**: Backend akan "sleep" setelah 15 menit tidak ada request. Request pertama akan lambat (~30 detik). Upgrade ke paid plan untuk production.
- **Neon free tier**: 0.5 GB storage, cukup untuk development & staging.
- **CORS**: Pastikan URL frontend/driver-app sudah di-whitelist di backend. Lihat `src/server.ts`.

---

## Development Lokal

```bash
# Install semua dependencies
npm run install:all

# Jalankan backend
cd backend && npm run dev

# Jalankan frontend (terminal baru)
cd frontend && npm run dev

# Jalankan driver-app (terminal baru)
cd driver-app && npm run dev
```

### Environment Variables Lokal

Backend (`backend/.env`):
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
JWT_SECRET="development-secret-key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
```

Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Sapadan Fishery System
```

Driver App (`driver-app/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```
