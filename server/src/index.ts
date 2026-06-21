import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import multer from "multer";
import prisma from "./db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

app.use(cors({
  origin: true, // Dynamically allow request origin in local dev
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));

// 1. Healthcheck Route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 1.5. Image Upload Endpoint
app.post("/api/upload", (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "ফাইল আপলোড করতে সমস্যা হয়েছে।" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "কোনো ফাইল সিলেক্ট করা হয়নি।" });
    }
    const filename = req.file.filename;
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
    res.json({ url: imageUrl });
  });
});


// 2. Seed Database Route
app.post("/api/seed", async (req, res) => {
  try {
    // Clear existing reviews, order items, products, categories, and coupons for a clean seed slate
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.coupon.deleteMany();

    // Seed Categories
    const categoryNames = [
      "সুতি থ্রি-পিস",
      "জর্জেট থ্রি-পিস",
      "লিলেন থ্রি-পিস",
      "ক্যাজুয়াল আবায়া",
      "উৎসবের বোরকা",
      "কম্বো সেট"
    ];
    for (const name of categoryNames) {
      await prisma.category.create({ data: { name } });
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
      orderBy: { name: "asc" }
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load categories: " + error.message });
  }
});

// B. Create Category
app.post("/api/categories", async (req, res) => {
  try {
    const { name } = req.body;
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
      data: { name: cleanName }
    });
    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create category: " + error.message });
  }
});

// C. Update Category
app.put("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "ক্যাটাগরির নাম আবশ্যক।" });
    }
    const cleanName = name.trim();
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ error: "ক্যাটাগরি পাওয়া যায়নি।" });
    }
    if (category.name === cleanName) {
      return res.json(category);
    }
    // Check duplicate for new name
    const existing = await prisma.category.findUnique({ where: { name: cleanName } });
    if (existing) {
      return res.status(400).json({ error: "এই নামের ক্যাটাগরি ইতিমধ্যে রয়েছে।" });
    }
    const oldName = category.name;
    const updated = await prisma.category.update({
      where: { id },
      data: { name: cleanName }
    });
    // Sync products matching the old category name
    await prisma.product.updateMany({
      where: { category: oldName },
      data: { category: cleanName }
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update category: " + error.message });
  }
});

// D. Delete Category
app.delete("/api/categories/:id", async (req, res) => {
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
    res.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete category: " + error.message });
  }
});

// 3. Products List Route
app.get("/api/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        reviews: true
      }
    });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load products: " + error.message });
  }
});

// 4. Create Order Route
app.post("/api/orders", async (req, res) => {
  try {
    const { name, phone, email, address, city, postcode, paymentMethod, shippingMethod, items, trxId } = req.body;

    // Validation
    if (!name || !phone || !address || !city || !postcode || !paymentMethod || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing required checkout fields or items is empty" });
    }

    // Validate stock levels before creating order
    for (const item of items) {
      const productId = item.id || "1";
      const prod = await prisma.product.findUnique({ where: { id: productId } });
      if (!prod) {
        return res.status(404).json({ error: `পোশাকটি পাওয়া যায়নি (কোড/আইডি: ${productId})` });
      }
      const size = item.size || "M";
      const sizes = JSON.parse(prod.sizesJson || "{}");
      const currentStock = Number(sizes[size] || 0);
      const qty = Number(item.quantity);
      if (currentStock < qty) {
        return res.status(400).json({ 
          error: `দুঃখিত, "${prod.name}" (সাইজ: ${size}) এর পর্যাপ্ত স্টক নেই। বর্তমান স্টক: ${currentStock} টি, অর্ডার চাওয়া হয়েছে: ${qty} টি।` 
        });
      }
    }

    let subtotal = 0;
    const orderItemsToCreate = [];

    for (const item of items) {
      const price = Number(item.price);
      const qty = Number(item.quantity);
      subtotal += price * qty;

      orderItemsToCreate.push({
        productId: item.id || "1",
        size: item.size || "M",
        quantity: qty,
        price: price
      });
    }

    const { discount } = req.body;
    const discountAmount = Number(discount || 0);
    const shippingCost = shippingMethod === "outside" ? 150 : 80;
    const grandTotal = subtotal - discountAmount + shippingCost;
    const orderNumber = "TF-" + Math.floor(100000 + Math.random() * 900000);

    const order = await prisma.order.create({
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
        trxId: trxId || null,
        items: {
          create: orderItemsToCreate
        }
      },
      include: {
        items: true
      }
    });

    console.log(`Order placed successfully: ${orderNumber}`);
    res.status(201).json(order);
  } catch (error: any) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ error: "Failed to place order: " + error.message });
  }
});

// 5. List Orders Route
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true
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
app.get("/api/analytics", async (req, res) => {
  try {
    const orders = await prisma.order.findMany();
    const totalEarnings = orders
      .filter(o => o.orderStatus !== "CANCELLED")
      .reduce((acc, o) => acc + o.grandTotal, 0);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.orderStatus === "PENDING").length;
    const activeOrders = orders.filter(o => o.orderStatus !== "DELIVERED" && o.orderStatus !== "CANCELLED").length;
    const totalProducts = await prisma.product.count();

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
      totalOrders,
      pendingOrders,
      activeOrders,
      totalProducts,
      salesChartData
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load analytics: " + error.message });
  }
});

// 9. Update Order Status & Info Route
app.put("/api/orders/:id", async (req, res) => {
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

    const targetOrderStatus = orderStatus || order.orderStatus;
    const isDeductState = ["CONFIRMED", "SHIPPED", "DELIVERED"].includes(targetOrderStatus);
    const isRestoreState = ["PENDING", "CANCELLED"].includes(targetOrderStatus);

    let nextStockAdjusted = order.stockAdjusted;

    // Deduct stock if transitioning to confirmed/shipped/delivered and not adjusted yet
    if (isDeductState && !order.stockAdjusted) {
      // First phase: validate all stocks
      for (const item of order.items) {
        const prod = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!prod) {
          return res.status(400).json({ error: `পোশাকটি পাওয়া যায়নি (কোড/আইডি: ${item.productId})` });
        }
        const sizes = JSON.parse(prod.sizesJson || "{}");
        const currentStock = Number(sizes[item.size] || 0);
        if (currentStock < item.quantity) {
          return res.status(400).json({ 
            error: `দুঃখিত, "${prod.name}" (সাইজ: ${item.size}) এর পর্যাপ্ত স্টক নেই। বর্তমান স্টক: ${currentStock} টি, অর্ডার চাওয়া হয়েছে: ${item.quantity} টি।` 
          });
        }
      }

      // Second phase: update stocks atomically
      for (const item of order.items) {
        const prod = await prisma.product.findUnique({ where: { id: item.productId } });
        if (prod) {
          const sizes = JSON.parse(prod.sizesJson || "{}");
          sizes[item.size] = Math.max(0, Number(sizes[item.size] || 0) - item.quantity);
          await prisma.product.update({
            where: { id: item.productId },
            data: { sizesJson: JSON.stringify(sizes) }
          });
        }
      }
      nextStockAdjusted = true;
    }
    // Restore stock if transitioning back to pending/cancelled and was adjusted
    else if (isRestoreState && order.stockAdjusted) {
      for (const item of order.items) {
        const prod = await prisma.product.findUnique({ where: { id: item.productId } });
        if (prod) {
          const sizes = JSON.parse(prod.sizesJson || "{}");
          sizes[item.size] = Number(sizes[item.size] || 0) + item.quantity;
          await prisma.product.update({
            where: { id: item.productId },
            data: { sizesJson: JSON.stringify(sizes) }
          });
        }
      }
      nextStockAdjusted = false;
    }

    const updatedOrder = await prisma.order.update({
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
        ...(trxId !== undefined && { trxId }),
        stockAdjusted: nextStockAdjusted
      },
      include: {
        items: true
      }
    });

    res.json(updatedOrder);
  } catch (error: any) {
    console.error("Order update error:", error);
    res.status(500).json({ error: "Failed to update order: " + error.message });
  }
});

// 10. Create Product Route
app.post("/api/products", async (req, res) => {
  try {
    const { sku, name, price, category, imgUrl, sizesJson } = req.body;

    if (!sku || !name || !price || !category || !imgUrl) {
      return res.status(400).json({ error: "Missing required product fields" });
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        price: Number(price),
        category,
        imgUrl,
        sizesJson: sizesJson || '{"S":10,"M":15,"L":15,"XL":5}'
      }
    });

    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create product: " + error.message });
  }
});

// 11. Update Product Route
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, imgUrl, sizesJson } = req.body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price && { price: Number(price) }),
        ...(category && { category }),
        ...(imgUrl && { imgUrl }),
        ...(sizesJson && { sizesJson })
      }
    });

    res.json(updatedProduct);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update product: " + error.message });
  }
});

// 12. Delete Product Route
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, delete dependent OrderItems and Reviews or let Prisma handle cascade
    // In our schema, we cascade delete reviews, but OrderItems are standard relations,
    // so we can delete reviews and product cleanly. Let's make sure.
    await prisma.review.deleteMany({ where: { productId: id } });
    await prisma.orderItem.deleteMany({ where: { productId: id } });
    
    await prisma.product.delete({
      where: { id }
    });
    
    res.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete product: " + error.message });
  }
});

// 13. Delete Review Route
app.delete("/api/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.review.delete({
      where: { id }
    });
    res.json({ message: "Review deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete review: " + error.message });
  }
});

// 14. Delete Order Route
app.delete("/api/orders/:id", async (req, res) => {
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
    
    // If stock was adjusted and order is being deleted, restore stock
    if (order.stockAdjusted) {
      for (const item of order.items) {
        const prod = await prisma.product.findUnique({ where: { id: item.productId } });
        if (prod) {
          const sizes = JSON.parse(prod.sizesJson || "{}");
          sizes[item.size] = Number(sizes[item.size] || 0) + item.quantity;
          await prisma.product.update({
            where: { id: item.productId },
            data: { sizesJson: JSON.stringify(sizes) }
          });
        }
      }
    }
    
    // Delete order (OrderItems will be cascade deleted)
    await prisma.order.delete({
      where: { id }
    });
    
    res.json({ message: "Order deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete order: " + error.message });
  }
});

// 15. Coupon API Routes
// A. List all coupons
app.get("/api/coupons", async (req, res) => {
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
app.post("/api/coupons", async (req, res) => {
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

    res.status(201).json(coupon);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create coupon: " + error.message });
  }
});

// C. Update coupon active status / values
app.put("/api/coupons/:id", async (req, res) => {
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

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update coupon: " + error.message });
  }
});

// D. Delete a coupon
app.delete("/api/coupons/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });
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

app.listen(PORT, () => {
  console.log(`Express Backend running on http://localhost:${PORT}`);
});
