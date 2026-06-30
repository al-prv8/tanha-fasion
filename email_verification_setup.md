# Multi-Factor Authentication (MFA / 2FA) & Verification Setup Guide

This guide details the step-by-step instructions to configure, deploy, verify, and manage the self-hosted custom **Email OTP Verification** and **Multi-Factor Authentication (MFA / 2FA)** systems on your production VPS.

---

## 1. Overview of Security Features

We have built three major security layers directly into your e-commerce platform:

1. **New User Email Verification (OTP)**: Automatically verifies all new customer sign-ups by sending a 6-digit verification code to their email.
2. **Email OTP Two-Factor Authentication (2FA)**: Sends a secure 6-digit OTP code to the admin/staff member's email on each login attempt.
3. **Authenticator App Multi-Factor Authentication (MFA / TOTP)**: Uses cryptographic time-based codes (TOTP) compatible with **Google Authenticator**, **Microsoft Authenticator**, or **Authy**.

---

## 2. Production Deployment Checklist

Run these commands in order on your production VPS:

### Step 1: Install & Configure Postfix (Local SMTP Server)
Postfix acts as your local outgoing mail server to send OTP codes for both email verification and 2FA. We secure it to `loopback-only` to prevent spam relay abuse:

```bash
# Update server packages
sudo apt update

# Install Postfix in non-interactive mode
sudo DEBIAN_FRONTEND=noninteractive apt install -y postfix

# Restrict Postfix to loopback connections on port 25 (security best practice)
sudo postconf -e "inet_interfaces = loopback-only"

# Set domain hostname
sudo postconf -e "myhostname = tanhafashion.com"

# Restart Postfix to load configuration changes
sudo systemctl restart postfix

# Confirm Postfix is active
sudo systemctl status postfix
```

---

### Step 2: Pull Code & Install Dependencies
Fetch the latest code and install `otplib` (for TOTP/MFA calculations) and `qrcode` (for scanning QR codes in authenticator apps):

```bash
# Navigate to the project root directory
cd ~/tanha-fasion

# Pull the latest changes from Git
git pull

# Install backend dependencies (nodemailer, otplib, qrcode)
cd server
npm install
```

---

### Step 3: Run Database Migrations & Safety Backfill
Update the database schema to support MFA/2FA states. **You must run the backfill script** to ensure existing users are marked as verified (preventing admin lockout).

```bash
# 1. Generate Prisma Client and apply database schema updates
npx prisma generate
npx prisma db push

# 2. Run the backfill script to verify all existing users
node backfill-users.js
```
> [!IMPORTANT]
> Confirm that the backfill script prints: `Successfully backfilled X existing users to isVerified = true`.
> Once the migration is complete, you can safely delete this script: `rm backfill-users.js`.

---

### Step 4: Re-Build and Restart Services
Re-compile both frontend and backend bundles and reload the PM2 processes:

```bash
cd ~/tanha-fasion

# Re-build frontend and backend bundles
npm run build:all

# Restart all PM2 server processes
pm2 restart all --update-env
```

---

## 3. Optimizing Email Deliverability (Inbox vs. Spam)

To ensure your verification and 2FA emails land directly in the **Inbox** instead of the **Spam folder**, add these DNS records to your domain name provider (e.g. Cloudflare):

### 1. Add SPF (Sender Policy Framework) Record
Tells recipient mail servers (like Gmail) that your VPS is authorized to send emails on behalf of `tanhafashion.com`.
* **Type**: `TXT`
* **Name/Host**: `@`
* **Value/Content**: `v=spf1 ip4:YOUR_VPS_IP_ADDRESS -all`
*(Replace `YOUR_VPS_IP_ADDRESS` with your actual VPS public IP address: `103.168.91.79`).*

### 2. Configure Reverse DNS (rDNS) / PTR Record
Links your server's IP address back to your domain. This must be set in your VPS control panel:
* Log in to your billing account panel at **hplink.bd**.
* Open a **Support Ticket** with their administrators:
  > *"Hello, please set the Reverse DNS (rDNS / PTR record) for my VPS IP **`103.168.91.79`** to point to **`tanhafashion.com`**. Thank you."*

---

## 4. Post-Deployment Verification & Testing

### Test A: Customer Email Verification
1. Open the homepage, navigate to registration, and sign up a new account.
2. Confirm the site redirects you to the `/verify-email` screen.
3. Check the registered email's inbox for a 6-digit OTP, enter it, and verify that registration completes and logs you in.

### Test B: Setting up Email OTP 2FA (MFA)
1. Log in to the Admin Panel.
2. Click **"২এফএ সেটিংস" (2FA Security Settings)** in the sidebar navigation.
3. Choose **ইমেইল ওটিপি (Email OTP)** and click **"সেটআপ শুরু করুন" (Start Setup)**.
4. Check your email for the code, enter it, and click **"যাচাই ও সচল করুন" (Verify & Enable)**.
5. Log out and try logging in. Verify that it prompts for an Email OTP before logging in.

### Test C: Setting up Authenticator App MFA (Google / Microsoft Authenticator)
1. Go back to the **২এফএ সেটিংস (2FA Security Settings)** page.
2. Choose **অথেন্টিকেটর অ্যাপ (Authenticator)** and click **"সেটআপ শুরু করুন" (Start Setup)**.
3. Open your mobile phone's Authenticator app, scan the displayed QR Code (or copy-paste the manual secret key), enter the rolling 6-digit code shown in the app, and click **"যাচাই ও সচল করুন" (Verify & Enable)**.
4. Log out and confirm you can log in using the code generated by your phone's Authenticator app.

---

## 5. Security Recovery: How to Reset MFA/2FA for Locked Users

If an administrator or staff member loses their phone, gets locked out, or stops receiving emails, you can reset their MFA/2FA status directly via the server command line.

Run this Prisma command inside your VPS terminal to disable 2FA for the locked user:

```bash
cd ~/tanha-fasion/server
npx prisma db execute --stdin <<EOF
UPDATE "User" 
SET "twoFactorEnabled" = false, 
    "twoFactorType" = 'NONE', 
    "twoFactorSecret" = NULL, 
    "twoFactorTempCode" = NULL 
WHERE "email" = 'user@email.com';
EOF
```
*(Replace `user@email.com` with the email address of the locked user account. Once run, the user can log in with just their password and reconfigure their 2FA settings).*
