"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Lock, Mail, User, Phone, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import MobileMenuDrawer from "@/components/layout/MobileMenuDrawer";
import CartDrawer from "@/components/layout/CartDrawer";
import { useCart } from "@/lib/cart-context";
import ToastNotification from "@/components/overlays/ToastNotification";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const { user, loading, login, register } = useAuth();
  const { cartCount, cartDrawerOpen, setCartDrawerOpen } = useCart();

  // Page layout states
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastActive, setToastActive] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Tab State: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastActive(true);
    setTimeout(() => setToastActive(false), 2000);
  };

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push(redirectPath);
    }
  }, [user, loading, router, redirectPath]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg("লগইন সফল হয়েছে! ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...");
      showToast("লগইন সফল হয়েছে!");
      setTimeout(() => {
        router.push(redirectPath);
      }, 1000);
    } else {
      setErrorMsg(result.message || "ইমেইল অথবা পাসওয়ার্ড ভুল।");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("দয়া করে সব আবশ্যক তথ্য পূরণ করুন।");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, email, phone, password);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg("নিবন্ধন সফল হয়েছে! এখন লগইন করুন।");
      showToast("নিবন্ধন সফল হয়েছে!");
      // Automatically log in the user after registration
      const loginResult = await login(email, password);
      if (loginResult.success) {
        setTimeout(() => {
          router.push(redirectPath);
        }, 1000);
      } else {
        setActiveTab("login");
        setPassword("");
      }
    } else {
      setErrorMsg(result.message || "নিবন্ধন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  if (loading) {
    return (
      <div className="grain-bg min-h-screen flex items-center justify-center text-foreground font-semibold">
        লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div className="grain-bg min-h-screen pb-16">
      <Navbar 
        cartCount={cartCount} 
        onOpenMenu={() => setMenuDrawerOpen(true)}
        onOpenCart={() => setCartDrawerOpen(true)}
        scrollToSection={() => router.push("/")}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <MobileMenuDrawer 
        isOpen={menuDrawerOpen} 
        onClose={() => setMenuDrawerOpen(false)} 
        activeSection={0} 
        scrollToSection={() => {}} 
      />

      <CartDrawer showToast={showToast} />

      <div className="max-w-md w-full mx-auto px-4 mt-12">
        {/* Form Container */}
        <div className="bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden">
          {/* Tab Selector */}
          <div className="flex border-b border-border">
            <button
              onClick={() => {
                setActiveTab("login");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-4 text-center text-sm font-bold transition-all ${
                activeTab === "login"
                  ? "text-primary border-b-2 border-primary bg-secondary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              লগইন করুন
            </button>
            <button
              onClick={() => {
                setActiveTab("register");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-4 text-center text-sm font-bold transition-all ${
                activeTab === "register"
                  ? "text-primary border-b-2 border-primary bg-secondary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              নতুন অ্যাকাউন্ট
            </button>
          </div>

          <div className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold font-display text-foreground leading-tight">
                {activeTab === "login" ? "স্বাগতম!" : "হয়ে যান তানহা মেম্বার"}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {activeTab === "login"
                  ? "আপনার অ্যাকাউন্ট দিয়ে লগইন করুন এবং অর্ডার ট্র্যাক করুন"
                  : "অ্যাকাউন্ট তৈরি করে অর্ডার ইতিহাস এবং দ্রুত চেকআউট সুবিধা পান"}
              </p>
            </div>

            {errorMsg && (
              <div className="bg-primary/5 text-primary text-xs font-bold p-3.5 rounded-xl mb-4 border border-primary/10">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/5 text-emerald-600 text-xs font-bold p-3.5 rounded-xl mb-4 border border-emerald-500/10 flex items-center gap-2">
                <CheckCircle size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {activeTab === "login" ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">ইমেইল অ্যাড্রেস *</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="example@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold"
                      required
                    />
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">পাসওয়ার্ড *</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold"
                      required
                    />
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3.5 px-6 rounded-xl border-none cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
                >
                  {isSubmitting ? "লগইন হচ্ছে..." : "লগইন করুন"}
                  {!isSubmitting && <ArrowRight size={16} />}
                </button>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">আপনার নাম *</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="যেমন: ফারহানা রহমান"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold"
                      required
                    />
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">ইমেইল অ্যাড্রেস *</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="example@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold"
                      required
                    />
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">মোবাইল নম্বর (ঐচ্ছিক)</label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="যেমন: 017XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold"
                    />
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">পাসওয়ার্ড *</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold"
                      required
                    />
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3.5 px-6 rounded-xl border-none cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
                >
                  {isSubmitting ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
                  {!isSubmitting && <ArrowRight size={16} />}
                </button>
              </form>
            )}

            {/* Back to Home Link */}
            <div className="text-center mt-6 pt-4 border-t border-border/60">
              <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors no-underline font-semibold">
                ← হোমপেজে ফিরে যান
              </Link>
            </div>
          </div>
        </div>
      </div>
      <ToastNotification isActive={toastActive} message={toastMsg} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="grain-bg min-h-screen flex items-center justify-center text-foreground font-semibold">লোড হচ্ছে...</div>}>
      <LoginContent />
    </Suspense>
  );
}
