# Deployment Guide

## Docker Deployment (Recommended)

### 1. Create Docker Files

**docker-compose.yml** (root directory)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: sapadan
      POSTGRES_PASSWORD: sapadan123
      POSTGRES_DB: sapadan_fishery
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - sapadan-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://sapadan:sapadan123@postgres:5432/sapadan_fishery?schema=public
      JWT_SECRET: your-production-secret-key
      JWT_EXPIRES_IN: 7d
      PORT: 5000
      NODE_ENV: production
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    networks:
      - sapadan-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - sapadan-network

volumes:
  postgres_data:

networks:
  sapadan-network:
    driver: bridge
```

**backend/Dockerfile**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
```

**frontend/Dockerfile**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**frontend/nginx.conf**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Deploy with Docker Compose

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### 3. Run Migrations & Seed

```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Seed database
docker-compose exec backend npx tsx prisma/seed.ts
```

---

## Manual Deployment (VPS/Cloud)

### Prerequisites
- Ubuntu 20.04+ / Debian 11+
- Node.js 18+
- PostgreSQL 14+
- Nginx
- PM2 (Process Manager)

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

### 2. Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE sapadan_fishery;
CREATE USER sapadan WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE sapadan_fishery TO sapadan;
\q
```

### 3. Deploy Backend

```bash
# Clone repository
cd /var/www
git clone <repository-url> sapadan-fishery
cd sapadan-fishery/backend

# Install dependencies
npm ci --production

# Setup environment
cp .env.example .env
nano .env
# Edit DATABASE_URL, JWT_SECRET, etc.

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npx tsx prisma/seed.ts

# Build
npm run build

# Start with PM2
pm2 start dist/server.js --name sapadan-backend
pm2 save
pm2 startup
```

### 4. Deploy Frontend

```bash
cd /var/www/sapadan-fishery/frontend

# Install dependencies
npm ci

# Setup environment
cp .env.example .env
nano .env
# Edit VITE_API_URL

# Build
npm run build

# Copy to nginx directory
sudo cp -r dist/* /var/www/html/sapadan/
```

### 5. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/sapadan
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/html/sapadan;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/sapadan /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 6. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Environment Variables (Production)

### Backend (.env)
```env
DATABASE_URL="postgresql://sapadan:secure-password@localhost:5432/sapadan_fishery?schema=public"
JWT_SECRET="very-long-random-secret-key-change-this"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=production
```

### Frontend (.env)
```env
VITE_API_URL=https://your-domain.com/api
VITE_APP_NAME=Sapadan Fishery System
```

---

## Monitoring & Maintenance

### PM2 Commands
```bash
# View logs
pm2 logs sapadan-backend

# Restart
pm2 restart sapadan-backend

# Stop
pm2 stop sapadan-backend

# Monitor
pm2 monit

# List processes
pm2 list
```

### Database Backup
```bash
# Backup
pg_dump -U sapadan sapadan_fishery > backup_$(date +%Y%m%d).sql

# Restore
psql -U sapadan sapadan_fishery < backup_20240101.sql

# Automated backup (cron)
crontab -e
# Add: 0 2 * * * pg_dump -U sapadan sapadan_fishery > /backups/sapadan_$(date +\%Y\%m\%d).sql
```

### Log Rotation
```bash
sudo nano /etc/logrotate.d/sapadan
```

```
/var/www/sapadan-fishery/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

---

## Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (ufw)
- [ ] Disable root SSH login
- [ ] Setup fail2ban
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor logs
- [ ] Rate limiting (optional)

---

## Performance Optimization

### Database
- Add indexes on frequently queried columns
- Use connection pooling
- Regular VACUUM and ANALYZE

### Backend
- Enable compression
- Use caching (Redis)
- Optimize queries

### Frontend
- Enable gzip compression
- Use CDN for static assets
- Lazy loading
- Code splitting

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs sapadan-backend

# Check database connection
psql -U sapadan -d sapadan_fishery

# Regenerate Prisma Client
npx prisma generate
```

### Database migration issues
```bash
# Reset database (CAUTION: Data loss!)
npx prisma migrate reset

# Force deploy
npx prisma migrate deploy --force
```

### Nginx errors
```bash
# Check configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Restart
sudo systemctl restart nginx
```
