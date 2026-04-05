# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm run install:all
```

### Step 2: Setup Database
```bash
# Create PostgreSQL database
createdb sapadan_fishery

# Configure backend environment
cd backend
cp .env.example .env
# Edit .env and set your DATABASE_URL
```

### Step 3: Run Migrations & Seed
```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
npx tsx prisma/seed.ts
```

### Step 4: Configure Frontend
```bash
cd frontend
cp .env.example .env
# Default settings should work for local development
```

### Step 5: Start Development Servers
```bash
# From root directory
npm run dev
```

### Step 6: Login
Open browser: `http://localhost:3000`

**Default Credentials:**
- Email: `owner@sapadan.com`
- Password: `password123`

---

## 📱 What You Can Do Now

### ✅ Fully Working Features

1. **Login & Authentication**
   - JWT-based authentication
   - Role-based access control

2. **Dashboard**
   - View sales statistics
   - View profit & revenue charts
   - Monitor kolam statistics

3. **Sales Order Management** (Complete Module)
   - Create new orders
   - View all orders
   - Update order status
   - Filter by status
   - Auto-complete customer data

4. **Product Management**
   - Add/Edit/Delete products
   - Manage stock
   - Set prices

---

## 🔄 Next Modules to Implement

The database schema is ready for these modules. You just need to create the UI:

1. **Modul Pakan**
   - Backend: ✅ Ready
   - Frontend: ⏳ Need to implement

2. **Modul Kolam**
   - Backend: ✅ Ready
   - Frontend: ⏳ Need to implement

3. **Modul Payroll**
   - Backend: ✅ Ready
   - Frontend: ⏳ Need to implement

4. **Modul Lembur**
   - Backend: ✅ Ready
   - Frontend: ⏳ Need to implement

---

## 📚 Documentation

- [README.md](../README.md) - Project overview
- [API.md](./API.md) - API documentation
- [ERD.md](./ERD.md) - Database schema
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide

---

## 🆘 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Check connection string in backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/sapadan_fishery"
```

### Port Already in Use
```bash
# Backend (port 5000)
lsof -i :5000
kill -9 <PID>

# Frontend (port 3000)
lsof -i :3000
kill -9 <PID>
```

### Prisma Client Error
```bash
cd backend
npm run prisma:generate
```

---

## 💡 Tips

1. **Use Prisma Studio** to view/edit database:
   ```bash
   cd backend
   npm run prisma:studio
   ```

2. **Check API Health**:
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **View Backend Logs**:
   Backend logs appear in the terminal where you ran `npm run dev`

4. **Redux DevTools**:
   Install Redux DevTools browser extension to debug state

---

## 🎯 Example Workflow

### Creating a Sales Order

1. Login as Owner/Admin
2. Navigate to "Pemesanan Ikan"
3. Click "Tambah Pesanan"
4. Fill customer data (or select existing)
5. Add products with quantity
6. Review total amount
7. Click "Simpan Pesanan"
8. Order appears in list with status "PENDING"
9. Change status to "DIPROSES" → "DIKIRIM" → "SELESAI"

### Managing Products

1. Navigate to "Produk"
2. Click "Tambah Produk"
3. Fill product details
4. Set price and stock
5. Click "Simpan"
6. Product appears in list
7. Use in sales orders

---

## 🔐 User Roles

| Role | Access Level |
|------|-------------|
| OWNER | Full access to everything |
| ADMIN | All operational features |
| SUPERVISOR | View reports, approve lembur |
| STAFF | Basic operations only |

---

## 📞 Support

For issues or questions:
1. Check documentation in `/docs`
2. Review error logs
3. Check database connection
4. Verify environment variables

---

## ✨ What Makes This System Special

1. **Production-Ready Architecture**
   - Clean code structure
   - TypeScript for type safety
   - Proper error handling
   - Security best practices

2. **Scalable Design**
   - Modular architecture
   - Easy to add new features
   - Multi-cabang ready
   - Audit logging built-in

3. **Modern Tech Stack**
   - React 18 + TypeScript
   - Redux Toolkit
   - Material-UI
   - Prisma ORM
   - PostgreSQL

4. **Complete Documentation**
   - API documentation
   - Database ERD
   - Development guide
   - Deployment guide

---

Happy Coding! 🎉
