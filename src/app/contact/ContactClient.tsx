"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  ChevronRight, 
  MessageSquare, 
  Facebook, 
  Youtube, 
  CheckCircle,
  HelpCircle
} from "lucide-react";

// Layout components
import Navbar from "@/components/layout/Navbar";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import MobileTabBar from "@/components/layout/MobileTabBar";
import MobileMenuDrawer from "@/components/layout/MobileMenuDrawer";
import CartDrawer from "@/components/layout/CartDrawer";
import Cta from "@/components/sections/Cta";
import ToastNotification from "@/components/overlays/ToastNotification";

export default function ContactClient() {
  const router = useRouter();
  const { cartCount, cartDrawerOpen, setCartDrawerOpen } = useCart();

  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastActive, setToastActive] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Form States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastActive(true);
    setTimeout(() => setToastActive(false), 2000);
  };

  // Redirect search requests to homepage search param
  useEffect(() => {
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  }, [searchQuery, router]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      showToast("দয়া করে প্রয়োজনীয় সব ক্ষেত্র পূরণ করুন।");
      return;
    }

    setIsSubmitting(true);
    // Simulate API request submission
    setTimeout(() => {
      setIsSubmitting(false);
      showToast("আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে!");
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    }, 1200);
  };

  const handleScrollToSection = (idx: number) => {
    router.push(`/?sec=${idx}`);
  };

  return (
    <div className="grain-bg min-h-screen pb-20 md:pb-0 font-sans text-foreground flex flex-col justify-between">
      <div>
        {/* Top Offer Announcement */}
        <AnnouncementBar scrollToSection={handleScrollToSection} />

        {/* Main Navbar */}
        <Navbar 
          cartCount={cartCount} 
          onOpenMenu={() => setMenuDrawerOpen(true)}
          onOpenCart={() => setCartDrawerOpen(true)}
          scrollToSection={handleScrollToSection}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="max-w-[1200px] w-full mx-auto px-4 md:px-8 py-10">
          
          {/* Breadcrumb Path */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap py-1">
            <Link href="/" className="hover:text-primary transition-colors no-underline">হোম</Link>
            <ChevronRight size={12} className="flex-shrink-0" />
            <span className="text-foreground font-semibold">যোগাযোগ করুন</span>
          </nav>

          {/* Header Title Banner */}
          <div className="mb-10 text-left space-y-2 border-b border-border/80 pb-6">
            <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-widest px-3.5 py-1.5 rounded-full border border-primary/20 inline-flex items-center gap-1.5">
              <MessageSquare size={12} />
              <span>সহায়তা ও যোগাযোগ</span>
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display leading-tight tracking-tight text-foreground">
              আমাদের সাথে যোগাযোগ করুন
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              তানহা ফ্যাশন সবসময় গ্রাহকদের সাহায্য করতে প্রস্তুত। জামা বা অর্ডারের যেকোনো তথ্যের জন্য সরাসরি আমাদের কল করুন অথবা ফর্ম পূরণ করে বার্তা পাঠান।
            </p>
          </div>

          {/* Contact Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
            
            {/* Left Column: Contact details & Map (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Detail Card */}
              <div className="bg-white border border-border/85 p-6 rounded-3xl shadow-xs space-y-6 text-left">
                <h3 className="text-base font-extrabold text-foreground border-b border-border/40 pb-3 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-primary rounded-full"></span>
                  <span>যোগাযোগের মাধ্যম</span>
                </h3>

                <ul className="list-none p-0 m-0 space-y-5">
                  <li className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary border border-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Phone size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">২৪/৭ কাস্টমার কেয়ার</span>
                      <a href="tel:+8801863694027" className="text-foreground hover:text-primary text-sm font-extrabold transition-colors no-underline block mt-0.5">
                        +৮৮০ ১৮৬৩ ৬৯৪০২৭
                      </a>
                      <span className="text-[10px] text-muted-foreground/80 mt-0.5">প্রতিদিন (সকাল ১০:০০ - রাত ০৮:০০)</span>
                    </div>
                  </li>

                  <li className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary border border-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">অফিসিয়াল ইমেইল</span>
                      <a href="mailto:info@tanhafashion.com" className="text-foreground hover:text-primary text-xs font-semibold transition-colors no-underline block mt-1">
                        info@tanhafashion.com
                      </a>
                      <span className="text-[10px] text-muted-foreground/80 mt-0.5">যেকোনো মতামত বা বিজনেজ অফার পাঠাতে পারেন</span>
                    </div>
                  </li>

                  <li className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary border border-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">ফ্ল্যাগশিপ শোরুম</span>
                      <p className="text-muted-foreground/90 text-xs leading-relaxed mt-1 mb-0">
                        বক্তাবলী বাজার, গলি নং ২, শপ নং ৮৯/৯০, ফতুল্লা, নারায়ণগঞ্জ।
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary border border-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">শোরুম সময়সূচী</span>
                      <span className="text-foreground text-xs font-semibold mt-1">সকাল ১০:০০ টা - রাত ০৮:৩০ টা</span>
                      <span className="text-[10px] text-muted-foreground/80 mt-0.5">মঙ্গলবার (শোরুম অর্ধদিবস বন্ধ)</span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Mock Google Map Card */}
              <div className="bg-white border border-border/85 p-5 rounded-3xl shadow-xs text-left relative overflow-hidden">
                <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary" />
                  <span>আউটলেট মানচিত্র (বসুন্ধরা সিটি)</span>
                </h3>
                <div className="w-full h-44 bg-zinc-100 rounded-2xl relative overflow-hidden border border-border/60 flex items-center justify-center">
                  {/* Styled Grid Background Mocking Map */}
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                  
                  {/* Decorative Map Routes/Lines */}
                  <div className="absolute top-[30%] left-0 w-full h-[6px] bg-white border-y border-zinc-300 -rotate-12"></div>
                  <div className="absolute top-0 left-[40%] w-[6px] h-full bg-white border-x border-zinc-300 rotate-45"></div>
                  <div className="absolute top-[60%] left-0 w-full h-[6px] bg-white border-y border-zinc-300 rotate-6"></div>
                  
                  {/* Flagship Indicator Icon */}
                  <div className="absolute top-[48%] left-[46%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-ping absolute"></div>
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md relative z-10">
                      <MapPin size={16} />
                    </div>
                    <span className="bg-foreground text-white text-[9px] font-bold py-0.5 px-2 rounded-md shadow-sm mt-1 whitespace-nowrap relative z-10">তানহা ফ্যাশন শোরুম</span>
                  </div>

                  <div className="absolute bottom-2 right-2 bg-white/90 border border-border/60 py-1 px-2.5 rounded-lg text-[9px] font-semibold text-muted-foreground select-none">
                    Map Preview Mockup
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Premium Contact Form (7 cols on lg) */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-border/85 p-6 md:p-8 rounded-3xl shadow-xs text-left">
                <h3 className="text-base font-extrabold text-foreground border-b border-border/40 pb-3 mb-4 flex items-center gap-2">
                  <MessageSquare size={18} className="text-primary" />
                  <span>আমাদের সরাসরি মেসেজ লিখুন</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                  যেকোনো প্রোডাক্টের স্টক সম্পর্কিত অনুসন্ধান, অর্ডার রিফান্ড, এক্সচেঞ্জ পলিসি বা ড্রেসের ফিটিংস নিয়ে প্রশ্ন থাকলে সরাসরি বার্তা দিন। ২৪ ঘন্টার মধ্যে আমাদের টিম রিপ্লাই দেবে।
                </p>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">আপনার নাম (Full Name) *</label>
                    <input
                      type="text"
                      required
                      placeholder="মোঃ আসিফ রহমান"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#FCFAF7] border border-border py-3 px-4 rounded-xl text-base sm:text-xs outline-none text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-foreground mb-1 block">মোবাইল নম্বর (Phone Number) *</label>
                      <input
                        type="tel"
                        required
                        placeholder="০১৭০০-০০০০০০"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#FCFAF7] border border-border py-3 px-4 rounded-xl text-base sm:text-xs outline-none text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground mb-1 block">ইমেইল এড্রেস (Email Address - Optional)</label>
                      <input
                        type="email"
                        placeholder="asif@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#FCFAF7] border border-border py-3 px-4 rounded-xl text-base sm:text-xs outline-none text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">আপনার বার্তা (Your Message) *</label>
                    <textarea
                      rows={5}
                      required
                      placeholder="বিস্তারিত এখানে লিখুন (যেমন: জামদানির স্টক আপডেট বা আবায়ার কালার অপশন)..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-[#FCFAF7] border border-border py-3 px-4 rounded-xl text-base sm:text-xs outline-none text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all leading-relaxed font-semibold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/95 text-white py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 shadow-xs hover:shadow-md active:scale-99 border-none disabled:opacity-75"
                  >
                    <span>{isSubmitting ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}</span>
                    <Send size={12} />
                  </button>
                </form>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Global Footer and Announcement drawers */}
      <Cta scrollToSection={handleScrollToSection} />
      <ToastNotification isActive={toastActive} message={toastMsg} />

      {/* CartDrawer Sidebar */}
      <CartDrawer showToast={showToast} />

      {/* Sticky Mobile bottom navigation tabs */}
      <MobileTabBar 
        activeSection={0}
        cartCount={cartCount}
        cartDrawerOpen={cartDrawerOpen}
        scrollToSection={handleScrollToSection}
        setCartDrawerOpen={setCartDrawerOpen}
        showToast={showToast}
      />

      {/* Mobile Drawer Menu */}
      <MobileMenuDrawer 
        isOpen={menuDrawerOpen} 
        onClose={() => setMenuDrawerOpen(false)} 
        activeSection={0} 
        scrollToSection={handleScrollToSection} 
      />
    </div>
  );
}
