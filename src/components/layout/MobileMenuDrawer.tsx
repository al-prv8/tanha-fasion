"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Home, 
  ShoppingBag, 
  Store, 
  MapPin, 
  User, 
  LogIn, 
  LogOut, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  FileText,
  UserCheck,
  Compass,
  ArrowRight
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { toBanglaNumber } from "@/lib/products";

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: number;
  scrollToSection: (index: number) => void;
}

export default function MobileMenuDrawer({
  isOpen,
  onClose,
  activeSection,
  scrollToSection,
}: MobileMenuDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        } else {
          // Fallbacks if backend fails
          setCategories([
            { name: "সুতি থ্রি-পিস" },
            { name: "জর্জেট থ্রি-পিস" },
            { name: "লিলেন থ্রি-পিস" },
            { name: "ক্যাজুয়াল আবায়া" },
            { name: "উৎসবের বোরকা" },
            { name: "বিশেষ কম্বো" },
          ]);
        }
      })
      .catch((err) => {
        console.error("Failed to load categories in MobileMenuDrawer, using fallback:", err);
        setCategories([
          { name: "সুতি থ্রি-পিস" },
          { name: "জর্জেট থ্রি-পিস" },
          { name: "লিলেন থ্রি-পিস" },
          { name: "ক্যাজুয়াল আবায়া" },
          { name: "উৎসবের বোরকা" },
          { name: "বিশেষ কম্বো" },
        ]);
      });
  }, []);

  const handleLinkClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    if (pathname === "/") {
      scrollToSection(index);
    } else {
      router.push(`/?sec=${index}`);
    }
    onClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      {/* Mobile Menu Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[15000] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`} 
        onClick={onClose} 
      />
      
      {/* Mobile Menu Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-[310px] max-w-[85%] bg-card border-r border-border/80 shadow-2xl z-[15001] flex flex-col justify-between transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-border/80 flex justify-between items-center bg-white/60 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-display font-black text-sm">
              T
            </div>
            <span className="font-extrabold text-slate-800 tracking-tight text-sm font-display">তানহা ফ্যাশন</span>
          </div>
          <button 
            className="w-8 h-8 rounded-xl bg-secondary/80 border border-border flex items-center justify-center hover:bg-secondary active:scale-95 cursor-pointer text-foreground transition-all" 
            onClick={onClose} 
            aria-label="Close menu"
          >
            <X size={15} />
          </button>
        </div>

        {/* Drawer Body - Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 text-left">
          
          {/* Section 1: User Profile & Authentication */}
          <div className="bg-secondary/40 border border-border/40 rounded-2xl p-4">
            {user ? (
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center font-display font-extrabold text-md flex-shrink-0">
                    {user.name ? user.name.slice(0, 1) : "T"}
                  </div>
                  <div className="min-w-0 text-left">
                    <h4 className="text-xs font-bold text-foreground truncate m-0">{user.name}</h4>
                    <p className="text-[10px] text-muted-foreground truncate m-0 mt-0.5">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                  <Link 
                    href="/dashboard"
                    onClick={onClose}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-primary text-white rounded-lg text-[10px] font-bold no-underline hover:bg-primary/95 transition-all text-center border-none cursor-pointer"
                  >
                    <UserCheck size={11} />
                    <span>ড্যাশবোর্ড</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold cursor-pointer transition-all text-center"
                  >
                    <LogOut size={11} />
                    <span>লগআউট</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-1">
                <p className="text-[10px] text-muted-foreground font-semibold m-0 mb-3 text-left">অর্ডার হিস্টোরি ও ডিসকাউন্ট পেতে লগইন করুন:</p>
                <Link 
                  href="/login"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-white rounded-xl text-xs font-black no-underline hover:bg-primary/95 transition-all w-full border-none cursor-pointer"
                >
                  <LogIn size={13} />
                  <span>কাস্টমার লগইন / সাইন-আপ</span>
                </Link>
              </div>
            )}
          </div>

          {/* Section 2: Main Store Pages */}
          <div className="space-y-2">
            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest block px-1 mb-2">স্টোর মেনু</span>
            <ul className="flex flex-col gap-1 list-none m-0 p-0">
              <li>
                <a 
                  href="#"
                  onClick={(e) => handleLinkClick(e, 0)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs border transition-all no-underline w-full text-left ${
                    pathname === "/" && activeSection === 0
                      ? "bg-primary border-primary text-white"
                      : "bg-transparent border-transparent text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <Home size={14} className={pathname === "/" && activeSection === 0 ? "text-white" : "text-primary"} />
                  <span>হোম পেজ</span>
                </a>
              </li>

              <li>
                <Link 
                  href="/categories"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs border transition-all no-underline w-full text-left ${
                    pathname === "/categories" && !pathname.includes("?")
                      ? "bg-primary border-primary text-white"
                      : "bg-transparent border-transparent text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <Compass size={14} className={pathname === "/categories" ? "text-white" : "text-primary"} />
                  <span>সব পোশাক কালেকশন</span>
                </Link>
              </li>

              <li>
                <Link 
                  href="/showroom"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs border transition-all no-underline w-full text-left ${
                    pathname === "/showroom"
                      ? "bg-primary border-primary text-white"
                      : "bg-transparent border-transparent text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <Store size={14} className={pathname === "/showroom" ? "text-white" : "text-primary"} />
                  <span>শোরুম আউটলেট</span>
                </Link>
              </li>

              <li>
                <Link 
                  href="/track"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs border transition-all no-underline w-full text-left ${
                    pathname === "/track"
                      ? "bg-primary border-primary text-white"
                      : "bg-transparent border-transparent text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <MapPin size={14} className={pathname === "/track" ? "text-white" : "text-primary"} />
                  <span>অর্ডার ট্র্যাকিং</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 3: Categories Accordion */}
          <div className="space-y-2">
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex justify-between items-center w-full bg-transparent border-none text-left p-1 text-muted-foreground/60 uppercase tracking-widest text-[9px] font-black cursor-pointer"
            >
              <span>পোশাকের ক্যাটাগরি</span>
              {categoriesOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>

            {categoriesOpen && (
              <div className="grid grid-cols-2 gap-1.5 pt-1 pl-1">
                {categories.map((cat, idx) => {
                  const href = `/categories?type=${encodeURIComponent(cat.name)}`;
                  const isActive = pathname === "/categories" && decodeURIComponent(window.location.search).includes(cat.name);
                  return (
                    <Link
                      key={idx}
                      href={href}
                      onClick={onClose}
                      className={`flex items-center gap-1.5 py-2 px-3 rounded-lg font-bold text-[10px] no-underline border transition-all truncate text-left w-full ${
                        isActive
                          ? "bg-primary/5 border-primary/20 text-primary"
                          : "bg-secondary/20 border-transparent text-foreground hover:bg-secondary/40"
                      }`}
                    >
                      <ShoppingBag size={10} className="text-primary/70" />
                      <span className="truncate">{cat.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: Support & Policies */}
          <div className="space-y-2">
            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest block px-1 mb-2">সহায়তা ও নীতিমালা</span>
            <ul className="flex flex-col gap-1 list-none m-0 p-0">
              <li>
                <a 
                  href="#"
                  onClick={(e) => handleLinkClick(e, categories.length + 2)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs text-foreground hover:bg-secondary/40 transition-all no-underline w-full text-left"
                >
                  <HelpCircle size={14} className="text-primary" />
                  <span>সচরাচর জিজ্ঞাসা (FAQ)</span>
                </a>
              </li>
              <li>
                <Link 
                  href="/refund-policy"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs text-foreground hover:bg-secondary/40 transition-all no-underline w-full text-left"
                >
                  <FileText size={14} className="text-primary" />
                  <span>রিটার্ন ও রিফান্ড পলিসি</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy-policy"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs text-foreground hover:bg-secondary/40 transition-all no-underline w-full text-left"
                >
                  <FileText size={14} className="text-primary" />
                  <span>প্রাইভেসী পলিসি</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms-conditions"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs text-foreground hover:bg-secondary/40 transition-all no-underline w-full text-left"
                >
                  <FileText size={14} className="text-primary" />
                  <span>শর্তাবলী (Terms)</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border/80 bg-white/60 text-center flex flex-col gap-1">
          <div className="text-[10px] text-slate-800 font-extrabold font-sans">
            হটলাইন: <span className="text-primary">০১৮৬৩৬৯৪০২৭</span>
          </div>
          <div className="text-[8px] text-muted-foreground/60 font-mono">
            v1.1.0 © তানহা ফ্যাশন
          </div>
        </div>
      </div>
    </>
  );
}
