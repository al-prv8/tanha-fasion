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

  const { user, loading, login, register, refreshSession } = useAuth();
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

  // 2FA states
  const [is2faRequired, setIs2faRequired] = useState(false);
  const [twoFactorType, setTwoFactorType] = useState<"EMAIL" | "TOTP" | null>(null);
  const [tempToken, setTempToken] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastActive(true);
    setTimeout(() => setToastActive(false), 2000);
  };

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (redirectPath === "/dashboard") {
        if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
          router.push("/admin");
        } else if (user.role === "BRANCH_MANAGER") {
          router.push("/admin/showroom");
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push(redirectPath);
      }
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
    } else if (result.isTwoFactorRequired) {
      setIs2faRequired(true);
      setTwoFactorType(result.twoFactorType || null);
      setTempToken(result.tempToken || "");
      showToast("টু-ফ্যাক্টর অথেন্টিকেশন কোড প্রয়োজন।");
    } else if (result.message === "email_unverified") {
      showToast("দয়া করে ইমেল ভেরিফাই করুন");
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } else {
      setErrorMsg(result.message || "ইমেইল অথবা পাসওয়ার্ড ভুল।");
    }
  };

  const handle2faSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/verify-2fa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tempToken, code: twoFactorCode.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "২এফএ ভেরিফিকেশন কোড ভুল।");
      }

      setSuccessMsg("২এফএ ভেরিফিকেশন সফল! ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...");
      showToast("২এফএ সফল হয়েছে!");

      // Update auth session context
      await refreshSession();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
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
      setSuccessMsg("নিবন্ধন সফল হয়েছে! আপনার ইমেলে ওটিপি পাঠানো হয়েছে।");
      showToast("নিবন্ধন সফল হয়েছে!");
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }, 1000);
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
          {!is2faRequired && (
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
          )}

          <div className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold font-display text-foreground leading-tight">
                {is2faRequired
                  ? "টু-ফ্যাক্টর অথেন্টিকেশন"
                  : activeTab === "login"
                  ? "স্বাগতম!"
                  : "হয়ে যান তানহা মেম্বার"}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {is2faRequired
                  ? "আপনার অ্যাকাউন্টটি সুরক্ষিত রাখতে টু-ফ্যাক্টর নিরাপত্তা কোডটি প্রদান করুন"
                  : activeTab === "login"
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

            {is2faRequired ? (
              /* 2FA Verification Form */
              <form onSubmit={handle2faSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">
                    {twoFactorType === "EMAIL" ? "ইমেল ২এফএ ওটিপি কোড *" : "অথেন্টিকেটর অ্যাপ কোড *"}
                  </label>
                  <div className="relative">
                    <input
                      id="2fa-code-input"
                      type="text"
                      maxLength={6}
                      placeholder="৬-ডিজিটের কোড"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full pl-10 pr-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-bold font-mono tracking-[0.2em] text-center"
                      required
                      autoFocus
                    />
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || twoFactorCode.length !== 6}
                  className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3.5 px-6 rounded-xl border-none cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
                >
                  {isSubmitting ? "কোড যাচাই করা হচ্ছে..." : "যাচাই করুন"}
                  {!isSubmitting && <ArrowRight size={16} />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIs2faRequired(false);
                    setTwoFactorCode("");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl border-none cursor-pointer transition-colors mt-2 text-xs"
                >
                  লগইন স্ক্রিনে ফিরে যান
                </button>
              </form>
            ) : activeTab === "login" ? (
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
                      className="w-full pl-10 pr-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold"
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
                      className="w-full pl-10 pr-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold"
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
                      className="w-full pl-10 pr-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold"
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
                      className="w-full pl-10 pr-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold"
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
                      className="w-full pl-10 pr-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold"
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
                      className="w-full pl-10 pr-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold"
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
