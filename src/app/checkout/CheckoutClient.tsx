"use client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { toBanglaNumber, formatBanglaPriceWithCommas } from "@/lib/products";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// Layout components
import Navbar from "@/components/layout/Navbar";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import MobileMenuDrawer from "@/components/layout/MobileMenuDrawer";
import MobileTabBar from "@/components/layout/MobileTabBar";
import CartDrawer from "@/components/layout/CartDrawer";
import Cta from "@/components/sections/Cta";
import ToastNotification from "@/components/overlays/ToastNotification";

export default function CheckoutClient() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    subtotal,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    clearCart,
    cartCount,
    cartDrawerOpen,
    setCartDrawerOpen,
  } = useCart();

  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastActive, setToastActive] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [couponInput, setCouponInput] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastActive(true);
    setTimeout(() => setToastActive(false), 2000);
  };

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);


  // Search redirection logic: redirect typing search to the home page
  useEffect(() => {
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  }, [searchQuery, router]);

  // Form States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [postcode, setPostcode] = useState("");
  
  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<"inside" | "outside">("inside");
  const shippingCost = shippingMethod === "inside" ? 80 : 150;
  const grandTotal = subtotal - discount + shippingCost;

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "cod" | "card">("cod");
  
  // Payment fields
  const [bkashNumber, setBkashNumber] = useState("");
  const [bkashTrx, setBkashTrx] = useState("");
  const [nagadNumber, setNagadNumber] = useState("");
  const [nagadTrx, setNagadTrx] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // UI States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState<any | null>(null);
  const [orderNumber, setOrderNumber] = useState("");

  // Redirect to home if cart is empty and order wasn't successfully placed
  useEffect(() => {
    if (items.length === 0 && !orderSuccess) {
      router.push("/");
    }
  }, [items, orderSuccess, router]);

  // Pre-fill fields if user is logged in
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");
      setAddress(user.address || "");
      setCity(user.city || "Dhaka");
      setPostcode(user.postcode || "");
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = "আপনার নাম লিখুন";
    if (!phone.trim()) {
      newErrors.phone = "আপনার মোবাইল নম্বর লিখুন";
    } else if (!/^(?:\+88|88)?(01[3-9]\d{8})$/.test(phone.trim().replace(/[-\s]/g, ""))) {
      newErrors.phone = "একটি সঠিক মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)";
    }
    if (!address.trim()) newErrors.address = "আপনার পূর্ণ ঠিকানা লিখুন";
    if (!postcode.trim()) newErrors.postcode = "পোস্টকোড লিখুন";

    if (paymentMethod === "bkash") {
      if (!bkashNumber.trim()) newErrors.bkashNumber = "বিকাশ নম্বর লিখুন";
      if (!bkashTrx.trim()) newErrors.bkashTrx = "Transaction ID লিখুন";
    } else if (paymentMethod === "nagad") {
      if (!nagadNumber.trim()) newErrors.nagadNumber = "নগদ নম্বর লিখুন";
      if (!nagadTrx.trim()) newErrors.nagadTrx = "Transaction ID লিখুন";
    } else if (paymentMethod === "card") {
      if (!cardNumber.trim()) newErrors.cardNumber = "কার্ড নম্বর লিখুন";
      if (!cardName.trim()) newErrors.cardName = "কার্ডহোল্ডারের নাম লিখুন";
      if (!cardExpiry.trim()) newErrors.cardExpiry = "মেয়াদ লিখুন";
      if (!cardCvv.trim()) newErrors.cardCvv = "CVV কোড লিখুন";
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      // Scroll to first error
      const firstErrorKey = Object.keys(newErrors)[0];
      const errorEl = document.getElementById(firstErrorKey);
      if (errorEl) {
        errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    const backendItems = items.map(item => ({
      id: item.id,
      size: item.size,
      quantity: item.quantity,
      price: item.price
    }));

    let resolvedTrxId = null;
    if (paymentMethod === "bkash") {
      resolvedTrxId = `বিকাশ নম্বর: ${bkashNumber}, TrxID: ${bkashTrx}`;
    } else if (paymentMethod === "nagad") {
      resolvedTrxId = `নগদ নম্বর: ${nagadNumber}, TrxID: ${nagadTrx}`;
    } else if (paymentMethod === "card") {
      resolvedTrxId = `কার্ড নম্বর: ${cardNumber.slice(-4)}, হোল্ডার: ${cardName}`;
    }

    const payload = {
      name,
      phone,
      email: email || null,
      address,
      city,
      postcode,
      paymentMethod,
      shippingMethod,
      trxId: resolvedTrxId,
      items: backendItems,
      discount: discount
    };

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      credentials: "include"
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to submit order");
        }
        return res.json();
      })
      .then((createdOrder) => {
        setCreatedOrderData(createdOrder);
        setOrderNumber(createdOrder.orderNumber);
        setIsSubmitting(false);
        setOrderSuccess(true);
        clearCart();
      })
      .catch((err) => {
        console.error("Order placement API error:", err);
        showToast("অর্ডার প্লেস করতে সমস্যা হয়েছে: " + err.message);
        setIsSubmitting(false);
      });
  };

    useEffect(() => {
    if (!createdOrderData) return;

    const generateAndUploadInvoice = async () => {
      // Wait for DOM to render the hidden invoice sheet
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const el = document.getElementById(`auto-invoice-sheet-${createdOrderData.id}`);
      if (!el) {
        console.error("Auto-invoice element not found!");
        return;
      }

      try {
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff"
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4"
        });

        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
          heightLeft -= pageHeight;
        }

        const pdfBlob = pdf.output("blob");
        const formData = new FormData();
        formData.append("invoice", pdfBlob, `invoice_${createdOrderData.orderNumber}.pdf`);

        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/orders/${createdOrderData.id}/invoice`, {
          method: "POST",
          body: formData,
          credentials: "include"
        });
        console.log("Automated S3 invoice upload successful for order ID:", createdOrderData.id);
      } catch (err) {
        console.error("Failed to compile/upload automated invoice PDF:", err);
      }
    };

    generateAndUploadInvoice();
  }, [createdOrderData]);

  const handleReturnHome = () => {
    clearCart();
    router.push("/");
  };

  return (
    <div className="grain-bg min-h-screen pb-24 md:pb-8">
      {/* Announcement offer bar */}
      <AnnouncementBar scrollToSection={(index) => router.push(`/?sec=${index}`)} />

      {/* Main Navbar */}
      <Navbar 
        cartCount={cartCount} 
        onOpenMenu={() => setMenuDrawerOpen(true)}
        onOpenCart={() => setCartDrawerOpen(true)}
        scrollToSection={(index) => router.push(`/?sec=${index}`)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <style dangerouslySetInnerHTML={{
        __html: `

          :root {
            --bg: var(--background);
            --fg: var(--foreground);
            --bone: var(--secondary);
            --muted: var(--muted-foreground);
            --font-bn: 'Hind Siliguri', sans-serif;
          }

          .checkout-page {
            background-color: var(--bg);
            color: var(--fg);
            font-family: var(--font-bn);
            min-height: 100vh;
            padding: 2rem 1rem 4rem;
            position: relative;
          }

          .checkout-page::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: var(--grain);
            background-size: 150px 150px;
            opacity: 0.05;
            pointer-events: none;
            z-index: 0;
          }

          .checkout-container {
            max-width: 1200px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
            padding-left: 1.25rem;
            padding-right: 1.25rem;
          }

          .checkout-header {
            text-align: center;
            margin-bottom: 3rem;
            border-bottom: 1px solid var(--border);
            padding-bottom: 2rem;
          }

          .checkout-logo {
            font-size: 2.25rem;
            font-weight: 700;
            text-decoration: none;
            color: var(--fg);
            display: inline-block;
            margin-bottom: 0.5rem;
          }

          .checkout-logo span {
            color: var(--primary);
          }

          .checkout-subtitle {
            font-size: 1.1rem;
            color: var(--muted);
          }

          .checkout-grid {
            display: grid;
            grid-template-columns: 7fr 5fr;
            gap: 2.5rem;
          }

          @media (max-width: 992px) {
            .checkout-grid {
              grid-template-columns: 1fr;
              gap: 2rem;
            }
          }

          .checkout-card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 2rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.02);
            margin-bottom: 1.5rem;
          }

          .card-title {
            font-size: 1.35rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid var(--border);
            padding-bottom: 0.75rem;
            color: var(--fg);
          }

          .form-group {
            margin-bottom: 1.25rem;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }


          label {
            display: block;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--fg);
          }

          .form-input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid var(--border);
            background: var(--bg);
            color: var(--fg);
            border-radius: var(--radius-sm);
            font-family: inherit;
            font-size: 1rem; /* 16px to prevent iOS Safari auto-zoom */
            transition: all 0.2s ease;
          }

          .form-input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 15%, transparent);
          }

          .error-text {
            color: var(--primary);
            font-size: 0.8rem;
            margin-top: 0.25rem;
            font-weight: 500;
          }

          /* Shipping Methods Styling */
          .shipping-methods {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1.5rem;
          }

          .shipping-card {
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            padding: 1rem;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--bg);
            transition: all 0.25s ease;
          }

          .shipping-card:hover {
            border-color: var(--accent);
          }

          .shipping-card.active {
            border-color: var(--primary);
            background: color-mix(in srgb, var(--primary) 5%, transparent);
            box-shadow: inset 0 0 0 1px var(--primary);
          }

          .shipping-info h4 {
            font-size: 0.95rem;
            font-weight: 700;
            margin: 0;
          }

          .shipping-info p {
            font-size: 0.75rem;
            color: var(--muted);
            margin: 0.25rem 0 0 0;
          }

          .shipping-price {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--primary);
          }

          /* Payment Tabs */
          .payment-tabs {
            display: flex;
            gap: 0.5rem;
            border-bottom: 1px solid var(--border);
            margin-bottom: 1.5rem;
            overflow-x: auto;
            padding-bottom: 2px;
          }

          .payment-tab {
            flex: 1;
            padding: 0.75rem 0.5rem;
            background: none;
            border: none;
            font-family: inherit;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            color: var(--muted);
            border-bottom: 2px solid transparent;
            transition: all 0.2s ease;
            white-space: nowrap;
            text-align: center;
          }

          .payment-tab:hover {
            color: var(--fg);
          }

          .payment-tab.active {
            color: var(--primary);
            border-bottom-color: var(--primary);
          }

          .payment-details {
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            padding: 1.25rem;
            margin-bottom: 1.5rem;
          }

          .payment-instructions {
            font-size: 0.9rem;
            line-height: 1.6;
            color: var(--muted);
            margin-bottom: 1rem;
          }

          .payment-instructions strong {
            color: var(--fg);
          }

          /* Summary Items */
          .summary-items {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1.5rem;
            max-height: 280px;
            overflow-y: auto;
            padding-right: 0.5rem;
          }

          .summary-item {
            display: flex;
            gap: 1rem;
            align-items: center;
          }

          .summary-item-img {
            width: 50px;
            height: 65px;
            object-fit: cover;
            border-radius: var(--radius-sm);
            background: var(--bone);
            border: 1px solid var(--border);
          }

          .summary-item-details {
            flex: 1;
          }

          .summary-item-name {
            font-size: 0.9rem;
            font-weight: 600;
            margin: 0;
          }

          .summary-item-meta {
            font-size: 0.75rem;
            color: var(--muted);
            margin-top: 0.15rem;
          }

          .summary-item-price {
            font-size: 0.9rem;
            font-weight: 700;
            color: var(--fg);
          }

          .divider {
            height: 1px;
            background: var(--border);
            margin: 1.25rem 0;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.95rem;
            color: var(--muted);
            margin-bottom: 0.65rem;
          }

          .summary-row.total {
            font-size: 1.35rem;
            font-weight: 700;
            color: var(--fg);
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px dashed var(--border);
          }

          .summary-row.total .total-price {
            color: var(--primary);
          }

          .btn-submit-order {
            display: flex;
            width: 100%;
            padding: 1.1rem;
            background: var(--primary);
            color: #fff;
            border: none;
            border-radius: 9999px;
            font-size: 1.1rem;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
            justify-content: center;
            align-items: center;
            transition: all 0.25s ease;
            box-shadow: 0 4px 15px color-mix(in srgb, var(--primary) 20%, transparent);
          }

          .btn-submit-order:hover:not(:disabled) {
            background: var(--fg);
            box-shadow: 0 4px 15px color-mix(in srgb, var(--fg) 15%, transparent);
          }

          .btn-submit-order:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--muted);
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            transition: color 0.2s;
          }

          .back-link:hover {
            color: var(--primary);
          }

          /* Success Overlay Modal */
          .success-overlay {
            position: fixed;
            inset: 0;
            background: color-mix(in srgb, var(--fg) 60%, transparent);
            backdrop-filter: blur(8px);
            z-index: 20000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            opacity: 0;
            animation: fadeIn 0.3s forwards;
          }

          .success-modal {
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            max-width: 500px;
            width: 100%;
            padding: 2.5rem 2rem;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            transform: scale(0.9);
            animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }

          .success-icon-wrap {
            width: 4.5rem;
            height: 4.5rem;
            background: color-mix(in srgb, var(--primary) 10%, transparent);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            color: var(--primary);
          }

          .success-icon {
            width: 2.5rem;
            height: 2.5rem;
          }

          .success-title {
            font-size: 1.65rem;
            font-weight: 700;
            color: var(--fg);
            margin-bottom: 0.75rem;
          }

          .success-message {
            color: var(--muted);
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 1.75rem;
          }

          .success-details {
            background: var(--bone);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            padding: 1rem 1.25rem;
            margin-bottom: 2rem;
            text-align: left;
          }

          .success-details-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
          }

          .success-details-row:last-child {
            margin-bottom: 0;
          }

          .success-details-label {
            color: var(--muted);
          }

          .success-details-val {
            font-weight: 700;
            color: var(--fg);
          }

          .btn-home {
            background: var(--fg);
            color: var(--bg);
            border: none;
            border-radius: 9999px;
            padding: 0.9rem 2rem;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            font-family: inherit;
            transition: background 0.2s;
            width: 100%;
          }

          .btn-home:hover {
            background: var(--primary);
            color: #fff;
          }

          @media (max-width: 768px) {
            .checkout-card {
              padding: 1.25rem 1rem;
            }
            .form-row {
              grid-template-columns: 1fr;
            }
            .shipping-methods {
              grid-template-columns: 1fr;
              gap: 0.75rem;
            }
            .payment-tabs {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 0.5rem;
              border-bottom: none;
              padding-bottom: 0;
            }
            .payment-tab {
              border: 1px solid var(--border);
              border-radius: var(--radius-sm);
              padding: 0.65rem 0.25rem;
              font-size: 0.8rem;
            }
            .payment-tab.active {
              border-color: var(--primary);
              background: color-mix(in srgb, var(--primary) 5%, transparent);
              border-bottom-color: var(--primary);
            }
          }

          @keyframes fadeIn {
            to { opacity: 1; }
          }

          @keyframes scaleIn {
            to { transform: scale(1); }
          }
        `
      }} />

      <div className="checkout-container" style={{ paddingTop: "2rem" }}>
        {/* Breadcrumb Path */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap py-1">
          <Link href="/" className="hover:text-primary transition-colors">হোম</Link>
          <ChevronRight size={12} className="flex-shrink-0" />
          <span className="text-foreground font-semibold">চেকআউট</span>
        </nav>

        <div className="mb-8 border-b border-border pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground">চেকআউট করুন</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">অনুগ্রহ করে নিচের ডেলিভারি ও পেমেন্ট ফর্মটি পূরণ করে আপনার অর্ডারটি সম্পন্ন করুন।</p>
        </div>

        {!user && (
          <div className="bg-secondary/30 border border-border/80 p-4 rounded-xl mb-6 text-xs font-semibold text-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span>দ্রুত চেকআউট করতে চান? আপনার ইনফো দিয়ে অটো-ফিল করতে লগইন করুন।</span>
            <Link href="/login?redirect=/checkout" className="text-primary font-bold hover:underline no-underline whitespace-nowrap">
              লগইন করুন →
            </Link>
          </div>
        )}


        <form onSubmit={handlePlaceOrder} className="checkout-grid">
          {/* Left Column - Shipping & Payment Form */}
          <div className="checkout-form-column">
            
            {/* Shipping Address Card */}
            <div className="checkout-card">
              <h2 className="card-title">১. ডেলিভারি ও যোগাযোগের ঠিকানা</h2>
              
              <div className="form-group" id="name">
                <label htmlFor="nameInput">নাম *</label>
                <input 
                  type="text" 
                  id="nameInput"
                  className="form-input" 
                  placeholder="আপনার সম্পূর্ণ নাম লিখুন"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <div className="error-text">{errors.name}</div>}
              </div>

              <div className="form-row">
                <div className="form-group" id="phone">
                  <label htmlFor="phoneInput">মোবাইল নম্বর *</label>
                  <input 
                    type="tel" 
                    id="phoneInput"
                    className="form-input" 
                    placeholder="যেমন: 017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  {errors.phone && <div className="error-text">{errors.phone}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="emailInput">ই-মেইল (ঐচ্ছিক)</label>
                  <input 
                    type="email" 
                    id="emailInput"
                    className="form-input" 
                    placeholder="mail@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" id="address">
                <label htmlFor="addressInput">পূর্ণ ঠিকানা *</label>
                <input 
                  type="text" 
                  id="addressInput"
                  className="form-input" 
                  placeholder="বাড়ি নম্বর, রোড নম্বর, এলাকা"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                {errors.address && <div className="error-text">{errors.address}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="citySelect">শহর *</label>
                  <select 
                    id="citySelect" 
                    className="form-input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    <option value="Dhaka">ঢাকা (Dhaka)</option>
                    <option value="Chittagong">চট্টগ্রাম (Chittagong)</option>
                    <option value="Sylhet">সিলেট (Sylhet)</option>
                    <option value="Rajshahi">রাজশাহী (Rajshahi)</option>
                    <option value="Khulna">খুলনা (Khulna)</option>
                    <option value="Barisal">বরিশাল (Barisal)</option>
                    <option value="Rangpur">রংপুর (Rangpur)</option>
                    <option value="Mymensingh">ময়মনসিংহ (Mymensingh)</option>
                  </select>
                </div>

                <div className="form-group" id="postcode">
                  <label htmlFor="postcodeInput">পোস্টকোড *</label>
                  <input 
                    type="text" 
                    id="postcodeInput"
                    className="form-input" 
                    placeholder="যেমন: ১২১২"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                  />
                  {errors.postcode && <div className="error-text">{errors.postcode}</div>}
                </div>
              </div>
            </div>

            {/* Delivery Methods Card */}
            <div className="checkout-card">
              <h2 className="card-title">২. ডেলিভারি এলাকা নির্বাচন করুন</h2>
              <div className="shipping-methods">
                <div 
                  className={`shipping-card ${shippingMethod === "inside" ? "active" : ""}`}
                  onClick={() => setShippingMethod("inside")}
                >
                  <div className="shipping-info">
                    <h4>ঢাকার ভেতরে</h4>
                    <p>হোম ডেলিভারি (১–২ দিন)</p>
                  </div>
                  <div className="shipping-price">৳ ৮০</div>
                </div>

                <div 
                  className={`shipping-card ${shippingMethod === "outside" ? "active" : ""}`}
                  onClick={() => setShippingMethod("outside")}
                >
                  <div className="shipping-info">
                    <h4>ঢাকার বাইরে</h4>
                    <p>কুরিয়ার ডেলিভারি (৩–৫ দিন)</p>
                  </div>
                  <div className="shipping-price">৳ ১৫০</div>
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="checkout-card">
              <h2 className="card-title">৩. পেমেন্ট পদ্ধতি</h2>
              
              <div className="payment-tabs">
                <button 
                  type="button"
                  className="payment-tab active"
                  style={{ width: "100%", cursor: "default" }}
                >
                  ক্যাশ অন ডেলিভারি (COD)
                </button>
              </div>

              {/* bKash instructions */}
              {paymentMethod === "bkash" && (
                <div className="payment-details-wrapper">
                  <div className="payment-instructions">
                    অনুগ্রহ করে আমাদের বিকাশ পার্সোনাল নম্বর <strong>০১৭০০ ০০০০০০</strong>-এ মোট টাকার পরিমাণ <strong>"Send Money"</strong> করুন। এরপর নিচের ঘরে আপনার বিকাশ নম্বর এবং লেনদেনের Transaction ID লিখুন।
                  </div>
                  <div className="payment-details">
                    <div className="form-group" id="bkashNumber">
                      <label htmlFor="bkashNumberInput">বিকাশ নম্বর (যে নম্বর থেকে টাকা পাঠিয়েছেন) *</label>
                      <input 
                        type="text" 
                        id="bkashNumberInput"
                        className="form-input" 
                        placeholder="যেমন: 017XXXXXXXX"
                        value={bkashNumber}
                        onChange={(e) => setBkashNumber(e.target.value)}
                      />
                      {errors.bkashNumber && <div className="error-text">{errors.bkashNumber}</div>}
                    </div>
                    <div className="form-group" id="bkashTrx">
                      <label htmlFor="bkashTrxInput">Transaction ID (ট্রানজেকশন আইডি) *</label>
                      <input 
                        type="text" 
                        id="bkashTrxInput"
                        className="form-input" 
                        placeholder="যেমন: A1B2C3D4"
                        value={bkashTrx}
                        onChange={(e) => setBkashTrx(e.target.value)}
                      />
                      {errors.bkashTrx && <div className="error-text">{errors.bkashTrx}</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* Nagad instructions */}
              {paymentMethod === "nagad" && (
                <div className="payment-details-wrapper">
                  <div className="payment-instructions">
                    অনুগ্রহ করে আমাদের নগদ পার্সোনাল নম্বর <strong>০১৭০০ ০০০০০০</strong>-এ মোট টাকার পরিমাণ <strong>"Send Money"</strong> করুন। এরপর নিচের ঘরে আপনার নগদ নম্বর এবং লেনদেনের Transaction ID লিখুন।
                  </div>
                  <div className="payment-details">
                    <div className="form-group" id="nagadNumber">
                      <label htmlFor="nagadNumberInput">নগদ নম্বর (যে নম্বর থেকে টাকা পাঠিয়েছেন) *</label>
                      <input 
                        type="text" 
                        id="nagadNumberInput"
                        className="form-input" 
                        placeholder="যেমন: 017XXXXXXXX"
                        value={nagadNumber}
                        onChange={(e) => setNagadNumber(e.target.value)}
                      />
                      {errors.nagadNumber && <div className="error-text">{errors.nagadNumber}</div>}
                    </div>
                    <div className="form-group" id="nagadTrx">
                      <label htmlFor="nagadTrxInput">Transaction ID (ট্রানজেকশন আইডি) *</label>
                      <input 
                        type="text" 
                        id="nagadTrxInput"
                        className="form-input" 
                        placeholder="যেমন: A1B2C3D4"
                        value={nagadTrx}
                        onChange={(e) => setNagadTrx(e.target.value)}
                      />
                      {errors.nagadTrx && <div className="error-text">{errors.nagadTrx}</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* COD instructions */}
              {paymentMethod === "cod" && (
                <div className="payment-details">
                  <div className="payment-instructions" style={{ marginBottom: 0 }}>
                    পোশাক হাতে পাওয়ার সময় ডেলিভারি ম্যানকে মূল্য পরিশোধ করুন। এই ক্ষেত্রে কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই।
                  </div>
                </div>
              )}

              {/* Card instructions */}
              {paymentMethod === "card" && (
                <div className="payment-details">
                  <div className="payment-instructions">
                    নিরাপদ কার্ড পেমেন্ট গেটওয়ে (Purely Visual Demo / SSL Secured visual)।
                  </div>
                  <div className="form-group" id="cardNumber">
                    <label htmlFor="cardNumberInput">কার্ড নম্বর *</label>
                    <input 
                      type="text" 
                      id="cardNumberInput"
                      className="form-input" 
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                    {errors.cardNumber && <div className="error-text">{errors.cardNumber}</div>}
                  </div>
                  
                  <div className="form-group" id="cardName">
                    <label htmlFor="cardNameInput">কার্ডহোল্ডারের নাম *</label>
                    <input 
                      type="text" 
                      id="cardNameInput"
                      className="form-input" 
                      placeholder="যেমন: FARIYA AHMED"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                    {errors.cardName && <div className="error-text">{errors.cardName}</div>}
                  </div>

                  <div className="form-row">
                    <div className="form-group" id="cardExpiry">
                      <label htmlFor="cardExpiryInput">মেয়াদ শেষ হওয়ার তারিখ *</label>
                      <input 
                        type="text" 
                        id="cardExpiryInput"
                        className="form-input" 
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                      {errors.cardExpiry && <div className="error-text">{errors.cardExpiry}</div>}
                    </div>

                    <div className="form-group" id="cardCvv">
                      <label htmlFor="cardCvvInput">CVV কোড *</label>
                      <input 
                        type="password" 
                        id="cardCvvInput"
                        maxLength={4}
                        className="form-input" 
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                      />
                      {errors.cardCvv && <div className="error-text">{errors.cardCvv}</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="checkout-summary-column">
            <div className="checkout-card" style={{ position: "sticky", top: "2rem" }}>
              <h2 className="card-title">অর্ডার সারসংক্ষেপ</h2>
              
              <div className="summary-items">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="summary-item">
                    <Image src={item.img?.src || item.img} alt={item.name} width={50} height={65} className="summary-item-img" />
                    <div className="summary-item-details">
                      <h3 className="summary-item-name">{item.name}</h3>
                      <div className="summary-item-meta">সাইজ: {item.size} | পরিমাণ: {toBanglaNumber(item.quantity)}</div>
                    </div>
                    <div className="summary-item-price">{formatBanglaPriceWithCommas(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="divider"></div>

              <div className="summary-row">
                <span>উপমোট</span>
                <span>{formatBanglaPriceWithCommas(subtotal)}</span>
              </div>

              {/* Coupon Form */}
              {appliedCoupon ? (
                <div className="flex justify-between items-center bg-primary/10 p-2.5 rounded-lg text-xs text-primary font-bold mb-3 border border-primary/20 mt-2">
                  <span>কুপন কোড ({appliedCoupon}) যুক্ত হয়েছে</span>
                  <button 
                    type="button" 
                    className="bg-transparent border-none text-primary cursor-pointer text-xs font-black underline" 
                    onClick={removeCoupon}
                  >
                    বাদ দিন
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 my-3">
                  <input
                    type="text"
                    placeholder="কুপন কোড লিখুন"
                    className="form-input"
                    style={{ padding: "0.5rem 0.75rem" }}
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />
                  <button 
                    type="button"
                    className="py-1.5 px-4 bg-foreground text-background border-none rounded-xl text-xs cursor-pointer font-bold transition-colors hover:bg-primary"
                    onClick={async () => {
                      const res = await applyCoupon(couponInput);
                      showToast(res.message);
                      if (res.success) setCouponInput("");
                    }}
                  >
                    প্রয়োগ
                  </button>
                </div>
              )}

              {appliedCoupon && (
                <div className="summary-row" style={{ color: "var(--primary)", fontWeight: "500" }}>
                  <span>ছাড় (কুপন: {appliedCoupon})</span>
                  <span>-{formatBanglaPriceWithCommas(discount)}</span>
                </div>
              )}

              <div className="summary-row">
                <span>ডেলিভারি খরচ</span>
                <span>{formatBanglaPriceWithCommas(shippingCost)}</span>
              </div>

              <div className="summary-row total">
                <span>সর্বমোট পরিশোধযোগ্য</span>
                <span className="total-price">{formatBanglaPriceWithCommas(grandTotal)}</span>
              </div>

              <div className="divider"></div>

              <button 
                type="submit" 
                className="btn-submit-order"
                disabled={isSubmitting || items.length === 0}
              >
                {isSubmitting ? "অর্ডার প্রসেস হচ্ছে..." : "অর্ডার নিশ্চিত করুন"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Order Success Popup Modal */}
      {orderSuccess && (
        <div className="success-overlay">
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="success-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="success-title">অর্ডার সফল হয়েছে!</h2>
            <p className="success-message">
              অভিনন্দন! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। অর্ডার সংক্রান্ত তথ্য ও ট্র্যাকিং বিস্তারিত মোবাইলে এসএমএস-এর মাধ্যমে পাঠিয়ে দেওয়া হবে।
            </p>
            
            <div className="success-details">
              <div className="success-details-row">
                <span className="success-details-label">অর্ডার নম্বর:</span>
                <span className="success-details-val">{orderNumber}</span>
              </div>
              <div className="success-details-row">
                <span className="success-details-label">ক্রেতার নাম:</span>
                <span className="success-details-val">{name}</span>
              </div>
              <div className="success-details-row">
                <span className="success-details-label">মোবাইল নম্বর:</span>
                <span className="success-details-val">{phone}</span>
              </div>
              <div className="success-details-row">
                <span className="success-details-label">পেমেন্ট পদ্ধতি:</span>
                <span className="success-details-val">
                  {paymentMethod === "bkash" && "বিকাশ (bKash)"}
                  {paymentMethod === "nagad" && "নগদ (Nagad)"}
                  {paymentMethod === "cod" && "ক্যাশ অন ডেলিভারি (COD)"}
                  {paymentMethod === "card" && "কার্ড পেমেন্ট (Card)"}
                </span>
              </div>
              <div className="success-details-row" style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px dashed rgba(42,26,14,0.1)" }}>
                <span className="success-details-label">সর্বমোট পরিশোধিত:</span>
                <span className="success-details-val" style={{ color: "var(--primary)" }}>{formatBanglaPriceWithCommas(grandTotal)}</span>
              </div>
            </div>

            <button className="btn-home" onClick={handleReturnHome}>
              হোম পেজে ফিরুন
            </button>
          </div>
        </div>
      )}

      {/* Slide drawers and notifications */}
      <MobileMenuDrawer 
        isOpen={menuDrawerOpen}
        onClose={() => setMenuDrawerOpen(false)}
        activeSection={99}
        scrollToSection={(index) => router.push(`/?sec=${index}`)}
      />
      <CartDrawer showToast={showToast} />
      <ToastNotification isActive={toastActive} message={toastMsg} />

      {/* Mobile-only layout bottom sticky nav tabs */}
      <MobileTabBar 
        activeSection={99}
        cartCount={cartCount}
        cartDrawerOpen={cartDrawerOpen}
        scrollToSection={(index) => router.push(`/?sec=${index}`)}
        setCartDrawerOpen={setCartDrawerOpen}
        showToast={showToast}
      />

      {/* Newsletter & Global Footer */}
      <Cta scrollToSection={(index) => router.push(`/?sec=${index}`)} />
          {/* Hidden A4 Invoice Sheet for Automated S3 Upload */}
      {createdOrderData && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px", width: "794px" }}>
          <div 
            id={`auto-invoice-sheet-${createdOrderData.id}`}
            style={{
              background: "#ffffff",
              padding: "40px",
              fontFamily: "sans-serif",
              color: "#1e293b",
              borderRadius: "8px",
              border: "1px solid #e2e8f0"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", borderBottom: "2px solid #0f172a", paddingBottom: "20px", marginBottom: "20px" }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 }}>তানহা ফ্যাশন</h1>
                <p style={{ fontSize: "10px", color: "#64748b", marginTop: "4px", fontWeight: "600" }}>তানহা ফ্যাশন — অনন্য কালেকশন</p>
                <p style={{ fontSize: "9px", color: "#94a3b8", marginTop: "2px" }}>Mirpur, Dhaka, Bangladesh | মোবাইল: 01863-694027</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "9px", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>রসিদ / ইনভয়েস</div>
                <div style={{ fontSize: "16px", fontFamily: "monospace", fontWeight: "900", color: "#0f172a", marginTop: "4px" }}>#{createdOrderData.orderNumber}</div>
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>
                  তারিখ: {new Date(createdOrderData.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", fontSize: "11px", marginBottom: "24px" }}>
              <div>
                <h4 style={{ fontWeight: "800", color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px", marginBottom: "8px", textTransform: "uppercase", fontSize: "9px" }}>ডেলিভারি ঠিকানা</h4>
                <div style={{ fontWeight: "900", color: "#0f172a", fontSize: "12px", marginBottom: "4px" }}>{createdOrderData.customerName || createdOrderData.name}</div>
                <div style={{ color: "#475569", fontWeight: "600" }}>{createdOrderData.address}</div>
                <div style={{ color: "#475569", fontWeight: "700", marginTop: "4px" }}>{createdOrderData.city} - {createdOrderData.postcode}</div>
              </div>
              <div>
                <h4 style={{ fontWeight: "800", color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px", marginBottom: "8px", textTransform: "uppercase", fontSize: "9px" }}>পেমেন্ট ও কন্টাক্ট</h4>
                <div style={{ fontWeight: "700", color: "#334155" }}>মোবাইল: {createdOrderData.phone}</div>
                {createdOrderData.email && <div style={{ color: "#334155", marginTop: "4px" }}>ইমেইল: {createdOrderData.email}</div>}
                <div style={{ marginTop: "10px" }}>
                  <span style={{ fontSize: "9px", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", display: "block" }}>পেমেন্ট পদ্ধতি:</span>
                  <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "10px", marginTop: "2px", display: "block" }}>
                    {createdOrderData.paymentMethod === "bkash" ? "বিকাশ" : createdOrderData.paymentMethod === "nagad" ? "নগদ" : createdOrderData.paymentMethod === "cod" ? "ক্যাশ অন ডেলিভারি" : createdOrderData.paymentMethod}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", marginBottom: "24px", fontSize: "11px", backgroundColor: "#f8fafc" }}>
              <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f1f5f9", borderBottom: "1px solid #e2e8f0", fontSize: "9px", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>
                    <th style={{ padding: "8px 12px" }}>আইটেম বিবরণ</th>
                    <th style={{ padding: "8px 12px", textAlign: "center" }}>সাইজ</th>
                    <th style={{ padding: "8px 12px", textAlign: "center" }}>পরিমাণ</th>
                    <th style={{ padding: "8px 12px", textAlign: "right" }}>মোট মূল্য</th>
                  </tr>
                </thead>
                <tbody style={{ color: "#334155" }}>
                  {createdOrderData.items && createdOrderData.items.map((item: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "10px 12px", fontWeight: "600", color: "#0f172a" }}>
                        <div>{item.product?.name || "ডিজাইনার ড্রেস"}</div>
                        <div style={{ fontSize: "9px", color: "#94a3b8", fontFamily: "monospace", marginTop: "2px" }}>ID/SKU: {item.product?.sku || item.productId}</div>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: "700" }}>{item.size}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: "700" }}>{item.quantity}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "700", fontFamily: "monospace" }}>৳ {item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ maxWidth: "240px", marginLeft: "auto", fontSize: "11px", display: "flex", flexDirection: "column", gap: "6px", borderTop: "1px solid #e2e8f0", paddingTop: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontWeight: "600" }}>
                <span>উপমোট:</span>
                <span style={{ fontWeight: "700", color: "#1e293b" }}>৳ {createdOrderData.subtotal}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontWeight: "600" }}>
                <span>ডেলিভারি খরচ:</span>
                <span style={{ fontWeight: "700", color: "#1e293b" }}>৳ {createdOrderData.shippingCost}</span>
              </div>
              {createdOrderData.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#e11d48", fontWeight: "700" }}>
                  <span>ছাড় (কুপন):</span>
                  <span>-৳ {createdOrderData.discount}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "900", borderTop: "1px dashed #cbd5e1", paddingTop: "8px", color: "#0f172a" }}>
                <span>সর্বমোট পরিশোধযোগ্য:</span>
                <span style={{ color: "#8b5cf6" }}>৳ {createdOrderData.grandTotal}</span>
              </div>
            </div>

            {createdOrderData.trxId && (
              <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px", borderRadius: "8px", fontSize: "9px", fontWeight: "700", color: "#475569", textAlign: "center", fontFamily: "monospace" }}>
                লেনদেন আইডি (TrxID): <span style={{ color: "#0f172a", fontWeight: "900" }}>{createdOrderData.trxId}</span>
              </div>
            )}
          </div>
        </div>
      )}

</div>
  );
}

