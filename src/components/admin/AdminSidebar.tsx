import React from "react";
import Link from "next/link";
import { 
  BarChart3, 
  ShoppingBag, 
  Package, 
  Star, 
  User, 
  ShieldCheck, 
  LogOut, 
  X,
  Layers,
  Tag
} from "lucide-react";
import { toBanglaNumber } from "@/lib/products";

interface SidebarProps {
  activeTab: "dashboard" | "orders" | "products" | "reviews" | "categories" | "coupons";
  setActiveTab: (tab: "dashboard" | "orders" | "products" | "reviews" | "categories" | "coupons") => void;
  ordersCount: number;
  productsCount: number;
  reviewsCount: number;
  categoriesCount: number;
  couponsCount: number;
  onLogout: () => void;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  ordersCount,
  productsCount,
  reviewsCount,
  categoriesCount,
  couponsCount,
  onLogout,
  onCloseMobile
}: SidebarProps) {
  const navigationItems = [
    { id: "dashboard", label: "ড্যাশবোর্ড", icon: <BarChart3 size={16} /> },
    { id: "orders", label: "অর্ডার সমূহ", icon: <ShoppingBag size={16} />, count: ordersCount },
    { id: "products", label: "পণ্য তালিকা", icon: <Package size={16} />, count: productsCount },
    { id: "categories", label: "ক্যাটাগরি", icon: <Layers size={16} />, count: categoriesCount },
    { id: "coupons", label: "কুপন পরিচালনা", icon: <Tag size={16} />, count: couponsCount },
    { id: "reviews", label: "রিভিউ মডারেশন", icon: <Star size={16} />, count: reviewsCount },
  ];

  return (
    <div className="flex flex-col h-full bg-card border-r border-border/80 w-64 flex-shrink-0 grain-bg">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border/80 bg-white">
        <Link href="/" className="text-lg font-black text-foreground no-underline font-display flex items-center gap-1.5 hover:opacity-90">
          <span className="w-2.5 h-2.5 bg-primary rounded-full inline-block animate-pulse"></span>
          তানহা <span className="text-primary">ফ্যাশন</span>
        </Link>
        <div className="flex items-center gap-1">
          <span className="text-[9px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">অ্যাডমিন</span>
          {onCloseMobile && (
            <button onClick={onCloseMobile} className="md:hidden p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* User Info Brief */}
      <div className="p-5 border-b border-border/60 bg-white/50 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary font-bold shadow-xs">
          <User size={18} />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-foreground flex items-center gap-1">
            <span className="truncate">মোঃ মামুন</span>
            <ShieldCheck size={12} className="text-primary flex-shrink-0" />
          </div>
          <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">স্টোর অ্যাডমিনিস্ট্রেটর</div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-4 flex flex-col gap-1.5 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full text-left py-3 px-4 rounded-xl font-bold text-xs flex items-center gap-3 border transition-all cursor-pointer ${
                isActive
                  ? "bg-primary border-primary text-white shadow-sm hover:bg-primary/95"
                  : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/60 hover:border-border/40"
              }`}
            >
              <span className={isActive ? "text-white" : "text-primary"}>{item.icon}</span>
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className={`ml-auto font-sans text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-secondary text-foreground border border-border"
                }`}>
                  {toBanglaNumber(item.count)}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer / Logout */}
      <div className="p-4 border-t border-border/80 bg-white/60 flex flex-col gap-2">
        <button
          onClick={onLogout}
          className="w-full bg-secondary hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-border text-foreground py-2 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={13} />
          <span>লগআউট করুন</span>
        </button>
        <div className="text-[9px] text-muted-foreground/60 font-mono text-center mt-1">
          v1.1.0 © তানহা ফ্যাশন
        </div>
      </div>
    </div>
  );
}
