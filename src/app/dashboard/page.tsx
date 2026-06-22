"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Key, 
  LogOut, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Clock, 
  Truck, 
  XCircle, 
  ShieldCheck,
  CreditCard,
  MessageCircle,
  Wallet,
  Activity,
  ChevronRight,
  UserCheck,
  PhoneCall
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import MobileMenuDrawer from "@/components/layout/MobileMenuDrawer";
import CartDrawer from "@/components/layout/CartDrawer";
import { useCart } from "@/lib/cart-context";
import { toBanglaNumber, formatBanglaPriceWithCommas } from "@/lib/products";
import ToastNotification from "@/components/overlays/ToastNotification";

type DashboardTabType = "overview" | "orders" | "profile" | "password";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user, loading, logout, updateProfile } = useAuth();
  const { cartCount, cartDrawerOpen, setCartDrawerOpen } = useCart();

  // Navigation states
  const [activeTab, setActiveTab] = useState<DashboardTabType>("overview");
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Data states
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Profile Form States
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileCity, setProfileCity] = useState("Dhaka");
  const [profilePostcode, setProfilePostcode] = useState("");

  // Password Change Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI notifications
  const [toastActive, setToastActive] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastActive(true);
    setTimeout(() => setToastActive(false), 2000);
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Sync profile details when user is loaded
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfilePhone(user.phone || "");
      setProfileAddress(user.address || "");
      setProfileCity(user.city || "Dhaka");
      setProfilePostcode(user.postcode || "");
    }
  }, [user]);

  // Fetch orders
  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  const fetchMyOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/orders/my-orders`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error("Failed to fetch customer orders", e);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleCancelOrderClick = async (orderId: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই অর্ডারটি বাতিল করতে চান? এটি করার পর প্রক্রিয়াটি রিভার্স করা যাবে না।")) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok) {
        showToast("অর্ডারটি সফলভাবে বাতিল করা হয়েছে।");
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: "CANCELLED", stockAdjusted: false } : o));
        fetchMyOrders();
      } else {
        alert(data.error || "অর্ডার বাতিল করা সম্ভব হয়নি।");
      }
    } catch (e) {
      console.error("Order cancellation failed", e);
      setIsSubmitting(false);
      alert("সার্ভারে সংযোগ স্থাপন করা যাচ্ছে না।");
    }
  };

  const handleProfileUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    const result = await updateProfile({
      name: profileName,
      phone: profilePhone,
      address: profileAddress,
      city: profileCity,
      postcode: profilePostcode
    });

    setIsSubmitting(false);
    if (result.success) {
      setSuccessMsg("আপনার প্রোফাইলের তথ্য সফলভাবে হালনাগাদ করা হয়েছে!");
      showToast("তথ্য সফলভাবে সেভ করা হয়েছে!");
    } else {
      setErrorMsg(result.message || "প্রোফাইল আপডেট করা যায়নি।");
    }
  };

  const handlePasswordUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!currentPassword || !newPassword) {
      setErrorMsg("সব পাসওয়ার্ড ফিল্ড পূরণ করা আবশ্যক।");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("নতুন পাসওয়ার্ডটি কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।");
      return;
    }

    setIsSubmitting(true);
    const result = await updateProfile({
      currentPassword,
      newPassword
    });
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg("আপনার পাসওয়ার্ডটি সফলভাবে পরিবর্তন করা হয়েছে!");
      showToast("পাসওয়ার্ড পরিবর্তন সফল!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setErrorMsg(result.message || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।");
    }
  };

  const handleLogoutClick = async () => {
    if (confirm("আপনি কি নিশ্চিতভাবে লগআউট করতে চান?")) {
      await logout();
      router.push("/");
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const baseClass = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border";
    switch (status) {
      case "PENDING":
        return <span className={`${baseClass} bg-amber-500/5 text-amber-600 border-amber-500/10`}><Clock size={13} />অপেক্ষমান</span>;
      case "CONFIRMED":
        return <span className={`${baseClass} bg-indigo-500/5 text-indigo-600 border-indigo-500/10`}><ShieldCheck size={13} />নিশ্চিতকৃত</span>;
      case "SHIPPED":
        return <span className={`${baseClass} bg-blue-500/5 text-blue-600 border-blue-500/10`}><Truck size={13} />শিপড</span>;
      case "DELIVERED":
        return <span className={`${baseClass} bg-emerald-500/5 text-emerald-600 border-emerald-500/10`}><CheckCircle size={13} />ডেলিভারি সম্পন্ন</span>;
      case "CANCELLED":
        return <span className={`${baseClass} bg-primary/5 text-primary border-primary/10`}><XCircle size={13} />বাতিলকৃত</span>;
      default:
        return <span className={`${baseClass} bg-slate-100 text-slate-700 border-slate-200`}>{status}</span>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const baseClass = "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border";
    if (status === "PAID") {
      return <span className={`${baseClass} bg-emerald-500/10 text-emerald-700 border-emerald-500/20`}>পরিশোধিত</span>;
    }
    return <span className={`${baseClass} bg-amber-500/10 text-amber-700 border-amber-500/20`}>অপরিশোধিত</span>;
  };

  const mapPaymentMethod = (method: string) => {
    switch (method) {
      case "bkash": return "বিকাশ (bKash)";
      case "nagad": return "নগদ (Nagad)";
      case "cod": return "ক্যাশ অন ডেলিভারি (Cash on Delivery)";
      case "card": return "কার্ড পেমেন্ট (Card)";
      default: return method;
    }
  };

  const renderDashboardOrderTimeline = (status: string, createdAt: string) => {
    const steps = [
      { key: "PENDING", label: "অর্ডার গ্রহণ", icon: Clock },
      { key: "CONFIRMED", label: "নিশ্চিতকৃত", icon: ShieldCheck },
      { key: "SHIPPED", label: "শিপড", icon: Truck },
      { key: "DELIVERED", label: "ডেলিভারড", icon: CheckCircle },
    ];

    if (status === "CANCELLED") {
      return (
        <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl flex items-start gap-4 mb-6 text-left w-full">
          <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <XCircle size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">অর্ডারটি বাতিল করা হয়েছে</h4>
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
              যদি পেমেন্ট পরিশোধ করা হয়ে থাকে তবে অনুগ্রহ করে রিফান্ডের জন্য কাস্টমার সাপোর্টে যোগাযোগ করুন।
            </p>
          </div>
        </div>
      );
    }

    let activeIndex = 0;
    if (status === "CONFIRMED") activeIndex = 1;
    if (status === "SHIPPED") activeIndex = 2;
    if (status === "DELIVERED") activeIndex = 3;

    return (
      <div className="bg-zinc-50 border border-border/60 rounded-2xl p-5 md:p-6 mb-6 w-full shadow-xs">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-5 md:mb-6 text-left">অর্ডার প্রসেসিং ট্র্যাকার</h4>
        
        {/* Desktop Horizontal Stepper (md:flex) */}
        <div className="hidden md:flex items-center justify-between gap-2 max-w-lg mx-auto relative before:absolute before:left-6 before:right-6 before:top-4 before:h-[2px] before:bg-border/60 before:z-0">
          {steps.map((step, idx) => {
            const isDone = idx <= activeIndex;
            const isCurrent = idx === activeIndex;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center relative z-10 flex-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                  isDone 
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-xs" 
                    : "bg-background text-muted-foreground border-border/80"
                } ${isCurrent ? "ring-4 ring-emerald-500/15 scale-105" : ""}`}>
                  <StepIcon size={14} />
                </div>
                <span className={`text-[9px] font-bold mt-2.5 text-center ${isDone ? "text-foreground" : "text-muted-foreground/60"}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile Vertical Stepper (md:hidden) */}
        <div className="md:hidden space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60 text-left">
          {steps.map((step, idx) => {
            const isDone = idx <= activeIndex;
            const isCurrent = idx === activeIndex;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex gap-4 relative items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border z-10 transition-all ${
                  isDone 
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-xs" 
                    : "bg-background text-muted-foreground border-border/80"
                } ${isCurrent ? "ring-4 ring-emerald-500/15" : ""}`}>
                  <StepIcon size={12} />
                </div>
                <div className="pt-0.5">
                  <span className={`text-xs font-bold block ${isDone ? "text-foreground" : "text-muted-foreground/60"}`}>
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading || !user) {
    return (
      <div className="grain-bg min-h-screen flex items-center justify-center text-foreground font-semibold">
        লোড হচ্ছে...
      </div>
    );
  }

  // Dashboard Stats Calculations
  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter(o => o.orderStatus !== "CANCELLED" && o.orderStatus !== "DELIVERED").length;
  const totalSpentAmt = orders
    .filter(o => o.orderStatus !== "CANCELLED")
    .reduce((sum, o) => sum + o.grandTotal, 0);

  return (
    <div className="grain-bg min-h-screen pb-20">
      <Navbar 
        cartCount={cartCount} 
        onOpenMenu={() => setMenuDrawerOpen(true)}
        onOpenCart={() => setCartDrawerOpen(true)}
        scrollToSection={() => router.push("/")}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <MobileMenuDrawer 
        isOpen={menuDrawerOpen} 
        onClose={() => setMenuDrawerOpen(false)} 
        activeSection={0} 
        scrollToSection={() => {}} 
      />

      <CartDrawer showToast={showToast} />

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto px-4 mt-8 space-y-8">
        
        {/* Industry Level Hero Banner with Gradient background */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary to-[#5c3c1b] p-8 md:p-12 text-white shadow-lg border border-primary/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3 text-left">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="bg-white/15 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                  <UserCheck size={12} />
                  <span>তানহা প্রিমিয়াম মেম্বার</span>
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-display leading-tight tracking-tight">
                আসসালামু আলাইকুম, {user.name}!
              </h1>
              <p className="text-xs text-white/80 max-w-md leading-relaxed">
                আপনার অ্যাকাউন্ট ড্যাশবোর্ডে স্বাগতম। এখান থেকে আপনি খুব সহজেই আপনার সাম্প্রতিক অর্ডারের শিপিং ট্র্যাক করতে পারেন এবং বিবরণ পরিবর্তন করতে পারেন।
              </p>
            </div>
            
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/5 text-[11px] font-bold">
              <Calendar size={14} className="text-white/80" />
              <span>মেম্বারশিপ শুরু: {new Date(user.createdAt || "").toLocaleDateString("bn-BD", { year: "numeric", month: "long" })}</span>
            </div>
          </div>
        </div>

        {/* Two Column Workspace */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Redesigned Sidebar Navigation Panel */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-6">
              
              {/* Short profile header */}
              <div className="flex items-center gap-4 pb-5 border-b border-border/60">
                <div className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center font-display font-extrabold text-xl flex-shrink-0">
                  {user.name ? user.name.slice(0, 1) : "T"}
                </div>
                <div className="text-left truncate min-w-0">
                  <h3 className="text-sm font-bold text-foreground truncate">{user.name}</h3>
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>

              {/* Sidebar Menu options */}
              <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 list-none m-0 p-0 select-none scrollbar-none -mx-6 px-6 lg:mx-0 lg:px-0">
                <button
                  onClick={() => {
                    setActiveTab("overview");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl border-none cursor-pointer transition-all w-max lg:w-full text-left whitespace-nowrap ${
                    activeTab === "overview"
                      ? "bg-primary text-white shadow-xs"
                      : "bg-transparent text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <User size={15} />
                  <span>অ্যাকাউন্ট ওভারভিউ</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("orders");
                    setErrorMsg("");
                    setSuccessMsg("");
                    fetchMyOrders();
                  }}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl border-none cursor-pointer transition-all w-max lg:w-full text-left whitespace-nowrap ${
                    activeTab === "orders"
                      ? "bg-primary text-white shadow-xs"
                      : "bg-transparent text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <ShoppingBag size={15} />
                  <span>অর্ডার ইতিহাস ({toBanglaNumber(totalOrdersCount)})</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("profile");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl border-none cursor-pointer transition-all w-max lg:w-full text-left whitespace-nowrap ${
                    activeTab === "profile"
                      ? "bg-primary text-white shadow-xs"
                      : "bg-transparent text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <MapPin size={15} />
                  <span>ঠিকানা ও প্রোফাইল</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("password");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl border-none cursor-pointer transition-all w-max lg:w-full text-left whitespace-nowrap ${
                    activeTab === "password"
                      ? "bg-primary text-white shadow-xs"
                      : "bg-transparent text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <Key size={15} />
                  <span>পাসওয়ার্ড পরিবর্তন</span>
                </button>

                <button
                  onClick={handleLogoutClick}
                  className="flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl border-none cursor-pointer transition-all w-max lg:w-full text-left text-primary hover:bg-primary/5 bg-transparent whitespace-nowrap lg:mt-6"
                >
                  <LogOut size={15} />
                  <span>লগআউট করুন</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content Pane */}
          <main className="flex-grow">
            <div className="bg-card border border-border/80 rounded-3xl p-6 md:p-8 shadow-xs min-h-[500px]">
              
              {errorMsg && (
                <div className="bg-primary/5 text-primary text-xs font-bold p-4 rounded-2xl mb-6 border border-primary/10">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-500/5 text-emerald-600 text-xs font-bold p-4 rounded-2xl mb-6 border border-emerald-500/10 flex items-center gap-2">
                  <CheckCircle size={15} />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* TAB CONTENT: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  <div className="text-left">
                    <h2 className="text-xl font-extrabold font-display text-foreground leading-tight">ড্যাশবোর্ড ওভারভিউ</h2>
                    <p className="text-xs text-muted-foreground mt-1">আপনার সাম্প্রতিক ক্রয়ের গতিবিধি ও পরিসংখ্যান এক নজরে দেখুন।</p>
                  </div>

                  {/* Redesigned stat cards with hover lifts */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-zinc-50/50 border border-border/80 p-6 rounded-2xl hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-center gap-4 text-left">
                      <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Wallet size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">মোট খরচ</p>
                        <p className="text-lg font-extrabold text-foreground font-mono mt-0.5">
                          {formatBanglaPriceWithCommas(totalSpentAmt)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-zinc-50/50 border border-border/80 p-6 rounded-2xl hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-center gap-4 text-left">
                      <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <ShoppingBag size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">অর্ডার সংখ্যা</p>
                        <p className="text-lg font-extrabold text-foreground font-mono mt-0.5">
                          {toBanglaNumber(totalOrdersCount)} টি
                        </p>
                      </div>
                    </div>

                    <div className="bg-zinc-50/50 border border-border/80 p-6 rounded-2xl hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-center gap-4 text-left">
                      <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Activity size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">সক্রিয় শিপমেন্ট</p>
                        <p className="text-lg font-extrabold text-foreground font-mono mt-0.5">
                          {toBanglaNumber(activeOrdersCount)} টি
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Saved shipping address visual card */}
                  <div className="border border-border/60 rounded-2xl overflow-hidden shadow-xs">
                    <div className="bg-secondary/20 p-4 border-b border-border/60 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                        <MapPin size={15} className="text-primary" />
                        <span>ডিফল্ট শিপিং ডিটেইলস</span>
                      </h3>
                      <button
                        onClick={() => setActiveTab("profile")}
                        className="text-xs text-primary font-bold hover:underline bg-transparent border-none cursor-pointer"
                      >
                        ঠিকানা পরিবর্তন করুন
                      </button>
                    </div>
                    
                    <div className="p-6 bg-white grid grid-cols-1 md:grid-cols-3 gap-6 text-left text-xs font-semibold text-foreground/90">
                      <div>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-1">গ্রাহকের নাম</p>
                        <p className="font-bold text-sm text-foreground">{user.name}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-1">যোগাযোগ মোবাইল</p>
                        <p className="font-bold text-sm text-foreground">{user.phone ? toBanglaNumber(user.phone) : "যোগ করা হয়নি"}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-1">ডেলিভারি ঠিকানা</p>
                        <p className="font-bold leading-relaxed">{user.address || "ঠিকানা যোগ করা হয়নি"}</p>
                        {(user.city || user.postcode) && (
                          <p className="font-bold mt-1 text-primary">
                            {user.city ? `${user.city}` : ""}{user.postcode ? `, ${toBanglaNumber(user.postcode)}` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: ORDERS */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <div className="text-left">
                    <h2 className="text-xl font-extrabold font-display text-foreground leading-tight">আমার কেনাকাটার অর্ডারসমূহ</h2>
                    <p className="text-xs text-muted-foreground mt-1">আপনার প্লেসকৃত সকল অর্ডারের তালিকা এবং বর্তমান ট্র্যাকিং স্ট্যাটাস নিচে দেখুন।</p>
                  </div>

                  {ordersLoading ? (
                    <div className="text-center py-12 text-sm text-muted-foreground font-semibold">অর্ডার লোড হচ্ছে...</div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-zinc-50/50">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="text-sm font-bold text-foreground mb-1">কোনো অর্ডার পাওয়া যায়নি</p>
                      <p className="text-xs text-muted-foreground mb-6">আপনি আমাদের শপ থেকে এখনও কোনো অর্ডার করেননি।</p>
                      <button 
                        onClick={() => router.push("/")}
                        className="bg-primary hover:bg-primary/95 text-white text-xs font-bold py-3 px-8 rounded-xl border-none cursor-pointer transition-all shadow-xs"
                      >
                        পোশাক কালেকশন দেখুন
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const isExpanded = expandedOrder === order.id;
                        return (
                          <div 
                            key={order.id} 
                            className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                              isExpanded 
                                ? "border-primary bg-white shadow-md" 
                                : "border-border/80 bg-zinc-50/20 hover:border-border/100 hover:bg-zinc-50/50"
                            }`}
                          >
                            {/* Order Header Summary Row */}
                            <div 
                              className="p-5 grid grid-cols-2 md:flex md:items-center justify-between gap-4 cursor-pointer"
                              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                            >
                              <div className="space-y-1 text-left">
                                <p className="text-xs font-bold text-primary font-mono">{order.orderNumber}</p>
                                <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                                  <Calendar size={12} />
                                  <span>{new Date(order.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "short", day: "numeric" })}</span>
                                </p>
                              </div>

                              <div className="text-right md:text-left">
                                <p className="text-[10px] text-muted-foreground font-semibold mb-0.5">সর্বমোট মূল্য</p>
                                <p className="text-sm font-extrabold text-foreground font-mono">{formatBanglaPriceWithCommas(order.grandTotal)}</p>
                              </div>

                              <div className="col-span-2 md:col-span-1 flex items-center justify-between md:justify-end gap-3 pt-3 border-t border-border/40 md:pt-0 md:border-none">
                                <div className="text-left md:text-right">
                                  <span className="md:hidden text-[9px] text-muted-foreground font-bold mr-2 uppercase tracking-wider">স্ট্যাটাস:</span>
                                  {getOrderStatusBadge(order.orderStatus)}
                                </div>
                                {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                              </div>
                            </div>

                            {/* Expanded Order Details */}
                            {isExpanded && (
                              <div className="border-t border-border/60 bg-white p-6 space-y-6">
                                
                                {/* Order Tracking Stepper */}
                                {renderDashboardOrderTimeline(order.orderStatus, order.createdAt)}

                                {/* Order Items Table */}
                                <div className="text-left">
                                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-4">অর্ডারকৃত পণ্যসমূহ:</h4>
                                  <div className="space-y-4">
                                    {order.items.map((item: any) => (
                                      <div key={item.id} className="flex items-center justify-between gap-4 py-2 border-b border-border/40 last:border-none">
                                        <div className="flex items-center gap-4">
                                          <div className="w-14 h-18 bg-zinc-100 rounded-xl overflow-hidden flex-shrink-0 border border-border/60">
                                            {item.product?.imgUrl ? (
                                              <img 
                                                src={item.product.imgUrl} 
                                                alt={item.product.name} 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                  (e.target as HTMLImageElement).src = '/assets/cotton_1.png';
                                                }}
                                              />
                                            ) : (
                                              <div className="w-full h-full bg-secondary/40" />
                                            )}
                                          </div>
                                          <div className="space-y-1">
                                            <p className="text-xs font-bold text-foreground line-clamp-1">{item.product?.name || "পোশাক"}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold">
                                              সাইজ: {item.size} | পরিমাণ: {toBanglaNumber(item.quantity)} টি
                                            </p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs font-extrabold text-foreground font-mono">{formatBanglaPriceWithCommas(item.price * item.quantity)}</p>
                                          {item.quantity > 1 && (
                                            <p className="text-[9px] text-muted-foreground font-mono mt-0.5">{formatBanglaPriceWithCommas(item.price)} প্রতি পিস</p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Price Breakdowns & Shipping details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/40 text-xs font-semibold text-foreground/80 text-left">
                                  <div className="space-y-2 bg-zinc-50/50 p-4 rounded-xl border border-border/60">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                      <MapPin size={13} className="text-primary" />
                                      <span>ডেলিভারি ও বিলিং ঠিকানা</span>
                                    </h4>
                                    <p className="font-bold text-foreground text-sm">{order.name}</p>
                                    <p>মোবাইল: {toBanglaNumber(order.phone)}</p>
                                    <p className="leading-relaxed">ঠিকানা: {order.address}, {order.city} - {toBanglaNumber(order.postcode)}</p>
                                  </div>

                                  <div className="space-y-2 bg-zinc-50/50 p-4 rounded-xl border border-border/60">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                      <CreditCard size={13} className="text-primary" />
                                      <span>মূল্যের বিবরণী</span>
                                    </h4>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">সাবটোটাল:</span>
                                      <span className="font-mono">{formatBanglaPriceWithCommas(order.subtotal)}</span>
                                    </div>
                                    {order.discount > 0 && (
                                      <div className="flex justify-between text-primary">
                                        <span>ডিসকাউন্ট ছাড়:</span>
                                        <span className="font-mono">-{formatBanglaPriceWithCommas(order.discount)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">ডেলিভারি চার্জ:</span>
                                      <span className="font-mono">{formatBanglaPriceWithCommas(order.shippingCost)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-border/40 pt-2.5 font-bold text-foreground text-sm">
                                      <span>সর্বমোট মূল্য:</span>
                                      <span className="font-mono text-primary">{formatBanglaPriceWithCommas(order.grandTotal)}</span>
                                    </div>
                                    
                                    <div className="border-t border-border/45 pt-3.5 flex flex-wrap gap-x-4 gap-y-2 items-center text-[10px] font-bold">
                                      <div className="flex items-center gap-1">
                                        <span>পেমেন্ট পদ্ধতি: {mapPaymentMethod(order.paymentMethod)}</span>
                                      </div>
                                      <div>
                                        {getPaymentStatusBadge(order.paymentStatus)}
                                      </div>
                                      {order.trxId && (
                                        <div className="w-full text-muted-foreground mt-1 font-mono">
                                          Transaction ID: {order.trxId}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Expanded Card Actions Footer */}
                                <div className="border-t border-border/40 pt-4 flex flex-wrap justify-between items-center gap-3 w-full">
                                  {order.orderStatus === "PENDING" ? (
                                    <button
                                      onClick={() => handleCancelOrderClick(order.id)}
                                      disabled={isSubmitting}
                                      className="bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold py-2.5 px-5 rounded-xl cursor-pointer transition-all active:scale-95 disabled:opacity-70"
                                    >
                                      {isSubmitting ? "বাতিল হচ্ছে..." : "অর্ডার বাতিল করুন"}
                                    </button>
                                  ) : (
                                    <div />
                                  )}

                                  <button
                                    onClick={() => {
                                      const text = `আসসালামু আলাইকুম তানহা ফ্যাশন। আমি আমার অর্ডার (${order.orderNumber}) সম্পর্কে জানতে চাই।`;
                                      window.open(`https://wa.me/8801700000000?text=${encodeURIComponent(text)}`, "_blank");
                                    }}
                                    className="bg-[#25D366]/5 hover:bg-[#25D366]/10 text-[#20ba5a] border border-[#25D366]/20 text-[10px] font-bold py-2.5 px-5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
                                  >
                                    <MessageCircle size={14} />
                                    <span>হোয়াটসঅ্যাপে সাপোর্ট</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: PROFILE EDITOR */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="text-left">
                    <h2 className="text-xl font-extrabold font-display text-foreground leading-tight">ঠিকানা ও প্রোফাইল বিবরণী</h2>
                    <p className="text-xs text-muted-foreground mt-1">শিপিং ও চেকআউট প্রক্রিয়া সহজ করতে আপনার ডিফল্ট কন্টাক্ট ইনফো নিচে হালনাগাদ করুন।</p>
                  </div>

                  <form onSubmit={handleProfileUpdateSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="text-left">
                        <label className="text-xs font-bold text-foreground mb-1 block">আপনার নাম *</label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full px-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold"
                          required
                        />
                      </div>

                      <div className="text-left">
                        <label className="text-xs font-bold text-foreground mb-1 block">মোবাইল নম্বর *</label>
                        <input
                          type="tel"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="w-full px-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <div className="text-left">
                      <label className="text-xs font-bold text-foreground mb-1 block">ইমেইল অ্যাড্রেস (পরিবর্তনযোগ্য নয়)</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-3 border border-border bg-secondary/30 rounded-xl text-sm text-muted-foreground font-semibold cursor-not-allowed"
                      />
                    </div>

                    <div className="text-left">
                      <label className="text-xs font-bold text-foreground mb-1 block">পূর্ণ শিপিং ঠিকানা (বিল্ডিং নম্বর, রোড, এলাকা) *</label>
                      <textarea
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold resize-none leading-relaxed"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="text-left">
                        <label className="text-xs font-bold text-foreground mb-1 block">শহর / সিটি *</label>
                        <select
                          value={profileCity}
                          onChange={(e) => setProfileCity(e.target.value)}
                          className="w-full px-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold cursor-pointer"
                        >
                          <option value="Dhaka">ঢাকা (Dhaka)</option>
                          <option value="Chittagong">চট্টগ্রাম (Chittagong)</option>
                          <option value="Sylhet">সিলেট (Sylhet)</option>
                          <option value="Rajshahi">রাজশাহী (Rajshahi)</option>
                          <option value="Khulna">খুলনা (Khulna)</option>
                          <option value="Barisal">বরিশাল (Barisal)</option>
                          <option value="Rangpur">রংপুর (Rangpur)</option>
                          <option value="Mymensingh">ময়মনসিংহ (Mymensingh)</option>
                        </select>
                      </div>

                      <div className="text-left">
                        <label className="text-xs font-bold text-foreground mb-1 block">পোস্টকোড *</label>
                        <input
                          type="text"
                          value={profilePostcode}
                          onChange={(e) => setProfilePostcode(e.target.value)}
                          className="w-full px-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/95 text-white font-bold py-3.5 px-8 rounded-xl border-none cursor-pointer transition-all shadow-xs disabled:opacity-75 flex items-center justify-center gap-2 text-xs"
                    >
                      <span>{isSubmitting ? "সংরক্ষণ হচ্ছে..." : "তথ্য সংরক্ষণ করুন"}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB CONTENT: PASSWORD UPDATE */}
              {activeTab === "password" && (
                <div className="space-y-6">
                  <div className="text-left">
                    <h2 className="text-xl font-extrabold font-display text-foreground leading-tight">পাসওয়ার্ড পরিবর্তন করুন</h2>
                    <p className="text-xs text-muted-foreground mt-1">অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে শক্তিশালী ও ক্যারেক্টার মিক্সড পাসওয়ার্ড দিন।</p>
                  </div>

                  <form onSubmit={handlePasswordUpdateSubmit} className="space-y-4 max-w-md">
                    <div className="text-left">
                      <label className="text-xs font-bold text-foreground mb-1 block">বর্তমান পাসওয়ার্ড *</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold"
                        required
                      />
                    </div>

                    <div className="text-left">
                      <label className="text-xs font-bold text-foreground mb-1 block">নতুন পাসওয়ার্ড *</label>
                      <input
                        type="password"
                        placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold"
                        required
                      />
                    </div>

                    <div className="text-left">
                      <label className="text-xs font-bold text-foreground mb-1 block">নতুন পাসওয়ার্ডটি নিশ্চিত করুন *</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/95 text-white font-bold py-3.5 px-8 rounded-xl border-none cursor-pointer transition-all shadow-xs disabled:opacity-75 text-xs block"
                    >
                      <span>{isSubmitting ? "আপডেট হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন করুন"}</span>
                    </button>
                  </form>
                </div>
              )}

            </div>
          </main>
        </div>
      </div>
      <ToastNotification isActive={toastActive} message={toastMsg} />
    </div>
  );
}
