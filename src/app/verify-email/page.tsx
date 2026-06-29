"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, ShieldCheck, ArrowRight, RefreshCw, KeyRound, AlertCircle } from "lucide-react";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Focus input on load
  useEffect(() => {
    const input = document.getElementById("otp-input");
    if (input) input.focus();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrorMsg("অনুগ্রহ করে ৬-ডিজিটের সঠিক ওটিপি কোড দিন।");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ভেরিফিকেশন সম্পন্ন করতে ব্যর্থ হয়েছে।");
      }

      setSuccessMsg("আপনার অ্যাকাউন্ট সফলভাবে ভেরিফাই করা হয়েছে! রিডাইরেক্ট করা হচ্ছে...");
      
      // Clear token / status context and redirect to home after 1.5s
      setTimeout(() => {
        // Trigger a hard reload/navigation to sync login status cookie across contexts
        window.location.href = "/";
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsResending(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "নতুন কোড পাঠাতে ব্যর্থ হয়েছে।");
      }

      setSuccessMsg("আপনার ইমেলে একটি নতুন ওটিপি কোড পাঠানো হয়েছে।");
      setResendTimer(60);
      setCanResend(false);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50 reveal-item">
      <div className="max-w-md w-full space-y-8 bg-white border border-border/80 p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 shadow-sm animate-pulse">
            <Mail size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">ইমেল ভেরিফিকেশন</h2>
          <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
            আমরা আপনার ইমেল <span className="font-bold text-slate-800 font-mono">{email || "অ্যাকাউন্টে"}</span>-এ একটি ৬-ডিজিটের ভেরিফিকেশন কোড পাঠিয়েছি। অনুগ্রহ করে কোডটি নিচে দিন।
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200/60 text-rose-700 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
            <ShieldCheck size={14} className="flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp-input" className="sr-only">ভেরিফিকেশন ওটিপি (OTP)</label>
            <div className="relative rounded-xl shadow-3xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound size={16} />
              </div>
              <input
                id="otp-input"
                name="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="৬-ডিজিটের ওটিপি কোড"
                className="block w-full pl-10 pr-4 py-3 border border-border rounded-xl text-center text-lg font-bold font-mono tracking-[0.4em] placeholder:tracking-normal placeholder:font-sans placeholder:text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="group relative w-full py-3 px-4 bg-primary hover:bg-primary/95 text-white border-none rounded-xl text-xs font-bold tracking-wider cursor-pointer shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>কোড যাচাই করা হচ্ছে...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={14} />
                <span>কোড সাবমিট করুন</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-xs font-extrabold text-primary hover:text-primary/90 bg-transparent border-none cursor-pointer flex items-center justify-center gap-1 mx-auto transition-colors"
            >
              {isResending ? <RefreshCw size={12} className="animate-spin" /> : null}
              <span>কোড পুনরায় পাঠান</span>
            </button>
          ) : (
            <p className="text-[11px] text-muted-foreground font-semibold flex items-center justify-center gap-1 font-mono">
              <RefreshCw size={10} className="animate-spin text-slate-400" />
              <span>{resendTimer} সেকেন্ড পর পুনরায় কোড পাঠানো যাবে</span>
            </p>
          )}
        </div>

        <div className="text-center border-t border-border/60 pt-4 text-xs font-bold text-muted-foreground flex items-center justify-center gap-1">
          <span>ইমেইল ভুল হয়েছে?</span>
          <Link href="/register" className="text-primary hover:underline no-underline font-extrabold">
            নতুন অ্যাকাউন্ট খুলুন
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <RefreshCw className="animate-spin text-primary" size={24} />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
