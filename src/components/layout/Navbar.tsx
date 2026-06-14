import React from "react";
import { Search, User, ShoppingBag, Menu, Sun, Moon } from "lucide-react";
import Logo from "./Logo";
import { toBanglaNumber } from "@/lib/products";
 
interface NavbarProps {
  cartCount: number;
  onOpenMenu: () => void;
  onOpenCart: () => void;
  scrollToSection: (index: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  theme?: "light" | "dark";
  toggleTheme?: () => void;
}
 
export default function Navbar({
  cartCount,
  onOpenMenu,
  onOpenCart,
  scrollToSection,
  searchQuery,
  setSearchQuery,
  theme,
  toggleTheme,
}: NavbarProps) {
  const categories = [
    { name: "সুতি থ্রি-পিস", sectionIndex: 2 },
    { name: "জর্জেট থ্রি-পিস", sectionIndex: 3 },
    { name: "লিলেন থ্রি-পিস", sectionIndex: 4 },
    { name: "ক্যাজুয়াল আবায়া", sectionIndex: 5 },
    { name: "উৎসবের বোরকা", sectionIndex: 6 },
    { name: "কম্বো সেট", sectionIndex: 7 },
  ];

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
          <Logo onClick={(e) => { e.preventDefault(); scrollToSection(0); }} />
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
          {/* Theme Toggle Button */}
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 rounded-full border border-border text-foreground hover:bg-secondary cursor-pointer transition-all duration-300 shadow-sm active:scale-95"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          <button className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
            <User size={18} />
            <span>লগইন</span>
          </button>
          
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
            className="w-full pl-9 pr-4 py-2 text-xs border border-border rounded-full bg-secondary/30 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
        </div>
      </div>

      {/* Bottom Header Row (Categories Nav Links) */}
      <div className="hidden md:block border-t border-border/60 bg-secondary/10">
        <div className="max-w-[1440px] mx-auto px-4 overflow-x-auto">
          <ul className="flex items-center justify-center min-w-max md:min-w-0 gap-6 md:gap-10 py-3 list-none mx-auto">
            {categories.map((cat, idx) => (
              <li key={idx}>
                <a
                  href={`#category-${cat.sectionIndex}`}
                  className="no-underline text-foreground hover:text-primary text-xs md:text-sm font-semibold transition-colors duration-300 relative pb-1 group cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(cat.sectionIndex);
                  }}
                >
                  {cat.name}
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
