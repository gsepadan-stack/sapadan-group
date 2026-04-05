@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════════════════════╗
echo ║   Sapadan Fishery System - MySQL Setup Wizard         ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo [STEP 1/7] Checking MySQL XAMPP...
echo.
echo Please make sure:
echo ✓ XAMPP Control Panel is open
echo ✓ MySQL is STARTED (green)
echo.
pause

echo.
echo [STEP 2/7] Installing dependencies...
call npm run install:all
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo [STEP 3/7] Setting up backend environment...
cd backend
if not exist .env (
    copy .env.example .env
    echo ✓ Created .env file
    echo.
    echo ⚠️  IMPORTANT: Edit backend\.env file
    echo    Set DATABASE_URL to: mysql://root@localhost:3306/sapadan_fishery
    echo    (Add password if needed: mysql://root:password@localhost:3306/sapadan_fishery)
    echo.
    pause
) else (
    echo ✓ .env file already exists
)
echo.

echo [STEP 4/7] Creating database...
echo.
echo Please create database manually:
echo.
echo Option A - phpMyAdmin:
echo   1. Open: http://localhost/phpmyadmin
echo   2. Click SQL tab
echo   3. Run: CREATE DATABASE sapadan_fishery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
echo.
echo Option B - Command Line:
echo   1. cd C:\xampp\mysql\bin
echo   2. mysql -u root
echo   3. CREATE DATABASE sapadan_fishery;
echo   4. exit;
echo.
echo Press any key after database is created...
pause >nul
echo.

echo [STEP 5/7] Generating Prisma Client...
call npm run prisma:generate
if errorlevel 1 (
    echo ❌ Failed to generate Prisma Client
    echo    Make sure DATABASE_URL in .env is correct
    pause
    exit /b 1
)
echo ✓ Prisma Client generated
echo.

echo [STEP 6/7] Running database migrations...
call npm run prisma:migrate
if errorlevel 1 (
    echo ❌ Failed to run migrations
    echo    Check if database exists and DATABASE_URL is correct
    pause
    exit /b 1
)
echo ✓ Migrations completed
echo.

echo [STEP 7/7] Seeding database...
call npx tsx prisma/seed.ts
if errorlevel 1 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)
echo ✓ Database seeded
echo.

cd ..

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║              🎉 Setup Complete! 🎉                     ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo ✓ MySQL configured
echo ✓ Database created and migrated
echo ✓ Sample data inserted
echo.
echo Default Login:
echo   Email: owner@sapadan.com
echo   Password: password123
echo.
echo To start development:
echo   npm run dev
echo.
echo Then open: http://localhost:3000
echo.
pause
