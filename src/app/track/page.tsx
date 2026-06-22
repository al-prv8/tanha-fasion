"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Search, 
  Clock, 
  ShieldCheck, 
  Truck, 
  CheckCircle, 
  XCircle, 
  MessageCircle, 
  Calendar, 
  CreditCard,
  AlertTriangle,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import MobileMenuDrawer from "@/components/layout/MobileMenuDrawer";
import CartDrawer from "@/components/layout/CartDrawer";
import { useCart } from "@/lib/cart-context";
import { toBanglaNumber, formatBanglaPriceWithCommas } from "@/lib/products";
import ToastNotification from "@/components/overlays/ToastNotification";

function TrackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialOrderNo = searchParams.get("num") || "";

  const { cartCount, cartDrawerOpen, setCartDrawerOpen } = useCart();

  // Page states
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastActive, setToastActive] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Tracking query form states
  const [orderNumber, setOrderNumber] = useState(initialOrderNo);
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [queriedOrder, setQueriedOrder] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastActive(true);
    setTimeout(() => setToastActive(false), 2000);
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setQueriedOrder(null);

    if (!orderNumber.trim()) {
      setErrorMsg("অর্ডার নম্বরটি দেওয়া আবশ্যক।");
      return;
    }
    if (!contact.trim()) {
      setErrorMsg("মোবাইল নম্বর অথবা ইমেইল দেওয়া আবশ্যক।");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/orders/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: orderNumber.trim(), contact: contact.trim() })
      });
      
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setQueriedOrder(data);
        showToast("অর্ডার ট্র্যাকিং সফল!");
      } else {
        setErrorMsg(data.error || "অর্ডার ট্র্যাকিং ব্যর্থ হয়েছে।");
      }
    } catch (e) {
      console.error("Order tracking error", e);
      setLoading(false);
      setErrorMsg("সার্ভারের সাথে সংযোগ স্থাপন করা যাচ্ছে না।");
    }
  };

  // Helper to map order status to Bengali steps
  const getTimelineSteps = (status: string, createdAt: string) => {
    const steps = [
      { key: "PENDING", label: "অর্ডার গ্রহণ করা হয়েছে", desc: "অর্ডারটি প্রসেসিংয়ের অপেক্ষায় আছে", icon: Clock },
      { key: "CONFIRMED", label: "অর্ডার নিশ্চিত করা হয়েছে", desc: "অর্ডার প্যাকেজিং শুরু করা হয়েছে", icon: ShieldCheck },
      { key: "SHIPPED", label: "শিপমেন্টে পাঠানো হয়েছে", desc: "কুরিয়ার সার্ভিসে হস্তান্তর করা হয়েছে", icon: Truck },
      { key: "DELIVERED", label: "ডেলিভারি সম্পন্ন", desc: "অর্ডারটি সফলভাবে আপনার ঠিকানায় পৌঁছেছে", icon: CheckCircle },
    ];

    if (status === "CANCELLED") {
      return (
        <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl flex items-start gap-4 mt-6">
          <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
            <XCircle size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">অর্ডারটি বাতিল করা হয়েছে</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              দুঃখিত, এই অর্ডারটি বাতিল করা হয়েছে। যদি কোনো পেমেন্ট করা হয়ে থাকে, তবে রিফান্ডের জন্য অনুগ্রহ করে আমাদের কাস্টমার কেয়ারের সাথে যোগাযোগ করুন।
            </p>
          </div>
        </div>
      );
    }

    // Determine active index
    let activeIndex = 0;
    if (status === "CONFIRMED") activeIndex = 1;
    if (status === "SHIPPED") activeIndex = 2;
    if (status === "DELIVERED") activeIndex = 3;

    return (
      <div className="mt-8 space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60">
        {steps.map((step, idx) => {
          const isDone = idx <= activeIndex;
          const isCurrent = idx === activeIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex gap-4 relative items-start">
              {/* Stepper Circle */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border z-10 transition-all ${
                isDone 
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-xs" 
                  : "bg-background text-muted-foreground border-border/80"
              } ${isCurrent ? "ring-4 ring-emerald-500/10" : ""}`}>
                <StepIcon size={16} />
              </div>

              {/* Step Info */}
              <div className="pt-1.5 space-y-1">
                <h4 className={`text-xs font-bold ${isDone ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.label}
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  {step.desc}
                </p>
                {idx === 0 && (
                  <span className="text-[9px] text-muted-foreground/60 block mt-1">
                    তারিখ: {new Date(createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleWhatsAppHelp = (orderNo: string) => {
    const text = `আসসালামু আলাইকুম তানহা ফ্যাশন। আমি আমার অর্ডার (${orderNo}) সম্পর্কে জানতে চাই।`;
    window.open(`https://wa.me/8801700000000?text=${encodeURIComponent(text)}`, "_blank");
  };

  const mapPaymentMethod = (method: string) => {
    switch (method) {
      case "bkash": return "বিকাশ (bKash)";
      case "nagad": return "নগদ (Nagad)";
      case "cod": return "ক্যাশ অন ডেলিভারি (Cash on Delivery)";
      case "card": return "কার্ড পেমেন্ট (Card)";
      default: return method;
    }
  };

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

      <div className="max-w-4xl w-full mx-auto px-4 mt-8">
        
        {/* Breadcrumb Path */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors no-underline">হোম</Link>
          <ChevronRight size={12} className="flex-shrink-0" />
          <span className="text-foreground font-semibold">অর্ডার ট্র্যাকিং</span>
        </nav>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground leading-tight">আপনার অর্ডার ট্র্যাক করুন</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            অর্ডারের সময় প্রাপ্ত ৬ সংখ্যার অর্ডার নম্বর এবং কন্টাক্ট ইনফো দিয়ে বর্তমান ডেলিভারি অবস্থা যাচাই করুন।
          </p>
        </div>

        {/* Query Input Card */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 md:p-8 shadow-sm max-w-2xl mx-auto mb-10">
          {errorMsg && (
            <div className="bg-primary/5 text-primary text-xs font-bold p-3.5 rounded-xl mb-6 border border-primary/10 flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleTrackSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">অর্ডার নম্বর *</label>
                <input
                  type="text"
                  placeholder="যেমন: TF-123456"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">মোবাইল বা ইমেইল *</label>
                <input
                  type="text"
                  placeholder="যেমন: 017XXXXXXXX বা mail@domain.com"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-4 py-3 border border-border bg-[#FCFAF7] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-semibold"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3.5 px-6 rounded-xl border-none cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
            >
              {loading ? "অর্ডার খোঁজা হচ্ছে..." : "ট্র্যাক করুন"}
              {!loading && <Search size={16} />}
            </button>
          </form>
        </div>

        {/* Query Results Display */}
        {queriedOrder && (
          <div className="bg-card border border-border/80 rounded-2xl p-6 md:p-8 shadow-sm max-w-2xl mx-auto space-y-8">
            
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">অর্ডার নম্বর</p>
                <h3 className="text-lg font-mono font-black text-primary mt-0.5">{queriedOrder.orderNumber}</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">সর্বমোট পরিশোধযোগ্য</p>
                <h3 className="text-lg font-mono font-black text-foreground mt-0.5">{formatBanglaPriceWithCommas(queriedOrder.grandTotal)}</h3>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-4">ডেলিভারি ট্র্যাকিং স্ট্যাটাস</h3>
              {getTimelineSteps(queriedOrder.orderStatus, queriedOrder.createdAt)}
            </div>

            {/* Billing / Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/60 text-xs font-semibold text-foreground/80">
              <div className="space-y-1.5 bg-[#FCFAF7] p-4 rounded-xl border border-border/60">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">শিপিং ঠিকানা</h4>
                <p className="font-bold text-foreground">{queriedOrder.name}</p>
                <p>মোবাইল: {toBanglaNumber(queriedOrder.phone)}</p>
                <p className="leading-relaxed">ঠিকানা: {queriedOrder.address}, {queriedOrder.city} - {toBanglaNumber(queriedOrder.postcode)}</p>
              </div>

              <div className="space-y-1.5 bg-[#FCFAF7] p-4 rounded-xl border border-border/60">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">অর্ডারের পোশাকসমূহ</h4>
                <div className="space-y-2.5 max-h-[120px] overflow-y-auto pr-1">
                  {queriedOrder.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between gap-4">
                      <span className="line-clamp-1">{item.product?.name || "পোশাক"} (সাইজ: {item.size}) x{toBanglaNumber(item.quantity)}</span>
                      <span className="font-mono font-bold whitespace-nowrap">{formatBanglaPriceWithCommas(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border/40 pt-2.5 flex items-center justify-between text-[10px] font-bold">
                  <span>পেমেন্ট: {mapPaymentMethod(queriedOrder.paymentMethod)}</span>
                  <span className={`px-2 py-0.5 rounded-full ${queriedOrder.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {queriedOrder.paymentStatus === 'PAID' ? 'পরিশোধিত' : 'অপরিশোধিত'}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Care WhatsApp Quick Action */}
            <div className="pt-4 border-t border-border/60">
              <button 
                onClick={() => handleWhatsAppHelp(queriedOrder.orderNumber)}
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3 px-6 rounded-xl border-none cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-xs text-xs"
              >
                <MessageCircle size={16} />
                <span>এই অর্ডার সংক্রান্ত সাহায্যের জন্য হোয়াটসঅ্যাপে যোগাযোগ করুন</span>
              </button>
            </div>
          </div>
        )}

      </div>
      <ToastNotification isActive={toastActive} message={toastMsg} />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="grain-bg min-h-screen flex items-center justify-center text-foreground font-semibold">লোড হচ্ছে...</div>}>
      <TrackContent />
    </Suspense>
  );
}
