# VPS SQLite ➔ PostgreSQL Migration Guide

Follow these steps on your live VPS to upgrade the active SQLite store database to the new PostgreSQL configuration.

---

### Step 1: Install PostgreSQL on the VPS
Log in to your VPS via SSH and install PostgreSQL:
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

### Step 2: Create PostgreSQL Database & User
Log into the PostgreSQL terminal:
```bash
sudo -i -u postgres psql
```
Execute the database setup commands (replace `your_secure_password` with a strong password):
```sql
CREATE DATABASE tanha_db;
CREATE USER tanha_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE tanha_db TO tanha_user;
\q
```

### Step 3: Pull Code Updates
Navigate to the repository folder, discard local changes to the old SQLite file (to prevent Git pull merge aborts), and pull the latest code:
```bash
cd ~/tanha-fasion
git checkout server/prisma/dev.db
git pull
```

### Step 4: Update Environment Configuration (`server/.env`)
Open your server environment config:
```bash
nano server/.env
```
Find the `DATABASE_URL` line:
```env
DATABASE_URL="file:./dev.db"
```
Replace it with your PostgreSQL connection string (using the password set in Step 2):
```env
DATABASE_URL="postgresql://tanha_user:your_secure_password@localhost:5432/tanha_db"
```
*Press `Ctrl + O` and `Enter` to save, then `Ctrl + X` to exit.*

### Step 5: Install Dependencies & Initialize Database Schema
Install the updated dependencies and push the Prisma database schema:
```bash
npm install
cd server
npm install
npx prisma generate
npx prisma db push
cd ..
```

### Step 6: Build & Restart PM2 Services
Rebuild the workspace and restart the background servers with the updated environment configurations:
```bash
npm run build:all
pm2 restart ecosystem.config.cjs --update-env
```

### Step 7: Seed Default Storefront Data
Seed the new database with products, categories, coupons, FAQs, and the super-admin account:
```bash
curl -X POST http://localhost:5000/api/seed
```
*Note: The seeded Super Admin login is `super-admin@tanhafashion.com` with password `superadmin123`.*

---

### Step 8: Update Daily Database Backups (Optional)
Open your backup shell script:
```bash
nano ~/backup_db.sh
```
Replace the old `sqlite3` command block with the `pg_dump` backup tool (using your database password):
```bash
#!/bin/bash
BACKUP_NAME="db_backup_$(date +%F_%T).sql"
PGPASSWORD="your_secure_password" pg_dump -U tanha_user -h localhost -d tanha_db -F p -f "/root/backups/$BACKUP_NAME"
# Keep only the last 30 days of backups
find /root/backups/ -type f -mtime +30 -name '*.sql' -exec rm -- {} \;
```
*Save and exit.*
