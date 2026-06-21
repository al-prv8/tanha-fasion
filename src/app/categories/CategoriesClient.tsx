"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useCart } from "@/lib/cart-context";
import { Product, PRODUCTS, toBanglaNumber, formatBanglaPriceWithCommas } from "@/lib/products";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal, Check } from "lucide-react";

// Layout components
import Navbar from "@/components/layout/Navbar";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import MobileTabBar from "@/components/layout/MobileTabBar";
import MobileMenuDrawer from "@/components/layout/MobileMenuDrawer";
import CartDrawer from "@/components/layout/CartDrawer";
import Cta from "@/components/sections/Cta";

// Overlays
import SpotlightModal from "@/components/overlays/SpotlightModal";
import ToastNotification from "@/components/overlays/ToastNotification";

const DEFAULT_CATEGORIES_LIST = [
  { id: "ALL", name: "সব পোশাক" },
  { id: "সুতি থ্রি-পিস", name: "সুতি থ্রি-পিস" },
  { id: "জর্জেট থ্রি-পিস", name: "জর্জেট থ্রি-পিস" },
  { id: "লিলেন থ্রি-পিস", name: "লিলেন থ্রি-পিস" },
  { id: "ক্যাজুয়াল আবায়া", name: "ক্যাজুয়াল আবায়া" },
  { id: "উৎসবের বোরকা", name: "উৎসবের বোরকা" },
  { id: "কম্বো সেট", name: "কম্বো সেট" }
];

function CategoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart, cartCount, cartDrawerOpen, setCartDrawerOpen } = useCart();

  // Data States
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>(DEFAULT_CATEGORIES_LIST);
  const [isLoading, setIsLoading] = useState(true);
  const [availableSizes, setAvailableSizes] = useState<string[]>(["S", "M", "L", "XL"]);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");

  // Size Picker States for individual cards
  const [cardSizes, setCardSizes] = useState<{ [productId: string]: string }>({});

  // UI Drawer/Modal States
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastActive, setToastActive] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSpotlightSize, setSelectedSpotlightSize] = useState("M");
  const [modalData, setModalData] = useState<{
    location: string;
    title: string;
    description: string;
    imgSrc: any;
    product?: Product;
  }>({
    location: "",
    title: "",
    description: "",
    imgSrc: "",
  });

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync Category with Query Parameter on Load
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam) {
      const decoded = decodeURIComponent(typeParam);
      const matched = categoriesList.find(
        (c) => c.name.toLowerCase() === decoded.toLowerCase() || c.id.toLowerCase() === decoded.toLowerCase()
      );
      if (matched) {
        setSelectedCategory(matched.id);
      }
    }
    const searchParam = searchParams.get("search");
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams, categoriesList]);

  // Fetch Live Database Products and Categories
  useEffect(() => {
    document.documentElement.classList.remove("dark");

    // Fetch Categories
    fetch("http://localhost:5000/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const list = [
            { id: "ALL", name: "সব পোশাক" },
            ...data.map((c: any) => ({ id: c.name, name: c.name }))
          ];
          setCategoriesList(list);
        }
      })
      .catch((err) => console.error("Error fetching categories:", err));

    // Fetch Products
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const allSizes = new Set<string>();
          const mapped = data.map((p: any) => {
            let sizesObj: { [sz: string]: number } = {};
            try {
              sizesObj = JSON.parse(p.sizesJson || "{}");
            } catch (e) {}
            const sizesKeys = Object.keys(sizesObj);
            sizesKeys.forEach(k => allSizes.add(k));
            const totalStock = Object.values(sizesObj).reduce((acc: number, val: any) => acc + Number(val || 0), 0);
            return {
              id: p.id,
              sku: p.sku,
              name: p.name,
              price: p.price,
              priceDisplay: `৳${p.price}`,
              loc: p.category,
              img: { src: p.imgUrl },
              sizes: sizesKeys.length > 0 ? sizesKeys : ["S", "M", "L", "XL"],
              sizesJson: p.sizesJson,
              desc: `${p.name} - Premium Quality Collection.`,
              tag: totalStock === 0 ? "স্টক শেষ" : "নতুন"
            };
          });
          setProductsList(mapped);
          if (allSizes.size > 0) {
            setAvailableSizes(Array.from(allSizes));
          }
        } else {
          setProductsList(PRODUCTS);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch live products, falling back to static:", err);
        setProductsList(PRODUCTS);
        setIsLoading(false);
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastActive(true);
    setTimeout(() => setToastActive(false), 2000);
  };

  const handleCardSizeSelect = (productId: string, size: string) => {
    setCardSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddClick = (product: Product) => {
    const size = cardSizes[product.id] || product.sizes[0] || "M";
    addToCart(product, 1, size);
    showToast(`"${product.name}" (${size}) ব্যাগ-এ যুক্ত করা হয়েছে!`);
  };

  const handleBuyNowClick = (product: Product) => {
    const size = cardSizes[product.id] || product.sizes[0] || "M";
    addToCart(product, 1, size);
    router.push("/checkout");
  };

  const openSpotlight = (product: Product) => {
    setSelectedSpotlightSize("M");
    setModalData({
      location: product.loc,
      title: product.name,
      description: product.desc,
      imgSrc: product.img,
      product: product,
    });
    setModalOpen(true);
  };

  // Redirection for Search input in Header
  useEffect(() => {
    if (searchQuery.trim() && pathnameIsNotCategories()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  }, [searchQuery, router]);

  const pathnameIsNotCategories = () => {
    if (typeof window !== "undefined") {
      return window.location.pathname !== "/categories";
    }
    return false;
  };

  // --- FILTER & SORT EXECUTION ---
  const filteredProducts = productsList.filter((p) => {
    // 1. Category Filter
    const matchesCategory = selectedCategory === "ALL" || p.loc === selectedCategory;
    
    // 2. Size Filter
    const matchesSize = !selectedSize || p.sizes.includes(selectedSize);

    // 3. Search query filter (if typing on categories page)
    const matchesSearch = 
      !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.loc.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSize && matchesSearch;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") {
      return a.price - b.price;
    }
    if (sortBy === "price-desc") {
      return b.price - a.price;
    }
    return 0; // Default order
  });

  return (
    <div className="grain-bg min-h-screen pb-20 md:pb-0 font-sans text-foreground">
      {/* Top offer announcement */}
      <AnnouncementBar scrollToSection={(idx) => router.push(`/?sec=${idx}`)} />

      {/* Main Navbar */}
      <Navbar 
        cartCount={cartCount} 
        onOpenMenu={() => setMenuDrawerOpen(true)}
        onOpenCart={() => setCartDrawerOpen(true)}
        scrollToSection={(idx) => router.push(`/?sec=${idx}`)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="max-w-[1440px] mx-auto px-4 md:px-12 py-10">
        
        {/* Breadcrumb Path */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap py-1">
          <Link href="/" className="hover:text-primary transition-colors">হোম</Link>
          <ChevronRight size={12} className="flex-shrink-0" />
          <span className="text-foreground font-semibold">পোশাকের ক্যাটাগরি ও ব্রাউজ</span>
        </nav>

        {/* Title banner */}
        <div className="mb-8 border-b border-border/80 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight">ফ্যাশন কালেকশন ব্রাউজার</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">সব পোশাক ও বিভাগ ফিল্টারের মাধ্যমে সহজেই খুঁজে নিন।</p>
          </div>
          
          {/* Mobile Filter toggle button */}
          <button 
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 py-2 px-4 bg-white border border-border rounded-full text-xs font-bold cursor-pointer"
          >
            <SlidersHorizontal size={13} />
            <span>ফিল্টার</span>
          </button>
        </div>

        {/* Grid Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* A. SIDEBAR FILTERS - DESKTOP VIEW */}
          <aside className="hidden md:flex md:col-span-3 flex-col gap-6 sticky top-24 bg-card border border-border/80 p-5 rounded-2xl shadow-2xs">
            {/* Category selection */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-primary border-b border-border/60 pb-2 mb-3">ক্যাটাগরি সমূহ</h4>
              <div className="flex flex-col gap-1">
                {categoriesList.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  const itemQuantity = cat.id === "ALL" 
                    ? productsList.length 
                    : productsList.filter(p => p.loc === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-between ${
                        isActive 
                          ? "bg-primary border-primary text-white" 
                          : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground border border-border/60"}`}>
                        {toBanglaNumber(itemQuantity)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size filters */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-primary border-b border-border/60 pb-2 mb-3">সাইজ ফিল্টার</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSize(null)}
                  className={`py-1.5 px-3 rounded text-[10px] font-bold border cursor-pointer transition-all ${
                    !selectedSize 
                      ? "bg-foreground text-background border-foreground" 
                      : "bg-background border-border text-foreground hover:border-primary/50"
                  }`}
                >
                  সব সাইজ
                </button>
                {availableSizes.map((sz) => {
                  const isActive = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`w-8 h-8 rounded text-[10px] font-bold border cursor-pointer transition-all flex items-center justify-center ${
                        isActive 
                          ? "bg-foreground text-background border-foreground" 
                          : "bg-background border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sorting */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-primary border-b border-border/60 pb-2 mb-3">মূল্য ক্রমানুসার</h4>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-2.5 py-2 border border-border bg-white rounded-lg text-xs font-bold outline-none focus:border-primary"
              >
                <option value="default">সাধারণ সাজানো</option>
                <option value="price-asc">মূল্য: কম থেকে বেশি</option>
                <option value="price-desc">মূল্য: বেশি থেকে কম</option>
              </select>
            </div>
          </aside>

          {/* B. MOBILE FILTERS DRAWER / COLLAPSIBLE PANEL */}
          {mobileFilterOpen && (
            <div className="md:hidden bg-card border border-border/80 p-5 rounded-2xl mb-6 shadow-md flex flex-col gap-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-primary block mb-2.5">ক্যাটাগরি ফিল্টার</span>
                <div className="flex flex-wrap gap-1.5">
                  {categoriesList.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          isActive 
                            ? "bg-primary border-primary text-white" 
                            : "bg-background border-border text-muted-foreground"
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary block mb-2">সাইজ</span>
                  <select 
                    value={selectedSize || ""} 
                    onChange={(e) => setSelectedSize(e.target.value || null)}
                    className="w-full px-2.5 py-1.5 border border-border bg-white rounded-lg text-[10px] font-bold"
                  >
                    <option value="">সব সাইজ</option>
                    {availableSizes.map(sz => <option key={sz} value={sz}>{sz}</option>)}
                  </select>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary block mb-2">ক্রমানুসার</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-border bg-white rounded-lg text-[10px] font-bold"
                  >
                    <option value="default">সাধারণ</option>
                    <option value="price-asc">মূল্য: কম-বেশি</option>
                    <option value="price-desc">মূল্য: বেশি-কম</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* C. PRODUCTS LIST GRID (Right Column) */}
          <div className="md:col-span-9">
            {isLoading ? (
              /* Loading Skeletons */
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="bg-card border border-border/40 rounded overflow-hidden flex flex-col gap-3 p-4 animate-pulse">
                    <div className="aspect-[3/4] bg-secondary rounded w-full"></div>
                    <div className="h-4 bg-secondary rounded w-3/4"></div>
                    <div className="h-3 bg-secondary rounded w-1/2"></div>
                    <div className="h-8 bg-secondary rounded w-full mt-2"></div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="py-24 text-center text-muted-foreground text-sm font-semibold bg-card border border-border/60 rounded-2xl">
                দুঃখিত, আপনার নির্বাচিত ফিল্টারের সাথে মিলে যায় এমন কোনো পোশাক পাওয়া যায়নি।
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {sortedProducts.map((prod) => {
                  const activeSize = cardSizes[prod.id] || prod.sizes[0] || "M";
                  return (
                    <div
                      key={prod.id}
                      className="bg-card border border-border/60 hover:border-primary/50 rounded overflow-hidden flex flex-col justify-between group transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1"
                    >
                      {/* Product Image Link */}
                      <Link href={`/products/${prod.id}`} className="relative aspect-[3/4] bg-secondary overflow-hidden w-full block cursor-pointer">
                        <img
                          src={prod.img?.src || prod.img}
                          alt={prod.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        
                        {prod.tag && (
                          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[9px] sm:text-[10px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wider shadow-sm">
                            {prod.tag}
                          </span>
                        )}
                      </Link>

                      {/* Details & Actions */}
                      <div className="p-3 sm:p-4 flex flex-col gap-2.5">
                        <div>
                          <Link
                            href={`/products/${prod.id}`}
                            className="text-xs sm:text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors cursor-pointer block no-underline"
                          >
                            {prod.name}
                          </Link>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{prod.loc}</p>
                        </div>

                        {/* Sizes */}
                        <div className="flex flex-col gap-1">
                          <div className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">সাইজ:</div>
                          <div className="flex flex-wrap gap-1">
                            {prod.sizes.map((sz) => (
                              <button
                                key={sz}
                                onClick={() => handleCardSizeSelect(prod.id, sz)}
                                className={`text-[9px] font-bold w-6 h-6 rounded border flex items-center justify-center transition-all cursor-pointer ${
                                  activeSize === sz
                                    ? "bg-primary border-primary text-white"
                                    : "bg-background border-border text-foreground hover:border-primary/50"
                                }`}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Pricing and Action buttons */}
                        <div className="flex flex-col gap-2 border-t border-border/40 pt-2.5 mt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-extrabold text-foreground">
                              {prod.priceDisplay}
                            </span>
                            <Link
                              href={`/products/${prod.id}`}
                              className="text-[10px] sm:text-xs text-primary hover:underline font-semibold no-underline"
                            >
                              বিস্তারিত
                            </Link>
                          </div>
                          
                          <div className="flex gap-1.5 mt-0.5">
                            <button
                              onClick={() => handleAddClick(prod)}
                              className="flex-grow bg-secondary hover:bg-secondary-foreground/10 text-foreground border border-border/80 py-1.5 px-2 rounded-sm text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              title="ব্যাগে যোগ করুন"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                              </svg>
                              <span className="hidden sm:inline">ব্যাগে রাখুন</span>
                            </button>
                            <button
                              onClick={() => handleBuyNowClick(prod)}
                              className="flex-grow bg-primary hover:bg-primary/95 text-white border-none py-1.5 px-2 rounded-sm text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>এখনই কিনুন</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Sizing guides and drawer panels */}
      <Cta scrollToSection={(idx) => router.push(`/?sec=${idx}`)} />
      
      <CartDrawer showToast={showToast} />
      
      <MobileTabBar 
        activeSection={99}
        cartCount={cartCount}
        cartDrawerOpen={cartDrawerOpen}
        scrollToSection={(idx) => router.push(`/?sec=${idx}`)}
        setCartDrawerOpen={setCartDrawerOpen}
        showToast={showToast}
      />

      <MobileMenuDrawer 
        isOpen={menuDrawerOpen}
        onClose={() => setMenuDrawerOpen(false)}
        activeSection={99}
        scrollToSection={(idx) => router.push(`/?sec=${idx}`)}
      />

      <ToastNotification isActive={toastActive} message={toastMsg} />
    </div>
  );
}

export default function CategoriesClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background text-primary font-bold">
        লোডিং হচ্ছে...
      </div>
    }>
      <CategoriesContent />
    </Suspense>
  );
}
