# Ubuntu 24.04 VPS Deployment & Domain Configuration Guide

This guide describes how to deploy the **Tanha Fashion** e-commerce store (Next.js frontend & Express/Prisma/SQLite backend) on a clean **Ubuntu 24.04 LTS** VPS and bind it to your domain **tanhafasion.com**.

---

## Architecture Overview

We will configure a single-domain routing architecture. Running both frontend and backend under the same domain (e.g., `tanhafasion.com` and `tanhafasion.com/api`) avoids cross-domain CORS issues, cookie blockage, and simplifies SSL certificate management.

* **Frontend**: Next.js (runs locally on port `3000`)
* **Backend**: Express API (runs locally on port `5000`)
* **Database**: SQLite (managed via Prisma ORM)
* **Reverse Proxy**: Nginx (listens on ports `80`/`443` and routes traffic accordingly)
* **Process Manager**: PM2 (keeps both servers running and auto-restarts them on crashes or system reboots)

---

## Step 1: System Preparation & Prerequisites

Log in to your Ubuntu 24.04 VPS via SSH:
```bash
ssh root@103.168.91.79
```

### 1. Update Package Registry
Ensure all system packages are up to date:
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Git, Curl, & SQLite3
Install essential dependencies:
```bash
sudo apt install -y git curl sqlite3 build-essential
```

### 3. Install Node.js v20 LTS
Set up the NodeSource repository and install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```
Verify the installation:
```bash
node -v   # Should be v20.x
npm -v    # Verify npm is installed
```

### 4. Install PM2 globally
PM2 manages background processes in production:
```bash
sudo npm install -y -g pm2
```

---

## Step 2: Clone and Configure the Application

### 1. Clone the Project
Navigate to your root home directory and clone your repository:
```bash
cd ~
git clone https://github.com/al-prv8/tanha-fasion.git tanha-fasion
cd ~/tanha-fasion
```

### 2. Configure Backend Environment (`server/.env`)
Create the server configuration file:
```bash
nano server/.env
```
Paste the following production configuration:
```env
PORT=5000
NODE_ENV=production
DATABASE_URL="file:./dev.db"

# Replace with a long random string
JWT_SECRET="generate_a_secure_long_secret_here"

# Steadfast Courier Merchant API keys
STEADFAST_API_KEY="az7qvs57zmyzdea0bj0t9lj3h6ff6xd9"
STEADFAST_SECRET_KEY="md14najjfbq1gvgndgw0oiq3"

# Your production domain (no trailing slash)
FRONTEND_URL="https://tanhafasion.com"
```
*Press `Ctrl + O` and `Enter` to save, then `Ctrl + X` to exit.*

### 3. Configure Frontend Environment (`.env.production`)
Configure the Next.js client environment variables:
```bash
nano .env.production
```
Paste the following:
```env
# Tells the client to send requests to the relative /api route under the same domain
NEXT_PUBLIC_API_URL="https://tanhafasion.com"
```
*Save and exit.*

---

## Step 3: Install Dependencies & Initialize Database

### 1. Install Workspace Dependencies
Install packages at the root workspace:
```bash
npm install
```

### 2. Setup Backend Dependencies & Prisma
Install backend packages and generate the Prisma Client bindings:
```bash
cd server
npm install
npx prisma generate
```

### 3. Initialize SQLite Database
Push the database schema rules to the production SQLite file:
```bash
npx prisma db push
```
*Note: The database is seeded via a built-in Express API endpoint. Once the backend server is running (Step 5), you can seed/reset the database with default categories, 24 catalog products, coupons, FAQs, announcements, and the admin user (`admin@tanha.com` / `adminpassword123`) by running the following command:*
```bash
curl -X POST http://localhost:5000/api/seed
```

Navigate back to the project root:
```bash
cd ~/tanha-fasion
```

---

## Step 4: Build Frontend & Backend Packages

Compile both parts of the system into production-optimized bundles:
```bash
# Compiles Next.js pages and Express server code
npm run build:all
```

---

## Step 5: Configure Process Management (PM2)

We will configure PM2 to keep both Next.js and Express servers active in the background.

### 1. Create a PM2 Configuration File
Create an ecosystem config file in the root workspace directory:
```bash
nano ecosystem.config.cjs
```
Paste the configuration layout (configured for absolute path `/root/tanha-fasion`):
```javascript
module.exports = {
  apps: [
    {
      name: "tanha-backend",
      cwd: "/root/tanha-fasion/server",
      script: "dist/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      }
    },
    {
      name: "tanha-frontend",
      cwd: "/root/tanha-fasion",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
```
*Save and exit.*

### 2. Start Services
Launch the background servers:
```bash
pm2 start ecosystem.config.cjs
```

### 3. Monitor Logs & Save Startup Configuration
Verify that both processes are running successfully:
```bash
pm2 list
pm2 logs
```
Configure PM2 to automatically restart both servers on system reboots:
```bash
pm2 save
pm2 startup
```
*Run the command outputted by `pm2 startup` to register the system service.*

---

## Step 6: Configure Nginx Reverse Proxy

### 1. Install Nginx
```bash
sudo apt install -y nginx
```

### 2. Create Virtual Host Configuration
Create a new configuration block for your domain:
```bash
sudo nano /etc/nginx/sites-available/tanhafasion.com
```
Paste the following Nginx server blocks (replace `tanhafasion.com` with your actual domain):
```nginx
server {
    listen 80;
    server_name tanhafasion.com www.tanhafasion.com;

    # Frontend (Next.js running on port 3000)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (Express running on port 5000)
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Adjust request payload limits for images uploads
        client_max_body_size 10M;
    }

    # Statically serve backend uploads directory
    location /uploads {
        alias /root/tanha-fasion/server/uploads;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```
*Save and exit.*

### 3. Enable Configuration & Test Nginx
Link the site configuration to enable it, remove the default site, and check for syntax errors:
```bash
sudo ln -s /etc/nginx/sites-available/tanhafasion.com /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
```
If the test says `syntax is ok`, restart Nginx:
```bash
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## Step 7: Configure DNS and Let's Encrypt SSL

### 1. Point DNS Records
Log in to your Domain Registrar (Namecheap, GoDaddy, Cloudflare, etc.) and add the following records:
* **A Record**: `@` -> `103.168.91.79`
* **CNAME Record**: `www` -> `tanhafasion.com`

*Wait a few minutes for DNS propagation.*

### 2. Install Certbot
Install Certbot for Nginx to acquire a free Let's Encrypt SSL certificate:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 3. Generate SSL Certificate
Run Certbot to fetch the certificate and let it automatically update your Nginx configuration to support secure HTTPS redirects:
```bash
sudo certbot --nginx -d tanhafasion.com -d www.tanhafasion.com
```
*Enter your email address and accept terms when prompted.*

### 4. Verify Automatic Renewal
Let's Encrypt certificates are valid for 90 days. Certbot configures a cron job to automatically renew them. You can test the renewal process:
```bash
sudo certbot renew --dry-run
```

---

## Step 8: Database Backups & Maintenance

Since you are using SQLite, backing up your database is as simple as copying the `dev.db` file. 

Create a shell script to run daily backups:
```bash
mkdir -p ~/backups
nano ~/backup_db.sh
```
Paste this command (configured to use `/root` folders):
```bash
#!/bin/bash
BACKUP_NAME="db_backup_$(date +%F_%T).sql"
sqlite3 /root/tanha-fasion/server/prisma/dev.db ".backup '/root/backups/$BACKUP_NAME'"
# Keep only the last 30 days of backups
find /root/backups/ -type f -mtime +30 -name '*.sql' -exec rm -- {} \;
```
Make the script executable:
```bash
chmod +x ~/backup_db.sh
```
Add it to your crontab (`crontab -e`) to run at midnight every day:
```cron
0 0 * * * /root/backup_db.sh
```

---

## Deploying Code Updates in the Future

When you push new changes to GitHub and need to deploy them to your server:
```bash
cd ~/tanha-fasion
git pull
npm install
cd server && npm install && npx prisma db push && cd ..
npm run build:all
pm2 restart ecosystem.config.cjs
```
