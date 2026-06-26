"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Shield } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import MobileMenuDrawer from "@/components/layout/MobileMenuDrawer";
import CartDrawer from "@/components/layout/CartDrawer";
import Cta from "@/components/sections/Cta";
import { useCart } from "@/lib/cart-context";
import ToastNotification from "@/components/overlays/ToastNotification";

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const { cartCount, cartDrawerOpen, setCartDrawerOpen } = useCart();

  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastActive, setToastActive] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastActive(true);
    setTimeout(() => setToastActive(false), 2000);
  };

  const handleScrollToSection = (idx: number) => {
    router.push(`/?sec=${idx}`);
  };

  return (
    <div className="grain-bg min-h-screen flex flex-col justify-between">
      <div>
        <Navbar 
          cartCount={cartCount} 
          onOpenMenu={() => setMenuDrawerOpen(true)}
          onOpenCart={() => setCartDrawerOpen(true)}
          scrollToSection={handleScrollToSection}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <MobileMenuDrawer 
          isOpen={menuDrawerOpen} 
          onClose={() => setMenuDrawerOpen(false)} 
          activeSection={0} 
          scrollToSection={handleScrollToSection} 
        />

        <CartDrawer showToast={showToast} />

        {/* Main Content Area */}
        <div className="max-w-4xl w-full mx-auto px-4 mt-8 pb-16">
          {/* Breadcrumb Path */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors no-underline">হোম</Link>
            <ChevronRight size={12} className="flex-shrink-0" />
            <span className="text-foreground font-semibold">গোপনীয়তা নীতি</span>
          </nav>

          {/* Page Title Banner */}
          <div className="text-left space-y-3 mb-10">
            <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-widest px-3.5 py-1.5 rounded-full border border-primary/20 inline-flex items-center gap-1.5">
              <Shield size={12} />
              <span>নিরাপত্তা ও গোপনীয়তা</span>
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display text-foreground leading-tight tracking-tight">
              গোপনীয়তা নীতি (Privacy Policy)
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              তানহা ফ্যাশন তার সম্মানিত গ্রাহকদের ব্যক্তিগত তথ্যের সর্বোচ্চ নিরাপত্তা বজায় রাখতে প্রতিশ্রুতিবদ্ধ। আমাদের ওয়েবসাইট ব্যবহারের ক্ষেত্রে আপনার তথ্য সংগ্রহ, সংরক্ষণ এবং ব্যবহার করার বিস্তারিত নিয়মাবলী নিচে দেওয়া হলো।
            </p>
          </div>

          {/* Policy Contents Grid */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 md:p-10 shadow-xs text-left space-y-8">
            
            {/* Section 1 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">১</span>
                <span>কোন কোন তথ্য আমরা সংগ্রহ করি?</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                আমাদের ওয়েবসাইট থেকে অর্ডার করার সময় আমরা আপনার নাম, ইমেইল এড্রেস, ডেলিভারি ঠিকানা, পোস্টকোড এবং মোবাইল নম্বর সংগ্রহ করে থাকি। অ্যাকাউন্ট তৈরি করার সময় বা ইমেইল সাবস্ক্রাইব করার ক্ষেত্রেও একই তথ্য সংরক্ষিত হতে পারে।
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">২</span>
                <span>তথ্য ব্যবহারের উদ্দেশ্যসমূহ</span>
              </h3>
              <div className="text-xs text-muted-foreground leading-relaxed pl-8 space-y-2">
                <p>সংগৃহীত তথ্যসমূহ আমরা নিম্নোক্ত প্রয়োজনীয় কাজের জন্য ব্যবহার করে থাকি:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>আপনার অর্ডারটি প্রস্তুতকরণ এবং সঠিক ঠিকানায় ডেলিভারি সম্পন্ন করার জন্য।</li>
                  <li>অর্ডারের বর্তমান শিপমেন্ট স্ট্যাটাস এসএমএস বা ইমেইলের মাধ্যমে জানানোর জন্য।</li>
                  <li>আমাদের নতুন প্রিমিয়াম কালেকশন ও বিশেষ ডিসকাউন্ট অফার সম্পর্কে গ্রাহককে অবহিত করতে।</li>
                  <li>অ্যাকাউন্ট ভেরিফিকেশন এবং সুরক্ষার জন্য।</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">৩</span>
                <span>তথ্যের নিরাপত্তা এবং সংরক্ষণ</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                আপনার পাসওয়ার্ড এবং অ্যাকাউন্ট ডিটেইলস আমাদের ডাটাবেজে অত্যন্ত নিরাপদে এনক্রিপ্ট করে সংরক্ষণ করা হয়। আমরা কোনো ধরনের থার্ড-পার্টি বা বাইরের কোনো প্রতিষ্ঠানের সাথে আমাদের গ্রাহকদের ব্যক্তিগত তথ্য শেয়ার বা বিক্রি করি না। চেকআউট পেমেন্ট সম্পূর্ণভাবে নিরাপদ গেটওয়ের মাধ্যমে প্রসেস করা হয়।
              </p>
            </div>

            {/* Section 4 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">৪</span>
                <span>কুকি (Cookies) নীতি</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                গ্রাহকের ব্রাউজিং অভিজ্ঞতা উন্নত করতে এবং পরবর্তী ভিজিটে অ্যাকাউন্ট অটো-লগইন সক্রিয় রাখতে আমরা কুকি ব্যবহার করে থাকি। আপনি চাইলে আপনার ব্রাউজার সেটিংস থেকে কুকি নিষ্ক্রিয় করতে পারেন, তবে এর ফলে ওয়েবসাইটের কিছু কিছু ফিচার কাজ নাও করতে পারে।
              </p>
            </div>

            {/* Section 5 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">৫</span>
                <span>গ্রাহকের অধিকার</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                আপনি যেকোনো সময় আপনার ড্যাশবোর্ডে লগইন করে আপনার সংরক্ষিত ডেলিভারি ঠিকানা, মোবাইল নম্বর এবং পাসওয়ার্ড হালনাগাদ করতে পারেন। এছাড়া আপনার সম্পূর্ণ প্রোফাইল বা ইমেইল সাবস্ক্রিপশন বাতিল করতে চাইলে আমাদের হেল্পলাইন নাম্বারে যোগাযোগ করতে পারেন।
              </p>
            </div>

          </div>
        </div>
      </div>

      <Cta scrollToSection={handleScrollToSection} />
      <ToastNotification isActive={toastActive} message={toastMsg} />
    </div>
  );
}
