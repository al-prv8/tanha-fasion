import React from "react";
import { Home, Grid, Sparkles, ShoppingBag, User } from "lucide-react";
import { toBanglaNumber } from "@/lib/products";

interface MobileTabBarProps {
  activeSection: number;
  cartCount: number;
  cartDrawerOpen: boolean;
  scrollToSection: (index: number) => void;
  setCartDrawerOpen: (isOpen: boolean) => void;
  showToast: (msg: string) => void;
}

export default function MobileTabBar({
  activeSection,
  cartCount,
  cartDrawerOpen,
  scrollToSection,
  setCartDrawerOpen,
  showToast,
}: MobileTabBarProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-17 bg-background/85 backdrop-blur-md border-t border-ink/10 flex justify-around items-center z-[9999] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(42,26,14,0.05)]" aria-label="Mobile Navigation">
      <button 
        className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-foreground cursor-pointer p-2 transition-colors duration-300 relative flex-1 bg-transparent border-none ${activeSection === 0 ? "text-primary" : ""}`}
        onClick={() => scrollToSection(0)}
      >
        <Home className="w-5 h-5" />
        <span>সূচনা</span>
      </button>
      <button 
        className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-foreground cursor-pointer p-2 transition-colors duration-300 relative flex-1 bg-transparent border-none ${activeSection === 1 ? "text-primary" : ""}`}
        onClick={() => scrollToSection(1)}
      >
        <Grid className="w-5 h-5" />
        <span>বিভাগ</span>
      </button>
      <button 
        className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-foreground cursor-pointer p-2 transition-colors duration-300 relative flex-1 bg-transparent border-none ${activeSection === 2 ? "text-primary" : ""}`}
        onClick={() => scrollToSection(2)}
      >
        <Sparkles className="w-5 h-5" />
        <span>সংগ্রহ</span>
      </button>
      <button 
        className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-foreground cursor-pointer p-2 transition-colors duration-300 relative flex-1 bg-transparent border-none ${cartDrawerOpen ? "text-primary" : ""}`}
        onClick={() => setCartDrawerOpen(true)}
      >
        <ShoppingBag className="w-5 h-5" />
        <span>ব্যাগ</span>
        {cartCount > 0 && (
          <span className="absolute top-1 right-[20%] bg-primary text-bone text-[9px] font-bold min-w-4 h-4 rounded-full flex items-center justify-center px-1 border border-background">{toBanglaNumber(cartCount)}</span>
        )}
      </button>
      <button 
        className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-foreground cursor-pointer p-2 transition-colors duration-300 relative flex-1 bg-transparent border-none"
        onClick={() => showToast("অ্যাকাউন্ট ফিচারটি শীঘ্রই আসছে!")}
      >
        <User className="w-5 h-5" />
        <span>অ্যাকাউন্ট</span>
      </button>
    </nav>
  );
}
