import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import multer from "multer";
import prisma from "./db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import compression from "compression";
import nodemailer from "nodemailer";
import { generateSecret, generateURI, verifySync } from "otplib";
import qrcode from "qrcode";

dotenv.config();

const app = express();
app.use(compression());

// Configure local SMTP transport (Postfix running on localhost:25)
const mailTransport = nodemailer.createTransport({
  host: "127.0.0.1",
  port: 25,
  secure: false,
  tls: {
    rejectUnauthorized: false
  }
});

const sendOtpEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: '"Tanha Fashion" <noreply@tanhafashion.com>',
    to: email,
    subject: "তানহা ফ্যাশন - ইমেল ভেরিফিকেশন কোড",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #9f1239; text-align: center;">ইমেল ভেরিফিকেশন কোড</h2>
        <p>তানহা ফ্যাশনে আপনাকে স্বাগতম! আপনার অ্যাকাউন্টটি সচল করতে নিচের ৬-ডিজিটের ওটিপি (OTP) কোডটি ব্যবহার করুন:</p>
        <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #0f172a; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 30px;">
          কোডটির মেয়াদ ৫ মিনিট। আপনি যদি এই অনুরোধটি না করে থাকেন, তবে দয়া করে এই ইমেলটি উপেক্ষা করুন।
        </p>
      </div>
    `
  };

  await mailTransport.sendMail(mailOptions);
};

const send2faEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: '"Tanha Fashion" <noreply@tanhafashion.com>',
    to: email,
    subject: "তানহা ফ্যাশন - টু-ফ্যাক্টর অথেন্টিকেশন (2FA) কোড",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #9f1239; text-align: center;">লগইন ভেরিফিকেশন কোড (2FA)</h2>
        <p>আপনার তানহা ফ্যাশন অ্যাডমিন অ্যাকাউন্টে লগইন করতে নিচের ৬-ডিজিটের নিরাপত্তা কোডটি (OTP) ব্যবহার করুন:</p>
        <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #0f172a; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 30px;">
          এই নিরাপত্তা কোডটির মেয়াদ ৫ মিনিট। আপনি যদি লগইন করার চেষ্টা না করে থাকেন, তবে অবিলম্বে আপনার পাসওয়ার্ড পরিবর্তন করুন।
        </p>
      </div>
    `
  };

  await mailTransport.sendMail(mailOptions);
};

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("FATAL ERROR: JWT_SECRET environment variable is required in production mode.");
  }
  return "tanha-fashion-jwt-secret-key-123!";
})();

// Ensure uploads folder exists
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("শুধুমাত্র ইমেজ ফাইল আপলোড করা যাবে।"));
    }
  }
});

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace("://", "://www.") : null
].filter((val): val is string => Boolean(val));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV === "production") {
      const msg = "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

// Rate Limiting Middlewares
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "অতিরিক্ত রিকোয়েস্ট করা হয়েছে, অনুগ্রহ করে ১৫ মিনিট পর আবার চেষ্টা করুন।" }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "অতিরিক্ত লগইন চেষ্টার কারণে সাময়িকভাবে ব্লক করা হয়েছে, অনুগ্রহ করে ১৫ মিনিট পর আবার চেষ্টা করুন।" }
});

app.use("/api/auth/login", authLimiter);
app.use("/api/", apiLimiter);

app.use("/uploads", express.static(UPLOADS_DIR));

// Authentication Middlewares
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "অননুমোদিত প্রবেশ। দয়া করে লগইন করুন।" });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as any;
    req.user = verified;
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.status(401).json({ error: "সেশন শেষ হয়েছে, আবার লগইন করুন।" });
  }
};

const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: "অননুমোদিত প্রবেশ।" });
    }
    
    // Normalize role: treat legacy 'ADMIN' as 'SUPER_ADMIN'
    const userRole = req.user.role === "ADMIN" ? "SUPER_ADMIN" : req.user.role;
    const normalizedRoles = roles.map(r => r === "ADMIN" ? "SUPER_ADMIN" : r);

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({ error: "আপনার এই সুবিধা ব্যবহারের অনুমতি নেই।" });
    }
    next();
  };
};

const requireModule = (moduleName: string) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: "অননুমোদিত প্রবেশ।" });
    }

    const userRole = req.user.role === "ADMIN" ? "SUPER_ADMIN" : req.user.role;
    if (userRole === "SUPER_ADMIN") {
      return next(); // Super Admin has access to all modules
    }

    const allowedModules = req.user.allowedModules;
    if (!allowedModules) {
      return res.status(403).json({ error: "আপনার এই সুবিধা ব্যবহারের অনুমতি নেই (কোনো মডিউল বরাদ্দ নেই)।" });
    }

    const modulesList = allowedModules.split(",").map((m: string) => m.trim());
    if (!modulesList.includes(moduleName)) {
      return res.status(403).json({ error: `আপনার "${moduleName}" মডিউলটি ব্যবহারের অনুমতি নেই।` });
    }
    
    next();
  };
};

const logActivity = async (email: string, adminName: string, action: string, details: string) => {
  try {
    await prisma.activityLog.create({
      data: {
        email,
        adminName,
        action,
        details
      }
    });
    console.log(`[Activity Logged] ${adminName} (${email}): ${action} - ${details}`);
  } catch (err) {
    console.error("Failed to write activity log:", err);
  }
};

const logAdminActivity = async (req: any, action: string, details: string) => {
  if (req.user) {
    await logActivity(req.user.email, req.user.name || "অ্যাডমিন", action, details);
  }
};

// --- Authentication Endpoints ---

// A. Register Customer
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "নাম, ইমেইল এবং পাসওয়ার্ড আবশ্যক।" });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(400).json({ error: "এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা আছে।" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        role: "CUSTOMER",
        isVerified: false,
        verificationToken: otp
      }
    });

    try {
      await sendOtpEmail(user.email, otp);
    } catch (mailErr: any) {
      console.error("Failed to send registration verification email:", mailErr.message);
    }

    res.status(201).json({
      message: "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। আপনার ইমেলে ওটিপি পাঠানো হয়েছে।",
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err: any) {
    res.status(500).json({ error: "নিবন্ধন ব্যর্থ হয়েছে: " + err.message });
  }
});

// B. Login (Issues JWT Cookie)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "ইমেইল এবং পাসওয়ার্ড আবশ্যক।" });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(400).json({ error: "ভুল ইমেইল বা পাসওয়ার্ড।" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "ভুল ইমেইল বা পাসওয়ার্ড।" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: "email_unverified", message: "দয়া করে আপনার ইমেল ভেরিফাই করুন।" });
    }

    if (user.twoFactorEnabled) {
      const tempToken = jwt.sign(
        { id: user.id, isTemp: true },
        JWT_SECRET,
        { expiresIn: "5m" }
      );

      if (user.twoFactorType === "EMAIL") {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await prisma.user.update({
          where: { id: user.id },
          data: { twoFactorTempCode: code }
        });

        try {
          await send2faEmail(user.email, code);
        } catch (mailErr: any) {
          console.error("Login 2FA Email send failed:", mailErr.message);
          return res.status(500).json({ error: "2FA ইমেল পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" });
        }
      }

      return res.json({
        status: "two_factor_required",
        twoFactorType: user.twoFactorType,
        tempToken
      });
    }


    // Sign token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, branchId: user.branchId, allowedModules: user.allowedModules },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: "লগইন সফল হয়েছে।",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        branchId: user.branchId,
        allowedModules: user.allowedModules,
        phone: user.phone,
        address: user.address,
        city: user.city,
        postcode: user.postcode
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: "লগইন ব্যর্থ হয়েছে: " + err.message });
  }
});

// C. Logout (Clears JWT Cookie)
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/"
  });
  res.json({ message: "লগআউট সফল হয়েছে।" });
});

// D. Verify Email OTP
app.post("/api/auth/verify-email", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "ইমেইল এবং ওটিপি (OTP) আবশ্যক।" });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(400).json({ error: "কোনো ইউজার পাওয়া যায়নি।" });
    }

    if (user.isVerified) {
      return res.status(200).json({ message: "অ্যাকাউন্ট ইতিমধ্যে ভেরিফাই করা আছে।" });
    }

    if (user.verificationToken !== otp.trim()) {
      return res.status(400).json({ error: "ভুল ওটিপি কোড।" });
    }

    // Verify user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null }
    });

    // Auto-login: Sign token
    const token = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role, name: updatedUser.name, branchId: updatedUser.branchId, allowedModules: updatedUser.allowedModules },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: "আপনার অ্যাকাউন্ট সফলভাবে ভেরিফাই করা হয়েছে এবং লগইন সম্পন্ন হয়েছে।",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        branchId: updatedUser.branchId,
        allowedModules: updatedUser.allowedModules,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        postcode: updatedUser.postcode
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: "ভেরিফিকেশন ব্যর্থ হয়েছে: " + err.message });
  }
});

// E. Resend Verification OTP
app.post("/api/auth/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "ইমেইল আবশ্যক।" });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(400).json({ error: "কোনো ইউজার পাওয়া যায়নি।" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "অ্যাকাউন্ট ইতিমধ্যে ভেরিফাই করা আছে।" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: otp }
    });

    try {
      await sendOtpEmail(user.email, otp);
    } catch (mailErr: any) {
      console.error("Failed to send verification email:", mailErr.message);
      return res.status(500).json({ error: "ভেরিফিকেশন ইমেল পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" });
    }

    res.json({ message: "আপনার ইমেলে নতুন ওটিপি (OTP) পাঠানো হয়েছে।" });
  } catch (err: any) {
    res.status(500).json({ error: "ওটিপি পাঠাতে ব্যর্থ হয়েছে: " + err.message });
  }
});

// F. Setup 2FA
app.post("/api/auth/2fa/setup", authenticateToken, async (req: any, res: any) => {
  try {
    const { type } = req.body;
    if (!type || (type !== "EMAIL" && type !== "TOTP")) {
      return res.status(400).json({ error: "সঠিক টু-ফ্যাক্টর টাইপ দিন (EMAIL বা TOTP)।" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: "ইউজার পাওয়া যায়নি।" });
    }

    if (type === "TOTP") {
      const secret = generateSecret();
      const otpauthurl = generateURI({ secret, label: user.email, issuer: "Tanha Fashion" });
      const qrImage = await qrcode.toDataURL(otpauthurl);

      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorSecret: secret, twoFactorType: "TOTP" }
      });

      return res.json({
        type: "TOTP",
        secret,
        qrImage
      });
    } else {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorTempCode: code, twoFactorType: "EMAIL" }
      });

      try {
        await send2faEmail(user.email, code);
      } catch (mailErr: any) {
        console.error("2FA Setup email failed:", mailErr.message);
        return res.status(500).json({ error: "ইমেইল পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" });
      }

      return res.json({
        type: "EMAIL",
        message: "আপনার ইমেলে একটি নিরাপত্তা কোড পাঠানো হয়েছে।"
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: "2FA সেটাপ ব্যর্থ হয়েছে: " + err.message });
  }
});

// G. Enable 2FA (Verifies test code and activates it)
app.post("/api/auth/2fa/enable", authenticateToken, async (req: any, res: any) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "নিরাপত্তা কোড আবশ্যক।" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.twoFactorType) {
      return res.status(400).json({ error: "আগে ২এফএ সেটাপ প্রসেস সম্পন্ন করুন।" });
    }

    let isVerified = false;
    if (user.twoFactorType === "TOTP") {
      if (!user.twoFactorSecret) {
        return res.status(400).json({ error: "কোনো সিক্রেট কি পাওয়া যায়নি।" });
      }
      isVerified = verifySync({
        token: code.trim(),
        secret: user.twoFactorSecret
      }).valid;
    } else if (user.twoFactorType === "EMAIL") {
      isVerified = user.twoFactorTempCode === code.trim();
    }

    if (!isVerified) {
      return res.status(400).json({ error: "ভুল নিরাপত্তা কোড। অনুগ্রহ করে আবার চেষ্টা করুন।" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorTempCode: null
      }
    });

    res.json({ message: "টু-ফ্যাক্টর অথেন্টিকেশন (2FA) সফলভাবে চালু হয়েছে।" });
  } catch (err: any) {
    res.status(500).json({ error: "2FA ভেরিফিকেশন ব্যর্থ হয়েছে: " + err.message });
  }
});

// H. Disable 2FA
app.post("/api/auth/2fa/disable", authenticateToken, async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: "ইউজার পাওয়া যায়নি।" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorType: "NONE",
        twoFactorSecret: null,
        twoFactorTempCode: null
      }
    });

    res.json({ message: "টু-ফ্যাক্টর অথেন্টিকেশন (2FA) সফলভাবে বন্ধ করা হয়েছে।" });
  } catch (err: any) {
    res.status(500).json({ error: "2FA বন্ধ করা ব্যর্থ হয়েছে: " + err.message });
  }
});

// I. Verify 2FA (Handles login completion)
app.post("/api/auth/verify-2fa", async (req, res) => {
  try {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) {
      return res.status(400).json({ error: "টেম্পোরারি টোকেন এবং নিরাপত্তা কোড আবশ্যক।" });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "সেশন শেষ হয়েছে, অনুগ্রহ করে আবার পাসওয়ার্ড দিয়ে লগইন করুন।" });
    }

    if (!decoded.isTemp) {
      return res.status(400).json({ error: "ভুল বা অবৈধ অনুরোধ।" });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(400).json({ error: "ইউজার পাওয়া যায়নি।" });
    }

    let isVerified = false;
    if (user.twoFactorType === "TOTP") {
      if (!user.twoFactorSecret) {
        return res.status(400).json({ error: "কোনো ২এফএ সিক্রেট পাওয়া যায়নি।" });
      }
      isVerified = verifySync({
        token: code.trim(),
        secret: user.twoFactorSecret
      }).valid;
    } else if (user.twoFactorType === "EMAIL") {
      isVerified = user.twoFactorTempCode === code.trim();
    }

    if (!isVerified) {
      return res.status(400).json({ error: "ভুল নিরাপত্তা কোড।" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorTempCode: null }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, branchId: user.branchId, allowedModules: user.allowedModules },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: "২এফএ যাচাই সফল হয়েছে। লগইন সম্পন্ন হয়েছে।",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        branchId: user.branchId,
        allowedModules: user.allowedModules,
        phone: user.phone,
        address: user.address,
        city: user.city,
        postcode: user.postcode
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: "২এফএ ভেরিফিকেশন ব্যর্থ হয়েছে: " + err.message });
  }
});



// D. Get Current User Session context
app.get("/api/auth/me", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "কোনো সচল সেশন পাওয়া যায়নি।" });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as any;
    // Fetch fresh user role from database
    const user = await prisma.user.findUnique({ where: { id: verified.id } });
    if (!user) {
      res.clearCookie("token");
      return res.status(401).json({ error: "ইউজার পাওয়া যায়নি।" });
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        branchId: user.branchId,
        allowedModules: user.allowedModules,
        phone: user.phone,
        address: user.address,
        city: user.city,
        postcode: user.postcode
      }
    });
  } catch (err) {
    res.clearCookie("token");
    res.status(401).json({ error: "সেশন অবৈধ বা মেয়াদ শেষ হয়েছে।" });
  }
});

// E. Update User Profile details & optional password
app.put("/api/auth/profile", authenticateToken, async (req: any, res: any) => {
  try {
    const { name, phone, address, city, postcode, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "ইউজার পাওয়া যায়নি।" });
    }

    let updatedPasswordHash = undefined;

    // Handle password update if requested
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "পাসওয়ার্ড পরিবর্তনের জন্য বর্তমান পাসওয়ার্ডটি আবশ্যক।" });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "বর্তমান পাসওয়ার্ডটি সঠিক নয়।" });
      }
      updatedPasswordHash = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
        ...(address !== undefined && { address: address ? address.trim() : null }),
        ...(city !== undefined && { city: city ? city.trim() : null }),
        ...(postcode !== undefined && { postcode: postcode ? postcode.trim() : null }),
        ...(updatedPasswordHash !== undefined && { password: updatedPasswordHash })
      }
    });

    res.json({
      message: "প্রোফাইল সফলভাবে হালনাগাদ করা হয়েছে।",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        postcode: updatedUser.postcode,
        role: updatedUser.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: "হালনাগাদ ব্যর্থ হয়েছে: " + err.message });
  }
});

// F. Get Customer Orders history
app.get("/api/orders/my-orders", authenticateToken, async (req: any, res: any) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const userPhone = req.user.phone ? req.user.phone.trim() : "";

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { email: { equals: userEmail } },
          ...(userPhone ? [{ phone: { equals: userPhone } }] : [])
        ]
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: "অর্ডার লোড করতে ব্যর্থ হয়েছে: " + err.message });
  }
});

// G. Public Order Tracking (both logged in and guest users)
app.post("/api/orders/track", async (req, res) => {
  try {
    const { orderNumber, contact } = req.body;
    if (!orderNumber || !contact) {
      return res.status(400).json({ error: "অর্ডার নম্বর এবং মোবাইল নম্বর/ইমেইল আবশ্যক।" });
    }

    const cleanOrderNumber = orderNumber.trim().toUpperCase();
    const cleanContact = contact.trim().toLowerCase();

    // Query order
    const order = await prisma.order.findUnique({
      where: { orderNumber: cleanOrderNumber },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: "দুঃখিত, এই নম্বর দিয়ে কোনো অর্ডার পাওয়া যায়নি।" });
    }

    // Verify contact matches order phone or email
    const orderPhone = order.phone.trim();
    const orderEmail = order.email ? order.email.trim().toLowerCase() : "";

    const contactPhoneNoPrefix = cleanContact.replace(/^(?:\+88|88)?0/, "0");
    const dbPhoneNoPrefix = orderPhone.replace(/^(?:\+88|88)?0/, "0");

    const phoneMatches = contactPhoneNoPrefix === dbPhoneNoPrefix || cleanContact === orderPhone;
    const emailMatches = orderEmail && cleanContact === orderEmail;

    if (!phoneMatches && !emailMatches) {
      return res.status(403).json({ error: "অর্ডারের সাথে প্রদানকৃত ইমেইল বা মোবাইল নম্বরটি মেলেনি।" });
    }

    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: "অর্ডার ট্র্যাক করতে ব্যর্থ হয়েছে: " + err.message });
  }
});

// H. Customer Self-Service Order Cancellation
app.put("/api/orders/:id/cancel", authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email.toLowerCase().trim();
    const userPhone = req.user.phone ? req.user.phone.trim() : "";

    // Fetch order first to check owner and status
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ error: "অর্ডারটি পাওয়া যায়নি।" });
    }

    // Verify ownership: checks email/phone matching logged in user
    const orderEmail = order.email ? order.email.toLowerCase().trim() : "";
    const orderPhone = order.phone.trim();

    const emailMatches = orderEmail && orderEmail === userEmail;
    const phoneMatches = userPhone && orderPhone === userPhone;

    if (!emailMatches && !phoneMatches) {
      return res.status(403).json({ error: "এই অর্ডারটি বাতিল করার অনুমতি আপনার নেই।" });
    }

    // Verify order is still PENDING
    if (order.orderStatus !== "PENDING") {
      return res.status(400).json({ error: "আপনার অর্ডারটি ইতিমধ্যে প্রসেস করা হয়েছে, তাই এটি বাতিল করা সম্ভব নয়।" });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      await adjustOrderStock(id, "CANCELLED", tx);

      return await tx.order.update({
        where: { id },
        data: {
          orderStatus: "CANCELLED"
        }
      });
    });

    res.json({
      message: "অর্ডারটি সফলভাবে বাতিল করা হয়েছে।",
      order: updatedOrder
    });
  } catch (err: any) {
    res.status(500).json({ error: "অর্ডার বাতিল করতে ব্যর্থ হয়েছে: " + err.message });
  }
});



// 1. Healthcheck Route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 1.5. Image Upload Endpoint
app.post("/api/upload", authenticateToken, requireRole(["ADMIN"]), (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "ফাইল আপলোড করতে সমস্যা হয়েছে।" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "কোনো ফাইল সিলেক্ট করা হয়নি।" });
    }
    const filename = req.file.filename;
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
    logAdminActivity(req, "IMAGE_UPLOAD", `Uploaded image file: ${filename}`);
    res.json({ url: imageUrl });
  });
});


// 2. Seed Database Route
app.post("/api/seed", async (req, res) => {
  try {
    // Clear existing reviews, order items, products, categories, coupons, and users for a clean seed slate
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.user.deleteMany();
    await prisma.faq.deleteMany();
    await prisma.announcement.deleteMany();

    // Clear branch-scoped tables
    await prisma.branchStock.deleteMany();
    await prisma.branch.deleteMany();

    // Seed default admin user (SUPER_ADMIN)
    const adminPasswordHash = await bcrypt.hash("superadmin123", 10);
    await prisma.user.create({
      data: {
        email: "super-admin@tanhafashion.com",
        password: adminPasswordHash,
        role: "SUPER_ADMIN",
        name: "তানহা সুপার অ্যাডমিন",
        phone: "01700000000"
      }
    });

    // Seed physical showroom branches
    const boktaboliBranch = await prisma.branch.create({
      data: {
        name: "Boktaboli Branch",
        address: "Boktaboli, Fatullah, Narayanganj 1421",
        phone: "01711111111",
        city: "Narayanganj",
        timings: "সকাল ১০:০০ টা - রাত ৯:০০ টা",
        holiday: "বৃহস্পতিবার (সাপ্তাহিক বন্ধ)"
      }
    });

    const balurcharBranch = await prisma.branch.create({
      data: {
        name: "Balurchar Branch",
        address: "Balurchar, Sirajdikhan, Munshiganj 1422",
        phone: "01722222222",
        city: "Munshiganj",
        timings: "সকাল ১০:০০ টা - রাত ৯:০০ টা",
        holiday: "বুধবার (সাপ্তাহিক বন্ধ)"
      }
    });

    // Seed Branch Managers
    const managerPasswordHash = await bcrypt.hash("manager123", 10);
    await prisma.user.create({
      data: {
        email: "boktaboli@tanhafashion.com",
        password: managerPasswordHash,
        role: "BRANCH_MANAGER",
        branchId: boktaboliBranch.id,
        name: "বক্তাবলী ম্যানেজার",
        phone: "01711111112",
        allowedModules: "showroom_pos,showroom_stock,showroom_purchases,showroom_orders,showroom_expenses"
      }
    });

    await prisma.user.create({
      data: {
        email: "balurchor@tanhafashion.com",
        password: managerPasswordHash,
        role: "BRANCH_MANAGER",
        branchId: balurcharBranch.id,
        name: "বালুরচর ম্যানেজার",
        phone: "01722222223",
        allowedModules: "showroom_pos,showroom_stock,showroom_purchases,showroom_orders,showroom_expenses"
      }
    });

    // Seed Categories
    const defaultCategories = [
      { name: "সুতি থ্রি-পিস", englishName: "COTTON 3-PIECE", imgUrl: "/assets/cotton_1.png", bannerUrl: "/assets/cotton_3pc_banner.png", order: 1, bannerSubtitle: "EXQUISITE COLLECTION", bannerDescription: "নতুন এবং আকর্ষণীয় ডিজাইনের চমৎকার প্রিমিয়াম সংগ্রহ।" },
      { name: "জর্জেট থ্রি-পিস", englishName: "GEORGETTE 3-PIECE", imgUrl: "/assets/georgette_1.png", bannerUrl: "/assets/georgette_3pc_banner.png", order: 2, bannerSubtitle: "EXQUISITE COLLECTION", bannerDescription: "নতুন এবং আকর্ষণীয় ডিজাইনের চমৎকার প্রিমিয়াম সংগ্রহ।" },
      { name: "লিলেন থ্রি-পিস", englishName: "LINEN 3-PIECE", imgUrl: "/assets/linen_1.png", bannerUrl: "/assets/linen_3pc_banner.png", order: 3, bannerSubtitle: "EXQUISITE COLLECTION", bannerDescription: "নতুন এবং আকর্ষণীয় ডিজাইনের চমৎকার প্রিমিয়াম সংগ্রহ।" },
      { name: "ক্যাজুয়াল আবায়া", englishName: "CASUAL ABAYA", imgUrl: "/assets/casual_abaya_1.png", bannerUrl: "/assets/casual_abaya_banner.png", order: 4, bannerSubtitle: "EXQUISITE COLLECTION", bannerDescription: "নতুন এবং আকর্ষণীয় ডিজাইনের চমৎকার প্রিমিয়াম সংগ্রহ।" },
      { name: "উৎসবের বোরকা", englishName: "FESTIVE BORKA", imgUrl: "/assets/festive_borka_1.png", bannerUrl: "/assets/festive_borka_banner.png", order: 5, bannerSubtitle: "EXQUISITE COLLECTION", bannerDescription: "নতুন এবং আকর্ষণীয় ডিজাইনের চমৎকার প্রিমিয়াম সংগ্রহ।" },
      { name: "কম্বো সেট", englishName: "COMBO PACK DETAILS", imgUrl: "/assets/combo_1.png", bannerUrl: "/assets/combo_pack_banner.png", order: 6, bannerSubtitle: "EXQUISITE COLLECTION", bannerDescription: "নতুন এবং আকর্ষণীয় ডিজাইনের চমৎকার প্রিমিয়াম সংগ্রহ।" }
    ];
    for (const cat of defaultCategories) {
      await prisma.category.create({ data: cat });
    }

    // Standard list of all 24 catalog products from products.ts
    const mockProducts = [
      // Cotton
      { id: "০১", sku: "TF-COT-001", name: "হ্যান্ডলুম পিওর কটন থ্রি-পিস", price: 1450, category: "সুতি থ্রি-পিস", imgUrl: "/assets/cotton_1.png" },
      { id: "০২", sku: "TF-COT-002", name: "ক্ল্যাসিক ব্লক প্রিন্ট সুতি থ্রি-পিস", price: 1650, category: "সুতি থ্রি-পিস", imgUrl: "/assets/cotton_2.png" },
      { id: "০৩", sku: "TF-COT-003", name: "নিপুণ কলার এমব্রয়ডারি সুতি থ্রি-পিস", price: 1850, category: "সুতি থ্রি-পিস", imgUrl: "/assets/cotton_3.png" },
      { id: "০৪", sku: "TF-COT-004", name: "এক্সক্লুসিভ জয়পুরি সুতি থ্রি-পিস", price: 1550, category: "সুতি থ্রি-পিস", imgUrl: "/assets/cotton_4.png" },
      // Georgette
      { id: "০৫", sku: "TF-GEO-001", name: "গর্জিয়াস জরি ওয়ার্ক জর্জেট থ্রি-পিস", price: 2450, category: "জর্জেট থ্রি-পিস", imgUrl: "/assets/georgette_1.png" },
      { id: "০৬", sku: "TF-GEO-002", name: "ডিজিটাল প্রিন্ট সিকোয়েন্স জর্জেট থ্রি-পিস", price: 2850, category: "জর্জেট থ্রি-পিস", imgUrl: "/assets/georgette_2.png" },
      { id: "০৭", sku: "TF-GEO-003", name: "পার্টি ওয়ার্ক এমব্রয়ডারি জর্জেট থ্রি-পিস", price: 3200, category: "জর্জেট থ্রি-পিস", imgUrl: "/assets/georgette_3.png" },
      { id: "০৮", sku: "TF-GEO-004", name: "লাক্সারি শিফন জর্জেট থ্রি-পিস সেট", price: 2650, category: "জর্জেট থ্রি-পিস", imgUrl: "/assets/georgette_4.png" },
      // Linen
      { id: "০৯", sku: "TF-LIN-001", name: "ডিজাইনার এম্বোশড লিলেন থ্রি-পিস", price: 1850, category: "লিলেন থ্রি-পিস", imgUrl: "/assets/linen_1.png" },
      { id: "১০", sku: "TF-LIN-002", name: "ক্যাজুয়াল রেগুলার লিলেন থ্রি-পিস", price: 1750, category: "লিলেন থ্রি-পিস", imgUrl: "/assets/linen_2.png" },
      { id: "১১", sku: "TF-LIN-003", name: "সেমি-ফরমাল রেয়ন লিলেন থ্রি-পিস", price: 1950, category: "লিলেন থ্রি-পিস", imgUrl: "/assets/linen_3.png" },
      { id: "১২", sku: "TF-LIN-004", name: "আরামদায়ক সামার লিলেন থ্রি-পিস", price: 1650, category: "লিলেন থ্রি-পিস", imgUrl: "/assets/linen_4.png" },
      // Abaya
      { id: "১৩", sku: "TF-ABA-001", name: "সামার লিনেন ডেইলি আবায়া সেট", price: 1950, category: "ক্যাজুয়াল আবায়া", imgUrl: "/assets/casual_abaya_1.png" },
      { id: "১৪", sku: "TF-ABA-002", name: "স্লিম-ফিট ক্যাজুয়াল আবায়া", price: 1800, category: "ক্যাজুয়াল আবায়া", imgUrl: "/assets/casual_abaya_2.png" },
      { id: "১৫", sku: "TF-ABA-003", name: "সফট কটন রেগুলার আবায়া", price: 2100, category: "ক্যাজুয়াল আবায়া", imgUrl: "/assets/casual_abaya_3.png" },
      { id: "১৬", sku: "TF-ABA-004", name: "ক্লাসিক পকেট ক্যাজুয়াল আবায়া", price: 1750, category: "ক্যাজুয়াল আবায়া", imgUrl: "/assets/casual_abaya_4.png" },
      // Borka
      { id: "১৭", sku: "TF-BOR-001", name: "দুবাই চেরি এমব্রয়ডারি বোরকা সেট", price: 2950, category: "উৎসবের বোরকা", imgUrl: "/assets/festive_borka_1.png" },
      { id: "১৮", sku: "TF-BOR-002", name: "শিমারিং লাক্সারি পার্টি বোরকা", price: 3450, category: "উৎসবের বোরকা", imgUrl: "/assets/festive_borka_2.png" },
      { id: "১৯", sku: "TF-BOR-003", name: "রয়েল জর্জেট কুচি বোরকা সেট", price: 2800, category: "উৎসবের বোরকা", imgUrl: "/assets/festive_borka_3.png" },
      { id: "২০", sku: "TF-BOR-004", name: "লাক্সারি স্টোন ওয়ার্ক বোরকা সেট", price: 3600, category: "উৎসবের বোরকা", imgUrl: "/assets/festive_borka_4.png" },
      // Combo
      { id: "২১", sku: "TF-COM-001", name: "থ্রি-পিস ও ম্যাচিং হিজাব কম্বো", price: 2200, category: "কম্বো সেট", imgUrl: "/assets/combo_1.png" },
      { id: "২২", sku: "TF-COM-002", name: "আবায়া ও ম্যাচিং নিকাব লাক্সারি কম্বো", price: 2400, category: "কম্বো সেট", imgUrl: "/assets/combo_2.png" },
      { id: "২৩", sku: "TF-COM-003", name: "ডাবল ওয়ান থ্রি-পিস প্যাক কম্বো", price: 3100, category: "কম্বো সেট", imgUrl: "/assets/combo_3.png" },
      { id: "২৪", sku: "TF-COM-004", name: "উৎসবের বোরকা ও সুতি থ্রি-পিস কম্বো", price: 4500, category: "কম্বো সেট", imgUrl: "/assets/combo_4.png" }
    ];

    const seeded = [];
    for (const p of mockProducts) {
      const created = await prisma.product.create({
        data: {
          id: p.id,
          sku: p.sku,
          name: p.name,
          price: p.price,
          category: p.category,
          imgUrl: p.imgUrl,
          sizesJson: '{"S":10,"M":15,"L":15,"XL":5}',
          showroomSizesJson: '{"S":10,"M":15,"L":15,"XL":5}'
        }
      });

      // Seed Branch Stocks for Boktaboli Outlet
      await prisma.branchStock.create({
        data: {
          productId: created.id,
          branchId: boktaboliBranch.id,
          sizesJson: '{"S":10,"M":15,"L":15,"XL":5}'
        }
      });

      // Seed Branch Stocks for Balurchar Outlet
      await prisma.branchStock.create({
        data: {
          productId: created.id,
          branchId: balurcharBranch.id,
          sizesJson: '{"S":10,"M":15,"L":15,"XL":5}'
        }
      });

      seeded.push(created);
    }

    // Seed default coupons
    const defaultCoupons = [
      { code: "SAVE50", type: "FLAT", value: 50, minSubtotal: 0 },
      { code: "TANHA10", type: "PERCENTAGE", value: 10, minSubtotal: 1000 },
      { code: "FESTIVE200", type: "FLAT", value: 200, minSubtotal: 1500 }
    ];
    for (const c of defaultCoupons) {
      await prisma.coupon.create({ data: c });
    }

    // Seed default FAQs
    const defaultFaqs = [
      {
        question: "পোশাক কত দিনে পৌঁছাবে?",
        answer: "ঢাকার ভেতরে ১–২ কর্মদিবস, ঢাকার বাইরে সারা দেশে ৩–৫ কর্মদিবসের মধ্যে পৌঁছে যাবে। আমরা অত্যন্ত নির্ভরযোগ্য কুরিয়ার পার্টনারদের মাধ্যমে হোম ডেলিভারি নিশ্চিত করি।",
        order: 1
      },
      {
        question: "পোশাকের কাপড় কোথা থেকে আসে?",
        answer: "আমাদের সংগৃহীত প্রতিটি পোশাকের মূল ঐতিহ্যবাহী কাপড় সরাসরি বাংলার প্রান্তিক তাঁতিদের নিজস্ব হস্তচালিত তাঁতে বোনা। রূপগঞ্জ, টাঙ্গাইল, কুমিল্লা ও সিরাজগঞ্জ থেকে আমরা এগুলো সংগ্রহ করি।",
        order: 2
      },
      {
        question: "ফেরত বা পরিবর্তনের নিয়ম কী?",
        answer: "পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে অক্ষত অবস্থায় ফেরত বা সাইজ পরিবর্তন করা যাবে — কোনো অতিরিক্ত ডেলিভারি চার্জ বা ঝামেলা ছাড়াই।",
        order: 3
      },
      {
        question: "মাপ নিয়ে সমস্যা হলে কী করব?",
        answer: "আমাদের প্রতিটা প্রোডাক্টের সাথে বিস্তারিত সাইজ গাইড রয়েছে। এছাড়াও মাপ নিয়ে কোনো সংশয় থাকলে সরাসরি আমাদের ফেসবুক পেজে বা হোয়াটসঅ্যাপে যোগাযোগ করুন — আমাদের প্রতিনিধি আপনাকে সঠিক সাইজ নির্বাচন করতে সাহায্য করবেন।",
        order: 4
      },
      {
        question: "ক্যাশ অন ডেলিভারি আছে কি?",
        answer: "হ্যাঁ, সারা বাংলাদেশে কোনো এডভান্স পেমেন্ট ছাড়াই শতভাগ ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। এছাড়াও আপনি বিকাশ, নগদ ও যেকোনো ব্যাংকের কার্ডের মাধ্যমে নিরাপদে বিল পরিশোধ করতে পারবেন।",
        order: 5
      }
    ];
    for (const f of defaultFaqs) {
      await prisma.faq.create({ data: f });
    }

    // Seed default announcements
    const defaultAnnouncements = [
      {
        text: "🎉 পূজা ও ঈদ সংস্করণ — ২০% ছাড়ের জন্য TANHA20 ব্যবহার করুন!",
        buttonText: "সংগ্রহ দেখুন →",
        link: "2",
        isActive: true
      }
    ];
    for (const ann of defaultAnnouncements) {
      await prisma.announcement.create({ data: ann });
    }

    res.json({ message: "Seeding complete!", count: seeded.length, products: seeded });
  } catch (error: any) {
    console.error("Seeding Error:", error);
    res.status(500).json({ error: "Seeding failed: " + error.message });
  }
});

// Categories API Routes
// A. List Categories
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" }
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load categories: " + error.message });
  }
});

// B. Create Category
app.post("/api/categories", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { name, englishName, imgUrl, bannerUrl, order, bannerSubtitle, bannerDescription } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "ক্যাটাগরির নাম আবশ্যক।" });
    }
    const cleanName = name.trim();
    // Check duplicate
    const existing = await prisma.category.findUnique({ where: { name: cleanName } });
    if (existing) {
      return res.status(400).json({ error: "এই ক্যাটাগরি ইতিমধ্যে যুক্ত আছে।" });
    }
    const category = await prisma.category.create({
      data: {
        name: cleanName,
        englishName: englishName ? englishName.trim() : null,
        imgUrl: imgUrl || null,
        bannerUrl: bannerUrl || null,
        order: order !== undefined ? Number(order) : 0,
        bannerSubtitle: bannerSubtitle || null,
        bannerDescription: bannerDescription || null
      }
    });
    logAdminActivity(req, "CATEGORY_CREATE", `Created new category: ${cleanName}`);
    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create category: " + error.message });
  }
});

// C. Update Category
app.put("/api/categories/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, englishName, imgUrl, bannerUrl, order, bannerSubtitle, bannerDescription } = req.body;

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ error: "ক্যাটাগরি পাওয়া যায়নি।" });
    }

    let nextName = category.name;
    const oldName = category.name;

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "ক্যাটাগরির নাম খালি রাখা যাবে না।" });
      }
      const cleanName = name.trim();
      if (cleanName !== category.name) {
        // Check duplicate for new name
        const existing = await prisma.category.findUnique({ where: { name: cleanName } });
        if (existing) {
          return res.status(400).json({ error: "এই নামের ক্যাটাগরি ইতিমধ্যে রয়েছে।" });
        }
        nextName = cleanName;
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: nextName,
        ...(englishName !== undefined && { englishName: englishName ? englishName.trim() : null }),
        ...(imgUrl !== undefined && { imgUrl: imgUrl || null }),
        ...(bannerUrl !== undefined && { bannerUrl: bannerUrl || null }),
        ...(order !== undefined && { order: Number(order) }),
        ...(bannerSubtitle !== undefined && { bannerSubtitle: bannerSubtitle || null }),
        ...(bannerDescription !== undefined && { bannerDescription: bannerDescription || null })
      }
    });

    // Sync products matching the old category name if the name changed
    if (nextName !== oldName) {
      await prisma.product.updateMany({
        where: { category: oldName },
        data: { category: nextName }
      });
    }

    logAdminActivity(req, "CATEGORY_UPDATE", `Updated category: ${oldName} (New Name: ${nextName}, Order: ${updated.order})`);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update category: " + error.message });
  }
});

// D. Delete Category
app.delete("/api/categories/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ error: "ক্যাটাগরি পাওয়া যায়নি।" });
    }
    // Safety check: prevent deleting if assigned to any products
    const productCount = await prisma.product.count({
      where: { category: category.name }
    });
    if (productCount > 0) {
      return res.status(400).json({
        error: `এই ক্যাটাগরিটি মুছে ফেলা যাবে না, কারণ এর অধীনে ${productCount}টি পণ্য রয়েছে। প্রথমে পণ্যগুলোর ক্যাটাগরি পরিবর্তন করুন।`
      });
    }
    await prisma.category.delete({ where: { id } });
    logAdminActivity(req, "CATEGORY_DELETE", `Deleted category: ${category.name}`);
    res.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete category: " + error.message });
  }
});

// Announcements API Routes
// A. List all announcements
app.get("/api/announcements", async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(announcements);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load announcements: " + error.message });
  }
});

// B. Get active announcements
app.get("/api/announcements/active", async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(announcements);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load active announcements: " + error.message });
  }
});

// C. Create Announcement
app.post("/api/announcements", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { text, buttonText, link, isActive } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "ঘোষণার লেখা আবশ্যক।" });
    }
    const announcement = await prisma.announcement.create({
      data: {
        text: text.trim(),
        buttonText: buttonText ? buttonText.trim() : null,
        link: link ? link.trim() : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    });
    logAdminActivity(req, "ANNOUNCEMENT_CREATE", `Created announcement: "${text.slice(0, 30)}${text.length > 30 ? '...' : ''}"`);
    res.status(201).json(announcement);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create announcement: " + error.message });
  }
});

// D. Update Announcement
app.put("/api/announcements/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { text, buttonText, link, isActive } = req.body;
    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) {
      return res.status(404).json({ error: "ঘোষণা পাওয়া যায়নি।" });
    }
    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        ...(text !== undefined && { text: text.trim() }),
        ...(buttonText !== undefined && { buttonText: buttonText ? buttonText.trim() : null }),
        ...(link !== undefined && { link: link ? link.trim() : null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) })
      }
    });
    let logMsg = `Updated announcement ID: ${id}.`;
    if (isActive !== undefined && isActive !== announcement.isActive) {
      logMsg += ` Status: ${announcement.isActive ? 'Active' : 'Inactive'} -> ${isActive ? 'Active' : 'Inactive'}.`;
    }
    logAdminActivity(req, "ANNOUNCEMENT_UPDATE", logMsg);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update announcement: " + error.message });
  }
});

// E. Delete Announcement
app.delete("/api/announcements/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) {
      return res.status(404).json({ error: "ঘোষণা পাওয়া যায়নি।" });
    }
    await prisma.announcement.delete({ where: { id } });
    logAdminActivity(req, "ANNOUNCEMENT_DELETE", `Deleted announcement: "${announcement.text.slice(0, 30)}${announcement.text.length > 30 ? '...' : ''}"`);
    res.json({ message: "Announcement deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete announcement: " + error.message });
  }
});

// 2.5. Branches List Route (Public - accessible by guests at /showroom)
app.get("/api/branches", async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { name: "asc" }
    });
    res.json(branches);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load branches: " + error.message });
  }
});

// Create Branch (Super Admin only)
app.post("/api/branches", authenticateToken, requireRole(["SUPER_ADMIN"]), async (req, res) => {
  try {
    const { name, address, phone, city, timings, holiday, location } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "শোরুমের নাম আবশ্যক।" });
    }
    const cleanName = name.trim();
    const existing = await prisma.branch.findUnique({ where: { name: cleanName } });
    if (existing) {
      return res.status(400).json({ error: "এই নামের শোরুম ইতিমধ্যে রয়েছে।" });
    }
    const branch = await prisma.branch.create({
      data: {
        name: cleanName,
        address: address ? address.trim() : null,
        phone: phone ? phone.trim() : null,
        city: city ? city.trim() : "Dhaka",
        timings: timings ? timings.trim() : "সকাল ১০:০০ টা - রাত ৯:০০ টা",
        holiday: holiday ? holiday.trim() : "বুধবার (সাপ্তাহিক বন্ধ)",
        location: location ? location.trim() : null
      }
    });

    // Automatically pre-populate BranchStock with all existing products
    const products = await prisma.product.findMany();
    if (products.length > 0) {
      await prisma.branchStock.createMany({
        data: products.map(p => ({
          productId: p.id,
          branchId: branch.id,
          sizesJson: '{"S":0,"M":0,"L":0,"XL":0}'
        }))
      });
    }

    logAdminActivity(req, "BRANCH_CREATE", `Created showroom branch: ${cleanName}`);
    res.status(201).json(branch);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create branch: " + error.message });
  }
});

// Update Branch (Super Admin only)
app.put("/api/branches/:id", authenticateToken, requireRole(["SUPER_ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, city, timings, holiday, location } = req.body;

    const branch = await prisma.branch.findUnique({ where: { id } });
    if (!branch) {
      return res.status(404).json({ error: "শোরুম পাওয়া যায়নি।" });
    }

    let nextName = branch.name;
    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "শোরুমের নাম খালি রাখা যাবে না।" });
      }
      const cleanName = name.trim();
      if (cleanName !== branch.name) {
        const existing = await prisma.branch.findUnique({ where: { name: cleanName } });
        if (existing) {
          return res.status(400).json({ error: "এই নামের শোরুম ইতিমধ্যে রয়েছে।" });
        }
        nextName = cleanName;
      }
    }

    const updated = await prisma.branch.update({
      where: { id },
      data: {
        name: nextName,
        address: address !== undefined ? (address ? address.trim() : null) : branch.address,
        phone: phone !== undefined ? (phone ? phone.trim() : null) : branch.phone,
        city: city !== undefined ? (city ? city.trim() : "Dhaka") : branch.city,
        timings: timings !== undefined ? (timings ? timings.trim() : "সকাল ১০:০০ টা - রাত ৯:০০ টা") : branch.timings,
        holiday: holiday !== undefined ? (holiday ? holiday.trim() : "বুধবার (সাপ্তাহিক বন্ধ)") : branch.holiday,
        location: location !== undefined ? (location ? location.trim() : null) : branch.location
      }
    });

    logAdminActivity(req, "BRANCH_UPDATE", `Updated showroom branch: ${updated.name}`);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update branch: " + error.message });
  }
});

// Delete Branch (Super Admin only)
app.delete("/api/branches/:id", authenticateToken, requireRole(["SUPER_ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await prisma.branch.findUnique({ where: { id } });
    if (!branch) {
      return res.status(404).json({ error: "শোরুম পাওয়া যায়নি।" });
    }

    // Check if there are users assigned to this branch
    const staffCount = await prisma.user.count({ where: { branchId: id } });
    if (staffCount > 0) {
      return res.status(400).json({ error: "এই শোরুমের অধীনে ম্যানেজার/কর্মী কর্মরত রয়েছে, প্রথমে তাদের প্রোফাইল মুছুন বা পরিবর্তন করুন।" });
    }

    // Check if there are orders assigned to this branch
    const orderCount = await prisma.order.count({ where: { branchId: id } });
    if (orderCount > 0) {
      return res.status(400).json({ error: "এই শোরুমের বিক্রয় এন্ট্রি বা অর্ডার ইতিহাসে রেকর্ড রয়েছে, নিরাপত্তা স্বার্থে এটি ডিলিট করা যাবে না।" });
    }

    await prisma.$transaction([
      prisma.branchStock.deleteMany({ where: { branchId: id } }),
      prisma.branch.delete({ where: { id } })
    ]);

    logAdminActivity(req, "BRANCH_DELETE", `Deleted showroom branch: ${branch.name}`);
    res.json({ message: "Branch deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete branch: " + error.message });
  }
});

// 3. Products List Route
app.get("/api/products", async (req, res) => {
  try {
    const branchId = req.query.branchId as string;

    const products = await prisma.product.findMany({
      include: {
        reviews: true,
        ...(branchId ? { branchStocks: { where: { branchId } } } : {})
      }
    });

    if (branchId) {
      const mapped = products.map((p: any) => {
        const bStock = p.branchStocks?.[0];
        return {
          ...p,
          showroomSizesJson: bStock ? bStock.sizesJson : '{"S":0,"M":0,"L":0,"XL":0}',
          branchStocks: undefined
        };
      });
      return res.json(mapped);
    }

    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load products: " + error.message });
  }
});

// Helper function to adjust order stock atomically
async function adjustOrderStock(orderId: string, nextStatus: string, txClient?: any) {
  const prismaClient = txClient || prisma;
  // Fetch order
  const order = await prismaClient.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });
  if (!order) throw new Error("Order not found");

  const isDeductState = ["CONFIRMED", "SHIPPED", "DELIVERED"].includes(nextStatus);
  const isRestoreState = ["PENDING", "CANCELLED"].includes(nextStatus);

  if (isDeductState && !order.stockAdjusted) {
    // Validate stocks first
    for (const item of order.items) {
      const prod = await prismaClient.product.findUnique({ where: { id: item.productId } });
      if (!prod) {
        throw new Error(`পোশাকটি পাওয়া যায়নি (কোড/আইডি: ${item.productId})`);
      }

      let currentStock = 0;
      if (order.isShowroom && order.branchId) {
        const bStock = await prismaClient.branchStock.findUnique({
          where: { productId_branchId: { productId: item.productId, branchId: order.branchId } }
        });
        const sizes = JSON.parse(bStock?.sizesJson || "{}");
        currentStock = Number(sizes[item.size] || 0);
      } else {
        const sizes = JSON.parse((order.isShowroom ? prod.showroomSizesJson : prod.sizesJson) || "{}");
        currentStock = Number(sizes[item.size] || 0);
      }

      if (currentStock < item.quantity) {
        throw new Error(`দুঃখিত, "${prod.name}" (সাইজ: ${item.size}) এর পর্যাপ্ত স্টক নেই। বর্তমান স্টক: ${currentStock} টি, অর্ডার চাওয়া হয়েছে: ${item.quantity} টি।`);
      }
    }

    // Deduct stocks
    for (const item of order.items) {
      const prod = await prismaClient.product.findUnique({ where: { id: item.productId } });
      if (prod) {
        if (order.isShowroom && order.branchId) {
          const bStock = await prismaClient.branchStock.findUnique({
            where: { productId_branchId: { productId: item.productId, branchId: order.branchId } }
          });
          const sizes = JSON.parse(bStock?.sizesJson || "{}");
          sizes[item.size] = Math.max(0, Number(sizes[item.size] || 0) - item.quantity);
          await prismaClient.branchStock.upsert({
            where: { productId_branchId: { productId: item.productId, branchId: order.branchId } },
            update: { sizesJson: JSON.stringify(sizes) },
            create: { productId: item.productId, branchId: order.branchId, sizesJson: JSON.stringify(sizes) }
          });
        } else {
          const sizes = JSON.parse((order.isShowroom ? prod.showroomSizesJson : prod.sizesJson) || "{}");
          sizes[item.size] = Math.max(0, Number(sizes[item.size] || 0) - item.quantity);
          await prismaClient.product.update({
            where: { id: item.productId },
            data: {
              [order.isShowroom ? "showroomSizesJson" : "sizesJson"]: JSON.stringify(sizes)
            }
          });
        }
      }
    }
    // Mark order as stockAdjusted
    await prismaClient.order.update({
      where: { id: orderId },
      data: { stockAdjusted: true }
    });
  } else if (isRestoreState && order.stockAdjusted) {
    // Restore stocks
    for (const item of order.items) {
      const prod = await prismaClient.product.findUnique({ where: { id: item.productId } });
      if (prod) {
        if (order.isShowroom && order.branchId) {
          const bStock = await prismaClient.branchStock.findUnique({
            where: { productId_branchId: { productId: item.productId, branchId: order.branchId } }
          });
          const sizes = JSON.parse(bStock?.sizesJson || "{}");
          sizes[item.size] = Number(sizes[item.size] || 0) + item.quantity;
          await prismaClient.branchStock.upsert({
            where: { productId_branchId: { productId: item.productId, branchId: order.branchId } },
            update: { sizesJson: JSON.stringify(sizes) },
            create: { productId: item.productId, branchId: order.branchId, sizesJson: JSON.stringify(sizes) }
          });
        } else {
          const sizes = JSON.parse((order.isShowroom ? prod.showroomSizesJson : prod.sizesJson) || "{}");
          sizes[item.size] = Number(sizes[item.size] || 0) + item.quantity;
          await prismaClient.product.update({
            where: { id: item.productId },
            data: {
              [order.isShowroom ? "showroomSizesJson" : "sizesJson"]: JSON.stringify(sizes)
            }
          });
        }
      }
    }
    // Mark order as not stockAdjusted
    await prismaClient.order.update({
      where: { id: orderId },
      data: { stockAdjusted: false }
    });
  }
}

// 4. Create Order Route
app.post("/api/orders", async (req, res) => {
  try {
    let { 
      name, 
      phone, 
      email, 
      address, 
      city, 
      postcode, 
      paymentMethod, 
      shippingMethod, 
      items, 
      trxId,
      orderStatus,
      paymentStatus,
      discount
    } = req.body;

    const isShowroom = shippingMethod === "showroom" || shippingMethod === "walkin";

    // Extract branchId from request body or authenticated token
    let branchId = req.body.branchId || null;
    let decodedToken: any = null;

    const token = req.cookies?.token;
    if (token) {
      try {
        decodedToken = jwt.verify(token, JWT_SECRET);
        if (!branchId) {
          branchId = decodedToken.branchId || null;
        }
      } catch (e) {}
    }

    // Enforce showroom_pos authorization checks if POS checkout
    if (isShowroom) {
      if (!decodedToken) {
        return res.status(401).json({ error: "শোরুম অর্ডারের জন্য ক্যাশিয়ার লগইন করা আবশ্যক।" });
      }

      const userRole = decodedToken.role === "ADMIN" ? "SUPER_ADMIN" : decodedToken.role;
      if (userRole !== "SUPER_ADMIN") {
        const allowedModules = decodedToken.allowedModules || "";
        const modulesList = allowedModules.split(",").map((m: string) => m.trim());
        if (!modulesList.includes("showroom_pos")) {
          return res.status(403).json({ error: "আপনার শোরুম POS ব্যবহারের অনুমতি নেই।" });
        }
      }

      // Default fields for showroom/walkin POS checkouts to save cashier time
      if (!name) name = "শোরুম কাস্টমার";
      if (!phone) phone = "01700000000";
      if (!address) address = "বসুন্ধরা সিটি শোরুম";
      if (!city) city = "Dhaka";
      if (!postcode) postcode = "1215";
    }

    // Validation
    if (!name || !phone || !address || !city || !postcode || !paymentMethod || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing required checkout fields or items is empty" });
    }

    // Atomic transaction for validating stock and creating order
    const order = await prisma.$transaction(async (tx) => {
      // Validate stock levels before creating order
      for (const item of items) {
        const productId = item.id || "1";
        const prod = await tx.product.findUnique({ where: { id: productId } });
        if (!prod) {
          throw new Error(`পোশাকটি পাওয়া যায়নি (কোড/আইডি: ${productId})`);
        }
        const size = item.size || "M";
        const qty = Number(item.quantity);

        let currentStock = 0;
        if (isShowroom && branchId) {
          // Look up from branch-specific stock
          const bStock = await tx.branchStock.findUnique({
            where: { productId_branchId: { productId, branchId } }
          });
          const sizes = JSON.parse(bStock?.sizesJson || "{}");
          currentStock = Number(sizes[size] || 0);
        } else {
          // Online store web stock or fallback showroom stock
          const sizes = JSON.parse((isShowroom ? prod.showroomSizesJson : prod.sizesJson) || "{}");
          currentStock = Number(sizes[size] || 0);
        }

        if (currentStock < qty) {
          throw new Error(`দুঃখিত, "${prod.name}" (সাইজ: ${size}) এর পর্যাপ্ত স্টক নেই। বর্তমান স্টক: ${currentStock} টি, অর্ডার চাওয়া হয়েছে: ${qty} টি।`);
        }
      }

      let subtotal = 0;
      const orderItemsToCreate = [];

      for (const item of items) {
        const productId = item.id || "1";
        const size = item.size || "M";
        const qty = Number(item.quantity);

        const prod = await tx.product.findUnique({ where: { id: productId } });
        if (!prod) {
          throw new Error(`পোশাকটি পাওয়া যায়নি (কোড/আইডি: ${productId})`);
        }

        // Determine size-specific price from DB
        let resolvedPrice = prod.price;
        if (prod.sizePricesJson) {
          try {
            const sizePrices = JSON.parse(prod.sizePricesJson);
            if (sizePrices[size] !== undefined && sizePrices[size] !== null && Number(sizePrices[size]) > 0) {
              resolvedPrice = Number(sizePrices[size]);
            }
          } catch (e) {}
        }

        // For showroom POS sales, we can trust the client override if provided. Otherwise use resolvedPrice.
        // For online store sales, we ALWAYS force resolvedPrice to prevent client tampering.
        let finalPrice = resolvedPrice;
        if (isShowroom && item.price !== undefined && item.price !== null) {
          finalPrice = Number(item.price);
        }

        subtotal += finalPrice * qty;

        orderItemsToCreate.push({
          productId,
          size,
          quantity: qty,
          price: finalPrice
        });
      }

      const discountAmount = Number(discount || 0);
      
      let shippingCost = 80;
      if (shippingMethod === "outside") {
        shippingCost = 150;
      } else if (shippingMethod === "showroom" || shippingMethod === "walkin") {
        shippingCost = 0;
      }

      const grandTotal = subtotal - discountAmount + shippingCost;
      const orderNumber = "TF-" + Math.floor(100000 + Math.random() * 900000);

      // Deduct stock if starting in a deduct state (like DELIVERED)
      const targetOrderStatus = orderStatus || "PENDING";
      const targetPaymentStatus = paymentStatus || "UNPAID";
      const isDeductState = ["CONFIRMED", "SHIPPED", "DELIVERED"].includes(targetOrderStatus);
      let stockAdjusted = false;

      if (isDeductState) {
        for (const item of items) {
          const productId = item.id || "1";
          const prod = await tx.product.findUnique({ where: { id: productId } });
          if (prod) {
            const size = item.size || "M";
            const qty = Number(item.quantity);

            if (isShowroom && branchId) {
              // Deduct from branch-specific stock
              const bStock = await tx.branchStock.findUnique({
                where: { productId_branchId: { productId, branchId } }
              });
              const sizes = JSON.parse(bStock?.sizesJson || "{}");
              sizes[size] = Math.max(0, Number(sizes[size] || 0) - qty);

              await tx.branchStock.upsert({
                where: { productId_branchId: { productId, branchId } },
                update: { sizesJson: JSON.stringify(sizes) },
                create: { productId, branchId, sizesJson: JSON.stringify(sizes) }
              });
            } else {
              // Deduct from Product (sizesJson or showroomSizesJson fallback)
              const sizes = JSON.parse((isShowroom ? prod.showroomSizesJson : prod.sizesJson) || "{}");
              sizes[size] = Math.max(0, Number(sizes[size] || 0) - qty);
              await tx.product.update({
                where: { id: productId },
                data: { 
                  [isShowroom ? "showroomSizesJson" : "sizesJson"]: JSON.stringify(sizes) 
                }
              });
            }
          }
        }
        stockAdjusted = true;
      }

      return await tx.order.create({
        data: {
          orderNumber,
          name,
          phone,
          email: email || null,
          address,
          city,
          postcode,
          shippingCost,
          subtotal,
          discount: discountAmount,
          grandTotal,
          paymentMethod,
          paymentStatus: targetPaymentStatus,
          orderStatus: targetOrderStatus,
          stockAdjusted,
          isShowroom,
          branchId: isShowroom ? branchId : null,
          trxId: trxId || null,
          items: {
            create: orderItemsToCreate
          }
        },
        include: {
          branch: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });
    });

    console.log(`Order placed successfully: ${order.orderNumber}`);

    // Verify optional admin session to log activity
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const isAllowed = decoded.role === "ADMIN" || decoded.role === "SUPER_ADMIN" || decoded.role === "BRANCH_MANAGER";
        if (decoded && isAllowed) {
          await logActivity(
            decoded.email,
            decoded.name || "অ্যাডমিন",
            "POS_ORDER_CREATE",
            `শোরুম থেকে বিক্রয় সম্পন্ন করা হয়েছে (অর্ডার নম্বর: ${order.orderNumber}, মোট টাকা: ৳${order.grandTotal}, পেমেন্ট: ${paymentMethod.toUpperCase()})`
          );
        }
      } catch (err) {
        // Ignore token errors
      }
    }

    res.status(201).json(order);
  } catch (error: any) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ error: "Failed to place order: " + error.message });
  }
});

// 5. List Orders Route
app.get("/api/orders", authenticateToken, requireRole(["SUPER_ADMIN", "BRANCH_MANAGER"]), async (req: any, res: any) => {
  try {
    const userRole = req.user.role === "ADMIN" ? "SUPER_ADMIN" : req.user.role;
    let whereClause = {};

    if (userRole === "BRANCH_MANAGER") {
      if (!req.user.branchId) {
        return res.status(400).json({ error: "ইউজারের জন্য কোনো শোরুম আউটলেট অ্যাসাইন করা নেই।" });
      }

      const allowedModules = req.user.allowedModules || "";
      const modulesList = allowedModules.split(",").map((m: string) => m.trim());
      if (!modulesList.includes("showroom_orders") && !modulesList.includes("showroom_pos")) {
        return res.status(403).json({ error: "আপনার অর্ডার লিস্ট দেখার অনুমতি নেই।" });
      }

      whereClause = { branchId: req.user.branchId };
    } else {
      const branchIdQuery = req.query.branchId as string;
      if (branchIdQuery) {
        whereClause = { branchId: branchIdQuery };
      }
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        branch: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load orders: " + error.message });
  }
});

// 5.5. Search Customers (Linked from POS)
app.get("/api/customers", authenticateToken, requireRole(["SUPER_ADMIN", "BRANCH_MANAGER"]), async (req: any, res: any) => {
  try {
    const { query } = req.query;
    let whereClause: any = {};

    if (query && String(query).trim().length >= 2) {
      const searchTerm = String(query).trim();
      whereClause.OR = [
        { phone: { contains: searchTerm } },
        { name: { contains: searchTerm } }
      ];
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      select: {
        name: true,
        phone: true,
        address: true,
        city: true,
        postcode: true,
        grandTotal: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 200
    });

    const seen = new Set();
    const clients: any[] = [];
    for (const o of orders) {
      if (o.phone && !seen.has(o.phone)) {
        seen.add(o.phone);
        clients.push({
          name: o.name,
          phone: o.phone,
          address: `${o.address || ""}, ${o.city || ""}`.trim().replace(/^,\s*/, "").replace(/,\s*$/, ""),
          city: o.city || "Dhaka",
          postcode: o.postcode || "1215",
          totalSpent: o.grandTotal,
          lastOrderDate: o.createdAt
        });
      } else if (o.phone) {
        const existing = clients.find(x => x.phone === o.phone);
        if (existing) {
          existing.totalSpent += o.grandTotal;
        }
      }
    }

    res.json(clients.slice(0, 100));
  } catch (error: any) {
    res.status(500).json({ error: "Failed to search customers: " + error.message });
  }
});

// 6. Create Review Route
app.post("/api/reviews", async (req, res) => {
  try {
    const { productId, name, rating, comment } = req.body;

    if (!productId || !name || !rating || !comment) {
      return res.status(400).json({ error: "Missing required review fields" });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        name,
        rating: Number(rating),
        comment
      }
    });

    res.status(201).json(review);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to save review: " + error.message });
  }
});

// 7. Get Reviews for Product Route
app.get("/api/reviews/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.review.findMany({
      where: {
        productId
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load reviews: " + error.message });
  }
});

// 8. Get Analytics Route
app.get("/api/analytics", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const orders = await prisma.order.findMany();
    const totalEarnings = orders
      .filter(o => o.orderStatus !== "CANCELLED")
      .reduce((acc, o) => acc + o.grandTotal, 0);

    const onlineEarnings = orders
      .filter(o => o.orderStatus !== "CANCELLED" && !o.isShowroom)
      .reduce((acc, o) => acc + o.grandTotal, 0);

    const showroomEarnings = orders
      .filter(o => o.orderStatus !== "CANCELLED" && o.isShowroom)
      .reduce((acc, o) => acc + o.grandTotal, 0);

    const totalOrders = orders.length;
    const onlineOrdersCount = orders.filter(o => !o.isShowroom).length;
    const showroomOrdersCount = orders.filter(o => o.isShowroom).length;

    const pendingOrders = orders.filter(o => o.orderStatus === "PENDING").length;
    const confirmedOrders = orders.filter(o => o.orderStatus === "CONFIRMED").length;
    const shippedOrders = orders.filter(o => o.orderStatus === "SHIPPED").length;
    const deliveredOrders = orders.filter(o => o.orderStatus === "DELIVERED").length;
    const cancelledOrders = orders.filter(o => o.orderStatus === "CANCELLED").length;
    const activeOrders = orders.filter(o => o.orderStatus !== "DELIVERED" && o.orderStatus !== "CANCELLED").length;
    
    const totalProducts = await prisma.product.count();
    const totalCustomers = await prisma.user.count({ where: { role: "CUSTOMER" } });
    const totalCoupons = await prisma.coupon.count();
    const totalReviews = await prisma.review.count();
    const totalSubscribers = await prisma.newsletterSubscriber.count();

    // Calculate Cost of Goods Sold (COGS) & Net Profit
    const purchases = await prisma.stockPurchase.findMany();
    const productSizeCostMap: { [key: string]: { totalCost: number; totalQty: number } } = {};
    for (const p of purchases) {
      const key = `${p.productId}-${p.size}`;
      if (!productSizeCostMap[key]) {
        productSizeCostMap[key] = { totalCost: 0, totalQty: 0 };
      }
      productSizeCostMap[key].totalCost += p.totalCost;
      productSizeCostMap[key].totalQty += p.quantity;
    }

    const productCostMap: { [productId: string]: { totalCost: number; totalQty: number } } = {};
    for (const p of purchases) {
      if (!productCostMap[p.productId]) {
        productCostMap[p.productId] = { totalCost: 0, totalQty: 0 };
      }
      productCostMap[p.productId].totalCost += p.totalCost;
      productCostMap[p.productId].totalQty += p.quantity;
    }

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          orderStatus: { not: "CANCELLED" }
        }
      },
      include: {
        product: true
      }
    });

    let totalCostOfGoods = 0;
    for (const item of orderItems) {
      const key = `${item.productId}-${item.size}`;
      if (productSizeCostMap[key] && productSizeCostMap[key].totalQty > 0) {
        const avgCost = productSizeCostMap[key].totalCost / productSizeCostMap[key].totalQty;
        totalCostOfGoods += avgCost * item.quantity;
      } else if (productCostMap[item.productId] && productCostMap[item.productId].totalQty > 0) {
        const avgCost = productCostMap[item.productId].totalCost / productCostMap[item.productId].totalQty;
        totalCostOfGoods += avgCost * item.quantity;
      } else {
        const fallbackCost = (item.product?.price || item.price) * 0.6;
        totalCostOfGoods += fallbackCost * item.quantity;
      }
    }

    // Fetch total showroom expenses
    const expenses = await prisma.expense.findMany();
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const netProfit = totalEarnings - totalCostOfGoods - totalExpenses;

    // Last 7 days daily sales log for dashboard charts
    const last7DaysSales: { [date: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString("bn-BD", { month: "short", day: "numeric" });
      last7DaysSales[dateString] = 0;
    }

    for (const order of orders) {
      if (order.orderStatus === "CANCELLED") continue;
      const orderDate = new Date(order.createdAt).toLocaleDateString("bn-BD", { month: "short", day: "numeric" });
      if (last7DaysSales[orderDate] !== undefined) {
        last7DaysSales[orderDate] += order.grandTotal;
      }
    }

    const salesChartData = Object.keys(last7DaysSales).map(key => ({
      date: key,
      sales: last7DaysSales[key]
    }));

    res.json({
      totalEarnings,
      onlineEarnings,
      showroomEarnings,
      totalOrders,
      onlineOrdersCount,
      showroomOrdersCount,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      activeOrders,
      totalProducts,
      totalCustomers,
      totalCoupons,
      totalReviews,
      totalSubscribers,
      totalCostOfGoods,
      totalExpenses,
      netProfit,
      salesChartData
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load analytics: " + error.message });
  }
});

// 9. Update Order Status & Info Route
app.put("/api/orders/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      phone, 
      email, 
      address, 
      city, 
      postcode, 
      paymentMethod, 
      paymentStatus, 
      orderStatus, 
      trxId 
    } = req.body;

    // Fetch existing order with its items to check current state
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (orderStatus) {
        await adjustOrderStock(id, orderStatus, tx);
      }

      return await tx.order.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(phone !== undefined && { phone }),
          ...(email !== undefined && { email }),
          ...(address !== undefined && { address }),
          ...(city !== undefined && { city }),
          ...(postcode !== undefined && { postcode }),
          ...(paymentMethod !== undefined && { paymentMethod }),
          ...(paymentStatus !== undefined && { paymentStatus }),
          ...(orderStatus !== undefined && { orderStatus }),
          ...(trxId !== undefined && { trxId })
        },
        include: {
          branch: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });
    });

    let logDetails = `Updated order: ${order.orderNumber}.`;
    if (orderStatus && orderStatus !== order.orderStatus) {
      logDetails += ` Status: ${order.orderStatus} -> ${orderStatus}.`;
    }
    if (paymentStatus && paymentStatus !== order.paymentStatus) {
      logDetails += ` Payment: ${order.paymentStatus} -> ${paymentStatus}.`;
    }
    if (name !== undefined || phone !== undefined || address !== undefined || trxId !== undefined) {
      logDetails += ` Modified shipping/payment fields.`;
    }
    logAdminActivity(req, "ORDER_UPDATE", logDetails);

    res.json(updatedOrder);
  } catch (error: any) {
    console.error("Order update error:", error);
    res.status(500).json({ error: "Failed to update order: " + error.message });
  }
});

// 10. Create Product Route
app.post("/api/products", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { sku, name, price, originalPrice, category, imgUrl, sizesJson, showroomSizesJson, sizePricesJson } = req.body;

    if (!sku || !name || !price || !category || !imgUrl) {
      return res.status(400).json({ error: "Missing required product fields" });
    }

    // Verify category exists in database
    const catExists = await prisma.category.findUnique({ where: { name: category } });
    if (!catExists) {
      return res.status(400).json({ error: `প্রদত্ত ক্যাটাগরি "${category}" সিস্টেমে পাওয়া যায়নি। প্রথমে ক্যাটাগরি তৈরি করুন।` });
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        category,
        imgUrl,
        sizesJson: sizesJson || '{"S":10,"M":15,"L":15,"XL":5}',
        showroomSizesJson: showroomSizesJson || sizesJson || '{"S":10,"M":15,"L":15,"XL":5}',
        sizePricesJson: sizePricesJson || '{}'
      }
    });
    logAdminActivity(req, "PRODUCT_CREATE", `Created new product: ${name} (SKU: ${sku}, Price: ৳${price})`);
    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create product: " + error.message });
  }
});

// 11. Update Product Route
app.put("/api/products/:id", authenticateToken, requireRole(["SUPER_ADMIN", "BRANCH_MANAGER"]), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { name, price, originalPrice, category, imgUrl, sizesJson, showroomSizesJson, sizePricesJson } = req.body;
    let branchId = req.body.branchId || null;

    const userRole = req.user.role === "ADMIN" ? "SUPER_ADMIN" : req.user.role;

    if (userRole === "BRANCH_MANAGER") {
      // Branch manager can ONLY update showroom stock (showroomSizesJson)
      if (name || price || originalPrice !== undefined || category || imgUrl || sizesJson || sizePricesJson) {
        return res.status(403).json({ error: "আপনার এই পণ্য তথ্য পরিবর্তন করার অনুমতি নেই।" });
      }
      if (!req.user.branchId) {
        return res.status(400).json({ error: "ইউজারের জন্য কোনো শোরুম আউটলেট অ্যাসাইন করা নেই।" });
      }
      branchId = req.user.branchId;
    }

    // If updating showroom stock and a branchId is resolved/provided, update the BranchStock pivot table!
    if (showroomSizesJson && branchId) {
      try {
        JSON.parse(showroomSizesJson);
      } catch (e) {
        return res.status(400).json({ error: "Invalid showroomSizesJson format" });
      }

      await prisma.branchStock.upsert({
        where: { productId_branchId: { productId: id, branchId } },
        update: { sizesJson: showroomSizesJson },
        create: { productId: id, branchId, sizesJson: showroomSizesJson }
      });

      const product = await prisma.product.findUnique({ where: { id } });
      logAdminActivity(req, "STOCK_UPDATE", `Updated showroom stock for product ${product?.sku} at branch ${branchId}`);
      
      return res.json({
        ...product,
        showroomSizesJson
      });
    }

    if (category) {
      // Verify category exists in database
      const catExists = await prisma.category.findUnique({ where: { name: category } });
      if (!catExists) {
        return res.status(400).json({ error: `প্রদত্ত ক্যাটাগরি "${category}" সিস্টেমে পাওয়া যায়নি। প্রথমে ক্যাটাগরি তৈরি করুন।` });
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price && { price: Number(price) }),
        ...(originalPrice !== undefined && { originalPrice: originalPrice ? Number(originalPrice) : null }),
        ...(category && { category }),
        ...(imgUrl && { imgUrl }),
        ...(sizesJson && { sizesJson }),
        ...(showroomSizesJson && { showroomSizesJson }),
        ...(sizePricesJson && { sizePricesJson })
      }
    });
    logAdminActivity(req, "PRODUCT_UPDATE", `Updated product: ${updatedProduct.name} (SKU: ${updatedProduct.sku}, Price: ৳${updatedProduct.price})`);
    res.json(updatedProduct);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update product: " + error.message });
  }
});

// 12. Delete Product Route
app.delete("/api/products/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    await prisma.review.deleteMany({ where: { productId: id } });
    await prisma.orderItem.deleteMany({ where: { productId: id } });
    await prisma.product.delete({
      where: { id }
    });
    logAdminActivity(req, "PRODUCT_DELETE", `Deleted product: ${product.name} (SKU: ${product.sku})`);
    res.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete product: " + error.message });
  }
});

// 13. Delete Review Route
app.delete("/api/reviews/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id }, include: { product: true } });
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    await prisma.review.delete({
      where: { id }
    });
    logAdminActivity(req, "REVIEW_DELETE", `Deleted review by ${review.name} on product: ${review.product?.name}`);
    res.json({ message: "Review deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete review: " + error.message });
  }
});

// 14. Delete Order Route
app.delete("/api/orders/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch order first to see if stock needs to be restored
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    await prisma.$transaction(async (tx) => {
      // Restore stock if adjusted
      await adjustOrderStock(id, "CANCELLED", tx);

      // Delete order (OrderItems will be cascade deleted)
      await tx.order.delete({
        where: { id }
      });
    });
    
    logAdminActivity(req, "ORDER_DELETE", `Deleted order: ${order.orderNumber} (Grand Total: ৳${order.grandTotal})`);
    res.json({ message: "Order deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete order: " + error.message });
  }
});

// 15. Coupon API Routes
// A. List all coupons
app.get("/api/coupons", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load coupons: " + error.message });
  }
});

// B. Create a coupon
app.post("/api/coupons", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { code, type, value, minSubtotal } = req.body;

    if (!code || !type || value === undefined) {
      return res.status(400).json({ error: "কুপন কোড, ধরন এবং মান আবশ্যক।" });
    }

    const cleanCode = code.toUpperCase().trim();

    // Check duplicate
    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode }
    });
    if (existing) {
      return res.status(400).json({ error: "এই কোড দিয়ে ইতিমধ্যে একটি কুপন তৈরি করা আছে।" });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        type,
        value: Number(value),
        minSubtotal: Number(minSubtotal || 0),
        isActive: true
      }
    });
    logAdminActivity(req, "COUPON_CREATE", `Created coupon code: ${cleanCode} (${type === 'PERCENTAGE' ? value + '%' : '৳' + value} discount)`);
    res.status(201).json(coupon);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create coupon: " + error.message });
  }
});

// C. Update coupon active status / values
app.put("/api/coupons/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, code, type, value, minSubtotal } = req.body;

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      return res.status(404).json({ error: "কুপন পাওয়া যায়নি।" });
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(code !== undefined && { code: code.toUpperCase().trim() }),
        ...(type !== undefined && { type }),
        ...(value !== undefined && { value: Number(value) }),
        ...(minSubtotal !== undefined && { minSubtotal: Number(minSubtotal) })
      }
    });
    let logMsg = `Updated coupon ${updated.code}.`;
    if (isActive !== undefined && isActive !== coupon.isActive) {
      logMsg += ` Status: ${coupon.isActive ? 'Active' : 'Inactive'} -> ${isActive ? 'Active' : 'Inactive'}.`;
    }
    logAdminActivity(req, "COUPON_UPDATE", logMsg);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update coupon: " + error.message });
  }
});

// D. Delete a coupon
app.delete("/api/coupons/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }
    await prisma.coupon.delete({ where: { id } });
    logAdminActivity(req, "COUPON_DELETE", `Deleted coupon code: ${coupon.code}`);
    res.json({ message: "Coupon deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete coupon: " + error.message });
  }
});

// E. Apply a coupon
app.post("/api/coupons/apply", async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || subtotal === undefined) {
      return res.status(400).json({ error: "কুপন কোড এবং সাবটোটাল আবশ্যক।" });
    }

    const cleanCode = code.toUpperCase().trim();
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode }
    });

    if (!coupon) {
      return res.status(404).json({ error: "ভুল কুপন কোড! কুপনটি পাওয়া যায়নি।" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ error: "দুঃখিত, এই কুপনটি এখন আর সচল নেই।" });
    }

    const subtotalNum = Number(subtotal);
    if (subtotalNum < coupon.minSubtotal) {
      return res.status(400).json({ 
        error: `এই কুপনটি ব্যবহার করতে ন্যূনতম ৳${coupon.minSubtotal} টাকার অর্ডার করতে হবে। আপনার বর্তমান সাবটোটাল: ৳${subtotalNum}` 
      });
    }

    let discountAmount = 0;
    if (coupon.type === "PERCENTAGE") {
      discountAmount = Math.round((subtotalNum * coupon.value) / 100);
    } else {
      discountAmount = coupon.value;
    }

    // Discount cannot exceed subtotal
    discountAmount = Math.min(discountAmount, subtotalNum);

    res.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to apply coupon: " + error.message });
  }
});

// --- FAQ API Routes ---

// A. Get all FAQs (Public)
app.get("/api/faqs", async (req, res) => {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: { order: "asc" }
    });
    res.json(faqs);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load FAQs: " + error.message });
  }
});

// B. Create FAQ (Admin only)
app.post("/api/faqs", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { question, answer, order } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: "প্রশ্ন এবং উত্তর দেওয়া আবশ্যক।" });
    }
    const faq = await prisma.faq.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        order: Number(order || 0)
      }
    });
    logAdminActivity(req, "FAQ_CREATE", `Created FAQ: "${question.slice(0, 30)}${question.length > 30 ? '...' : ''}"`);
    res.status(201).json(faq);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create FAQ: " + error.message });
  }
});

// C. Update FAQ (Admin only)
app.put("/api/faqs/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, order } = req.body;
    
    const faq = await prisma.faq.findUnique({ where: { id } });
    if (!faq) {
      return res.status(404).json({ error: "FAQ পাওয়া যায়নি।" });
    }

    const updated = await prisma.faq.update({
      where: { id },
      data: {
        ...(question !== undefined && { question: question.trim() }),
        ...(answer !== undefined && { answer: answer.trim() }),
        ...(order !== undefined && { order: Number(order) })
      }
    });
    logAdminActivity(req, "FAQ_UPDATE", `Updated FAQ ID: ${id}`);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update FAQ: " + error.message });
  }
});

// D. Delete FAQ (Admin only)
app.delete("/api/faqs/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await prisma.faq.findUnique({ where: { id } });
    if (!faq) {
      return res.status(404).json({ error: "FAQ not found" });
    }
    await prisma.faq.delete({ where: { id } });
    logAdminActivity(req, "FAQ_DELETE", `Deleted FAQ: "${faq.question.slice(0, 30)}${faq.question.length > 30 ? '...' : ''}"`);
    res.json({ message: "FAQ deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete FAQ: " + error.message });
  }
});

// --- Newsletter Subscriber API Routes ---

// A. Subscribe to newsletter (Public)
app.post("/api/newsletter/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "ইমেইল এড্রেস দেওয়া আবশ্যক।" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: "অনুগ্রহ করে একটি সঠিক ইমেইল এড্রেস প্রদান করুন।" });
    }

    // Check duplicate
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: cleanEmail }
    });

    if (existing) {
      return res.status(400).json({ error: "এই ইমেইলটি ইতিমধ্যে সাবস্ক্রাইব করা হয়েছে।" });
    }

    const subscriber = await prisma.newsletterSubscriber.create({
      data: { email: cleanEmail }
    });

    res.status(201).json({
      message: "নিউজলেটার সাবস্ক্রিপশন সফল হয়েছে।",
      subscriber
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to subscribe to newsletter: " + error.message });
  }
});

// B. List all subscribers (Admin only)
app.get("/api/newsletter", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(subscribers);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to list subscribers: " + error.message });
  }
});

// C. Delete subscriber / unsubscribe manually (Admin only)
app.delete("/api/newsletter/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await prisma.newsletterSubscriber.findUnique({ where: { id } });
    if (!sub) {
      return res.status(404).json({ error: "Subscriber not found" });
    }
    await prisma.newsletterSubscriber.delete({
      where: { id }
    });
    logAdminActivity(req, "NEWSLETTER_UNSUBSCRIBE", `Removed newsletter subscriber: ${sub.email}`);
    res.json({ message: "Subscriber removed successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete subscriber: " + error.message });
  }
});

// --- Admin Activity Logs Endpoint ---
app.get("/api/logs", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load activity logs: " + error.message });
  }
});

// --- Suppliers and Wholesale Purchases Endpoints ---

// 1. List all suppliers
app.get("/api/suppliers", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(suppliers);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to list suppliers: " + error.message });
  }
});

// 2. Create supplier
app.post("/api/suppliers", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { name, phone, company } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Supplier name is required" });
    }
    const supplier = await prisma.supplier.create({
      data: { name, phone, company }
    });
    logAdminActivity(req, "SUPPLIER_CREATE", `Created supplier: ${name} (${company || "No Company"})`);
    res.json(supplier);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create supplier: " + error.message });
  }
});

// 3. Delete supplier
app.delete("/api/suppliers/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    await prisma.supplier.delete({ where: { id } });
    logAdminActivity(req, "SUPPLIER_DELETE", `Deleted supplier: ${supplier.name}`);
    res.json({ message: "Supplier deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete supplier: " + error.message });
  }
});

// 4. Retrieve purchase logs
app.get("/api/purchases", authenticateToken, requireRole(["SUPER_ADMIN", "BRANCH_MANAGER"]), requireModule("showroom_purchases"), async (req: any, res: any) => {
  try {
    const userRole = req.user.role === "ADMIN" ? "SUPER_ADMIN" : req.user.role;
    let whereClause = {};

    if (userRole === "BRANCH_MANAGER") {
      if (!req.user.branchId) {
        return res.status(400).json({ error: "ইউজারের জন্য কোনো শোরুম আউটলেট অ্যাসাইন করা নেই।" });
      }
      whereClause = { branchId: req.user.branchId };
    } else {
      const branchIdQuery = req.query.branchId as string;
      if (branchIdQuery) {
        whereClause = { branchId: branchIdQuery };
      }
    }

    const purchases = await prisma.stockPurchase.findMany({
      where: whereClause,
      include: {
        supplier: true,
        product: true
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(purchases);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to list purchases: " + error.message });
  }
});

// 5. Record new purchase and increment stock atomically
app.post("/api/purchases", authenticateToken, requireRole(["SUPER_ADMIN", "BRANCH_MANAGER"]), requireModule("showroom_purchases"), async (req: any, res: any) => {
  try {
    const { supplierId, productId, size, quantity, buyingPrice, target } = req.body;
    let branchId = req.body.branchId || null;

    const userRole = req.user.role === "ADMIN" ? "SUPER_ADMIN" : req.user.role;
    if (userRole === "BRANCH_MANAGER") {
      if (!req.user.branchId) {
        return res.status(400).json({ error: "ইউজারের জন্য কোনো শোরুম আউটলেট অ্যাসাইন করা নেই।" });
      }
      branchId = req.user.branchId;
    }

    if (!productId || !size || !quantity || !buyingPrice) {
      return res.status(400).json({ error: "Product ID, size, quantity, and buying price are required" });
    }

    const qty = parseInt(quantity);
    const price = parseFloat(buyingPrice);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: "Quantity must be a positive number" });
    }
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: "Buying price must be a positive number" });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const isShowroom = target === "showroom";

    // Increment stock count
    let sizes: any = {};
    let branchSizes: any = {};

    if (isShowroom && branchId) {
      const bStock = await prisma.branchStock.findUnique({
        where: { productId_branchId: { productId, branchId } }
      });
      try {
        branchSizes = JSON.parse(bStock?.sizesJson || "{}");
      } catch (e) {
        branchSizes = {};
      }
      branchSizes[size] = (branchSizes[size] || 0) + qty;
    } else {
      try {
        sizes = JSON.parse((isShowroom ? product.showroomSizesJson : product.sizesJson) || "{}");
      } catch (e) {
        sizes = {};
      }
      sizes[size] = (sizes[size] || 0) + qty;
    }

    // Use Prisma transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create StockPurchase record
      const purchase = await tx.stockPurchase.create({
        data: {
          supplierId: supplierId || null,
          productId,
          size,
          quantity: qty,
          buyingPrice: price,
          totalCost: qty * price,
          branchId: isShowroom ? branchId : null
        },
        include: {
          supplier: true,
          product: true
        }
      });

      // 2. Update Product or BranchStock
      if (isShowroom && branchId) {
        await tx.branchStock.upsert({
          where: { productId_branchId: { productId, branchId } },
          update: { sizesJson: JSON.stringify(branchSizes) },
          create: { productId, branchId, sizesJson: JSON.stringify(branchSizes) }
        });
      } else {
        await tx.product.update({
          where: { id: productId },
          data: {
            [isShowroom ? "showroomSizesJson" : "sizesJson"]: JSON.stringify(sizes)
          }
        });
      }

      return purchase;
    });

    logAdminActivity(req, "STOCK_PURCHASE", `পাইকারি ক্রয় নথিভুক্ত করেছেন (SKU: ${product.sku}, সাইজ: ${size}, পরিমাণ: ${qty}, মূল্য: ৳${price}, টার্গেট: ${isShowroom ? "শোরুম" : "অনলাইন"})`);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to record purchase: " + error.message });
  }
});


// --- Steadfast Courier Integration Endpoints ---

// 1. Book order to Steadfast Courier
app.post("/api/orders/:id/book-steadfast", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { codAmount, note } = req.body;

    const order = await prisma.order.findUnique({
      where: { id }
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.courierConsignmentId) {
      return res.status(400).json({ error: "Order is already booked with Steadfast" });
    }

    // Clean recipient phone to be 11-digit starting with 01
    let cleanPhone = order.phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("880")) {
      cleanPhone = cleanPhone.substring(3);
    } else if (cleanPhone.startsWith("88")) {
      cleanPhone = cleanPhone.substring(2);
    }
    if (!cleanPhone.startsWith("0")) {
      cleanPhone = "0" + cleanPhone;
    }

    const parsedCod = parseFloat(codAmount);
    const finalCodAmount = isNaN(parsedCod) ? (order.paymentMethod === "cod" && order.paymentStatus === "UNPAID" ? order.grandTotal : 0) : parsedCod;

    const apiKey = process.env.STEADFAST_API_KEY || "";
    const secretKey = process.env.STEADFAST_SECRET_KEY || "";

    const payload = {
      invoice: order.orderNumber,
      recipient_name: order.name,
      recipient_phone: cleanPhone,
      recipient_address: `${order.address}, ${order.city} - ${order.postcode}`,
      cod_amount: finalCodAmount,
      note: note || ""
    };

    const response = await fetch("https://portal.packzy.com/api/v1/create_order", {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Secret-Key": secretKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data: any = await response.json();

    if (data.status === 200 && data.consignment) {
      const consignment = data.consignment;
      const updatedOrder = await prisma.$transaction(async (tx) => {
        await adjustOrderStock(id, "SHIPPED", tx);

        return await tx.order.update({
          where: { id },
          data: {
            courierConsignmentId: String(consignment.consignment_id),
            courierTrackingCode: consignment.tracking_code,
            courierStatus: "pending",
            orderStatus: "SHIPPED" // Mark as shipped since it has been sent to courier
          }
        });
      });

      logAdminActivity(
        req,
        "STEADFAST_BOOKING",
        `অর্ডার #${order.orderNumber} কুরিয়ারে পাঠিয়েছেন (কনসাইনমেন্ট আইডি: ${consignment.consignment_id}, ট্র্যাকিং কোড: ${consignment.tracking_code}, COD: ৳${finalCodAmount})`
      );

      res.json(updatedOrder);
    } else {
      res.status(400).json({ error: data.message || "Steadfast Courier API returned an error" });
    }
  } catch (error: any) {
    res.status(500).json({ error: "Failed to book with Steadfast: " + error.message });
  }
});

// 2. Sync order status from Steadfast Courier
app.post("/api/orders/:id/sync-steadfast", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id }
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (!order.courierConsignmentId) {
      return res.status(400).json({ error: "Order has no Steadfast Consignment ID to sync" });
    }

    const apiKey = process.env.STEADFAST_API_KEY || "";
    const secretKey = process.env.STEADFAST_SECRET_KEY || "";

    const response = await fetch(`https://portal.packzy.com/api/v1/status_by_cid/${order.courierConsignmentId}`, {
      method: "GET",
      headers: {
        "Api-Key": apiKey,
        "Secret-Key": secretKey,
        "Content-Type": "application/json"
      }
    });

    const data: any = await response.json();

    if (data.status === 200 && data.delivery_status) {
      const deliveryStatus = data.delivery_status;
      
      let updatedOrderStatus = order.orderStatus;
      let updatedPaymentStatus = order.paymentStatus;

      if (deliveryStatus === "delivered") {
        updatedOrderStatus = "DELIVERED";
        updatedPaymentStatus = "PAID";
      } else if (deliveryStatus === "cancelled") {
        updatedOrderStatus = "CANCELLED";
      }

      const updatedOrder = await prisma.$transaction(async (tx) => {
        if (updatedOrderStatus !== order.orderStatus) {
          await adjustOrderStock(id, updatedOrderStatus, tx);
        }

        return await tx.order.update({
          where: { id },
          data: {
            courierStatus: deliveryStatus,
            orderStatus: updatedOrderStatus,
            paymentStatus: updatedPaymentStatus
          }
        });
      });

      logAdminActivity(
        req,
        "STEADFAST_SYNC",
        `কুরিয়ার ট্র্যাক সিঙ্ক হয়েছে: #${order.orderNumber} এর কুরিয়ার স্ট্যাটাস: ${deliveryStatus}`
      );

      res.json(updatedOrder);
    } else {
      res.status(400).json({ error: data.message || "Steadfast Courier API returned an error" });
    }
  } catch (error: any) {
    res.status(500).json({ error: "Failed to sync with Steadfast: " + error.message });
  }
});

// 12. Product Stock Transfer Route (Online ⇄ Showroom)
app.post("/api/products/:id/transfer-stock", authenticateToken, requireRole(["SUPER_ADMIN", "BRANCH_MANAGER"]), requireModule("showroom_stock"), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { size, quantity, direction } = req.body;
    let branchId = req.body.branchId || null;

    const userRole = req.user.role === "ADMIN" ? "SUPER_ADMIN" : req.user.role;
    if (userRole === "BRANCH_MANAGER") {
      if (!req.user.branchId) {
        return res.status(400).json({ error: "ইউজারের জন্য কোনো শোরুম আউটলেট অ্যাসাইন করা নেই।" });
      }
      branchId = req.user.branchId;
    }

    if (!size || !quantity || quantity <= 0 || !direction) {
      return res.status(400).json({ error: "Invalid transfer parameters" });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const sizes = JSON.parse(product.sizesJson || "{}");

    // Load target showroom stock
    let showroomSizes: any = {};
    if (branchId) {
      const bStock = await prisma.branchStock.findUnique({
        where: { productId_branchId: { productId: id, branchId } }
      });
      showroomSizes = JSON.parse(bStock?.sizesJson || "{}");
    } else {
      showroomSizes = JSON.parse(product.showroomSizesJson || "{}");
    }

    if (direction === "online_to_showroom") {
      const currentOnlineStock = Number(sizes[size] || 0);
      if (currentOnlineStock < quantity) {
        return res.status(400).json({ error: `Insufficient online stock. Available: ${currentOnlineStock}` });
      }
      sizes[size] = currentOnlineStock - quantity;
      showroomSizes[size] = Number(showroomSizes[size] || 0) + quantity;
    } else if (direction === "showroom_to_online") {
      const currentShowroomStock = Number(showroomSizes[size] || 0);
      if (currentShowroomStock < quantity) {
        return res.status(400).json({ error: `Insufficient showroom stock. Available: ${currentShowroomStock}` });
      }
      showroomSizes[size] = currentShowroomStock - quantity;
      sizes[size] = Number(sizes[size] || 0) + quantity;
    } else {
      return res.status(400).json({ error: "Invalid transfer direction" });
    }

    // Save changes
    await prisma.product.update({
      where: { id },
      data: { sizesJson: JSON.stringify(sizes) }
    });

    if (branchId) {
      await prisma.branchStock.upsert({
        where: { productId_branchId: { productId: id, branchId } },
        update: { sizesJson: JSON.stringify(showroomSizes) },
        create: { productId: id, branchId, sizesJson: JSON.stringify(showroomSizes) }
      });
    } else {
      await prisma.product.update({
        where: { id },
        data: { showroomSizesJson: JSON.stringify(showroomSizes) }
      });
    }

    const dirLabel = direction === "online_to_showroom" ? "অনলাইন -> শোরুম" : "শোরুম -> অনলাইন";
    logAdminActivity(
      req,
      "STOCK_TRANSFER",
      `Transferred ${quantity} pcs of ${product.name} (Size: ${size}) from ${dirLabel}`
    );

    res.json({
      ...product,
      sizesJson: JSON.stringify(sizes),
      showroomSizesJson: JSON.stringify(showroomSizes)
    });
  } catch (error: any) {
    res.status(500).json({ error: "Stock transfer failed: " + error.message });
  }
});

// 13. Expense API Routes
app.get("/api/expenses", authenticateToken, requireRole(["SUPER_ADMIN", "BRANCH_MANAGER"]), requireModule("showroom_expenses"), async (req: any, res: any) => {
  try {
    const userRole = req.user.role === "ADMIN" ? "SUPER_ADMIN" : req.user.role;
    let whereClause = {};

    if (userRole === "BRANCH_MANAGER") {
      if (!req.user.branchId) {
        return res.status(400).json({ error: "ইউজারের জন্য কোনো শোরুম আউটলেট অ্যাসাইন করা নেই।" });
      }
      whereClause = { branchId: req.user.branchId };
    } else {
      const branchIdQuery = req.query.branchId as string;
      if (branchIdQuery) {
        whereClause = { branchId: branchIdQuery };
      }
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        branch: true
      },
      orderBy: { date: "desc" }
    });
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load expenses: " + error.message });
  }
});

app.post("/api/expenses", authenticateToken, requireRole(["SUPER_ADMIN", "BRANCH_MANAGER"]), requireModule("showroom_expenses"), async (req: any, res: any) => {
  try {
    const { category, amount, description, date } = req.body;
    let branchId = req.body.branchId || null;

    const userRole = req.user.role === "ADMIN" ? "SUPER_ADMIN" : req.user.role;
    if (userRole === "BRANCH_MANAGER") {
      if (!req.user.branchId) {
        return res.status(400).json({ error: "ইউজারের জন্য কোনো শোরুম আউটলেট অ্যাসাইন করা নেই।" });
      }
      branchId = req.user.branchId;
    }

    if (!category || !amount || amount <= 0) {
      return res.status(400).json({ error: "Category and valid amount are required" });
    }

    const parsedDate = date ? new Date(date) : new Date();

    const expense = await prisma.expense.create({
      data: {
        category,
        amount: Number(amount),
        description: description || null,
        branchId,
        date: parsedDate
      }
    });

    logAdminActivity(req, "EXPENSE_CREATE", `Logged showroom expense: ${category} (Amount: ৳${amount})`);
    res.status(201).json(expense);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to log expense: " + error.message });
  }
});

app.delete("/api/expenses/:id", authenticateToken, requireRole(["SUPER_ADMIN", "BRANCH_MANAGER"]), requireModule("showroom_expenses"), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    const userRole = req.user.role === "ADMIN" ? "SUPER_ADMIN" : req.user.role;
    if (userRole === "BRANCH_MANAGER" && expense.branchId !== req.user.branchId) {
      return res.status(403).json({ error: "আপনার এই আউটলেটের ব্যয় বিবরণী ডিলিট করার অনুমতি নেই।" });
    }

    await prisma.expense.delete({ where: { id } });
    logAdminActivity(req, "EXPENSE_DELETE", `Deleted expense entry: ${expense.category} (Amount: ৳${expense.amount})`);

    res.json({ message: "Expense deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete expense: " + error.message });
  }
});

// 14. Staff Management API Routes (Super Admin only)
app.get("/api/staff", authenticateToken, requireRole(["SUPER_ADMIN"]), async (req: any, res: any) => {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: {
          in: ["SUPER_ADMIN", "BRANCH_MANAGER", "ADMIN"]
        }
      },
      include: {
        branch: true
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(staff);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load staff list: " + error.message });
  }
});

app.post("/api/staff", authenticateToken, requireRole(["SUPER_ADMIN"]), async (req: any, res: any) => {
  try {
    const { email, password, name, role, branchId, phone, allowedModules } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "Email, password, name, and role are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const emailClean = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: emailClean } });
    if (existing) {
      return res.status(400).json({ error: "এই ইমেইল দিয়ে অলরেডি অ্যাকাউন্ট রয়েছে।" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: emailClean,
        password: hashedPassword,
        name,
        role,
        branchId: role === "BRANCH_MANAGER" ? branchId : null,
        phone: phone || null,
        allowedModules: allowedModules || null
      },
      include: {
        branch: true
      }
    });

    logAdminActivity(req, "STAFF_CREATE", `Created new staff account: ${name} (${role})`);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create staff account: " + error.message });
  }
});

app.put("/api/staff/:id", authenticateToken, requireRole(["SUPER_ADMIN"]), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { email, password, name, role, branchId, phone, allowedModules } = req.body;

    const staffUser = await prisma.user.findUnique({ where: { id } });
    if (!staffUser) {
      return res.status(404).json({ error: "Staff user not found" });
    }

    let hashedPassword = staffUser.password;
    if (password && password.trim()) {
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long." });
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const emailClean = email ? email.toLowerCase().trim() : staffUser.email;
    if (email && emailClean !== staffUser.email) {
      const existing = await prisma.user.findUnique({ where: { email: emailClean } });
      if (existing) {
        return res.status(400).json({ error: "এই ইমেইল দিয়ে অলরেডি অন্য একটি অ্যাকাউন্ট রয়েছে।" });
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        email: emailClean,
        password: hashedPassword,
        name: name || staffUser.name,
        role: role || staffUser.role,
        branchId: role === "BRANCH_MANAGER" ? branchId : null,
        phone: phone !== undefined ? phone : staffUser.phone,
        allowedModules: allowedModules !== undefined ? allowedModules : staffUser.allowedModules
      },
      include: {
        branch: true
      }
    });

    logAdminActivity(req, "STAFF_UPDATE", `Updated staff account: ${updated.name} (${updated.role})`);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update staff account: " + error.message });
  }
});

app.delete("/api/staff/:id", authenticateToken, requireRole(["SUPER_ADMIN"]), async (req: any, res: any) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({ error: "আপনি নিজের সচল অ্যাডমিন অ্যাকাউন্ট মুছতে পারবেন না।" });
    }

    const staffUser = await prisma.user.findUnique({ where: { id } });
    if (!staffUser) {
      return res.status(404).json({ error: "Staff user not found" });
    }

    await prisma.user.delete({ where: { id } });
    logAdminActivity(req, "STAFF_DELETE", `Deleted staff account: ${staffUser.name} (${staffUser.role})`);
    res.json({ message: "Staff account deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete staff account: " + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Express Backend running on http://localhost:${PORT}`);
});
