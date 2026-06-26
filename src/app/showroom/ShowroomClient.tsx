"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { 
  MapPin, 
  Phone, 
  Clock, 
  Sparkles, 
  CheckCircle, 
  CreditCard, 
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Scissors
} from "lucide-react";

// Layout components
import Navbar from "@/components/layout/Navbar";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import MobileTabBar from "@/components/layout/MobileTabBar";
import MobileMenuDrawer from "@/components/layout/MobileMenuDrawer";
import CartDrawer from "@/components/layout/CartDrawer";
import Cta from "@/components/sections/Cta";
import ToastNotification from "@/components/overlays/ToastNotification";

// Import Showroom mock interior banner
import showroomOutletBanner from "@/assets/showroom_banner.png";

export default function ShowroomClient() {
  const router = useRouter();
  const { cartCount, cartDrawerOpen, setCartDrawerOpen } = useCart();

  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastActive, setToastActive] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastActive(true);
    setTimeout(() => setToastActive(false), 2000);
  };

  // Redirect search requests
  useEffect(() => {
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  }, [searchQuery, router]);

  const showroomOutlets = [
    {
      name: "মিরপুর শোরুম আউটলেট",
      city: "Dhaka",
      address: "শপ নং ২০২, লেভেল ২, মিরপুর শপিং সেন্টার, মিরপুর-১, ঢাকা-১২১৬।",
      phone: "০৯৬১২-৩৪৫৬৭৮",
      timings: "সকাল ১০:০০ টা - রাত ৯:০০ টা",
      holiday: "বুধবার (সাপ্তাহিক বন্ধ)",
      hotline: "tel:09612345678"
    },
    {
      name: "উত্তরা শোরুম আউটলেট",
      city: "Dhaka",
      address: "হাউজ ১৫, রোড ৭, সেক্টর ৩, উত্তরা, ঢাকা-১২৩০।",
      phone: "০৯৬১২-৮৭৬৫৪৩",
      timings: "সকাল ১০:০০ টা - রাত ৯:০০ টা",
      holiday: "বুধবার (সাপ্তাহিক বন্ধ)",
      hotline: "tel:09612876543"
    }
  ];

  const perks = [
    {
      icon: <Sparkles className="text-primary" size={24} />,
      title: "আরামদায়ক ট্রায়াল রুম",
      desc: "আমাদের আউটলেটে পছন্দসই পোশাক ট্রায়াল দিয়ে সঠিক সাইজ যাচাই করে সংগ্রহ করার সুবিধা রয়েছে।"
    },
    {
      icon: <Scissors className="text-primary" size={24} />,
      title: "ইনস্ট্যান্ট সাইজ অল্টারেশন",
      desc: "সংগৃহীত পোশাকের হাতা, ঝুল বা ফিটিংস সাথে সাথে টেইলরিং এক্সপার্ট দ্বারা নিখুঁতভাবে অল্টার করে দেওয়া হয়।"
    },
    {
      icon: <CreditCard className="text-primary" size={24} />,
      title: "নমনীয় পেমেন্ট পদ্ধতি",
      desc: "ক্যাশ ছাড়াও সব ধরণের ভিসা, মাস্টারকার্ড এবং মোবাইল ফিনান্সিয়াল সার্ভিস (বিকাশ, নগদ) পেমেন্ট গ্রহণযোগ্য।"
    },
    {
      icon: <RotateCcw className="text-primary" size={24} />,
      title: "৩ দিনে সহজ এক্সচেঞ্জ",
      desc: "আউটলেট থেকে কেনা পোশাকের সাইজ বা কালারে সমস্যা থাকলে ৩ দিনের মধ্যে মেমো সহ এসে পরিবর্তন করতে পারবেন।"
    }
  ];

  return (
    <div className="grain-bg min-h-screen pb-20 md:pb-0 font-sans text-foreground">
      {/* Top Offer Announcement */}
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
          <span className="text-foreground font-semibold">শোরুম আউটলেট</span>
        </nav>

        {/* Header Title */}
        <div className="mb-8 border-b border-border/80 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight">আউটলেট ও শোরুম লোকেশন</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">সরাসরি আমাদের আউটলেটে এসে কাপড় পরখ করে চমৎকার শপিংয়ের অভিজ্ঞতা নিন।</p>
        </div>

        {/* Hero image display */}
        <div className="relative w-full h-[220px] sm:h-[280px] md:h-[360px] lg:h-[420px] overflow-hidden rounded-2xl mb-12 shadow-md border border-border">
          <Image 
            src="/assets/showroom_outlet.png" 
            alt="তানহা ফ্যাশন শোরুম" 
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-700 hover:scale-101" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6 sm:p-12 text-white">
            <span className="text-xs sm:text-sm font-bold text-primary uppercase tracking-[0.2em] mb-2">VISIT TANHA FASHION OUTLETS</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display leading-tight">আভিজাত্য আর আরামের নিখুঁত মেলবন্ধন</h2>
            <p className="text-xs sm:text-sm text-zinc-200 mt-2 max-w-xl opacity-90 leading-relaxed">আমাদের আউটলেটগুলোতে চমৎকার ও মার্জিত পরিবেশে সাজানো রয়েছে প্রিমিয়াম সুতি, জর্জেট, লিনেন ও আভিজাত্যময় উৎসবের বোরকা সম্ভার।</p>
          </div>
        </div>

        {/* Outlets Listing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {showroomOutlets.map((outlet, index) => (
            <div 
              key={index} 
              className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-block mb-3.5">
                  Dhaka Outlet
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-foreground font-display mb-4">{outlet.name}</h3>
                
                <div className="flex flex-col gap-3.5 text-xs text-muted-foreground font-semibold">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-primary flex-shrink-0 mt-0.5" size={16} />
                    <span className="text-foreground leading-relaxed">{outlet.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="text-primary flex-shrink-0" size={16} />
                    <span>প্রতিদিন: {outlet.timings} <strong className="text-primary">({outlet.holiday})</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="text-primary flex-shrink-0" size={16} />
                    <span className="font-mono text-foreground">{outlet.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-border/60 pt-6 flex gap-3">
                <a 
                  href={outlet.hotline}
                  className="flex-1 text-center py-2.5 px-4 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs transition-colors border-none no-underline flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Phone size={13} />
                  <span>কল করুন</span>
                </a>
                <a 
                  href="https://maps.google.com" 
                  target="_blank"
                  className="flex-1 text-center py-2.5 px-4 bg-secondary hover:bg-secondary-foreground/10 border border-border text-foreground font-bold rounded-xl text-xs transition-colors no-underline flex items-center justify-center gap-1.5"
                >
                  <MapPin size={13} />
                  <span>গুগল ম্যাপ</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Boutique Services perks section */}
        <section className="border-t border-border/60 pt-16 mb-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs text-primary font-bold tracking-widest uppercase mb-2 block">STORE FEATURES</span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground leading-tight">শোরুম থেকে কেনাকাটার বিশেষ সুবিধাসমূহ</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-medium">আমরা গ্রাহকদের শোরুমে এসে নিখুঁত ফিটিং ও সর্বোচ্চ কোয়ালিটি যাচাই করে সেরা পোশাকটি বেছে নেওয়ার নিশ্চয়তা প্রদান করি।</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((p, idx) => (
              <div 
                key={idx} 
                className="bg-card border border-border/80 rounded-2xl p-5 shadow-2xs hover:-translate-y-0.5 transition-transform duration-300 flex flex-col gap-3"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  {p.icon}
                </div>
                <h4 className="text-sm font-bold text-foreground font-display mt-1">{p.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer & Drawers */}
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
