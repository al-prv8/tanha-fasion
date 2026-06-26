"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import MobileMenuDrawer from "@/components/layout/MobileMenuDrawer";
import CartDrawer from "@/components/layout/CartDrawer";
import Cta from "@/components/sections/Cta";
import { useCart } from "@/lib/cart-context";
import ToastNotification from "@/components/overlays/ToastNotification";

export default function TermsConditionsPage() {
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
            <span className="text-foreground font-semibold">শর্তাবলী ও নিয়ম</span>
          </nav>

          {/* Page Title Banner */}
          <div className="text-left space-y-3 mb-10">
            <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-widest px-3.5 py-1.5 rounded-full border border-primary/20 inline-flex items-center gap-1.5">
              <FileText size={12} />
              <span>নিয়ম ও ব্যবহার বিধি</span>
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display text-foreground leading-tight tracking-tight">
              শর্তাবলী ও নিয়ম (Terms & Conditions)
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              তানহা ফ্যাশন ওয়েবসাইট ভিজিট এবং কেনাকাটা করার জন্য নির্দিষ্ট কিছু শর্তাবলী ও নিয়ম প্রযোজ্য। আমাদের সেবা উপভোগ করার পূর্বে অনুগ্রহ করে নিম্নোক্ত শর্তসমূহ মনোযোগ সহকারে পড়ে নিন।
            </p>
          </div>

          {/* Policy Contents Grid */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 md:p-10 shadow-xs text-left space-y-8">
            
            {/* Section 1 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">১</span>
                <span>অর্ডার এবং স্টক প্রাপ্যতা</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                তানহা ফ্যাশনের ওয়েবসাইটে প্রদর্শিত সকল পোশাকের স্টক সীমিত হতে পারে। ভুলবশত ওয়েবসাইটের কোনো অসঙ্গতি বা স্টক লিমিটেশন ওভারফ্লোর কারণে অর্ডার প্লেস করার পরও যদি কোনো পণ্য দিতে অপারগ হই, তবে তাৎক্ষণিকভাবে গ্রাহককে অবহিত করা হবে এবং পেইড পেমেন্ট সম্পূর্ণ রিফান্ড করা হবে।
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">২</span>
                <span>পেমেন্ট ও ট্রানজেকশন</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                গ্রাহক ক্যাশ অন ডেলিভারি (COD), বিকাশ, রকেট বা নগদের মাধ্যমে অর্ডারের পেমেন্ট সম্পূর্ণ করতে পারেন। মোবাইল ফিন্যান্সিয়াল সার্ভিসের (MFS) ক্ষেত্রে অর্ডারের সময় সঠিক ট্রানজেকশন আইডি (TrxID) প্রদান করা আবশ্যক। ভুল বা ভুয়া ট্রানজেকশন আইডি প্রদান করা হলে অর্ডার বাতিল করার অধিকার তানহা ফ্যাশন সংরক্ষণ করে।
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">৩</span>
                <span>ডেলিভারি চার্জ এবং সময়সীমা</span>
              </h3>
              <div className="text-xs text-muted-foreground leading-relaxed pl-8 space-y-2">
                <p>আমাদের ডেলিভারি খরচ ও সময় নিচে উল্লেখ করা হলো:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>ঢাকা সিটির অভ্যন্তরে:</strong> ডেলিভারি চার্জ ৮০ টাকা। সময়সীমা ২-৩ কার্যদিবস।</li>
                  <li><strong>ঢাকা সিটির বাইরে (সারা বাংলাদেশ):</strong> ডেলিভারি চার্জ ১৫০ টাকা। সময়সীমা ৩-৫ কার্যদিবস।</li>
                  <li>প্রাকৃতিক দুর্যোগ, পরিবহন ধর্মঘট বা অন্য কোনো বিশেষ কারণে ডেলিভারি সময় কিছুটা বেশি লাগতে পারে।</li>
                </ul>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">৪</span>
                <span>কুপন ও ছাড়ের ব্যবহার</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                বিভিন্ন প্রমোশনে প্রদানকৃত কুপন কোডগুলো কেবল নির্ধারিত শর্ত পূরণ সাপেক্ষে এবং নির্দিষ্ট মেয়াদের মধ্যে ব্যবহারযোগ্য। একটি অর্ডারে একের বেশি কুপন কোড ব্যবহার করা যাবে না। অসদুপায় বা সিস্টেম ত্রুটির মাধ্যমে কোনো কুপন অপব্যবহার করা হলে সেই অর্ডার বাতিল করা হবে।
              </p>
            </div>

            {/* Section 5 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">৫</span>
                <span>শর্তাবলীর পরিবর্তন</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                তানহা ফ্যাশন যেকোনো সময় এবং কোনো পূর্ব নোটিশ ছাড়াই এই শর্তাবলী পরিবর্তন, সংশোধন বা পরিবর্ধন করার পূর্ণ অধিকার সংরক্ষণ করে। পরিবর্তিত শর্তাবলী ওয়েবসাইটে আপলোড করার সাথে সাথে কার্যকর বলে গণ্য হবে।
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
