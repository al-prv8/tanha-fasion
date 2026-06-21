"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

// Modular Admin Components
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import DashboardTab from "@/components/admin/DashboardTab";
import OrdersTab from "@/components/admin/OrdersTab";
import ProductsTab from "@/components/admin/ProductsTab";
import CategoriesTab from "@/components/admin/CategoriesTab";
import CouponsTab from "@/components/admin/CouponsTab";
import ReviewsTab from "@/components/admin/ReviewsTab";

const DEFAULT_CATEGORIES = [
  "সুতি থ্রি-পিস",
  "জর্জেট থ্রি-পিস",
  "লিলেন থ্রি-পিস",
  "ক্যাজুয়াল আবায়া",
  "উৎসবের বোরকা",
  "কম্বো সেট"
];

export default function AdminPage() {
  // Authentication State
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  // Navigation State
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "products" | "reviews" | "categories" | "coupons">("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Live Data States
  const [analytics, setAnalytics] = useState<any>({
    totalEarnings: 0,
    totalOrders: 0,
    pendingOrders: 0,
    activeOrders: 0,
    totalProducts: 0,
    salesChartData: []
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search States
  const [orderSearch, setOrderSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  // Product Create/Edit Form State
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    sku: "",
    name: "",
    price: "",
    category: "",
    imgUrl: "/assets/cotton_1.png",
    sizesJson: '{"S":10,"M":15,"L":15,"XL":5}'
  });

  const [coupons, setCoupons] = useState<any[]>([]);

  // Verify sessionStorage on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem("admin_auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch all backend data once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
  }, [isAuthenticated]);

  // Sync default category in form when categories list changes
  useEffect(() => {
    const activeCategoriesList = categories.length > 0 
      ? categories.map(c => c.name) 
      : DEFAULT_CATEGORIES;
    
    if (activeCategoriesList.length > 0 && (!productForm.category || !activeCategoriesList.includes(productForm.category))) {
      setProductForm(prev => ({ ...prev, category: activeCategoriesList[0] }));
    }
  }, [categories, productForm.category]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, ordersRes, productsRes, categoriesRes, couponsRes] = await Promise.all([
        fetch("http://localhost:5000/api/analytics"),
        fetch("http://localhost:5000/api/orders"),
        fetch("http://localhost:5000/api/products"),
        fetch("http://localhost:5000/api/categories"),
        fetch("http://localhost:5000/api/coupons")
      ]);

      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
      if (couponsRes.ok) setCoupons(await couponsRes.json());
      
      if (productsRes.ok) {
        const prodData = await productsRes.json();
        setProducts(prodData);
        
        // Collate product reviews to display under reviews moderation
        const collatedReviews: any[] = [];
        prodData.forEach((p: any) => {
          if (p.reviews && Array.isArray(p.reviews)) {
            p.reviews.forEach((r: any) => {
              collatedReviews.push({ ...r, productName: p.name });
            });
          }
        });
        setReviews(collatedReviews);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "123456") {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      setAuthError("");
    } else {
      setAuthError("ভুল পাসকোড! দয়া করে সঠিক পাসকোড দিন।");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_auth");
    setPasscode("");
  };

  // Order status transitions
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: status })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: status, stockAdjusted: updated.stockAdjusted } : o));
        fetchData();
      } else {
        const errData = await res.json();
        alert("স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে: " + (errData.error || res.statusText));
        fetchData(); 
      }
    } catch (err: any) {
      console.error("Failed to update status:", err);
      alert("সংযোগ স্থাপন করতে ব্যর্থ হয়েছে: " + err.message);
      fetchData();
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: status })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: status } : o));
        fetchData();
      } else {
        const errData = await res.json();
        alert("পেমেন্ট স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে: " + (errData.error || res.statusText));
        fetchData();
      }
    } catch (err: any) {
      console.error("Failed to update payment status:", err);
      alert("সংযোগ স্থাপন করতে ব্যর্থ হয়েছে: " + err.message);
      fetchData();
    }
  };

  // Detailed Order Contact Editing
  const handleUpdateOrderInfo = async (orderId: string, infoPayload: any) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(infoPayload)
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
        alert("অর্ডারের তথ্য সফলভাবে হালনাগাদ করা হয়েছে!");
        fetchData();
      } else {
        const errData = await res.json();
        alert("অর্ডারের তথ্য হালনাাদ করতে ব্যর্থ হয়েছে: " + (errData.error || res.statusText));
      }
    } catch (err: any) {
      console.error("Failed to edit order info details:", err);
      alert("সংযোগ স্থাপন করতে ব্যর্থ হয়েছে: " + err.message);
    }
  };

  // Order Deletion
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই অর্ডারটি মুছে ফেলতে চান? এটি মুছে ফেললে ডাটাবেজ থেকে অর্ডারটি সম্পূর্ণরূপে হারিয়ে যাবে এবং সমন্বয়কৃত স্টক থাকলে তা স্বয়ংক্রিয়ভাবে ফেরত যাবে।")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("অর্ডারটি সফলভাবে মুছে ফেলা হয়েছে!");
        fetchData();
      } else {
        const errData = await res.json();
        alert("অর্ডারটি মুছতে ব্যর্থ হয়েছে: " + (errData.error || res.statusText));
      }
    } catch (err: any) {
      console.error("Failed to delete order:", err);
      alert("সংযোগ স্থাপন করতে ব্যর্থ হয়েছে: " + err.message);
    }
  };

  // Product CRUD Handlers
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProduct 
      ? `http://localhost:5000/api/products/${editingProduct.id}` 
      : "http://localhost:5000/api/products";
    const method = editingProduct ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm)
      });
      
      if (res.ok) {
        alert(editingProduct ? "পণ্যটি সফলভাবে হালনাগাদ করা হয়েছে!" : "পণ্যটি সফলভাবে যোগ করা হয়েছে!");
        const activeCategoriesList = categories.length > 0 
          ? categories.map(c => c.name) 
          : DEFAULT_CATEGORIES;
          
        setProductForm({
          sku: "",
          name: "",
          price: "",
          category: activeCategoriesList[0] || "",
          imgUrl: "/assets/cotton_1.png",
          sizesJson: '{"S":10,"M":15,"L":15,"XL":5}'
        });
        setEditingProduct(null);
        fetchData();
      } else {
        const errData = await res.json();
        alert("পণ্যটি সংরক্ষণ করতে ব্যর্থ হয়েছে: " + (errData.error || res.statusText));
      }
    } catch (err: any) {
      console.error("Failed to save product:", err);
      alert("সংযোগ স্থাপন করতে ব্যর্থ হয়েছে: " + err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("পণ্যটি সফলভাবে মুছে ফেলা হয়েছে!");
        fetchData();
      } else {
        const errData = await res.json();
        alert("পণ্যটি মুছতে ব্যর্থ হয়েছে: " + (errData.error || res.statusText));
      }
    } catch (err: any) {
      console.error("Failed to delete product:", err);
      alert("সংযোগ স্থাপন করতে ব্যর্থ হয়েছে: " + err.message);
    }
  };

  const handleStartEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setProductForm({
      sku: prod.sku,
      name: prod.name,
      price: prod.price.toString(),
      category: prod.category,
      imgUrl: prod.imgUrl,
      sizesJson: prod.sizesJson || '{"S":10,"M":15,"L":15,"XL":5}'
    });
  };

  // Category CRUD Handlers
  const handleCreateCategory = async (name: string) => {
    try {
      const res = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        alert("ক্যাটাগরি সফলভাবে যুক্ত করা হয়েছে!");
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "ক্যাটাগরি যুক্ত করা যায়নি।");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      alert("সংযোগ স্থাপন করা যাচ্ছে না।");
    }
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        alert("ক্যাটাগরি সফলভাবে হালনাগাদ করা হয়েছে!");
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "ক্যাটাগরি হালনাগাদ করা যায়নি।");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      alert("সংযোগ স্থাপন করা যাচ্ছে না।");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে!");
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "ক্যাটাগরি মুছতে ব্যর্থ হয়েছে।");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("সংযোগ স্থাপন করা যাচ্ছে না।");
    }
  };

  // Coupon CRUD Handlers
  const handleCreateCoupon = async (code: string, type: string, value: number, minSubtotal: number) => {
    try {
      const res = await fetch("http://localhost:5000/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, type, value, minSubtotal })
      });
      if (res.ok) {
        alert("কুপন সফলভাবে যুক্ত করা হয়েছে!");
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "কুপন যুক্ত করা যায়নি।");
      }
    } catch (error) {
      console.error("Error creating coupon:", error);
      alert("সংযোগ স্থাপন করা যাচ্ছে না।");
    }
  };

  const handleToggleCouponActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`http://localhost:5000/api/coupons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive })
      });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "কুপন স্ট্যাটাস পরিবর্তন করা যায়নি।");
      }
    } catch (error) {
      console.error("Error updating coupon status:", error);
      alert("সংযোগ স্থাপন করা যাচ্ছে না।");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই কুপনটি ডিলিট করতে চান?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/coupons/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("কুপন সফলভাবে মুছে ফেলা হয়েছে!");
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "কুপন মুছে ফেলা যায়নি।");
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      alert("সংযোগ স্থাপন করা যাচ্ছে না।");
    }
  };

  // Review Deletion Handler
  const handleDeleteReview = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই রিভিউটি মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("রিভিউটি সফলভাবে মুছে ফেলা হয়েছে!");
        setReviews(prev => prev.filter(r => r.id !== id));
        fetchData();
      } else {
        const errData = await res.json();
        alert("রিভিউটি মুছতে ব্যর্থ হয়েছে: " + (errData.error || res.statusText));
      }
    } catch (err: any) {
      console.error("Failed to delete review:", err);
      alert("সংযোগ স্থাপন করতে ব্যর্থ হয়েছে: " + err.message);
    }
  };

  // --- RENDER LOGIN GATE ---
  if (!isAuthenticated) {
    return (
      <div className="grain-bg min-h-screen flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="max-w-md w-full bg-card border border-border/80 p-8 rounded-2xl shadow-xl text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary border border-primary/20">
            <Lock size={26} />
          </div>
          <h1 className="text-2xl font-extrabold font-display text-foreground mb-1 leading-tight">অ্যাডমিন প্যানেল প্রবেশ</h1>
          <p className="text-xs text-muted-foreground mb-6 font-semibold">তানহা ফ্যাশন স্টোর পরিচালনার জন্য পাসকোড লিখুন</p>
          
          <div className="mb-4">
            <input 
              type="password" 
              placeholder="পাসকোড লিখুন (১২৩৪৫৬)" 
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-4 py-3 border border-border bg-secondary/30 rounded-xl text-center text-lg font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:bg-white transition-all text-foreground font-black"
              autoFocus
            />
          </div>
          {authError && <div className="text-xs text-primary font-bold mb-4 font-sans">{authError}</div>}
          
          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 px-6 rounded-xl border-none cursor-pointer transition-colors shadow-xs"
          >
            লগইন করুন
          </button>
        </form>
      </div>
    );
  }

  const activeCategoriesList = categories.length > 0 
    ? categories.map(c => c.name) 
    : DEFAULT_CATEGORIES;

  // --- RENDER MAIN ADMIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#FCFAF7] text-foreground flex font-sans">
      
      {/* 1. Sidebar - Desktop view */}
      <aside className="hidden md:block">
        <AdminSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          ordersCount={orders.length}
          productsCount={products.length}
          reviewsCount={reviews.length}
          categoriesCount={categories.length}
          couponsCount={coupons.length}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile Drawer view */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex" onClick={() => setIsMobileSidebarOpen(false)}>
          <div className="w-64 bg-card h-full" onClick={(e) => e.stopPropagation()}>
            <AdminSidebar 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              ordersCount={orders.length}
              productsCount={products.length}
              reviewsCount={reviews.length}
              categoriesCount={categories.length}
              couponsCount={coupons.length}
              onLogout={handleLogout}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 2. Main Work Area Container */}
      <div className="flex-grow flex flex-col min-w-0">
        <AdminHeader 
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onRefresh={fetchData}
          isLoading={isLoading}
          onLogout={handleLogout}
        />

        {/* Content Body */}
        <main className="p-6 md:p-8 flex-grow overflow-y-auto max-w-[1440px] w-full mx-auto">
          {activeTab === "dashboard" && (
            <DashboardTab 
              analytics={analytics}
              products={products}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "orders" && (
            <OrdersTab 
              orders={orders}
              orderSearch={orderSearch}
              setOrderSearch={setOrderSearch}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
              onUpdateOrderInfo={handleUpdateOrderInfo}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {activeTab === "products" && (
            <ProductsTab 
              products={products}
              productSearch={productSearch}
              setProductSearch={setProductSearch}
              editingProduct={editingProduct}
              setEditingProduct={setEditingProduct}
              productForm={productForm}
              setProductForm={setProductForm}
              onProductSubmit={handleProductSubmit}
              onDeleteProduct={handleDeleteProduct}
              onStartEditProduct={handleStartEditProduct}
              CATEGORIES={activeCategoriesList}
            />
          )}

          {activeTab === "categories" && (
            <CategoriesTab 
              categories={categories}
              products={products}
              onCreateCategory={handleCreateCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeTab === "coupons" && (
            <CouponsTab 
              coupons={coupons}
              onCreateCoupon={handleCreateCoupon}
              onToggleCouponActive={handleToggleCouponActive}
              onDeleteCoupon={handleDeleteCoupon}
            />
          )}

          {activeTab === "reviews" && (
            <ReviewsTab 
              reviews={reviews}
              onDeleteReview={handleDeleteReview}
            />
          )}
        </main>
      </div>
    </div>
  );
}
