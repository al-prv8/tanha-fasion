"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import MobileMenuDrawer from "@/components/layout/MobileMenuDrawer";
import CartDrawer from "@/components/layout/CartDrawer";
import Cta from "@/components/sections/Cta";
import { useCart } from "@/lib/cart-context";
import ToastNotification from "@/components/overlays/ToastNotification";

export default function RefundPolicyPage() {
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
            <span className="text-foreground font-semibold">রিটার্ন ও রিফান্ড পলিসি</span>
          </nav>

          {/* Page Title Banner */}
          <div className="text-left space-y-3 mb-10">
            <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-widest px-3.5 py-1.5 rounded-full border border-primary/20 inline-flex items-center gap-1.5">
              <RefreshCw size={12} />
              <span>পরিবর্তন ও মূল্য ফেরত নীতি</span>
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display text-foreground leading-tight tracking-tight">
              রিটার্ন ও রিফান্ড পলিসি (Return & Refund)
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              তানহা ফ্যাশন সবসময় কাস্টমারদের সর্বোচ্চ সন্তুষ্টি নিশ্চিত করতে কাজ করে। আমাদের পাঠানো পোশাকে কোনো সমস্যা থাকলে অথবা সাইজে মিল না হলে তা পরিবর্তন বা রিটার্ন করার সহজ নিয়মাবলী নিচে দেওয়া হলো।
            </p>
          </div>

          {/* Policy Contents Grid */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 md:p-10 shadow-xs text-left space-y-8">
            
            {/* Section 1 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">১</span>
                <span>রিটার্ন ও এক্সচেঞ্জ করার সময়সীমা</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                আপনি আমাদের কাছ থেকে পোশাকটি বুঝে পাওয়ার পর সর্বোচ্চ <strong>৩ দিনের (৭২ ঘণ্টা)</strong> মধ্যে রিটার্ন অথবা এক্সচেঞ্জের জন্য আমাদের হোয়াটসঅ্যাপ সাপোর্ট লাইনে অথবা কাস্টমার কেয়ার নাম্বারে যোগাযোগ করতে হবে। ৩ দিন পার হয়ে যাওয়ার পর কোনো রিটার্ন বা এক্সচেঞ্জ আবেদন গ্রহণ করা হবে না।
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">২</span>
                <span>কোন কোন ক্ষেত্রে এক্সচেঞ্জ প্রযোজ্য?</span>
              </h3>
              <div className="text-xs text-muted-foreground leading-relaxed pl-8 space-y-2">
                <p>নিম্নোক্ত সমস্যাগুলোর জন্য কোনো অতিরিক্ত সার্ভিস চার্জ ছাড়াই পোশাক পরিবর্তন করা যাবে:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>পোশাকে কোনো ধরনের বড় ছেঁড়া, ডিফেক্ট বা রঙের বড় ত্রুটি থাকলে।</li>
                  <li>আমাদের ওয়েবসাইট থেকে সিলেক্ট করা সাইজের পরিবর্তে অন্য ভুল সাইজের পোশাক পাঠানো হলে।</li>
                  <li>গ্রাহক নিজে সাইজ নির্ধারণে ভুল করলে (সেক্ষেত্রে এক্সচেঞ্জের জন্য কুরিয়ারের যাওয়া-আসার সার্ভিস ফি গ্রাহককে বহন করতে হবে)।</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">৩</span>
                <span>রিটার্ন করার পূর্বশর্তসমূহ</span>
              </h3>
              <div className="text-xs text-muted-foreground leading-relaxed pl-8 space-y-2">
                <p>যেকোনো পোশাক ফেরত পাঠাতে চাইলে তা অবশ্যই নিচের শর্তগুলো পূরণ করতে হবে:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>পোশাকটি সম্পূর্ণ অব্যবহৃত ও নতুন হতে হবে।</li>
                  <li>পোশাকের গায়ে সংযুক্ত সকল ট্যাগ, ইনভয়েস স্লিপ এবং অরিজিনাল প্যাকেজিং অক্ষত থাকতে হবে।</li>
                  <li>পোশাক ধৌত করা হলে বা তাতে কোনো ধরনের পারফিউম/অন্য গন্ধ পাওয়া গেলে তা রিটার্নযোগ্য হবে না।</li>
                </ul>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">৪</span>
                <span>রিফান্ড (মূল্য ফেরত) প্রক্রিয়া</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                যদি পোশাকের কোনো ত্রুটির কারণে রিটার্ন নেওয়া হয় এবং আমাদের স্টকে বিকল্প পোশাক না থাকে, তবে আমরা আপনার পরিশোধিত মূল্য ফেরত দিয়ে থাকি। এক্সচেঞ্জ করা কুরিয়ারের মাধ্যমে ফেরত পণ্যটি আমাদের কার্যালয়ে পৌঁছানোর পর আমরা তা পর্যবেক্ষণ করবো। পর্যবেক্ষণ শেষে <strong>৫-৭ কার্যদিবসের</strong> মধ্যে বিকাশ/নগদ বা ব্যাংক অ্যাকাউন্টের মাধ্যমে আপনার পেমেন্ট ফেরত দেওয়া হবে।
              </p>
            </div>

            {/* Section 5 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">৫</span>
                <span>কিভাবে যোগাযোগ করবেন?</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                রিটার্ন বা এক্সচেঞ্জ করতে চাইলে আপনার অর্ডার নম্বর এবং পোশাকের ত্রুটির ছবি সহ আমাদের অফিসিয়াল হোয়াটসঅ্যাপ নাম্বারে <strong>+৮৮০ ১৭০০ ০০০০০০</strong> এসএমএস করুন। আমাদের সাপোর্ট টিম দ্রুত সময়ের মধ্যে সমাধান প্রদানে সাহায্য করবে।
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
