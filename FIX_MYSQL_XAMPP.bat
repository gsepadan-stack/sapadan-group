@echo off
echo ========================================
echo   Fix MySQL XAMPP - Sapadan Fishery
echo ========================================
echo.

echo [1/5] Checking MySQL port...
netstat -ano | findstr :3306
echo.

echo [2/5] Checking for lock files...
if exist "C:\xampp\mysql\data\*.lock" (
    echo Found lock files. Please close XAMPP and delete them manually.
    echo Location: C:\xampp\mysql\data\
    pause
) else (
    echo No lock files found.
)
echo.

echo [3/5] Instructions to start MySQL:
echo 1. Open XAMPP Control Panel
echo 2. Click START button next to MySQL
echo 3. Wait until it turns green
echo.
pause

echo [4/5] Creating database...
echo Please run this in MySQL:
echo CREATE DATABASE sapadan_fishery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
echo.
echo You can use phpMyAdmin: http://localhost/phpmyadmin
echo.
pause

echo [5/5] Next steps:
echo 1. cd backend
echo 2. copy .env.example .env
echo 3. Edit .env file with: DATABASE_URL="mysql://root@localhost:3306/sapadan_fishery"
echo 4. npm install
echo 5. npm run prisma:generate
echo 6. npm run prisma:migrate
echo 7. npx tsx prisma/seed.ts
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Now you can run: npm run dev
echo.
pause
