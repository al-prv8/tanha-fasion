"use client";
 
import React, { useState, useEffect } from "react";
import { Search, User, ShoppingBag, Menu } from "lucide-react";
import Logo from "./Logo";
import { toBanglaNumber } from "@/lib/products";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface NavbarProps {
  cartCount: number;
  onOpenMenu: () => void;
  onOpenCart: () => void;
  scrollToSection: (index: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Navbar({
  cartCount,
  onOpenMenu,
  onOpenCart,
  scrollToSection,
  searchQuery,
  setSearchQuery,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data.map((c, idx) => ({ name: c.name, sectionIndex: idx + 2 })));
        } else {
          setCategories([
            { name: "সুতি থ্রি-পিস", sectionIndex: 2 },
            { name: "জর্জেট থ্রি-পিস", sectionIndex: 3 },
            { name: "লিলেন থ্রি-পিস", sectionIndex: 4 },
            { name: "ক্যাজুয়াল আবায়া", sectionIndex: 5 },
            { name: "উৎসবের বোরকা", sectionIndex: 6 },
            { name: "কম্বো সেট", sectionIndex: 7 },
          ]);
        }
      })
      .catch((err) => {
        console.error("Failed to load categories in Navbar, using fallback:", err);
        setCategories([
          { name: "সুতি থ্রি-পিস", sectionIndex: 2 },
          { name: "জর্জেট থ্রি-পিস", sectionIndex: 3 },
          { name: "লিলেন থ্রি-পিস", sectionIndex: 4 },
          { name: "ক্যাজুয়াল আবায়া", sectionIndex: 5 },
          { name: "উৎসবের বোরকা", sectionIndex: 6 },
          { name: "কম্বো সেট", sectionIndex: 7 },
        ]);
      });
  }, []);

  return (
    <header className="sticky top-0 z-[1000] w-full bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      {/* Middle Header Row (Logo, Search, Actions) */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        {/* Mobile Hamburger Menu */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded-full border border-border text-foreground hover:bg-secondary cursor-pointer transition-colors"
          onClick={onOpenMenu}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Logo */}
        <div className="flex-shrink-0">
          <Logo onClick={(e) => {
            e.preventDefault();
            if (pathname === "/") {
              scrollToSection(0);
            } else {
              router.push("/");
            }
          }} />
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-grow max-w-xl relative mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="পণ্য খুঁজুন (যেমন: সুতি থ্রি-পিস, আবায়া)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-full bg-secondary/30 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground placeholder-muted-foreground"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <Link 
              href="/dashboard"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors no-underline cursor-pointer"
            >
              <User size={18} />
              <span>{user.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link 
              href="/login"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors no-underline cursor-pointer"
            >
              <User size={18} />
              <span>লগইন</span>
            </Link>
          )}
          
          <button
            className="flex items-center gap-2 border border-border py-2 px-4 rounded-full text-sm font-medium bg-transparent text-foreground hover:bg-secondary cursor-pointer transition-all duration-300 relative"
            onClick={onOpenCart}
          >
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">ব্যাগ</span>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
              {toBanglaNumber(cartCount)}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Input Row */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="পণ্য খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-base md:text-xs border border-border rounded-full bg-secondary/30 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
        </div>
      </div>

      {/* Bottom Header Row (Categories Nav Links) */}
      <div className="hidden md:block border-t border-border/60 bg-secondary/10">
        <div className="max-w-[1440px] mx-auto px-4 overflow-x-auto">
          <ul className="flex items-center justify-center min-w-max md:min-w-0 gap-5 md:gap-7 py-3 list-none mx-auto">
            <li>
              <Link 
                href="/"
                className={`no-underline hover:text-primary text-xs md:text-sm font-bold transition-colors duration-300 relative pb-1 group cursor-pointer ${pathname === "/" ? "text-primary font-black" : "text-foreground"}`}
              >
                হোম
                <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-primary transition-transform duration-300 origin-left ${pathname === "/" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
              </Link>
            </li>
            <li>
              <Link 
                href="/categories"
                className={`no-underline hover:text-primary text-xs md:text-sm font-bold transition-colors duration-300 relative pb-1 group cursor-pointer ${pathname === "/categories" ? "text-primary font-black" : "text-foreground"}`}
              >
                সব পোশাক
                <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-primary transition-transform duration-300 origin-left ${pathname === "/categories" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
              </Link>
            </li>
            <li>
              <Link 
                href="/showroom"
                className={`no-underline hover:text-primary text-xs md:text-sm font-bold transition-colors duration-300 relative pb-1 group cursor-pointer ${pathname === "/showroom" ? "text-primary font-black" : "text-foreground"}`}
              >
                শোরুম আউটলেট
                <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-primary transition-transform duration-300 origin-left ${pathname === "/showroom" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
              </Link>
            </li>
            <li>
              <Link 
                href="/track"
                className={`no-underline hover:text-primary text-xs md:text-sm font-bold transition-colors duration-300 relative pb-1 group cursor-pointer ${pathname === "/track" ? "text-primary font-black" : "text-foreground"}`}
              >
                অর্ডার ট্র্যাকিং
                <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-primary transition-transform duration-300 origin-left ${pathname === "/track" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
              </Link>
            </li>
            
            <li className="h-4 w-[1px] bg-border/80 self-center"></li>

            {categories.map((cat, idx) => (
              <li key={idx}>
                <Link
                  href={`/categories?type=${encodeURIComponent(cat.name)}`}
                  className="no-underline text-foreground hover:text-primary text-xs md:text-sm font-semibold transition-colors duration-300 relative pb-1 group cursor-pointer"
                >
                  {cat.name}
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
