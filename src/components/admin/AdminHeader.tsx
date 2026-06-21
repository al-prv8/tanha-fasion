import React from "react";
import Link from "next/link";
import { 
  Menu, 
  ExternalLink, 
  RefreshCw, 
  ChevronRight 
} from "lucide-react";

interface HeaderProps {
  activeTab: "dashboard" | "orders" | "products" | "reviews" | "categories" | "coupons";
  onOpenMobileSidebar: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  onLogout: () => void;
}

export default function AdminHeader({
  activeTab,
  onOpenMobileSidebar,
  onRefresh,
  isLoading,
  onLogout
}: HeaderProps) {
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case "dashboard": return "ড্যাশবোর্ড অ্যানালিটিক্স";
      case "orders": return "অর্ডার সমূহ";
      case "products": return "পণ্য সম্ভার";
      case "categories": return "ক্যাটাগরি মডারেশন";
      case "coupons": return "কুপন পরিচালনা";
      case "reviews": return "রিভিউ মডারেশন";
      default: return "";
    }
  };

  return (
    <header className="bg-white border-b border-border/80 h-16 flex items-center justify-between px-6 sticky top-0 z-40 shadow-2xs">
      {/* Left: Mobile Sidebar Toggle & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenMobileSidebar} 
          className="md:hidden p-2 border border-border hover:bg-secondary text-foreground rounded-lg cursor-pointer transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
          <span>তানহা ফ্যাশন অ্যাডমিন</span>
          <ChevronRight size={12} className="text-muted-foreground/60" />
          <span className="text-foreground uppercase font-black tracking-wider">
            {getTabLabel(activeTab)}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Public Store Link */}
        <Link 
          href="/" 
          target="_blank" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-foreground no-underline transition-colors"
        >
          <ExternalLink size={14} /> 
          <span>স্টোর দেখুন</span>
        </Link>

        {/* Sync/Refresh Data */}
        <button 
          onClick={onRefresh} 
          className="p-2 border border-border hover:bg-secondary text-foreground rounded-lg cursor-pointer transition-colors"
          title="ডাটা রিফ্রেশ করুন"
          disabled={isLoading}
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin text-primary" : ""} />
        </button>

        <div className="h-6 w-[1px] bg-border"></div>

        {/* Desktop Logout Button */}
        <button 
          onClick={onLogout} 
          className="hidden sm:inline-flex bg-secondary hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-foreground border border-border py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all"
        >
          লগআউট
        </button>
      </div>
    </header>
  );
}
