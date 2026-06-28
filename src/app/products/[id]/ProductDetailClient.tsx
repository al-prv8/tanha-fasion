"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { Product, PRODUCTS, toBanglaNumber, formatBanglaPriceWithCommas } from "@/lib/products";
import { 
  ShoppingBag, 
  Phone, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Plus, 
  Minus, 
  ChevronDown, 
  Share2, 
  Copy, 
  Heart,
  ChevronRight,
  MessageCircle,
  Info,
  Star
} from "lucide-react";

// Layout components
import Navbar from "@/components/layout/Navbar";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import MobileMenuDrawer from "@/components/layout/MobileMenuDrawer";
import MobileTabBar from "@/components/layout/MobileTabBar";
import CartDrawer from "@/components/layout/CartDrawer";
import Cta from "@/components/sections/Cta";
import ToastNotification from "@/components/overlays/ToastNotification";

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const pathname = usePathname();
  const { addToCart, cartCount, cartDrawerOpen, setCartDrawerOpen } = useCart();

  // Stock utility function
  const getStockForSize = (size: string) => {
    const p = product as any;
    if (p.sizesJson) {
      try {
        const sizesObj = JSON.parse(p.sizesJson);
        return sizesObj[size] !== undefined ? Number(sizesObj[size]) : 0;
      } catch (e) {}
    }
    if (size === "S") return p.stockS !== undefined ? p.stockS : 10;
    if (size === "M") return p.stockM !== undefined ? p.stockM : 15;
    if (size === "L") return p.stockL !== undefined ? p.stockL : 15;
    if (size === "XL") return p.stockXL !== undefined ? p.stockXL : 5;
    return 0;
  };

  // Find first size that is in stock, or fallback to the first element
  const getInitialSize = () => {
    const firstInStock = product.sizes.find(sz => getStockForSize(sz) > 0);
    return firstInStock || product.sizes[0] || "M";
  };

  // UI States
  const [selectedSize, setSelectedSize] = useState(getInitialSize);
  const [quantity, setQuantity] = useState(1);
  const [toastActive, setToastActive] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const currentStock = getStockForSize(selectedSize);

  // Automatically adjust quantity if it exceeds current stock
  useEffect(() => {
    if (quantity > currentStock && currentStock > 0) {
      setQuantity(currentStock);
    } else if (currentStock === 0) {
      setQuantity(1);
    }
  }, [selectedSize, currentStock]);
  
  // Interactive Reviews States
  const [reviews, setReviews] = useState<Array<{ name: string; rating: number; date: string; comment: string }>>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>(() => {
    const categoryName = product.loc || (product as any).category;
    return PRODUCTS.filter((p) => {
      const pCat = p.loc || (p as any).category;
      return pCat === categoryName && p.id !== product.id;
    })
      .slice(0, 4)
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        imgUrl: p.img?.src || p.img || '/assets/cotton_1.png',
        category: p.loc || (p as any).category,
      }));
  });
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  // Load reviews dynamically from the Express API
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/reviews/${product.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const mapped = data.map((r: any) => ({
            name: r.name,
            rating: r.rating,
            date: new Date(r.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" }),
            comment: r.comment
          }));
          setReviews(mapped);
        } else {
          // Fallback static reviews if database is empty
          const defaults = [
            { name: "তাসমিয়া রহমান", rating: 5, date: "১৮ জুন ২০২৬", comment: "ডিজাইনটা সত্যি অসাধারণ! কাপড় অনেক সফট এবং গরমের জন্য খুব আরামদায়ক। ডেলিভারি মাত্র ২ দিনে পেয়েছি।" },
            { name: "ফারজানা আক্তার", rating: 5, date: "১০ জুন ২০২৬", comment: "লাইভ ছবির চেয়েও সামনাসামনি দেখতে বেশি সুন্দর। সেলাই অনেক নিখুঁত এবং সাইজ একদম ঠিকঠাক মিলেছে।" },
          ];
          setReviews(defaults);
        }
      })
      .catch((err) => {
        console.error("Failed to load live reviews:", err);
        const defaults = [
          { name: "তাসমিয়া রহমান", rating: 5, date: "১৮ জুন ২০২৬", comment: "ডিজাইনটা সত্যি অসাধারণ! কাপড় অনেক সফট এবং গরমের জন্য খুব আরামদায়ক। ডেলিভারি মাত্র ২ দিনে পেয়েছি।" },
          { name: "ফারজানা আক্তার", rating: 5, date: "১০ জুন ২০২৬", comment: "লাইভ ছবির চেয়েও সামনাসামনি দেখতে বেশি সুন্দর। সেলাই অনেক নিখুঁত এবং সাইজ একদম ঠিকঠাক মিলেছে।" },
        ];
        setReviews(defaults);
      });
  }, [product.id]);

  // Fetch related products from the same category
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const related = data
            .filter((p: any) => p.category === (product as any).category && p.id !== product.id)
            .slice(0, 4)
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              imgUrl: p.imgUrl,
              category: p.category,
            }));
          setRelatedProducts(related);
        }
      })
      .catch(() => {});
  }, [product.id]);

  // Scroll listener to show sticky mobile bar when main buttons scroll off screen
  useEffect(() => {
    const handleScroll = () => {
      const buyButton = document.getElementById("main-buy-buttons");
      if (buyButton) {
        const rect = buyButton.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Search redirection logic: redirect typing search to the home page
  useEffect(() => {
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  }, [searchQuery, router]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastActive(true);
    setTimeout(() => setToastActive(false), 2000);
  };

  const handleAddBag = () => {
    addToCart(product, quantity, selectedSize);
    showToast(`"${product.name}" (${selectedSize}) x${toBanglaNumber(quantity)} ব্যাগে যোগ করা হয়েছে!`);
    setCartDrawerOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize);
    router.push("/checkout");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("পণ্য লিঙ্ক কপি করা হয়েছে!");
  };

  // WhatsApp order text generation
  const handleWhatsAppOrder = () => {
    const text = `আসসালামু আলাইকুম তানহা ফ্যাশন। আমি "${product.name}" (সাইজ: ${selectedSize}, পরিমাণ: ${quantity}) অর্ডার করতে চাই। পণ্যের মূল্য: ${activePriceDisplay}। লিঙ্ক: ${window.location.href}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/8801700000000?text=${encodedText}`, "_blank");
  };

  // Helper to convert date to Bangla representation
  const toBanglaDate = (date: Date) => {
    const months = [
      "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
      "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
    ];
    const day = toBanglaNumber(date.getDate());
    const month = months[date.getMonth()];
    const year = toBanglaNumber(date.getFullYear());
    return `${day} ${month} ${year}`;
  };

  // Review submission handler
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim()) {
      showToast("দয়া করে আপনার নাম লিখুন!");
      return;
    }
    if (!newReviewComment.trim()) {
      showToast("দয়া করে আপনার রিভিউ মন্তব্য লিখুন!");
      return;
    }

    const payload = {
      productId: product.id,
      name: newReviewName.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim()
    };

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save review");
        return res.json();
      })
      .then((savedReview) => {
        const newRev = {
          name: savedReview.name,
          rating: savedReview.rating,
          date: new Date(savedReview.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" }),
          comment: savedReview.comment
        };
        setReviews((prev) => [newRev, ...prev]);
        showToast("রিভিউটি সফলভাবে যুক্ত হয়েছে! ধন্যবাদ।");
        setNewReviewName("");
        setNewReviewComment("");
        setNewReviewRating(5);
      })
      .catch((err) => {
        console.error("Failed to submit review to server, saving locally as fallback:", err);
        const newRev = {
          name: newReviewName.trim(),
          rating: newReviewRating,
          date: toBanglaDate(new Date()),
          comment: newReviewComment.trim()
        };
        const updatedReviews = [newRev, ...reviews];
        setReviews(updatedReviews);
        localStorage.setItem(`reviews_${product.id}`, JSON.stringify(updatedReviews));
        showToast("রিভিউটি সফলভাবে যুক্ত হয়েছে! ধন্যবাদ।");
        setNewReviewName("");
        setNewReviewComment("");
        setNewReviewRating(5);
      });
  };

  // Dynamic pricing calculation based on sizePricesJson
  const getPriceForSize = (size: string) => {
    const p = product as any;
    if (p.sizePricesJson) {
      try {
        const sizePrices = typeof p.sizePricesJson === 'string' 
          ? JSON.parse(p.sizePricesJson) 
          : p.sizePricesJson;
        if (sizePrices && sizePrices[size] !== undefined && sizePrices[size] !== null && Number(sizePrices[size]) > 0) {
          return Number(sizePrices[size]);
        }
      } catch (e) {}
    }
    return product.price;
  };

  const activePrice = getPriceForSize(selectedSize);
  const activePriceDisplay = formatBanglaPriceWithCommas(activePrice);
  const originalPrice = Math.round(activePrice * 1.25);
  const discountPercentStr = toBanglaNumber(20);



  // Helper to map category/loc to homepage section index
  const getCategoryIndex = (loc: string) => {
    switch (loc) {
      case "সুতি থ্রি-পিস": return 2;
      case "জর্জেট থ্রি-পিস": return 3;
      case "লিলেন থ্রি-পিস": return 4;
      case "ক্যাজুয়াল আবায়া": return 5;
      case "উৎসবের বোরকা": return 6;
      case "কম্বো সেট": return 7;
      default: return 0;
    }
  };

  // Product structured JSON-LD data for AEO & SEO
  const productImageUrl = product.img.src.startsWith("http")
    ? product.img.src
    : `https://tanhafashion.com${product.img.src}`;
  
  const isOutOfStock = product.tag === "স্টক শেষ";
  const availability = isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock";

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [productImageUrl],
    "description": product.desc || `${product.name} - Premium Quality Collection`,
    "sku": (product as any).sku || product.id,
    "brand": {
      "@type": "Brand",
      "name": "তানহা ফ্যাশন"
    },
    "offers": {
      "@type": "Offer",
      "url": typeof window !== "undefined" ? window.location.href : `https://tanhafashion.com/products/${product.id}`,
      "priceCurrency": "BDT",
      "price": activePrice,
      "priceValidUntil": "2030-12-31",
      "availability": availability,
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  return (
    <div className="grain-bg min-h-screen pb-24 md:pb-8">
      {/* Product JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      {/* Announcement offer bar */}
      <AnnouncementBar scrollToSection={(index) => router.push(`/?sec=${index}`)} />

      {/* Main Navbar */}
      <Navbar 
        cartCount={cartCount} 
        onOpenMenu={() => setMenuDrawerOpen(true)}
        onOpenCart={() => setCartDrawerOpen(true)}
        scrollToSection={(index) => router.push(`/?sec=${index}`)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="max-w-[1440px] mx-auto px-4 md:px-12 py-10">
        {/* Breadcrumb Path */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap py-1">
          <Link href="/" className="hover:text-primary transition-colors">হোম</Link>
          <ChevronRight size={12} className="flex-shrink-0" />
          <Link 
            href={`/?sec=${getCategoryIndex(product.loc)}`} 
            className="hover:text-primary transition-colors"
          >
            {product.loc}
          </Link>
          <ChevronRight size={12} className="flex-shrink-0" />
          <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* Product details grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left Column: Image Gallery Container */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="relative aspect-[3/4] w-full bg-secondary overflow-hidden rounded-lg border border-border shadow-sm group">
              <Image 
                src={product.img?.src || product.img} 
                alt={product.name} 
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover transition-transform duration-500 hover:scale-108 cursor-zoom-in animate-fade-in"
                priority
              />
              {/* Product tag badge */}
              {product.tag && (
                <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold py-1 px-3.5 rounded-full tracking-wider shadow-sm uppercase">
                  {product.tag}
                </span>
              )}
            </div>

            {/* Quick Share buttons */}
            <div className="flex items-center justify-between bg-card border border-border/80 p-4 rounded-xl shadow-xs">
              <span className="text-xs font-bold text-foreground flex items-center gap-1">
                <Share2 size={13} className="text-primary" /> শেয়ার করুন:
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={handleCopyLink} 
                  className="flex items-center gap-1.5 text-[11px] font-bold bg-secondary hover:bg-ink/5 text-foreground py-2 px-4 border border-border rounded-full cursor-pointer transition-colors"
                  title="Copy product link"
                >
                  <Copy size={12} /> লিঙ্ক কপি
                </button>
                <button 
                  onClick={handleWhatsAppOrder} 
                  className="flex items-center gap-1.5 text-[11px] font-bold bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-full border-none cursor-pointer transition-colors"
                >
                  <MessageCircle size={12} /> হোয়াটসঅ্যাপ
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Order specifications form */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Title & Tags */}
            <div>
              <span className="inline-block text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2">
                {product.loc} কালেকশন
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display text-foreground leading-[1.2] tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span>কোড: <strong className="text-foreground">{toBanglaNumber(product.numericId)}</strong></span>
                <span className="text-border">|</span>
                {currentStock > 0 ? (
                  <span className="text-green-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    স্টকে আছে ({toBanglaNumber(currentStock)} টি)
                  </span>
                ) : (
                  <span className="text-rose-500 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    স্টক শেষ (Out of Stock)
                  </span>
                )}
              </div>
            </div>

            {/* Price Segment */}
            <div className="bg-secondary/40 dark:bg-card p-5 rounded-xl border border-border/80 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-primary font-display">
                    {activePriceDisplay}
                  </span>
                  <span className="text-base sm:text-lg text-muted-foreground line-through decoration-red-500 font-medium">
                    {formatBanglaPriceWithCommas(originalPrice)}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">ভ্যাট ও ট্যাক্স অন্তর্ভুক্ত</p>
              </div>
              <div className="bg-primary/10 border border-primary/20 text-primary py-1.5 px-4 rounded-full text-xs font-extrabold uppercase tracking-wide">
                সঞ্চয় {discountPercentStr}%
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {product.desc} আমাদের এক্সক্লুসিভ বুনন এবং ডিজাইনার কাজের দ্বারা প্রস্তুত করা হয়েছে। জামা, ওড়না ও সালোয়ারের কম্বিনেশনে তৈরি পোশাকটি যেকোনো ক্যাজুয়াল বা পার্পল আমেজে উৎসবমুখর আবহ ফুটিয়ে তুলবে।
              </p>
            </div>

            {/* Size Selector */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-bold text-foreground">সাইজ নির্বাচন করুন:</span>
                <button 
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs text-primary font-semibold hover:underline cursor-pointer flex items-center gap-1 bg-transparent border-none"
                >
                  <Info size={12} /> সাইজ গাইড
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const sizeStock = getStockForSize(size);
                  const isOutOfStock = sizeStock <= 0;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => !isOutOfStock && setSelectedSize(size)}
                      disabled={isOutOfStock}
                      className={`w-12 h-12 text-xs sm:text-sm font-bold border transition-all flex items-center justify-center rounded relative ${
                        isOutOfStock
                          ? "bg-secondary/40 border-border text-muted-foreground/45 cursor-not-allowed line-through"
                          : selectedSize === size
                            ? "bg-foreground text-background border-foreground shadow-md cursor-pointer"
                            : "bg-background border-border text-foreground hover:border-primary/50 cursor-pointer"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex flex-col gap-3">
              <span className="text-xs sm:text-sm font-bold text-foreground">পরিমাণ:</span>
              <div className="flex items-center border border-border rounded w-fit bg-background p-1">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 border-none bg-transparent cursor-pointer flex items-center justify-center text-foreground hover:bg-secondary rounded transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-extrabold select-none">{toBanglaNumber(quantity)}</span>
                <button 
                  onClick={() => {
                    if (quantity < currentStock) {
                      setQuantity(prev => prev + 1);
                    } else {
                      showToast(`দুঃখিত, সর্বোচ্চ উপলব্ধ স্টক: ${toBanglaNumber(currentStock)} টি`);
                    }
                  }}
                  className="w-10 h-10 border-none bg-transparent cursor-pointer flex items-center justify-center text-foreground hover:bg-secondary rounded transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Buy Buttons */}
            <div id="main-buy-buttons" className="flex flex-col sm:flex-row gap-3 pt-2">
              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={currentStock <= 0}
                className="flex-1 bg-primary hover:bg-primary/95 text-white border-none py-4 px-6 rounded-full font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-95 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <ShoppingBag size={18} />
                <span>{currentStock <= 0 ? "স্টক নেই" : "এখনই কিনুন"}</span>
              </button>
              {/* Add to Bag */}
              <button
                onClick={handleAddBag}
                disabled={currentStock <= 0}
                className="flex-1 bg-background hover:bg-secondary text-foreground border border-border py-4 px-6 rounded-full font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed"
              >
                <span>ব্যাগে রাখুন</span>
              </button>
              {/* Wishlist Icon */}
              <button 
                onClick={() => {
                  setIsFavorite(!isFavorite);
                  showToast(isFavorite ? "প্রিয় তালিকা থেকে বাদ দেওয়া হয়েছে" : "প্রিয় তালিকায় যুক্ত করা হয়েছে");
                }}
                className={`p-4 border rounded-full flex items-center justify-center cursor-pointer transition-colors bg-background ${isFavorite ? "text-primary border-primary/40 bg-primary/5" : "text-muted-foreground border-border hover:border-primary/50"}`}
                aria-label="Add to wishlist"
              >
                <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Call to Order Indicator Banner */}
            <div className="bg-secondary/40 border border-border/80 p-4 rounded-xl flex items-center justify-between gap-4 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Phone size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">ফোনে অর্ডারের সুবিধা</h4>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">সরাসরি ফোন করে সহজেই অর্ডার প্লেস করুন।</p>
                </div>
              </div>
              <a 
                href="tel:09612345678" 
                className="no-underline py-2.5 px-5 bg-foreground hover:bg-primary text-background hover:text-white rounded-full text-xs font-bold transition-all text-center cursor-pointer"
              >
                কল করুন: ০৯৬১২-৩৪৫৬৭৮
              </a>
            </div>

            {/* Local Trust Badges */}
            <div className="grid grid-cols-3 gap-2 py-5 border-y border-border/60 text-center my-3">
              <div className="flex flex-col items-center gap-1.5 p-1">
                <ShieldCheck size={22} className="text-primary" />
                <span className="text-[10px] sm:text-xs font-bold text-foreground leading-tight">১০০% ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-1">
                <RotateCcw size={22} className="text-primary" />
                <span className="text-[10px] sm:text-xs font-bold text-foreground leading-tight">৩ দিনে সহজ রিটার্ন</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-1">
                <Truck size={22} className="text-primary" />
                <span className="text-[10px] sm:text-xs font-bold text-foreground leading-tight">৭২ ঘণ্টায় দেশব্যাপী শিপিং</span>
              </div>
            </div>

            {/* Accordion list details */}
            <div className="flex flex-col border border-border rounded-lg overflow-hidden bg-card mt-1">
              {/* Panel 1 */}
              <div className="border-b border-border">
                <button
                  onClick={() => setOpenAccordion(openAccordion === "description" ? null : "description")}
                  className="w-full flex items-center justify-between p-4 bg-transparent border-none text-left font-bold text-xs sm:text-sm text-foreground cursor-pointer hover:bg-secondary/20 transition-colors"
                >
                  <span>কাপড়ের বিবরণ ও বৈশিষ্ট্য</span>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-200 ${openAccordion === "description" ? "rotate-180" : ""}`} 
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openAccordion === "description" ? "max-h-[300px] border-t border-border p-4" : "max-h-0"}`}>
                  <ul className="text-xs sm:text-sm text-muted-foreground list-disc pl-4 flex flex-col gap-2">
                    <li>১০০% প্রিমিয়াম সুতি ও জর্জেট ফ্যাব্রিকে তৈরি অত্যন্ত আরামদায়ক ও নিখুঁত ফিনিশিং।</li>
                    <li>ওড়না: বড় ও সেমি-স্ট্রেচড ফ্যাব্রিক, সহজে পরার জন্য উপযোগী।</li>
                    <li>সালোয়ার: আরামদায়ক ফিটিং এবং নিখুঁত স্টিচিং ফ্যাব্রিকেশন।</li>
                    <li>আরামদায়ক বুনন যা দৈনন্দিন ব্যবহারের জন্য এবং গরমের আমেজে একদম উপযোগী।</li>
                  </ul>
                </div>
              </div>

              {/* Panel 2 */}
              <div className="border-b border-border">
                <button
                  onClick={() => setOpenAccordion(openAccordion === "care" ? null : "care")}
                  className="w-full flex items-center justify-between p-4 bg-transparent border-none text-left font-bold text-xs sm:text-sm text-foreground cursor-pointer hover:bg-secondary/20 transition-colors"
                >
                  <span>ধৌতকরণ ও যত্ন নির্দেশিকা</span>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-200 ${openAccordion === "care" ? "rotate-180" : ""}`} 
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openAccordion === "care" ? "max-h-[300px] border-t border-border p-4" : "max-h-0"}`}>
                  <ul className="text-xs sm:text-sm text-muted-foreground list-disc pl-4 flex flex-col gap-2">
                    <li>প্রথমবার ওয়াশ করার ক্ষেত্রে হ্যান্ড ওয়াশ করার পরামর্শ রইলো।</li>
                    <li>মাইল্ড ডিটারজেন্ট ব্যবহার করুন, ব্লিচিং পাউডার বর্জন করুন।</li>
                    <li>ছায়াযুক্ত স্থানে শুকিয়ে রাখুন যাতে কাপড়ের রঙের উজ্জ্বলতা বজায় থাকে।</li>
                    <li>মাঝারি তাপে ইস্ত্রি (Iron) করুন।</li>
                  </ul>
                </div>
              </div>

              {/* Panel 3 */}
              <div>
                <button
                  onClick={() => setOpenAccordion(openAccordion === "shipping" ? null : "shipping")}
                  className="w-full flex items-center justify-between p-4 bg-transparent border-none text-left font-bold text-xs sm:text-sm text-foreground cursor-pointer hover:bg-secondary/20 transition-colors"
                >
                  <span>ডেলিভারি ও রিটার্ন পলিসি</span>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-200 ${openAccordion === "shipping" ? "rotate-180" : ""}`} 
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openAccordion === "shipping" ? "max-h-[300px] border-t border-border p-4" : "max-h-0"}`}>
                  <ul className="text-xs sm:text-sm text-muted-foreground list-disc pl-4 flex flex-col gap-2">
                    <li>ঢাকা সিটির ভেতর ডেলিভারি চার্জ ৮০ টাকা (১-২ দিন)।</li>
                    <li>ঢাকা সিটির বাইরে ডেলিভারি চার্জ ১৫০ টাকা (২-৩ দিন)।</li>
                    <li>সাইজ বা পণ্যে কোনো সমস্যা থাকলে ৩ দিনের মধ্যে সহজে এক্সচেঞ্জ বা রিটার্ন করুন।</li>
                    <li>ডেলিভারিম্যানের সামনে পণ্য চেক করে রিসিভ করার অনুরোধ রইলো।</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Interactive Reviews Section */}
            <div className="bg-card border border-border p-5 rounded-lg shadow-xs mt-2">
              <h3 className="text-sm font-bold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-1.5 font-display">
                ক্রেতাদের প্রতিক্রিয়া ({toBanglaNumber(reviews.length)})
              </h3>
              
              {/* Review Form */}
              <form onSubmit={handleReviewSubmit} className="bg-secondary/20 p-4 rounded-lg border border-border/80 mb-6 flex flex-col gap-3">
                <span className="text-xs font-bold text-foreground font-display block">আপনার মতামত দিন (Write a Review)</span>
                
                {/* Rating Input (Stars) */}
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-muted-foreground mr-1">রেটিং:</span>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isLit = hoverRating !== null ? star <= hoverRating : star <= newReviewRating;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewReviewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="bg-transparent border-none p-0.5 cursor-pointer text-amber-400 transition-transform duration-100 hover:scale-110"
                      >
                        <Star size={16} fill={isLit ? "currentColor" : "none"} />
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    placeholder="আপনার নাম লিখুন *"
                    className="w-full bg-background border border-border py-2 px-3 rounded text-base sm:text-xs outline-none text-foreground placeholder-muted-foreground focus:border-primary transition-all"
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <textarea
                    placeholder="আপনার মন্তব্য লিখুন *"
                    rows={3}
                    className="w-full bg-background border border-border py-2 px-3 rounded text-base sm:text-xs outline-none text-foreground placeholder-muted-foreground focus:border-primary transition-all resize-none"
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white border-none py-2 px-4 rounded-full text-[11px] font-bold transition-all duration-300 w-fit self-end cursor-pointer shadow-xs active:scale-95"
                >
                  রিভিউ জমা দিন
                </button>
              </form>

              {/* Reviews List */}
              <div className="flex flex-col gap-4">
                {reviews.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">এই পণ্যের জন্য এখনও কোনো রিভিউ দেওয়া হয়নি। প্রথম রিভিউটি আপনিই দিন!</p>
                ) : (
                  reviews.map((rev, index) => (
                    <div key={index} className="flex flex-col gap-1.5 text-xs pb-4 border-b border-border/40 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-foreground">{rev.name}</span>
                        <span className="text-[10px] text-muted-foreground">{rev.date}</span>
                      </div>
                      {/* Stars */}
                      <div className="flex text-amber-400 text-xs">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={12} 
                            fill={star <= rev.rating ? "currentColor" : "none"} 
                            className="mr-0.5"
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground leading-relaxed mt-1">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 border-t border-border pt-12">
            <div className="flex justify-between items-baseline mb-8">
              <div>
                <span className="text-xs text-primary font-bold tracking-widest block uppercase mb-1">RECOMMENDED ITEMS</span>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground font-display">সম্পর্কিত অন্যান্য পণ্যসমূহ</h2>
              </div>
              <Link 
                href={`/?sec=${getCategoryIndex(product.loc)}`} 
                className="text-xs text-primary font-bold hover:underline"
              >
                সবগুলো দেখুন
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-background border border-border/60 hover:border-primary/50 rounded overflow-hidden flex flex-col justify-between group transition-all duration-300 shadow-sm hover:shadow-lg"
                >
                  <Link href={`/products/${prod.id}`} className="relative aspect-[3/4] bg-secondary overflow-hidden w-full block cursor-pointer">
                    <Image
                      src={prod.img?.src || prod.img}
                      alt={prod.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {prod.tag && (
                      <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[9px] sm:text-[10px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wider shadow-sm">
                        {prod.tag}
                      </span>
                    )}
                  </Link>

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
                          onClick={() => {
                            addToCart(prod, 1, "M");
                            showToast(`"${prod.name}" (M) ব্যাগ-এ যুক্ত করা হয়েছে!`);
                          }}
                          className="flex-grow bg-secondary hover:bg-secondary-foreground/10 text-foreground border border-border/80 py-1.5 px-2 rounded-sm text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ShoppingBag size={11} />
                          <span className="hidden sm:inline">ব্যাগে রাখুন</span>
                        </button>
                        <button
                          onClick={() => {
                            addToCart(prod, 1, "M");
                            router.push("/checkout");
                          }}
                          className="flex-grow bg-primary hover:bg-primary/95 text-white border-none py-1.5 px-2 rounded-sm text-[10px] font-bold transition-colors flex items-center justify-center cursor-pointer"
                        >
                          কিনুন
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Sizing Guide Dialog Overlay */}
      {sizeGuideOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[15000] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSizeGuideOpen(false)}
        >
          <div 
            className="bg-background border border-border rounded-lg shadow-2xl p-6 max-w-[500px] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
              <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-1.5 font-display">
                <Info size={18} className="text-primary" /> সাইজ গাইড (Size Measurement Guide)
              </h3>
              <button 
                onClick={() => setSizeGuideOpen(false)}
                className="bg-transparent border-none text-foreground font-semibold text-lg cursor-pointer hover:opacity-75"
              >
                ✕
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-secondary/60 text-foreground border-b border-border">
                    <th className="py-2.5 px-3 text-left font-bold">সাইজ (Size)</th>
                    <th className="py-2.5 px-3 text-center font-bold">বুক (Chest)</th>
                    <th className="py-2.5 px-3 text-center font-bold">লম্বা (Length)</th>
                    <th className="py-2.5 px-3 text-center font-bold">কাঁধ (Shoulder)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border hover:bg-secondary/10">
                    <td className="py-2 px-3 font-semibold">S</td>
                    <td className="py-2 px-3 text-center">৩৬" (ইঞ্চি)</td>
                    <td className="py-2 px-3 text-center">৩৮" (ইঞ্চি)</td>
                    <td className="py-2 px-3 text-center">১৪" (ইঞ্চি)</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-secondary/10">
                    <td className="py-2 px-3 font-semibold">M</td>
                    <td className="py-2 px-3 text-center">৩৮" (ইঞ্চি)</td>
                    <td className="py-2 px-3 text-center">৪০" (ইঞ্চি)</td>
                    <td className="py-2 px-3 text-center">১৪.৫" (ইঞ্চি)</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-secondary/10">
                    <td className="py-2 px-3 font-semibold">L</td>
                    <td className="py-2 px-3 text-center">৪০" (ইঞ্চি)</td>
                    <td className="py-2 px-3 text-center">৪২" (ইঞ্চি)</td>
                    <td className="py-2 px-3 text-center">১৫" (ইঞ্চি)</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-secondary/10">
                    <td className="py-2 px-3 font-semibold">XL</td>
                    <td className="py-2 px-3 text-center">৪২" (ইঞ্চি)</td>
                    <td className="py-2 px-3 text-center">৪৪" (ইঞ্চি)</td>
                    <td className="py-2 px-3 text-center">১৫.৫" (ইঞ্চি)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-muted-foreground mt-4 italic">
              * মাপসমূহ ১-২ সেমি কম/বেশি হতে পারে। আপনার সঠিক ফিটিংস নিশ্চিত করে অর্ডার করুন।
            </p>
          </div>
        </div>
      )}

      {/* Sticky Bottom Actions Bar (Mobile Only, shown when scrolled past main buy buttons) */}
      <div 
        className={`fixed bottom-[68px] left-0 right-0 z-[1400] bg-background/95 backdrop-blur-md border-t border-border flex items-center justify-between p-3 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-transform duration-300 ${
          showStickyBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center gap-2 max-w-[50%]">
          <Image 
            src={product.img?.src || product.img} 
            alt={product.name} 
            width={40}
            height={52}
            className="object-cover rounded bg-card flex-shrink-0" 
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-foreground truncate">{product.name}</h4>
            <div className="flex gap-1.5 items-baseline">
              <span className="text-xs font-extrabold text-primary">{activePriceDisplay}</span>
              <span className="text-[10px] text-muted-foreground font-semibold">({selectedSize})</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1.5 flex-grow justify-end pl-2">
          {/* Quick Add icon */}
          <button
            onClick={handleAddBag}
            className="bg-secondary border border-border text-foreground hover:bg-ink/5 p-2.5 rounded cursor-pointer"
            aria-label="Add to bag"
          >
            <ShoppingBag size={16} />
          </button>
          {/* Buy Now text */}
          <button
            onClick={handleBuyNow}
            className="bg-primary hover:bg-primary/95 text-white border-none py-2.5 px-4 rounded-full text-xs font-extrabold cursor-pointer"
          >
            এখনই কিনুন
          </button>
        </div>
      </div>

      {/* Slide drawers and notifications */}
      <MobileMenuDrawer 
        isOpen={menuDrawerOpen}
        onClose={() => setMenuDrawerOpen(false)}
        activeSection={0}
        scrollToSection={(index) => router.push(`/?sec=${index}`)}
      />
      <CartDrawer showToast={showToast} />
      <ToastNotification isActive={toastActive} message={toastMsg} />

      {/* Mobile-only layout bottom sticky nav tabs */}
      <MobileTabBar 
        activeSection={99}
        cartCount={cartCount}
        cartDrawerOpen={cartDrawerOpen}
        scrollToSection={(index) => router.push(`/?sec=${index}`)}
        setCartDrawerOpen={setCartDrawerOpen}
        showToast={showToast}
      />

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 md:px-12 py-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground mb-1">আরও দেখুন</div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display">একই <span className="text-primary">ক্যাটাগরি</span>র পোশাক</h2>
            </div>
            <Link href={`/categories?type=${encodeURIComponent((product as any).category || '')}`} className="text-xs font-bold text-primary hover:underline no-underline">
              সব দেখুন →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((rp) => (
              <Link
                key={rp.id}
                href={`/products/${rp.id}`}
                className="group block bg-background border border-border/60 hover:border-primary/40 rounded overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 no-underline hover:-translate-y-1"
              >
                <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
                  <Image
                    src={rp.imgUrl || '/assets/cotton_1.png'}
                    alt={rp.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{rp.name}</h3>
                  <p className="text-xs font-extrabold text-foreground mt-1">৳ {rp.price?.toLocaleString('bn-BD')}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter & Global Footer */}
      <Cta scrollToSection={(index) => router.push(`/?sec=${index}`)} />
    </div>
  );
}
