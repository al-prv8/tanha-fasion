"use client";

import React, { useState, useEffect } from "react";
import { Shield, ShieldAlert, ShieldCheck, Mail, Smartphone, RefreshCw, KeyRound, Copy, Check, PowerOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface SecurityTabProps {
  showToast: (msg: string) => void;
}

export default function SecurityTab({ showToast }: SecurityTabProps) {
  const { user, refreshSession } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Setup state
  const [setupType, setSetupType] = useState<"EMAIL" | "TOTP">("EMAIL");
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Fetch latest user status on mount
  useEffect(() => {
    refreshSession();
  }, []);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    showToast("সিক্রেট কি কপি করা হয়েছে!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartSetup = async () => {
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setQrImage("");
    setSecretKey("");
    setVerifyCode("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/2fa/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ type: setupType })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "২এফএ সেটাপ আরম্ভ করতে ব্যর্থ হয়েছে।");
      }

      if (setupType === "TOTP") {
        setQrImage(data.qrImage);
        setSecretKey(data.secret);
      }
      setIsSettingUp(true);
      showToast("২এফএ সেটাপ কোড তৈরি করা হয়েছে।");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyCode.length !== 6) {
      setErrorMsg("অনুগ্রহ করে ৬-ডিজিটের সঠিক কোড দিন।");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/2fa/enable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code: verifyCode.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ভেরিফিকেশন সম্পন্ন করতে ব্যর্থ হয়েছে।");
      }

      setSuccessMsg("অভিনন্দন! আপনার টু-ফ্যাক্টর অথেন্টিকেশন (2FA) সফলভাবে চালু হয়েছে।");
      showToast("২এফএ সফলভাবে সচল হয়েছে!");
      setIsSettingUp(false);
      setVerifyCode("");
      
      // Refresh user context to display active status
      await refreshSession();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm("আপনি কি নিশ্চিতভাবে টু-ফ্যাক্টর অথেন্টিকেশন (2FA) নিষ্ক্রিয় করতে চান? এটি আপনার অ্যাকাউন্টের নিরাপত্তা কমিয়ে দেবে।")) {
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/2fa/disable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "২এফএ বন্ধ করতে ব্যর্থ হয়েছে।");
      }

      setSuccessMsg("আপনার টু-ফ্যাক্টর অথেন্টিকেশন (2FA) নিষ্ক্রিয় করা হয়েছে।");
      showToast("২এফএ বন্ধ করা হয়েছে।");
      setIsSettingUp(false);
      
      // Refresh user context
      await refreshSession();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-border/80 p-6 rounded-2xl shadow-3xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2">
            <Shield className="text-primary" size={22} />
            <span>নিরাপত্তা ও ২এফএ সেটিংস (2FA Security)</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            আপনার অ্যাডমিন বা স্টাফ অ্যাকাউন্টের অননুমোদিত প্রবেশ রোধ করতে টু-ফ্যাক্টর অথেন্টিকেশন সচল করুন।
          </p>
        </div>

        {/* Current status pill */}
        {user?.twoFactorEnabled ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold shadow-3xs">
            <ShieldCheck size={14} />
            <span>২এফএ সচল আছে (Active)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold shadow-3xs">
            <ShieldAlert size={14} />
            <span>২এফএ নিষ্ক্রিয় আছে (Disabled)</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
          <ShieldCheck size={14} className="flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Configurations */}
        <div className="lg:col-span-1 bg-white border border-border/80 rounded-2xl p-6 shadow-3xs space-y-6">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <KeyRound size={16} className="text-slate-500" />
            <span>নিরাপত্তা মেথড নির্ধারণ</span>
          </h3>

          {user?.twoFactorEnabled ? (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-3">
                {user?.twoFactorType === "TOTP" ? (
                  <Smartphone className="text-primary" size={24} />
                ) : (
                  <Mail className="text-primary" size={24} />
                )}
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {user?.twoFactorType === "TOTP" ? "অথেন্টিকেটর অ্যাপ (Google/Microsoft)" : "ইমেইল ওটিপি (Email OTP)"}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">ভেরিফিকেশনের জন্য নির্ধারিত মেথড</div>
                </div>
              </div>

              <button
                onClick={handleDisable2FA}
                disabled={isLoading}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 py-3 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <PowerOff size={14} />
                <span>২এফএ নিষ্ক্রিয় করুন</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                ২এফএ চালু করতে নিচের যেকোনো একটি মেথড নির্বাচন করে "সেটআপ শুরু করুন" বাটনে ক্লিক করুন।
              </p>

              {/* Selection Options */}
              <div className="space-y-2">
                <label
                  onClick={() => !isSettingUp && setSetupType("EMAIL")}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSettingUp ? "opacity-50 cursor-not-allowed" : ""
                  } ${
                    setupType === "EMAIL"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="setupType"
                    checked={setupType === "EMAIL"}
                    disabled={isSettingUp}
                    onChange={() => setSetupType("EMAIL")}
                    className="accent-primary pointer-events-none hidden"
                  />
                  <Mail size={20} className={setupType === "EMAIL" ? "text-primary" : "text-slate-400"} />
                  <div className="text-left">
                    <div className="text-xs font-bold">ইমেইল ওটিপি (Email OTP)</div>
                    <div className="text-[10px] opacity-80 mt-0.5">ইমেলে কোড পাঠিয়ে যাচাই করা হবে</div>
                  </div>
                </label>

                <label
                  onClick={() => !isSettingUp && setSetupType("TOTP")}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSettingUp ? "opacity-50 cursor-not-allowed" : ""
                  } ${
                    setupType === "TOTP"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="setupType"
                    checked={setupType === "TOTP"}
                    disabled={isSettingUp}
                    onChange={() => setSetupType("TOTP")}
                    className="accent-primary pointer-events-none hidden"
                  />
                  <Smartphone size={20} className={setupType === "TOTP" ? "text-primary" : "text-slate-400"} />
                  <div className="text-left">
                    <div className="text-xs font-bold">অথেন্টিকেটর অ্যাপ (Authenticator)</div>
                    <div className="text-[10px] opacity-80 mt-0.5">মোবাইল অ্যাপ ব্যবহার করে কোড পাবেন</div>
                  </div>
                </label>
              </div>

              {!isSettingUp && (
                <button
                  onClick={handleStartSetup}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/95 border-none text-white py-3 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  {isLoading ? <RefreshCw size={14} className="animate-spin" /> : null}
                  <span>সেটআপ শুরু করুন</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column - QR Code / Verification Inputs */}
        <div className="lg:col-span-2 bg-white border border-border/80 rounded-2xl p-6 shadow-3xs flex flex-col justify-center">
          {isSettingUp ? (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-primary" />
                  <span>২এফএ ভেরিফিকেশন ও সচল করা</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSettingUp(false)}
                  className="text-xs text-muted-foreground hover:text-rose-600 bg-transparent border-none cursor-pointer font-bold"
                >
                  সেটআপ বাতিল করুন
                </button>
              </div>

              {setupType === "TOTP" ? (
                /* Authenticator Setup QR code and instructions */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200/50 p-4 rounded-2xl shadow-3xs">
                    {qrImage ? (
                      <img src={qrImage} alt="2FA QR Code" className="w-48 h-48 border border-white rounded-xl shadow-xs" />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center">
                        <RefreshCw className="animate-spin text-slate-400" size={24} />
                      </div>
                    )}
                    <span className="text-[10px] text-muted-foreground mt-3 font-semibold text-center leading-relaxed">
                      Google Authenticator বা Microsoft Authenticator অ্যাপ দিয়ে স্ক্যান করুন।
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="text-xs font-bold text-slate-800">ম্যানুয়াল কোড সেটিংস:</div>
                    <div className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl flex items-center justify-between font-mono text-[10px] text-slate-600 font-bold select-all">
                      <span className="truncate mr-2">{secretKey}</span>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 bg-transparent border-none cursor-pointer flex-shrink-0"
                        title="সিক্রেট কি কপি করুন"
                      >
                        {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    </div>

                    <form onSubmit={handleEnable2FA} className="space-y-3 pt-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                          আপনার অ্যাপ থেকে ৬-ডিজিটের নিরাপত্তা কোডটি দিন:
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="৬-ডিজিটের কোড দিন"
                          value={verifyCode}
                          onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                          className="w-full px-3.5 py-2.5 border border-border rounded-xl text-base sm:text-xs font-bold font-mono tracking-wider text-center focus:outline-none focus:ring-1 focus:ring-primary text-slate-900"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading || verifyCode.length !== 6}
                        className="w-full bg-primary hover:bg-primary/95 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer border-none transition-colors shadow-xs flex items-center justify-center gap-1.5"
                      >
                        {isLoading ? <RefreshCw className="animate-spin" size={12} /> : null}
                        <span>যাচাই ও সচল করুন</span>
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                /* Email OTP code validation */
                <div className="max-w-md mx-auto space-y-4 py-4">
                  <div className="text-xs font-bold text-slate-800 text-center">
                    আমরা আপনার ইমেইল <span className="text-slate-900 font-black">{user?.email}</span>-এ একটি ভেরিফিকেশন ওটিপি (OTP) পাঠিয়েছি। কোডটি নিচে দিন:
                  </div>

                  <form onSubmit={handleEnable2FA} className="space-y-4">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="৬-ডিজিটের নিরাপত্তা ওটিপি কোড"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-4 py-3 border border-border rounded-xl text-lg font-bold font-mono tracking-[0.2em] text-center focus:outline-none focus:ring-1 focus:ring-primary text-slate-900"
                      required
                    />

                    <button
                      type="submit"
                      disabled={isLoading || verifyCode.length !== 6}
                      className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl text-xs font-bold cursor-pointer border-none transition-colors shadow-xs flex items-center justify-center gap-1.5"
                    >
                      {isLoading ? <RefreshCw className="animate-spin" size={14} /> : null}
                      <span>কোড যাচাই ও ২এফএ চালু করুন</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            /* Idle Screen when 2FA is disable or enabled */
            <div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
              {user?.twoFactorEnabled ? (
                <>
                  <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-xs animate-pulse">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">আপনার অ্যাকাউন্ট নিরাপদ আছে</h4>
                    <p className="text-[11px] text-muted-foreground max-w-sm mt-1 leading-relaxed">
                      টু-ফ্যাক্টর অথেন্টিকেশন (2FA) সক্রিয় থাকার ফলে প্রতিবার লগইনের সময় অতিরিক্ত নিরাপত্তা কোড প্রদান করতে হবে।
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 shadow-xs">
                    <Shield size={32} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">২এফএ নিষ্ক্রিয় করা আছে</h4>
                    <p className="text-[11px] text-muted-foreground max-w-sm mt-1 leading-relaxed">
                      অ্যাকাউন্টের নিরাপত্তা বৃদ্ধিকল্পে ও হ্যাকিং রোধ করতে টু-ফ্যাক্টর অথেন্টিকেশন সচল করা আবশ্যক।
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
