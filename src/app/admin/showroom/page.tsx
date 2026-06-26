"use client";

import React, { useState, useEffect } from "react";
import "@/app/pos/receipt.css";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Store, Barcode, ArrowLeft, User, ShieldCheck, LogOut, Loader2, Package, LayoutDashboard, Truck, Menu, X, ShoppingBag, Wallet, Trash2, Plus, RefreshCw } from "lucide-react";

const parseSplitPayment = (methodStr: string) => {
  if (!methodStr || !methodStr.startsWith("split:")) return null;
  const parts = methodStr.substring(6).split(",");
  const result: { method: string; amount: number }[] = [];
  parts.forEach(p => {
    const match = p.trim().match(/^(\w+)\((\d+)\)$/);
    if (match) {
      const amt = Number(match[2]);
      if (amt > 0) {
        result.push({ method: match[1], amount: amt });
      }
    }
  });
  return result.length > 0 ? result : null;
};

const EXPENSE_CATEGORIES: { [key: string]: string } = {
  Rent: "দোকান ভাড়া (Rent)",
  Utilities: "ইউটিলিটি বিল (Utilities)",
  Salary: "বেতন/ভাতা (Salary)",
  Packaging: "প্যাকেজিং ও ব্যাগ (Packaging)",
  Entertainment: "আপ্যায়ন (Entertainment)",
  Other: "অন্যান্য ব্যয় (Other)"
};

// Modular Admin Components
import ShowroomStockTab from "@/components/admin/ShowroomStockTab";
import PurchasesTab from "@/components/admin/PurchasesTab";
import POSTab from "@/components/admin/POSTab";
import ToastNotification from "@/components/overlays/ToastNotification";
import { toBanglaNumber } from "@/lib/products";

const DEFAULT_CATEGORIES = [
  "সুতি থ্রি-পিস",
  "জর্জেট থ্রি-পিস",
  "লিলেন থ্রি-পিস",
  "ক্যাজুয়াল আবায়া",
  "উৎসবের বোরকা",
  "কম্বো সেট"
];

export default function ShowroomAdminPage() {
  const router = useRouter();
  // Authentication State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [authError, setAuthError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Branch Selector states
  const [branches, setBranches] = useState<any[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string>("");

  // Active Tab State: "showroom" | "pos" | "purchases" | "orders" | "expenses"
  const [activeTab, setActiveTab] = useState<"showroom" | "pos" | "purchases" | "orders" | "expenses">("showroom");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [printOrder, setPrintOrder] = useState<any | null>(null);

  // Live Data States
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Expense modal / form hooks
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState("Rent");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [expenseFilterCategory, setExpenseFilterCategory] = useState("All");

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Local pagination states for showroom dashboard (Sales Log and Expenses)
  const [currentPageOrders, setCurrentPageOrders] = useState(1);
  const itemsPerPageOrders = 10;
  
  const [currentPageExpenses, setCurrentPageExpenses] = useState(1);
  const itemsPerPageExpenses = 10;

  const showroomOrders = orders.filter(o => o.isShowroom);
  const totalPagesOrders = Math.ceil(showroomOrders.length / itemsPerPageOrders) || 1;
  const paginatedOrders = showroomOrders.slice(
    (currentPageOrders - 1) * itemsPerPageOrders,
    currentPageOrders * itemsPerPageOrders
  );

  const filteredExpenses = expenses.filter(e => expenseFilterCategory === "All" || e.category === expenseFilterCategory);
  
  // Reset page when expense category filter changes
  useEffect(() => {
    setCurrentPageExpenses(1);
  }, [expenseFilterCategory]);

  const totalPagesExpenses = Math.ceil(filteredExpenses.length / itemsPerPageExpenses) || 1;
  const paginatedExpenses = filteredExpenses.slice(
    (currentPageExpenses - 1) * itemsPerPageExpenses,
    currentPageExpenses * itemsPerPageExpenses
  );

  useEffect(() => {
    if (printOrder) {
      const timer = setTimeout(() => {
        window.print();
        setPrintOrder(null);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [printOrder]);

  // Toast Notification States
  const [toastActive, setToastActive] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastActive(true);
    setTimeout(() => setToastActive(false), 2000);
  };

  // Authenticated fetch wrapper to automatically include credentials cookies
  const authenticatedFetch = (url: string, options: any = {}) => {
    return fetch(url, {
      ...options,
      credentials: "include"
    });
  };

  // Verify active JWT session cookie on mount
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/me`, { credentials: "include" })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error("No session");
      })
      .then(data => {
        const isAllowed = data.user && (data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN" || data.user.role === "BRANCH_MANAGER");
        if (isAllowed) {
          const userRole = data.user.role === "ADMIN" ? "SUPER_ADMIN" : data.user.role;
          if (userRole === "SUPER_ADMIN") {
            setIsAuthenticated(true);
            setAdminUser(data.user);
          } else if (userRole === "BRANCH_MANAGER") {
            const hasShowroom = !data.user.allowedModules || data.user.allowedModules.split(",").some((m: string) => m.trim().startsWith("showroom_"));
            if (hasShowroom) {
              setIsAuthenticated(true);
              setAdminUser(data.user);
              
              // land on first permitted showroom tab
              const allowed = data.user.allowedModules ? data.user.allowedModules.split(",").map((m: string) => m.trim()) : [];
              const firstShowroom = ["showroom", "pos", "purchases", "orders", "expenses"].find(tabId => {
                const map: { [key: string]: string } = {
                  showroom: "showroom_stock",
                  pos: "showroom_pos",
                  purchases: "showroom_purchases",
                  orders: "showroom_orders",
                  expenses: "showroom_expenses"
                };
                const moduleKey = map[tabId];
                return !data.user.allowedModules || allowed.includes(moduleKey);
              });
              if (firstShowroom) {
                setActiveTab(firstShowroom as any);
              }
            } else {
              router.push("/admin");
            }
          }
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, [router]);

  // Fetch branches list if SUPER_ADMIN
  useEffect(() => {
    if (!isAuthenticated || !adminUser) return;
    const userRole = adminUser.role === "ADMIN" ? "SUPER_ADMIN" : adminUser.role;
    if (userRole === "SUPER_ADMIN") {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/branches`, { credentials: "include" })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("Failed to load branches");
        })
        .then(data => {
          setBranches(data);
          if (data.length > 0) {
            setActiveBranchId(data[0].id);
          }
        })
        .catch(err => console.error("Error loading branches:", err));
    } else if (adminUser.branchId) {
      setActiveBranchId(adminUser.branchId);
    }
  }, [isAuthenticated, adminUser]);

  // Fetch data once authenticated and activeBranchId is selected
  useEffect(() => {
    if (!isAuthenticated) return;
    const userRole = adminUser?.role === "ADMIN" ? "SUPER_ADMIN" : adminUser?.role;
    if (userRole === "SUPER_ADMIN" && !activeBranchId) return;

    fetchData();
  }, [isAuthenticated, activeBranchId, adminUser]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const branchQuery = activeBranchId ? `?branchId=${activeBranchId}` : "";
      const [productsRes, categoriesRes, suppliersRes, purchasesRes, ordersRes, expensesRes] = await Promise.all([
        authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/products${branchQuery}`),
        authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/categories`),
        authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/suppliers`),
        authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/purchases${branchQuery}`),
        authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/orders${branchQuery}`),
        authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/expenses${branchQuery}`)
      ]);

      if (productsRes.ok) {
        const prodData = await productsRes.json();
        const enriched = prodData.map((p: any) => {
          const englishDigits = p.id.split("").map((c: string) => {
            const idx = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"].indexOf(c);
            return idx !== -1 ? idx : c;
          }).join("");
          const parsed = parseInt(englishDigits, 10);
          return { ...p, numericId: !isNaN(parsed) ? parsed : 999 };
        });
        setProducts(enriched);
      }
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
      if (suppliersRes.ok) setSuppliers(await suppliersRes.json());
      if (purchasesRes.ok) setPurchases(await purchasesRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (expensesRes.ok) setExpenses(await expensesRes.json());
    } catch (err) {
      console.error("Error loading showroom stock data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        const isAllowed = data.user && (data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN" || data.user.role === "BRANCH_MANAGER");
        if (isAllowed) {
          const userRole = data.user.role === "ADMIN" ? "SUPER_ADMIN" : data.user.role;
          if (userRole === "SUPER_ADMIN") {
            setIsAuthenticated(true);
            setAdminUser(data.user);
            setEmail("");
            setPassword("");
          } else if (userRole === "BRANCH_MANAGER") {
            const hasShowroom = !data.user.allowedModules || data.user.allowedModules.split(",").some((m: string) => m.trim().startsWith("showroom_"));
            if (hasShowroom) {
              setIsAuthenticated(true);
              setAdminUser(data.user);
              setEmail("");
              setPassword("");
              
              // land on first permitted showroom tab
              const allowed = data.user.allowedModules ? data.user.allowedModules.split(",").map((m: string) => m.trim()) : [];
              const firstShowroom = ["showroom", "pos", "purchases", "orders", "expenses"].find(tabId => {
                const map: { [key: string]: string } = {
                  showroom: "showroom_stock",
                  pos: "showroom_pos",
                  purchases: "showroom_purchases",
                  orders: "showroom_orders",
                  expenses: "showroom_expenses"
                };
                const moduleKey = map[tabId];
                return !data.user.allowedModules || allowed.includes(moduleKey);
              });
              if (firstShowroom) {
                setActiveTab(firstShowroom as any);
              }
            } else {
              // Redirect to online admin
              setIsAuthenticated(true);
              setAdminUser(data.user);
              router.push("/admin");
            }
          }
        } else {
          setAuthError("আপনার অ্যাডমিন বা শোরুম ম্যানেজার পারমিশন নেই।");
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/logout`, { method: "POST", credentials: "include" });
        }
      } else {
        const err = await res.json();
        setAuthError(err.error || "লগইন ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      setAuthError("সার্ভারের সাথে সংযোগ স্থাপন করা যাচ্ছে না।");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (e) {
      console.error("Logout failed:", e);
    }
    setIsAuthenticated(false);
    setAdminUser(null);
  };

  const handleUpdateProductShowroomStock = async (id: string, showroomSizesJson: string) => {
    try {
      const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showroomSizesJson, branchId: activeBranchId })
      });
      if (res.ok) {
        showToast("স্টক সফলভাবে সংরক্ষণ করা হয়েছে!");
        fetchData();
      } else {
        const errData = await res.json();
        alert("স্টক সংরক্ষণ করতে ব্যর্থ হয়েছে: " + (errData.error || res.statusText));
      }
    } catch (err: any) {
      console.error("Failed to update showroom stock:", err);
      alert("সংযোগ স্থাপন করতে ব্যর্থ হয়েছে: " + err.message);
    }
  };

  const handleTransferProductStock = async (id: string, size: string, quantity: number, direction: "online_to_showroom" | "showroom_to_online") => {
    try {
      const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/products/${id}/transfer-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size, quantity, direction, branchId: activeBranchId })
      });
      if (res.ok) {
        showToast("স্টক সফলভাবে স্থানান্তর করা হয়েছে!");
        fetchData();
      } else {
        const errData = await res.json();
        alert("স্টক স্থানান্তর ব্যর্থ হয়েছে: " + (errData.error || res.statusText));
      }
    } catch (err: any) {
      console.error("Failed to transfer stock:", err);
      alert("সংযোগ স্থাপন করতে ব্যর্থ হয়েছে: " + err.message);
    }
  };

  const handleAddSupplier = async (supplierPayload: { name: string; phone?: string; company?: string }) => {
    try {
      const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplierPayload)
      });
      if (res.ok) {
        showToast("সরবরাহকারী সফলভাবে যুক্ত করা হয়েছে!");
        fetchData();
      } else {
        const err = await res.json();
        throw new Error(err.error || "সরবরাহকারী যুক্ত করতে ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message);
      throw err;
    }
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    try {
      const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/suppliers/${supplierId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showToast("সরবরাহকারী সফলভাবে মুছে ফেলা হয়েছে!");
        fetchData();
      } else {
        const err = await res.json();
        throw new Error(err.error || "সরবরাহকারী মুছতে ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message);
      throw err;
    }
  };

  const handleAddPurchase = async (purchasePayload: { supplierId?: string; productId: string; size: string; quantity: number; buyingPrice: number }) => {
    try {
      const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/purchases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...purchasePayload, target: "showroom", branchId: activeBranchId }) // Force showroom target!
      });
      if (res.ok) {
        showToast("পাইকারি ক্রয় সফলভাবে নথিভুক্ত এবং শোরুম স্টক হালনাগাদ করা হয়েছে!");
        fetchData();
      } else {
        const err = await res.json();
        throw new Error(err.error || "ক্রয় এন্ট্রি ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message);
      throw err;
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseCategory || !expenseAmount || Number(expenseAmount) <= 0) {
      alert("অনুগ্রহ করে একটি সঠিক ক্যাটাগরি এবং পজিটিভ খরচ প্রদান করুন।");
      return;
    }
    try {
      const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: expenseCategory,
          amount: Number(expenseAmount),
          description: expenseDescription,
          date: expenseDate,
          branchId: activeBranchId
        })
      });
      if (res.ok) {
        showToast("ব্যয় সফলভাবে নথিভুক্ত করা হয়েছে!");
        setIsAddExpenseModalOpen(false);
        setExpenseAmount("");
        setExpenseDescription("");
        setExpenseCategory("Rent");
        setExpenseDate(new Date().toISOString().split("T")[0]);
        fetchData();
      } else {
        const err = await res.json();
        throw new Error(err.error || "ব্যয় যুক্ত করতে ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই ব্যয়ের রেকর্ডটি মুছে ফেলতে চান?")) return;
    try {
      const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/expenses/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showToast("ব্যয় সফলভাবে মুছে ফেলা হয়েছে!");
        fetchData();
      } else {
        const err = await res.json();
        throw new Error(err.error || "ব্যয় মুছতে ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  // Showroom stats calculations
  const totalShowroomStockQty = products.reduce((acc, p) => {
    try {
      const sizes = JSON.parse(p.showroomSizesJson || "{}");
      return acc + Object.values(sizes).reduce((sum: number, val: any) => sum + Number(val || 0), 0);
    } catch (e) {
      return acc;
    }
  }, 0);

  const lowStockShowroomItemsCount = products.filter(p => {
    try {
      const sizesObj = JSON.parse(p.showroomSizesJson || "{}");
      return Object.values(sizesObj).some((qty: any) => Number(qty) < 5);
    } catch(e) {
      return false;
    }
  }).length;

  if (isCheckingAuth) {
    return (
      <div className="grain-bg min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-xs font-bold text-muted-foreground font-sans">প্রবেশাধিকার যাচাই করা হচ্ছে...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="grain-bg min-h-screen flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="max-w-md w-full bg-card border border-border/80 p-8 rounded-2xl shadow-xl text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary border border-primary/20">
            <Lock size={26} />
          </div>
          <h1 className="text-2xl font-extrabold font-display text-foreground mb-1 leading-tight">শোরুম অ্যাডমিন প্যানেল</h1>
          <p className="text-xs text-muted-foreground mb-6 font-semibold">ফিজিক্যাল শোরুম ইনভেন্টরি ও বারকোড সেন্টার পরিচালনার জন্য লগইন করুন</p>
          
          <div className="mb-4 text-left">
            <label className="text-xs font-bold text-foreground mb-1 block">ইমেইল অ্যাড্রেস</label>
            <input 
              type="email" 
              placeholder="admin@tanha.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-left text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground font-semibold"
              required
              autoFocus
            />
          </div>

          <div className="mb-6 text-left">
            <label className="text-xs font-bold text-foreground mb-1 block">পাসওয়ার্ড</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-left text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground font-semibold"
              required
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

  const renderSidebar = (onCloseMobile?: () => void) => {
    const hasModuleAccess = (moduleKey: string) => {
      if (!adminUser) return false;
      const role = adminUser.role === "ADMIN" ? "SUPER_ADMIN" : adminUser.role;
      if (role === "SUPER_ADMIN") return true;
      if (role === "BRANCH_MANAGER") {
        if (!adminUser.allowedModules) return true; // Default fallback to allow all showroom modules
        const allowed = adminUser.allowedModules.split(",").map((m: string) => m.trim());
        return allowed.includes(moduleKey);
      }
      return false;
    };

    const hasOnlineAccess = adminUser?.role === "SUPER_ADMIN" || adminUser?.role === "ADMIN" || 
      (adminUser?.allowedModules && adminUser.allowedModules.split(",").some((m: string) => m.trim().startsWith("online_")));

    const sections = [
      {
        title: "কাউন্টার অপারেশনস",
        items: [
          { id: "pos", label: "পিওএস শোরুম বিক্রয় (POS)", icon: <Store size={16} />, module: "showroom_pos" },
          { id: "orders", label: "বিক্রয় ইতিহাস (Sales Log)", icon: <ShoppingBag size={16} />, module: "showroom_orders", count: orders.filter(o => o.isShowroom).length },
        ]
      },
      {
        title: "ইনভেন্টরি ও লজিস্টিকস",
        items: [
          { id: "showroom", label: "শোরুম স্টক ও বারকোড", icon: <Barcode size={16} />, module: "showroom_stock", count: lowStockShowroomItemsCount },
          { id: "purchases", label: "পাইকারি ক্রয় (Wholesale)", icon: <Truck size={16} />, module: "showroom_purchases", count: purchases.length },
        ]
      },
      {
        title: "হিসাব ও ব্যয়",
        items: [
          { id: "expenses", label: "অন্যান্য ব্যয় (Expenses Log)", icon: <Wallet size={16} />, module: "showroom_expenses", count: expenses.length },
        ]
      }
    ];

    return (
      <div className="w-64 bg-card border-r border-border/80 flex-shrink-0 flex flex-col h-full grain-bg">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border/80 bg-white">
          <Link href="/" className="text-lg font-black text-foreground no-underline font-display flex items-center gap-1.5 hover:opacity-90">
            <span className="w-2.5 h-2.5 bg-primary rounded-full inline-block animate-pulse"></span>
            তানহা <span className="text-primary">ফ্যাশন</span>
          </Link>
          <div className="flex items-center gap-1">
            <span className="text-[9px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">শোরুম</span>
            {onCloseMobile && (
              <button onClick={onCloseMobile} className="md:hidden p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="p-5 border-b border-border/60 bg-white/50 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary font-bold shadow-xs">
            <User size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-foreground flex items-center gap-1">
              <span className="truncate">{adminUser?.name || "অ্যাডমিন"}</span>
              <ShieldCheck size={12} className="text-primary flex-shrink-0" />
            </div>
            <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">
              {adminUser?.role === "SUPER_ADMIN" || adminUser?.role === "ADMIN" ? "সুপার অ্যাডমিন" : "শোরুম ম্যানেজার"}
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-grow p-4 flex flex-col gap-3 overflow-y-auto scrollbar-none">
          {sections.map((section, secIdx) => {
            const visibleItems = section.items.filter(item => hasModuleAccess(item.module));
            if (visibleItems.length === 0) return null;

            return (
              <div key={secIdx} className="flex flex-col gap-1">
                <div className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-wider px-3 mb-1.5 mt-2">
                  {section.title}
                </div>
                {visibleItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const isLowStockWarning = item.id === "showroom" && (item.count ?? 0) > 0;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full text-left py-2.5 px-4 rounded-xl font-bold text-xs flex items-center gap-3 border transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary border-primary text-white shadow-xs hover:bg-primary/95"
                          : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/45 hover:border-border/20"
                      }`}
                    >
                      <span className={isActive ? "text-white" : "text-primary"}>{item.icon}</span>
                      <span>{item.label}</span>
                      {item.count !== undefined && item.count > 0 && (
                        <span className={`ml-auto font-sans text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : isLowStockWarning
                              ? "bg-amber-150 text-amber-800 border border-amber-250 font-bold"
                              : "bg-secondary text-foreground border border-border"
                        }`}>
                          {toBanglaNumber(item.count)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {hasOnlineAccess && (
            <>
              <div className="h-px bg-border/60 my-2"></div>
              <div className="flex flex-col gap-1">
                <Link
                  href="/admin"
                  className="w-full text-left py-3 px-4 rounded-xl font-bold text-xs flex items-center gap-3 border border-border/80 transition-all cursor-pointer bg-white text-slate-700 hover:bg-slate-50 no-underline shadow-3xs hover:shadow-2xs"
                >
                  <span><LayoutDashboard size={16} className="text-primary" /></span>
                  <span>অনলাইন অ্যাডমিন প্যানেল</span>
                </Link>
              </div>
            </>
          )}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-border/80 bg-white/60 flex flex-col gap-2">
          <button
            onClick={handleLogout}
            className="w-full bg-secondary hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-border text-foreground py-2 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={13} />
            <span>লগআউট করুন</span>
          </button>
          <div className="text-[9px] text-muted-foreground/60 font-mono text-center mt-1">
            v1.1.0 © শোরুম অ্যাডমিন
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-[#FCFAF7] text-foreground flex font-sans overflow-hidden">
      {/* 1. Sidebar - Desktop view */}
      <aside className="hidden md:block h-full">
        {renderSidebar()}
      </aside>

      {/* Mobile Drawer view */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex" onClick={() => setIsMobileSidebarOpen(false)}>
          <div className="w-64 bg-card h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            {renderSidebar(() => setIsMobileSidebarOpen(false))}
          </div>
        </div>
      )}

      {/* 2. Main Work Area Container */}
      <div className="flex-grow flex flex-col min-w-0 h-full overflow-y-scroll relative">
        {/* Floating Mobile Sidebar Toggle */}
        <button 
          onClick={() => setIsMobileSidebarOpen(true)} 
          className="md:hidden fixed bottom-6 right-6 z-40 bg-primary hover:bg-primary/95 text-white p-3.5 rounded-full shadow-lg border-none cursor-pointer flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Open showroom navigation menu"
        >
          <Menu size={20} />
        </button>

        <main className="p-6 md:p-8 flex-grow max-w-[1440px] w-full mx-auto">
          {adminUser?.role === "SUPER_ADMIN" && branches.length > 0 && (
            <div className="mb-6 bg-card border border-border/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left">
              <div>
                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider">আউটলেট ব্র্যাঞ্চ নির্বাচন</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">আপনি এখন যেকোনো আউটলেটের স্টক ও ব্যয় পরিচালনা করতে পারেন।</p>
              </div>
              <select
                value={activeBranchId}
                onChange={(e) => setActiveBranchId(e.target.value)}
                className="px-4 py-2 border border-border rounded-xl text-xs bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold min-w-[200px]"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
          
          {activeTab === "showroom" && (
            <div className="space-y-6">
              {/* Showroom mini stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">মোট শোরুম পোশাক</span>
                    <span className="text-2xl font-black font-sans leading-none">{toBanglaNumber(products.length)}</span>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Package size={20} />
                  </div>
                </div>

                <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">মোট শোরুম স্টক সংখ্যা</span>
                    <span className="text-2xl font-black font-sans leading-none">{toBanglaNumber(totalShowroomStockQty)} টি</span>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Store size={20} />
                  </div>
                </div>

                <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">সীমিত স্টক পোশাক</span>
                    <span className={`text-2xl font-black font-sans leading-none ${lowStockShowroomItemsCount > 0 ? "text-rose-600" : ""}`}>
                      {toBanglaNumber(lowStockShowroomItemsCount)}
                    </span>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${lowStockShowroomItemsCount > 0 ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-primary/10 text-primary"}`}>
                    <Barcode size={20} />
                  </div>
                </div>
              </div>

              <ShowroomStockTab 
                products={products}
                CATEGORIES={activeCategoriesList}
                onUpdateProductShowroomStock={handleUpdateProductShowroomStock}
                onTransferProductStock={handleTransferProductStock}
                onRefresh={fetchData}
                isLoading={isLoading}
              />
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display text-left">শোরুম বিক্রয় ইতিহাস (POS Sales Log)</h2>
                  <p className="text-xs text-muted-foreground mt-0.5 text-left">শোরুমের বিক্রয় রশিদ অনুসন্ধান, পর্যালোচনা ও পুনরায় প্রিন্ট করুন।</p>
                </div>
                <div className="flex items-center gap-2 self-start">
                  <div className="text-xs text-muted-foreground font-bold font-sans bg-white border border-border/80 px-3.5 py-2 rounded-xl shadow-3xs">
                    মোট বিক্রয়: <span className="text-primary font-black">{toBanglaNumber(showroomOrders.length)}</span> টি
                  </div>
                  <button
                    onClick={() => fetchData()}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 py-2 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all shadow-3xs disabled:opacity-50 self-start"
                    title="রিফ্রেশ করুন"
                  >
                    <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
                    <span>রিফ্রেশ</span>
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                  <span className="text-xs font-bold font-sans">বিক্রয় ইতিহাস লোড হচ্ছে...</span>
                </div>
              ) : (
                <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-2xs text-left">
                  <div className="p-6 border-b border-border/60 flex items-center justify-between gap-4">
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs text-slate-700">
                      <thead>
                        <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-400 font-black text-[9px] uppercase tracking-wider">
                          <th className="py-3 px-6 text-left">রশিদ নং</th>
                          <th className="py-3 px-6 text-left">তারিখ</th>
                          <th className="py-3 px-6 text-left">ক্রেতা</th>
                          <th className="py-3 px-6 text-left">পেমেন্ট</th>
                          <th className="py-3 px-6 text-right">মোট টাকা</th>
                          <th className="py-3 px-6 text-center">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                        {showroomOrders.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-slate-400 font-semibold">কোনো শোরুম বিক্রয় পাওয়া যায়নি।</td>
                          </tr>
                        ) : (
                          paginatedOrders.map((o) => (
                            <tr key={o.id} className="hover:bg-slate-50/40 transition-colors">
                              <td className="py-3 px-6 font-mono font-bold text-primary">#{o.orderNumber}</td>
                              <td className="py-3 px-6 font-mono text-slate-400 text-[10px]">
                                {new Date(o.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "numeric", day: "numeric" })}
                              </td>
                              <td className="py-3 px-6">
                                <div>{o.name}</div>
                                <div className="text-[9px] font-mono text-slate-400 mt-0.5">{o.phone}</div>
                              </td>
                              <td className="py-3 px-6">
                                <span className="text-[9.5px] uppercase font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                  {o.paymentMethod}
                                </span>
                              </td>
                              <td className="py-3 px-6 text-right font-black text-slate-900">
                                ৳ {o.grandTotal.toLocaleString("bn-BD")}
                              </td>
                              <td className="py-3 px-6 text-center">
                                <button
                                  onClick={() => setPrintOrder(o)}
                                  className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg border-none cursor-pointer flex items-center gap-1 mx-auto transition-all shadow-3xs"
                                >
                                  <span>রশিদ প্রিন্ট</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPagesOrders > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-4 mt-4">
                      <button
                        type="button"
                        onClick={() => setCurrentPageOrders(p => Math.max(p - 1, 1))}
                        disabled={currentPageOrders === 1}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-3xs"
                      >
                        পূর্ববর্তী (Prev)
                      </button>
                      <span className="text-xs font-bold text-muted-foreground">
                        পৃষ্ঠা {toBanglaNumber(currentPageOrders)} / {toBanglaNumber(totalPagesOrders)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentPageOrders(p => Math.min(p + 1, totalPagesOrders))}
                        disabled={currentPageOrders === totalPagesOrders}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-3xs"
                      >
                        পরবর্তী (Next)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "expenses" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display text-left">শোরুম ব্যয় রেজিস্ট্রি (Showroom Expenses)</h2>
                  <p className="text-xs text-muted-foreground mt-0.5 text-left">শোরুমের দৈনন্দিন আনুষঙ্গিক ও অন্যান্য খরচ নথিভুক্ত করুন।</p>
                </div>
                <div className="flex items-center gap-2 self-start">
                  <button
                    onClick={() => fetchData()}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 py-2 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all shadow-3xs disabled:opacity-50"
                    title="রিফ্রেশ করুন"
                  >
                    <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
                    <span>রিফ্রেশ</span>
                  </button>
                  <button
                    onClick={() => setIsAddExpenseModalOpen(true)}
                    className="bg-primary hover:bg-primary/95 text-white font-bold py-2.5 px-5 rounded-xl border-none cursor-pointer text-xs transition-all shadow-xs flex items-center gap-2"
                  >
                    <Plus size={14} />
                    <span>ব্যয় যোগ করুন</span>
                  </button>
                </div>
              </div>

              {/* Stats Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">মোট ব্যয় (Total Expenses)</span>
                    <span className="text-2xl font-black text-rose-600 font-sans leading-none">৳ {expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString("bn-BD")}</span>
                  </div>
                  <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-600">
                    <Wallet size={20} />
                  </div>
                </div>

                <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">চলতি মাসের মোট ব্যয়</span>
                    <span className="text-2xl font-black text-slate-800 font-sans leading-none">
                      ৳ {expenses
                        .filter(e => {
                          const date = new Date(e.date);
                          const now = new Date();
                          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                        })
                        .reduce((sum, e) => sum + e.amount, 0)
                        .toLocaleString("bn-BD")}
                    </span>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Store size={20} />
                  </div>
                </div>

                <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">মোট ব্যয় এন্ট্রি সংখ্যা</span>
                    <span className="text-2xl font-black text-slate-800 font-sans leading-none">{toBanglaNumber(expenses.length)} টি</span>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Package size={20} />
                  </div>
                </div>
              </div>

              {/* Filter and Table Grid */}
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                  <span className="text-xs font-bold font-sans">ব্যয় তালিকা লোড হচ্ছে...</span>
                </div>
              ) : (
                <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-2xs text-left">
                  {/* Category Filter Tab Bar */}
                  <div className="p-4 border-b border-border/60 bg-slate-50/50 flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => setExpenseFilterCategory("All")}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        expenseFilterCategory === "All"
                          ? "bg-slate-900 border-slate-900 text-white"
                          : "bg-white border-border text-muted-foreground hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      সকল ব্যয়
                    </button>
                    {Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setExpenseFilterCategory(key)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          expenseFilterCategory === key
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-white border-border text-muted-foreground hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        {label.split(" (")[0]}
                      </button>
                    ))}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs text-slate-700">
                      <thead>
                        <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-400 font-black text-[9px] uppercase tracking-wider">
                          <th className="py-3 px-6 text-left">খরচের খাত</th>
                          <th className="py-3 px-6 text-left">তারিখ</th>
                          <th className="py-3 px-6 text-left">বিবরণ / নোট</th>
                          <th className="py-3 px-6 text-right">পরিমাণ</th>
                          <th className="py-3 px-6 text-center">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                        {filteredExpenses.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-10 text-center text-slate-400 font-semibold">কোনো ব্যয় রেকর্ড পাওয়া যায়নি।</td>
                          </tr>
                        ) : (
                          paginatedExpenses.map((e) => (
                            <tr key={e.id} className="hover:bg-slate-50/40 transition-colors">
                              <td className="py-3 px-6">
                                <span className="text-[10px] font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                                  {EXPENSE_CATEGORIES[e.category] ? EXPENSE_CATEGORIES[e.category].split(" (")[0] : e.category}
                                </span>
                              </td>
                              <td className="py-3 px-6 font-mono text-slate-400 text-[10px]">
                                {new Date(e.date).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}
                              </td>
                              <td className="py-3 px-6 text-slate-500 font-medium max-w-xs truncate" title={e.description || ""}>
                                {e.description || "—"}
                              </td>
                              <td className="py-3 px-6 text-right font-black text-rose-600 font-sans">
                                ৳ {e.amount.toLocaleString("bn-BD")}
                              </td>
                              <td className="py-3 px-6 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExpense(e.id)}
                                  className="py-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] rounded-lg border border-rose-200 cursor-pointer transition-all inline-flex items-center gap-1"
                                >
                                  <Trash2 size={12} />
                                  <span>মুছুন</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPagesExpenses > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-4 mt-4">
                      <button
                        type="button"
                        onClick={() => setCurrentPageExpenses(p => Math.max(p - 1, 1))}
                        disabled={currentPageExpenses === 1}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-3xs"
                      >
                        পূর্ববর্তী (Prev)
                      </button>
                      <span className="text-xs font-bold text-muted-foreground">
                        পৃষ্ঠা {toBanglaNumber(currentPageExpenses)} / {toBanglaNumber(totalPagesExpenses)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentPageExpenses(p => Math.min(p + 1, totalPagesExpenses))}
                        disabled={currentPageExpenses === totalPagesExpenses}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-3xs"
                      >
                        পরবর্তী (Next)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {isClient && printOrder && createPortal(
        <div 
          id={`printable-showroom-receipt-${printOrder.id}`}
          className="bg-white p-4 text-slate-800"
        >
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', fontWeight: 'bold' }}>তানহা ফ্যাশন</h3>
            {printOrder.branch ? (
              <>
                <p style={{ margin: '0', fontSize: '9px', color: '#555', fontWeight: 'bold' }}>{printOrder.branch.name}</p>
                <p style={{ margin: '0', fontSize: '9px', color: '#555' }}>{printOrder.branch.address || printOrder.branch.city}</p>
                <p style={{ margin: '3px 0', fontSize: '9px', color: '#555' }}>হটলাইন: {printOrder.branch.phone}</p>
              </>
            ) : (
              <>
                <p style={{ margin: '0', fontSize: '9px', color: '#555' }}>বসুন্ধরা সিটি শোরুম, ঢাকা</p>
                <p style={{ margin: '3px 0', fontSize: '9px', color: '#555' }}>মোবাইল: 01700000000</p>
              </>
            )}
            <div style={{ borderBottom: '1px dashed #bbb', margin: '8px 0' }}></div>
          </div>
          <table style={{ width: '100%', fontSize: '9.5px', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '10px' }}>
            <tbody>
              <tr>
                <td style={{ color: '#555', padding: '2px 0' }}>রশিদ নং:</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', padding: '2px 0' }}>#{printOrder.orderNumber}</td>
              </tr>
              <tr>
                <td style={{ color: '#555', padding: '2px 0' }}>তারিখ:</td>
                <td style={{ textAlign: 'right', padding: '2px 0' }}>{new Date(printOrder.createdAt).toLocaleDateString("bn-BD")}</td>
              </tr>
              <tr>
                <td style={{ color: '#555', padding: '2px 0' }}>ক্রেতা:</td>
                <td style={{ textAlign: 'right', padding: '2px 0' }}>{printOrder.name} ({printOrder.phone})</td>
              </tr>
            </tbody>
          </table>
          <div style={{ borderBottom: '1px dashed #bbb', margin: '8px 0' }}></div>
          <table style={{ width: '100%', fontSize: '9.5px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ paddingBottom: '5px' }}>পোশাক</th>
                <th style={{ textAlign: 'center', paddingBottom: '5px' }}>সাইজ</th>
                <th style={{ textAlign: 'center', paddingBottom: '5px' }}>পরিমাণ</th>
                <th style={{ textAlign: 'right', paddingBottom: '5px' }}>মূল্য</th>
              </tr>
            </thead>
            <tbody>
              {printOrder.items && printOrder.items.map((item: any) => {
                // Find matching product name in cache if populated
                const prodName = products.find(p => p.id === item.productId)?.name || item.product?.name || "পোশাক";
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '6px 0', fontSize: '9px', verticalAlign: 'middle', maxWidth: '35mm', wordWrap: 'break-word' }}>
                      {prodName}
                    </td>
                    <td style={{ padding: '6px 0', textAlign: 'center', verticalAlign: 'middle' }}>{item.size}</td>
                    <td style={{ padding: '6px 0', textAlign: 'center', verticalAlign: 'middle' }}>{item.quantity}</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', verticalAlign: 'middle' }}>৳ {item.price * item.quantity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ borderBottom: '1px dashed #bbb', margin: '8px 0' }}></div>
          <table style={{ width: '150px', marginLeft: 'auto', fontSize: '9.5px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <tbody>
              <tr>
                <td style={{ color: '#555', padding: '2px 0' }}>উপ-মোট:</td>
                <td style={{ textAlign: 'right', padding: '2px 0' }}>৳ {printOrder.subtotal}</td>
              </tr>
              {printOrder.discount > 0 && (
                <tr>
                  <td style={{ color: '#555', padding: '2px 0' }}>ডিসকাউন্ট:</td>
                  <td style={{ textAlign: 'right', color: '#c2410c', padding: '2px 0' }}>- ৳ {printOrder.discount}</td>
                </tr>
              )}
              <tr style={{ borderTop: '1px solid #ddd', fontSize: '11px', fontWeight: 'bold' }}>
                <td style={{ paddingTop: '5px' }}>সর্বমোট:</td>
                <td style={{ textAlign: 'right', paddingTop: '5px' }}>৳ {printOrder.grandTotal}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ borderBottom: '1px dashed #bbb', margin: '8px 0' }}></div>
          <div style={{ fontSize: "9px", margin: "5px 0" }}>
            {printOrder.paymentMethod.startsWith("split:") ? (
              <div>
                <div>পেমেন্ট মেথড: <span style={{ fontWeight: 'bold', color: '#555' }}>(বিভক্ত পেমেন্ট)</span></div>
                <div style={{ paddingLeft: "10px", margin: "2px 0" }}>
                  {parseSplitPayment(printOrder.paymentMethod)?.map((sp, idx) => (
                    <div key={idx}>- <span style={{ textTransform: 'uppercase', fontWeight: 'semibold' }}>{sp.method === "bkash" ? "bKash" : sp.method === "nagad" ? "Nagad" : sp.method}</span>: <span style={{ fontWeight: 'bold' }}>৳ {sp.amount}</span></div>
                  ))}
                </div>
              </div>
            ) : (
              <div>পেমেন্ট মেথড: <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{printOrder.paymentMethod}</span></div>
            )}
            <div>পেমেন্ট স্ট্যাটাস: <span style={{ fontWeight: 'bold' }}>{printOrder.paymentStatus === "PAID" ? "পরিশোধিত" : "বকেয়া"}</span></div>
            <div>ডেলিভারি মোড: <span style={{ fontWeight: 'bold' }}>{printOrder.shippingCost > 0 ? "হোম ডেলিভারি" : "শোরুম ক্যাশ কাউন্টার"}</span></div>
            {printOrder.trxId && (
              <div style={{ fontSize: "8px", color: "#555", marginTop: "2px" }}>Trx ID: {printOrder.trxId}</div>
            )}
          </div>
          <div style={{ borderBottom: '1px dashed #bbb', margin: '8px 0' }}></div>
          <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '9px', color: '#555' }}>
            <p style={{ margin: '0' }}>ক্রয় করার জন্য ধন্যবাদ!</p>
            <p style={{ margin: '3px 0' }}>তানহা ফ্যাশন</p>
          </div>
        </div>,
        document.body
      )}

      {/* Add Expense Modal */}
      {isAddExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-border bg-[#FCFAF7]/40 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800 font-display flex items-center gap-2">
                <Wallet className="text-primary w-4 h-4" />
                নতুন শোরুম ব্যয় যোগ করুন
              </h3>
              <button 
                onClick={() => setIsAddExpenseModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 border-none bg-transparent cursor-pointer p-1 text-sm font-bold leading-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddExpense}>
              <div className="p-5 space-y-4 text-left">
                <div>
                  <label className="text-xs font-bold text-slate-800 mb-1 block">ব্যয়ের খাত / ক্যাটাগরি *</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-border bg-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-slate-800"
                    required
                  >
                    {Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 mb-1 block">ব্যয়ের পরিমাণ (টাকায়) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-sans">৳</span>
                    <input 
                      type="number"
                      placeholder="0"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 border border-border bg-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-black text-slate-800"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 mb-1 block">ব্যয়ের তারিখ *</label>
                  <input 
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border bg-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 mb-1 block">ব্যয়ের বিবরণ (ঐচ্ছিক)</label>
                  <textarea 
                    placeholder="খরচ সম্পর্কে বিস্তারিত লিখুন (যেমন: মে মাসের বিদ্যুৎ বিল, ব্যাগ প্রিন্টিং ইত্যাদি)..."
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-border bg-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-border bg-[#FCFAF7]/20 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseModalOpen(false)}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-bold py-2 px-4 rounded-xl border border-border cursor-pointer text-xs transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white font-bold py-2 px-5 rounded-xl border-none cursor-pointer text-xs transition-colors shadow-xs"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastNotification isActive={toastActive} message={toastMsg} />
    </div>
  );
}
