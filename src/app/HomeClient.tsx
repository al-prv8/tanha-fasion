"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { PRODUCTS, Product, toBanglaNumber, formatBanglaPriceWithCommas } from "@/lib/products";

// Assets imports
import heroModel from "@/assets/hero-model.jpg";
import catSaree from "@/assets/cat-saree.jpg";
import catPanjabi from "@/assets/cat-panjabi.jpg";
import catKurta from "@/assets/cat-kurta.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";
import catSalwar from "@/assets/cat-salwar.jpg";
import catShawl from "@/assets/cat-shawl.jpg";

import craftImg from "@/assets/craft.jpg";
import look1 from "@/assets/look-1.jpg";
import look2 from "@/assets/look-2.jpg";
import look3 from "@/assets/look-3.jpg";

export default function HomeClient() {
  const {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discount,
    cartCount,
    cartDrawerOpen,
    setCartDrawerOpen,
  } = useCart();

  const [activeSection, setActiveSection] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("M");
  const [couponInput, setCouponInput] = useState("");
  const [modalData, setModalData] = useState<{
    location: string;
    title: string;
    description: string;
    imgSrc: any;
    product?: Product;
  }>({
    location: "",
    title: "",
    description: "",
    imgSrc: "",
  });
  const [toastActive, setToastActive] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showFloatingCart, setShowFloatingCart] = useState(false);

  const sections = [
    { id: "body", label: "সূচনা" },
    { id: "categories", label: "শ্রেণী" },
    { id: "collection", label: "সংগ্রহ" },
    { id: "craft", label: "কারিগরি" },
    { id: "lookbook", label: "লুকবুক" },
    { id: "testimonials", label: "মতামত" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const scrollPos = window.scrollY + windowHeight * 0.4;
      let activeIdx = 0;

      sections.forEach((sec, idx) => {
        const el = sec.id === "body" ? document.body : document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            activeIdx = idx;
          }
        }
      });

      setActiveSection(activeIdx);

      // Show/hide floating cart based on scroll position
      if (window.scrollY > 300) {
        setShowFloatingCart(true);
      } else {
        setShowFloatingCart(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const revealItems = document.querySelectorAll(".reveal-item");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1 }
    );

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (index: number) => {
    const sec = sections[index];
    const el = sec.id === "body" ? document.body : document.getElementById(sec.id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 50,
        behavior: "smooth",
      });
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastActive(true);
    setTimeout(() => {
      setToastActive(false);
    }, 2000);
  };

  const openSpotlight = (
    locationOrProduct: string | Product,
    title?: string,
    description?: string,
    imgSrc?: any
  ) => {
    setSelectedSize("M");
    if (typeof locationOrProduct === "object") {
      const prod = locationOrProduct;
      setModalData({
        location: prod.loc,
        title: prod.title,
        description: prod.desc,
        imgSrc: prod.img,
        product: prod,
      });
    } else {
      setModalData({
        location: locationOrProduct,
        title: title || "",
        description: description || "",
        imgSrc: imgSrc || "",
        product: undefined,
      });
    }
    setModalOpen(true);
  };

  const closeSpotlight = () => {
    setModalOpen(false);
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      showToast(`কুপন কোড "${code}" কপি করা হয়েছে!`);
    });
  };

  const faqs = [
    {
      q: "পোশাক কত দিনে পৌঁছাবে?",
      a: "ঢাকার ভেতরে ১–২ কর্মদিবস, ঢাকার বাইরে সারা দেশে ৩–৫ কর্মদিবসের মধ্যে পৌঁছে যাবে।",
    },
    {
      q: "পোশাকের কাপড় কোথা থেকে আসে?",
      a: "প্রতিটি কাপড় বাংলাদেশের তাঁতি পরিবারের হাতে সরাসরি তৈরি — রূপগঞ্জ, টাঙ্গাইল, কুমিল্লা ও সিরাজগঞ্জ থেকে আসে।",
    },
    {
      q: "ফেরত বা পরিবর্তনের নিয়ম কী?",
      a: "পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে অক্ষত অবস্থায় ফেরত বা সাইজ পরিবর্তন করা যাবে — কোনো অতিরিক্ত খরচ ছাড়াই।",
    },
    {
      q: "মাপ নিয়ে সমস্যা হলে কী করব?",
      a: "আমাদের সাইজ গাইড অনুসরণ করুন, অথবা সরাসরি হোয়াটসঅ্যাপে আমাদের জানান — আমরা ব্যক্তিগত মাপে তৈরি করে দেব।",
    },
    {
      q: "ক্যাশ অন ডেলিভারি আছে কি?",
      a: "হ্যাঁ, সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে — সাথে বিকাশ, নগদ ও কার্ডে পেমেন্টের ব্যবস্থাও আছে।",
    },
  ];

  return (
    <div className="grain">
      <style dangerouslySetInnerHTML={{
        __html: `
          *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

          :root {
            --bg: #F5EDE4;
            --fg: #2A1A0E;
            --primary: #A0522D;
            --primary-light: #C4845C;
            --accent: #D4956B;
            --muted: #8B7355;
            --card: #EDE3D6;
            --bone: #F9F3EC;
            --gold: #C9A96E;
            --font-bn: 'Hind Siliguri', sans-serif;
            --font-en: 'Hind Siliguri', sans-serif;
            --grain: radial-gradient(rgba(42,26,14,0.04) 1px, transparent 1px);
            --shadow-soft: 0 30px 80px -30px rgba(42,26,14,0.25);
          }

          html { scroll-behavior: smooth; }
          body {
            background: var(--bg) !important;
            color: var(--fg) !important;
            font-family: var(--font-bn) !important;
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden;
            line-height: 1.6;
          }

          /* ==================== GRAIN TEXTURE ==================== */
          .grain { background-image: var(--grain); background-size: 3px 3px; min-height: 100vh; }

          /* ==================== INTERACTIVE DOT NAV ==================== */
          .chapter-nav {
            position: fixed;
            left: 2.5rem;
            top: 50%;
            transform: translateY(-50%);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }
          .chapter-dot-wrapper {
            display: flex;
            align-items: center;
            gap: 1rem;
            text-decoration: none;
            color: var(--fg);
            cursor: pointer;
          }
          .chapter-dot {
            width: 0.5rem;
            height: 0.5rem;
            border-radius: 50%;
            background: rgba(42, 26, 14, 0.2);
            border: 1px solid var(--fg);
            transition: all 0.3s;
          }
          .chapter-lbl {
            font-size: 0.8rem;
            font-weight: 600;
            opacity: 0;
            transform: translateX(-10px);
            transition: all 0.3s;
            white-space: nowrap;
            pointer-events: none;
          }
          .chapter-dot-wrapper:hover .chapter-lbl {
            opacity: 0.8;
            transform: translateX(0);
          }
          .chapter-dot-wrapper.active .chapter-dot {
            background: var(--primary);
            border-color: var(--primary);
            transform: scale(1.5);
          }
          .chapter-dot-wrapper.active .chapter-lbl {
            opacity: 1;
            transform: translateX(0);
            color: var(--primary);
          }

          /* ==================== DROPCAP ==================== */
          .dropcap::first-letter {
            font-family: var(--font-en);
            font-size: 3.5rem;
            font-weight: 700;
            float: left;
            margin-right: 0.6rem;
            line-height: 1;
            color: var(--primary);
          }

          /* ==================== SCROLL ANIMATIONS ==================== */
          .reveal-item {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s cubic-bezier(0.2, 0.7, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.7, 0.2, 1);
          }
          .reveal-item.revealed {
            opacity: 1;
            transform: translateY(0);
          }

          /* ==================== ANIMATIONS ==================== */
          @keyframes rise {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }

          .rise { animation: rise 1s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
          .rise-d1 { animation-delay: 0.15s; }
          .rise-d2 { animation-delay: 0.3s; }
          .rise-d3 { animation-delay: 0.45s; }
          .fade-in { animation: fadeIn 1.2s ease both; }

          /* ==================== NAV ==================== */
          .nav {
            position: relative;
            z-index: 100;
            padding: 1.5rem 3rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 1440px;
            margin: 0 auto;
          }
          .nav-logo {
            display: flex;
            align-items: baseline;
            gap: 0.5rem;
            text-decoration: none;
            color: var(--fg);
          }
          .nav-logo-name {
            font-size: 1.75rem;
            font-weight: 700;
            letter-spacing: -0.02em;
          }
          .nav-logo-sub {
            font-size: 0.65rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.3em;
            color: var(--muted);
          }
          .nav-links {
            display: flex;
            gap: 2.5rem;
            list-style: none;
          }
          .nav-links a {
            text-decoration: none;
            color: var(--fg);
            font-size: 0.875rem;
            font-weight: 500;
            transition: color 0.3s;
          }
          .nav-links a:hover { color: var(--primary); }
          .nav-bag {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            border: 1px solid rgba(42,26,14,0.2);
            padding: 0.5rem 1rem;
            border-radius: 999px;
            font-size: 0.875rem;
            font-weight: 500;
            background: transparent;
            color: var(--fg);
            cursor: pointer;
            transition: all 0.3s;
          }
          .nav-bag:hover { background: var(--fg); color: var(--bg); }
          .nav-bag-count {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 1.25rem;
            height: 1.25rem;
            border-radius: 50%;
            background: var(--primary);
            color: var(--bone);
            font-size: 0.625rem;
          }

          /* ==================== HERO ==================== */
          .hero {
            position: relative;
            max-width: 1440px;
            margin: 0 auto;
            padding: 2rem 3rem 4rem;
            display: grid;
            grid-template-columns: 7fr 5fr;
            gap: 3rem;
            align-items: start;
          }
          .hero::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: var(--grain);
            background-size: 3px 3px;
            opacity: 0.6;
            pointer-events: none;
          }
          .hero-text { position: relative; z-index: 2; }
          .hero-season {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.4em;
            color: var(--muted);
            margin-bottom: 1.5rem;
          }
          .hero-season::before {
            content: '';
            width: 2.5rem;
            height: 1px;
            background: rgba(42,26,14,0.4);
          }
          .hero h1 {
            font-family: var(--font-bn);
            font-size: clamp(4rem, 9.5vw, 8.5rem);
            font-weight: 700;
            line-height: 0.85;
            letter-spacing: -0.03em;
            text-wrap: balance;
          }
          .hero h1 .accent {
            font-weight: 700;
            color: var(--primary);
          }
          .hero-desc {
            margin-top: 2rem;
            max-width: 28rem;
            font-size: 1.05rem;
            line-height: 1.7;
            color: var(--muted);
          }
          .hero-actions {
            margin-top: 2.5rem;
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            align-items: center;
          }
          .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            background: var(--fg);
            color: var(--bg);
            padding: 1rem 2rem;
            border-radius: 999px;
            font-size: 0.875rem;
            font-weight: 600;
            text-decoration: none;
            transition: transform 0.3s;
          }
          .btn-primary:hover { transform: scale(1.03); }
          .btn-primary .arrow {
            display: inline-block;
            transition: transform 0.3s;
          }
          .btn-primary:hover .arrow { transform: translateX(4px); }
          .btn-text {
            font-size: 0.875rem;
            font-weight: 500;
            text-decoration: none;
            color: var(--fg);
            text-underline-offset: 8px;
          }
          .btn-text:hover { text-decoration: underline; }

          .hero-stats {
            margin-top: 4rem;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
            border-top: 1px solid rgba(42,26,14,0.1);
            padding-top: 2rem;
            max-width: 30rem;
          }
          .hero-stat-val {
            font-size: 2rem;
            font-weight: 700;
          }
          .hero-stat-label {
            margin-top: 0.25rem;
            font-size: 0.7rem;
            color: var(--muted);
          }

          .hero-image {
            position: relative;
          }
          .hero-image-wrap {
            position: relative;
            aspect-ratio: 3/4;
            overflow: hidden;
            border-radius: 2px;
            box-shadow: var(--shadow-soft);
          }
          .hero-image-wrap img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
          .hero-image-overlay {
            position: absolute;
            bottom: 1.5rem;
            left: 1.5rem;
            right: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            color: var(--bone);
          }
          .hero-image-overlay-label {
            font-size: 0.6rem;
            text-transform: uppercase;
            letter-spacing: 0.3em;
            opacity: 0.8;
          }
          .hero-image-overlay-title {
            font-size: 1.125rem;
            font-weight: 600;
          }
          .hero-image-overlay-num {
            font-size: 0.75rem;
            opacity: 0.8;
          }
          .hero-glow {
            position: absolute;
            top: -2.5rem;
            left: -2.5rem;
            width: 10rem;
            height: 10rem;
            border-radius: 50%;
            background: rgba(212,149,107,0.3);
            filter: blur(48px);
            z-index: -1;
          }

          /* ==================== MARQUEE ==================== */
          .marquee-bar {
            border-top: 1px solid rgba(42,26,14,0.1);
            border-bottom: 1px solid rgba(42,26,14,0.1);
            background: var(--fg);
            color: var(--bg);
            overflow: hidden;
          }
          .marquee-track-animation {
            display: inline-flex;
            white-space: nowrap;
            animation: marquee 40s linear infinite;
            padding: 1rem 0;
            font-size: 1.5rem;
            font-weight: 500;
            letter-spacing: 0.05em;
          }
          .marquee-item {
            display: inline-flex;
            align-items: center;
            gap: 2.5rem;
            margin: 0 2.5rem;
          }
          .marquee-dot { opacity: 0.4; }

          /* ==================== SECTION HEADERS ==================== */
          .section-label {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.4em;
            color: var(--muted);
            margin-bottom: 0.75rem;
          }
          .section-title {
            font-size: clamp(2.25rem, 5vw, 3.5rem);
            font-weight: 700;
            line-height: 1.1;
            letter-spacing: -0.02em;
          }
          .section-title .accent {
            font-weight: 700;
            color: var(--primary);
          }

          /* ==================== CATEGORIES ==================== */
          .categories {
            max-width: 1440px;
            margin: 0 auto;
            padding: 5rem 3rem 6rem;
          }
          .categories-header {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: flex-end;
            gap: 1.5rem;
            margin-bottom: 3rem;
          }
          .categories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
          }
          .cat-card {
            position: relative;
            display: block;
            overflow: hidden;
            border-radius: 2px;
            background: var(--card);
            text-decoration: none;
            color: var(--bg);
          }
          .cat-card-img {
            aspect-ratio: 1;
            overflow: hidden;
          }
          .cat-card-img img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.7s;
          }
          .cat-card:hover .cat-card-img img { transform: scale(1.1); }
          .cat-card-info {
            position: absolute;
            inset: auto 0 0 0;
            padding: 1.25rem;
            background: linear-gradient(to top, rgba(42,26,14,0.8), transparent);
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .cat-card-name {
            font-size: 1.375rem;
            font-weight: 600;
          }
          .cat-card-count {
            font-size: 0.75rem;
            opacity: 0.8;
            margin-top: 0.25rem;
          }
          .cat-card-arrow {
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s;
          }
          .cat-card:hover .cat-card-arrow { transform: translateX(4px); }

          /* ==================== COLLECTION ==================== */
          .collection {
            max-width: 1440px;
            margin: 0 auto;
            padding: 6rem 3rem 8rem;
          }
          .collection-header {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: flex-end;
            gap: 1.5rem;
            margin-bottom: 4rem;
          }
          .collection-header p {
            max-width: 24rem;
            color: var(--muted);
          }
          .collection-title {
            font-size: clamp(2.5rem, 6vw, 4.5rem);
            font-weight: 700;
            line-height: 1.1;
            letter-spacing: -0.02em;
          }
          .collection-title .accent {
            font-weight: 700;
            color: var(--primary);
          }
          .collection-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
          }
          .product-card { position: relative; cursor: pointer; }
          .product-card:nth-child(2) { margin-top: 4rem; }
          .product-card-img {
            position: relative;
            aspect-ratio: 3/4;
            overflow: hidden;
            border-radius: 2px;
            background: var(--card);
          }
          .product-card-img img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.7s;
          }
          .product-card:hover .product-card-img img { transform: scale(1.05); }
          .product-tag {
            position: absolute;
            top: 1rem;
            left: 1rem;
            background: rgba(245,237,228,0.9);
            padding: 0.25rem 0.75rem;
            border-radius: 999px;
            font-size: 0.625rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          .product-quick {
            position: absolute;
            bottom: 1rem;
            right: 1rem;
            background: var(--fg);
            color: var(--bg);
            padding: 0.5rem 1rem;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 500;
            opacity: 0;
            transform: translateY(8px);
            transition: all 0.3s;
            border: none;
            cursor: pointer;
          }
          .product-card:hover .product-quick {
            opacity: 1;
            transform: translateY(0);
          }
          .product-info {
            margin-top: 1.25rem;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
          }
          .product-id {
            font-size: 0.75rem;
            color: var(--muted);
          }
          .product-name {
            margin-top: 0.25rem;
            font-size: 1.25rem;
            font-weight: 600;
          }
          .product-price {
            font-size: 1.125rem;
            font-weight: 600;
          }

          /* ==================== CRAFT ==================== */
          .craft {
            background: var(--fg);
            color: var(--bg);
            position: relative;
          }
          .craft::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: var(--grain);
            background-size: 3px 3px;
            opacity: 0.2;
            pointer-events: none;
          }
          .craft-inner {
            max-width: 1440px;
            margin: 0 auto;
            padding: 6rem 3rem 8rem;
            display: grid;
            grid-template-columns: 5fr 7fr;
            gap: 3rem;
            position: relative;
          }
          .craft-text-label {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.4em;
            opacity: 0.6;
            margin-bottom: 1rem;
          }
          .craft-title {
            font-size: clamp(2.5rem, 5vw, 3.75rem);
            font-weight: 700;
            line-height: 0.95;
            letter-spacing: -0.02em;
          }
          .craft-title .accent {
            font-weight: 700;
            color: #D4A574;
          }
          .craft-desc {
            margin-top: 2rem;
            max-width: 28rem;
            line-height: 1.7;
            opacity: 0.7;
          }
          .craft-link {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            margin-top: 2.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--bg);
            text-decoration: none;
            border-bottom: 1px solid rgba(245,237,228,0.4);
            padding-bottom: 0.25rem;
            transition: border-color 0.3s;
          }
          .craft-link:hover { border-color: var(--bg); }
          .craft-image {
            aspect-ratio: 7/5;
            overflow: hidden;
            border-radius: 2px;
          }
          .craft-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .craft-stats {
            margin-top: 2rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            border-top: 1px solid rgba(245,237,228,0.2);
            padding-top: 2rem;
          }
          .craft-stat-val {
            font-size: 2.5rem;
            font-weight: 700;
          }
          .craft-stat-label {
            margin-top: 0.5rem;
            font-size: 0.875rem;
            opacity: 0.6;
          }

          /* ==================== QUOTE ==================== */
          .quote-section {
            max-width: 1100px;
            margin: 0 auto;
            padding: 7rem 3rem;
            text-align: center;
          }
          .quote-section blockquote {
            margin-top: 2rem;
            font-size: clamp(1.5rem, 4vw, 3rem);
            font-weight: 500;
            line-height: 1.25;
            letter-spacing: -0.015em;
            text-wrap: balance;
          }
          .quote-section blockquote .accent {
            font-weight: 700;
            color: var(--primary);
          }
          .quote-author {
            margin-top: 2.5rem;
            display: inline-flex;
            align-items: center;
            gap: 1rem;
            font-size: 0.875rem;
            color: var(--muted);
          }
          .quote-author-line {
            width: 3rem;
            height: 1px;
            background: rgba(42,26,14,0.3);
          }

          /* ==================== LOOKBOOK ==================== */
          .lookbook {
            max-width: 1440px;
            margin: 0 auto;
            padding: 0 3rem 8rem;
          }
          .lookbook-header {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: flex-end;
            gap: 1.5rem;
            margin-bottom: 3rem;
          }
          .lookbook-header p {
            max-width: 24rem;
            color: var(--muted);
          }
          .lookbook-grid {
            display: grid;
            grid-template-columns: 5fr 7fr;
            gap: 1.5rem;
          }
          .lookbook-tall {
            aspect-ratio: 3/4;
            overflow: hidden;
            border-radius: 2px;
            cursor: pointer;
            position: relative;
          }
          .lookbook-tall img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.7s;
          }
          .lookbook-tall:hover img { transform: scale(1.05); }
          .lookbook-right {
            display: grid;
            grid-template-rows: 1fr 1fr;
            gap: 1.5rem;
          }
          .lookbook-wide {
            aspect-ratio: 7/4;
            overflow: hidden;
            border-radius: 2px;
            cursor: pointer;
            position: relative;
          }
          .lookbook-wide img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.7s;
          }
          .lookbook-wide:hover img { transform: scale(1.05); }
          
          .lookbook-hover-label {
            position: absolute;
            inset: 0;
            background: rgba(42, 26, 14, 0.4);
            opacity: 0;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 1.5rem;
            color: #fff;
            transition: opacity 0.3s;
          }
          .lookbook-tall:hover .lookbook-hover-label,
          .lookbook-wide:hover .lookbook-hover-label {
            opacity: 1;
          }
          .lookbook-lbl-title { font-size: 1.25rem; font-weight: 700; }
          .lookbook-lbl-subtitle { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); }

          /* ==================== LOOKBOOK SPOTLIGHT MODAL ==================== */
          .spotlight-modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(42, 26, 14, 0.6);
            backdrop-filter: blur(8px);
            z-index: 10000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          .spotlight-modal-backdrop.active { opacity: 1; pointer-events: auto; }
          .spotlight-modal {
            background: var(--bg);
            border: 1px solid rgba(42, 26, 14, 0.15);
            border-radius: 4px;
            max-width: 600px;
            width: 100%;
            overflow: hidden;
            box-shadow: var(--shadow-soft);
            transform: scale(0.95);
            transition: transform 0.3s;
          }
          .spotlight-modal-backdrop.active .spotlight-modal { transform: scale(1); }
          .spotlight-img { aspect-ratio: 16/10; width: 100%; object-fit: cover; }
          .spotlight-body { padding: 2rem; }
          .spotlight-loc { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.2em; color: var(--primary); margin-bottom: 0.5rem; display: block; }
          .spotlight-title { font-family: var(--font-bn); font-size: 1.8rem; font-weight: 700; margin-bottom: 1rem; color: var(--fg); }
          .spotlight-desc { color: var(--muted); font-size: 1rem; line-height: 1.6; margin-bottom: 1.5rem; }
          .spotlight-close {
            background: var(--fg);
            color: var(--bg);
            border: none;
            padding: 0.6rem 1.5rem;
            border-radius: 99px;
            font-weight: 600;
            cursor: pointer;
            font-family: var(--font-bn);
            transition: background 0.3s;
          }
          .spotlight-close:hover { background: var(--primary); color: #fff; }

          /* ==================== FESTIVE OFFER ==================== */
          .offer {
            position: relative;
            overflow: hidden;
            border-top: 1px solid rgba(42,26,14,0.1);
            border-bottom: 1px solid rgba(42,26,14,0.1);
            background: var(--accent);
            color: var(--bone);
          }
          .offer::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: var(--grain);
            background-size: 3px 3px;
            opacity: 0.3;
            pointer-events: none;
          }
          .offer-inner {
            max-width: 1440px;
            margin: 0 auto;
            padding: 4rem 3rem 5rem;
            display: grid;
            grid-template-columns: 2fr 1fr;
            align-items: center;
            gap: 2rem;
            position: relative;
          }
          .offer-label {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.4em;
            opacity: 0.8;
            margin-bottom: 0.75rem;
          }
          .offer-title {
            font-size: clamp(2rem, 5vw, 3.5rem);
            font-weight: 700;
            line-height: 1.1;
          }
          .offer-title .accent {
            font-weight: 700;
          }
          .offer-right {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 1rem;
          }
          .offer-coupon-label {
            font-size: 0.875rem;
            letter-spacing: 0.3em;
            opacity: 0.8;
          }
          .offer-coupon {
            border: 2px dashed rgba(249,243,236,0.6);
            padding: 0.75rem 1.5rem;
            font-size: 1.5rem;
            font-weight: 700;
            letter-spacing: 0.15em;
            border-radius: 2px;
            cursor: pointer;
            transition: background 0.3s;
          }
          .offer-coupon:hover { background: rgba(249,243,236,0.1); }
          .btn-offer {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--bone);
            color: var(--accent);
            padding: 0.75rem 1.5rem;
            border-radius: 99px;
            font-size: 0.875rem;
            font-weight: 600;
            text-decoration: none;
            transition: transform 0.3s;
          }
          .btn-offer:hover { transform: scale(1.03); }

          /* ==================== TESTIMONIALS ==================== */
          .testimonials {
            max-width: 1440px;
            margin: 0 auto;
            padding: 7rem 3rem 9rem;
          }
          .testimonials-header { margin-bottom: 4rem; max-width: 36rem; }
          .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }
          .test-card {
            border: 1px solid rgba(42,26,14,0.1);
            border-radius: 2px;
            padding: 2rem;
            background: var(--card);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: border-color 0.3s;
          }
          .test-card:hover { border-color: rgba(42,26,14,0.3); }
          .test-quote-mark {
            font-size: 3rem;
            line-height: 1;
            color: var(--primary);
          }
          .test-quote {
            margin-top: 1rem;
            flex: 1;
            font-size: 0.95rem;
            line-height: 1.7;
            color: rgba(42,26,14,0.9);
          }
          .test-footer {
            margin-top: 2rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            border-top: 1px solid rgba(42,26,14,0.1);
            padding-top: 1.25rem;
          }
          .test-avatar {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            background: rgba(160,82,45,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.875rem;
            font-weight: 700;
            color: var(--primary);
          }
          .test-name {
            font-size: 0.875rem;
            font-weight: 600;
          }
          .test-role {
            font-size: 0.75rem;
            color: var(--muted);
          }
          .test-stars {
            margin-left: auto;
            font-size: 0.75rem;
            color: var(--primary);
          }

          /* ==================== FAQ ==================== */
          .faq {
            max-width: 1440px;
            margin: 0 auto;
            padding: 0 3rem 8rem;
            display: grid;
            grid-template-columns: 4fr 8fr;
            gap: 3rem;
          }
          .faq-left { position: sticky; top: 3rem; align-self: start; }
          .faq-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            border: 1px solid rgba(42,26,14,0.2);
            padding: 0.75rem 1.25rem;
            border-radius: 999px;
            font-size: 0.875rem;
            font-weight: 500;
            background: transparent;
            color: var(--fg);
            cursor: pointer;
            margin-top: 1.5rem;
            text-decoration: none;
            transition: all 0.3s;
          }
          .faq-btn:hover { background: var(--fg); color: var(--bg); }
          .faq-list {
            border-top: 1px solid rgba(42,26,14,0.1);
            border-bottom: 1px solid rgba(42,26,14,0.1);
          }
          .faq-item {
            border-bottom: 1px solid rgba(42,26,14,0.1);
          }
          .faq-item:last-child { border-bottom: none; }
          .faq-question {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            padding: 1.5rem 0;
            background: none;
            border: none;
            cursor: pointer;
            font-family: var(--font-bn);
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--fg);
            text-align: left;
            transition: color 0.3s;
          }
          .faq-question:hover { color: var(--primary); }
          .faq-toggle {
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            border: 1px solid rgba(42,26,14,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.125rem;
            flex-shrink: 0;
            transition: all 0.3s;
          }
          .faq-item.open .faq-toggle {
            transform: rotate(45deg);
            background: var(--fg);
            color: var(--bg);
          }
          .faq-answer {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.4s ease, padding 0.4s ease;
          }
          .faq-item.open .faq-answer {
            max-height: 12rem;
            padding-bottom: 1.5rem;
          }
          .faq-answer p {
            max-width: 36rem;
            line-height: 1.7;
            color: var(--muted);
          }

          /* ==================== CTA ==================== */
          .cta {
            max-width: 1440px;
            margin: 0 auto;
            padding: 0 3rem 6rem;
          }
          .cta-inner {
            position: relative;
            overflow: hidden;
            border-radius: 2px;
            background: var(--primary);
            color: var(--bone);
            padding: 4rem 5rem;
          }
          .cta-inner::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: var(--grain);
            background-size: 3px 3px;
            opacity: 0.3;
            pointer-events: none;
          }
          .cta-grid {
            position: relative;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            align-items: flex-end;
          }
          .cta-title {
            font-size: clamp(2rem, 5vw, 3.5rem);
            font-weight: 700;
            line-height: 1.1;
          }
          .cta-title .accent {
            font-weight: 700;
          }
          .cta-desc {
            margin-top: 1.5rem;
            max-width: 28rem;
            opacity: 0.8;
          }
          .cta-form {
            display: flex;
            gap: 0.75rem;
          }
          .cta-input {
            flex: 1;
            border: 1px solid rgba(249,243,236,0.3);
            background: transparent;
            padding: 1rem 1.5rem;
            border-radius: 999px;
            font-family: var(--font-bn);
            font-size: 1rem;
            color: var(--bone);
            outline: none;
          }
          .cta-input::placeholder { color: rgba(249,243,236,0.6); }
          .cta-input:focus { border-color: var(--bone); }
          .cta-submit {
            background: var(--bone);
            color: var(--primary);
            padding: 1rem 2rem;
            border-radius: 999px;
            border: none;
            font-family: var(--font-bn);
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s;
          }
          .cta-submit:hover { transform: scale(1.03); }

          /* ==================== FOOTER ==================== */
          .footer {
            border-top: 1px solid rgba(42,26,14,0.1);
          }
          .footer-inner {
            max-width: 1440px;
            margin: 0 auto;
            padding: 4rem 3rem 2rem;
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 2.5rem;
          }
          .footer-brand {
            font-size: 1.5rem;
            font-weight: 700;
          }
          .footer-brand-desc {
            margin-top: 1rem;
            font-size: 0.875rem;
            color: var(--muted);
            max-width: 20rem;
          }
          .footer-col-title {
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 0.3em;
            color: var(--muted);
            margin-bottom: 1rem;
          }
          .footer-col ul {
            list-style: none;
          }
          .footer-col li {
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
          }
          .footer-col a {
            text-decoration: none;
            color: var(--fg);
            transition: color 0.3s;
          }
          .footer-col a:hover { color: var(--primary); }
          .footer-bottom {
            border-top: 1px solid rgba(42,26,14,0.1);
          }
          .footer-bottom-inner {
            max-width: 1440px;
            margin: 0 auto;
            padding: 1.5rem 3rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.75rem;
            color: var(--muted);
          }
          .footer-bottom-links {
            display: flex;
            gap: 1.5rem;
          }
          .footer-bottom-links a {
            text-decoration: none;
            color: var(--muted);
            transition: color 0.3s;
          }
          .footer-bottom-links a:hover { color: var(--primary); }

          /* ==================== PRODUCT ACTIONS ==================== */
          .product-actions {
            position: absolute;
            bottom: 1rem;
            left: 1rem;
            right: 1rem;
            display: flex;
            gap: 0.5rem;
            opacity: 0;
            transform: translateY(8px);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 10;
          }
          .product-card:hover .product-actions {
            opacity: 1;
            transform: translateY(0);
          }
          .prod-action-btn {
            flex: 1;
            background: var(--fg);
            color: var(--bg);
            padding: 0.6rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            border: 1px solid rgba(245,237,228,0.2);
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: inherit;
          }
          .prod-action-btn:hover {
            background: var(--primary);
            color: #fff;
          }
          .prod-action-btn.add-to-bag {
            background: var(--primary);
            color: #fff;
            border-color: var(--primary);
          }
          .prod-action-btn.add-to-bag:hover {
            background: var(--fg);
            color: var(--bg);
            border-color: var(--fg);
          }

          /* ==================== SPOTLIGHT SIZE SELECTOR ==================== */
          .spotlight-size-title {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--fg);
            margin-top: 1.25rem;
            margin-bottom: 0.5rem;
          }
          .size-picker {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1.25rem;
          }
          .size-btn {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 4px;
            border: 1px solid rgba(42,26,14,0.15);
            background: none;
            color: var(--fg);
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          }
          .size-btn:hover {
            border-color: var(--fg);
          }
          .size-btn.active {
            background: var(--fg);
            color: var(--bg);
            border-color: var(--fg);
          }
          .spotlight-actions-row {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
            align-items: center;
          }
          .spotlight-add-btn {
            flex: 1;
            background: var(--primary);
            color: #fff;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 99px;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            font-family: inherit;
            transition: background 0.3s ease;
          }
          .spotlight-add-btn:hover {
            background: var(--fg);
          }

          /* ==================== CART DRAWER ==================== */
          .cart-drawer-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(42, 26, 14, 0.4);
            backdrop-filter: blur(4px);
            z-index: 15000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
          }
          .cart-drawer-backdrop.active {
            opacity: 1;
            pointer-events: auto;
          }
          .cart-drawer {
            position: fixed;
            top: 0;
            right: 0;
            height: 100%;
            width: 420px;
            max-width: 100%;
            background: var(--bg);
            box-shadow: -10px 0 30px rgba(42, 26, 14, 0.15);
            z-index: 15001;
            display: flex;
            flex-direction: column;
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .cart-drawer.active {
            transform: translateX(0);
          }
          .cart-drawer-header {
            padding: 1.5rem;
            border-bottom: 1px solid rgba(42, 26, 14, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .cart-drawer-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--fg);
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .cart-drawer-close {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.5rem;
            color: var(--fg);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.2s;
          }
          .cart-drawer-close:hover {
            opacity: 0.7;
          }
          .cart-drawer-items {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }
          .cart-drawer-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: var(--muted);
            text-align: center;
            gap: 1rem;
          }
          .cart-drawer-empty-icon {
            width: 3.5rem;
            height: 3.5rem;
            opacity: 0.3;
          }
          .cart-drawer-empty-text {
            font-size: 1.05rem;
            font-weight: 500;
          }
          .cart-drawer-item {
            display: flex;
            gap: 1rem;
            padding-bottom: 1.25rem;
            border-bottom: 1px solid rgba(42, 26, 14, 0.06);
          }
          .cart-item-img {
            width: 70px;
            height: 90px;
            object-fit: cover;
            border-radius: 4px;
            background: var(--card);
          }
          .cart-item-details {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .cart-item-title {
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--fg);
            line-height: 1.2;
          }
          .cart-item-size {
            font-size: 0.75rem;
            color: var(--muted);
            margin-top: 0.15rem;
          }
          .cart-item-price {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--primary);
            margin-top: 0.25rem;
          }
          .cart-item-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 0.5rem;
          }
          .qty-controls {
            display: flex;
            align-items: center;
            background: var(--card);
            border-radius: 4px;
            padding: 2px;
          }
          .qty-btn {
            width: 24px;
            height: 24px;
            border-radius: 2px;
            border: none;
            background: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
            color: var(--fg);
            transition: background 0.2s;
          }
          .qty-btn:hover {
            background: rgba(42, 26, 14, 0.08);
          }
          .qty-val {
            font-size: 0.85rem;
            font-weight: 600;
            width: 24px;
            text-align: center;
          }
          .cart-item-remove {
            background: none;
            border: none;
            color: var(--muted);
            cursor: pointer;
            font-size: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem;
            transition: color 0.2s;
          }
          .cart-item-remove:hover {
            color: #d9534f;
          }
          .cart-drawer-footer {
            padding: 1.5rem;
            border-top: 1px solid rgba(42, 26, 14, 0.1);
            background: var(--bone);
          }
          .cart-summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            color: var(--muted);
          }
          .cart-summary-row.total {
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--fg);
            margin-top: 0.75rem;
            padding-top: 0.75rem;
            border-top: 1px dashed rgba(42, 26, 14, 0.15);
          }
          .coupon-section {
            margin-top: 0.75rem;
            display: flex;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
          }
          .coupon-input {
            flex: 1;
            padding: 0.5rem 0.75rem;
            border: 1px solid rgba(42, 26, 14, 0.15);
            background: #fff;
            border-radius: 4px;
            font-size: 0.85rem;
            font-family: inherit;
            color: var(--fg);
          }
          .coupon-input:focus {
            outline: none;
            border-color: var(--primary);
          }
          .coupon-btn {
            padding: 0.5rem 1rem;
            background: var(--fg);
            color: var(--bg);
            border: none;
            border-radius: 4px;
            font-size: 0.85rem;
            cursor: pointer;
            font-weight: 600;
            font-family: inherit;
            transition: background 0.2s;
          }
          .coupon-btn:hover {
            background: var(--primary);
          }
          .coupon-applied {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(212, 149, 107, 0.15);
            padding: 0.5rem 0.75rem;
            border-radius: 4px;
            margin-bottom: 0.75rem;
            font-size: 0.8rem;
            color: var(--primary);
            font-weight: 500;
          }
          .coupon-remove-btn {
            background: none;
            border: none;
            color: var(--primary);
            cursor: pointer;
            font-size: 0.75rem;
            font-weight: 600;
            text-decoration: underline;
          }
          .checkout-btn {
            display: flex;
            width: 100%;
            text-align: center;
            padding: 0.9rem;
            background: var(--primary);
            color: #fff;
            border: none;
            border-radius: 4px;
            font-weight: 700;
            margin-top: 0.5rem;
            transition: background 0.2s;
            text-decoration: none;
            align-items: center;
            justify-content: center;
            font-family: inherit;
            cursor: pointer;
            font-size: 1rem;
          }
          .checkout-btn:hover {
            background: var(--fg);
          }

          /* ==================== TOAST ALERT ==================== */
          .toast {
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: var(--fg);
            color: var(--bg);
            padding: 0.75rem 1.5rem;
            border-radius: 99px;
            font-weight: 600;
            font-size: 0.9rem;
            box-shadow: var(--shadow-soft);
            z-index: 20000;
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          .toast.active { transform: translateX(-50%) translateY(0); }

          /* ==================== FLOATING CART BUTTON ==================== */
          .floating-cart {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 3.5rem;
            height: 3.5rem;
            border-radius: 50%;
            background: var(--fg);
            color: var(--bg);
            border: 1px solid rgba(245,237,228,0.2);
            box-shadow: 0 10px 30px rgba(42,26,14,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 999;
            opacity: 0;
            transform: scale(0.8) translateY(20px);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: none;
          }
          .floating-cart.active {
            opacity: 1;
            transform: scale(1) translateY(0);
            pointer-events: auto;
          }
          .floating-cart:hover {
            background: var(--primary);
            color: #fff;
            transform: scale(1.05);
          }
          .cart-icon {
            width: 1.5rem;
            height: 1.5rem;
          }
          .floating-cart-count {
            position: absolute;
            top: -0.25rem;
            right: -0.25rem;
            background: var(--primary);
            color: var(--bone);
            font-size: 0.75rem;
            font-weight: 700;
            width: 1.25rem;
            height: 1.25rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid var(--bg);
          }

          /* ==================== RESPONSIVE ==================== */
          @media (max-width: 992px) {
            .chapter-nav { display: none; }
            .floating-cart { bottom: 1.5rem; right: 1.5rem; width: 3.25rem; height: 3.25rem; }
            .nav { padding: 0.75rem 1rem; }
            .nav-bag { min-height: 44px; min-width: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0.5rem 1.25rem; }
            .nav-links { display: none; }
            
            .hero { grid-template-columns: 1fr; padding: 1rem 1rem 2rem; gap: 1.5rem; }
            .hero h1 { font-size: clamp(2.4rem, 11vw, 3.2rem); line-height: 0.95; }
            .hero-desc { margin-top: 1rem; font-size: 0.95rem; }
            .dropcap::first-letter { font-size: 2.8rem; margin-right: 0.4rem; }
            .hero-image { order: -1; }
            .hero-image-wrap { aspect-ratio: 4/3; }
            .hero-actions { margin-top: 1.5rem; gap: 0.75rem; }
            .btn-primary { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0.75rem 1.5rem; }
            .btn-text { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0.5rem 1rem; }
            .hero-stats { grid-template-columns: repeat(3, 1fr); max-width: 100%; margin-top: 1.5rem; padding-top: 1.25rem; gap: 0.75rem; text-align: center; }
            .hero-stat-val { font-size: 1.5rem; }
            .hero-stat-label { font-size: 0.65rem; margin-top: 0.15rem; }
            .marquee-track-animation { padding: 0.5rem 0; font-size: 1rem; }
            .marquee-item { margin: 0 1rem; gap: 1rem; }
            
            .categories { padding: 2rem 1rem 2.5rem; }
            .categories-header { margin-bottom: 1.5rem; gap: 1rem; }
            .categories-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
            .cat-card-info { padding: 0.75rem; }
            .cat-card-name { font-size: 1.1rem; }
            .cat-card-arrow { width: 1.75rem; height: 1.75rem; }
            
            .collection { padding: 2rem 1rem 3rem; }
            .collection-header { margin-bottom: 2rem; gap: 1rem; }
            .collection-grid { grid-template-columns: repeat(2, 1fr); gap: 1.25rem 0.85rem; }
            .product-card:nth-child(2) { margin-top: 0; }
            .product-name { font-size: 1.05rem; }
            .product-price { font-size: 0.95rem; }
            .product-quick {
              opacity: 1;
              transform: translateY(0);
              bottom: 0.5rem;
              right: 0.5rem;
              left: 0.5rem;
              font-size: 0.8rem;
              padding: 0.65rem 0.5rem;
              min-height: 44px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 4px;
              background: rgba(245, 237, 228, 0.95);
              color: var(--fg);
              border: 1px solid rgba(42, 26, 14, 0.15);
            }
            
            .craft-inner { grid-template-columns: 1fr; padding: 2rem 1rem; gap: 1.5rem; }
            .craft-title { font-size: clamp(1.8rem, 8vw, 2.4rem); }
            .craft-desc { margin-top: 1rem; font-size: 0.95rem; }
            .craft-stats { margin-top: 1.5rem; padding-top: 1.5rem; gap: 1rem; }
            .craft-stat-val { font-size: 2rem; }
            .craft-stat-label { font-size: 0.75rem; }
            
            .quote-section { padding: 2.5rem 1rem; }
            .quote-section blockquote { font-size: clamp(1.2rem, 5vw, 1.6rem); line-height: 1.35; margin-top: 1rem; }
            .quote-author { margin-top: 1.5rem; }
            
            .lookbook { padding: 0 1rem 3rem; }
            .lookbook-header { margin-bottom: 1.5rem; }
            .lookbook-grid { grid-template-columns: 1fr; gap: 1rem; }
            .lookbook-tall { aspect-ratio: 4/3; }
            .lookbook-wide { aspect-ratio: 4/3; }
            .lookbook-hover-label {
              opacity: 1;
              background: linear-gradient(to top, rgba(42, 26, 14, 0.8) 0%, transparent 70%);
            }
            
            .offer-inner { grid-template-columns: 1fr; padding: 2rem 1rem; gap: 1.5rem; text-align: center; }
            .offer-title { font-size: clamp(1.5rem, 6vw, 2rem); }
            .offer-right { align-items: center; gap: 0.75rem; }
            .offer-coupon { font-size: 1.25rem; padding: 0.6rem 1.25rem; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; }
            .btn-offer { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0.75rem 1.5rem; width: 100%; max-width: 240px; }
            
            .testimonials { padding: 2.5rem 1rem 3rem; }
            .testimonials-header { margin-bottom: 2rem; }
            .testimonials-grid { grid-template-columns: 1fr; gap: 1rem; }
            .test-card { padding: 1.5rem; }
            
            .faq { grid-template-columns: 1fr; padding: 0 1rem 3rem; gap: 1.5rem; }
            .faq-left { position: static; text-align: center; }
            .faq-btn { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0.75rem 1.5rem; margin-top: 1rem; }
            .faq-question { padding: 1rem 0; font-size: 1rem; min-height: 44px; }
            .faq-toggle { width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; }
            
            .cta { padding: 0 1rem 3rem; }
            .cta-inner { padding: 2rem 1.25rem; text-align: center; }
            .cta-grid { grid-template-columns: 1fr; gap: 1.5rem; }
            .cta-desc { margin-top: 0.75rem; }
            .cta-form { flex-direction: column; gap: 0.75rem; }
            .cta-input { min-height: 44px; padding: 0.75rem 1.25rem; font-size: 0.95rem; text-align: center; }
            .cta-submit { min-height: 44px; padding: 0.75rem 1.5rem; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; }
            
            .footer-inner { grid-template-columns: 1fr 1fr; padding: 2rem 1rem 1.5rem; gap: 1.5rem 1rem; }
            .footer-brand-col { grid-column: 1 / -1; text-align: center; }
            .footer-brand { text-align: center; }
            .footer-brand-desc { text-align: center; margin-top: 0.25rem; font-size: 0.85rem; max-width: 100%; }
            .footer-col { text-align: left; }
            .footer-col:last-child { text-align: right; }
            .footer-col:last-child ul { text-align: right; }
            .footer-col-title { margin-bottom: 0.5rem; font-size: 0.75rem; }
            .footer-col li { margin-bottom: 0rem; }
            .footer-col a { display: inline-block; padding: 0.5rem 0; font-size: 0.9rem; }
            .footer-bottom-inner { flex-direction: column; gap: 0.75rem; text-align: center; padding: 1rem 0; }
            .footer-bottom-links { display: flex; justify-content: center; gap: 1.25rem; flex-wrap: wrap; }
            .footer-bottom-links a { display: inline-block; padding: 0.5rem 0.25rem; font-size: 0.8rem; }
            
            .spotlight-modal { max-width: 95%; margin: 1rem; }
            .spotlight-body { padding: 1.25rem; }
            .spotlight-close { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0.75rem 1.5rem; }

            /* Mobile Cart & Product Actions overrides */
            .product-actions {
              opacity: 1;
              transform: translateY(0);
              bottom: 0.5rem;
              left: 0.5rem;
              right: 0.5rem;
              gap: 0.35rem;
            }
            .prod-action-btn {
              padding: 0.5rem 0.25rem;
              font-size: 0.7rem;
              min-height: 38px;
              background: rgba(245, 237, 228, 0.95);
              color: var(--fg);
              border: 1px solid rgba(42, 26, 14, 0.15);
            }
            .prod-action-btn.add-to-bag {
              background: var(--primary);
              color: #fff;
              border-color: var(--primary);
            }
            .cart-drawer {
              width: 100%;
            }
          }
        `,
      }} />

      {/* Chapter Side navigation */}
      <nav className="chapter-nav">
        {sections.map((sec, idx) => (
          <a
            key={sec.id}
            href={`#${sec.id}`}
            className={`chapter-dot-wrapper ${activeSection === idx ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(idx);
            }}
          >
            <span className="chapter-dot" />
            <span className="chapter-lbl">{sec.label}</span>
          </a>
        ))}
      </nav>

      {/* NAV */}
      <header>
        <nav className="nav rise">
          <a href="#" className="nav-logo">
            <span className="nav-logo-name">তানহা</span>
            <span className="nav-logo-sub">ফ্যাশন</span>
          </a>
          <ul className="nav-links">
            <li><a href="#collection" onClick={(e) => { e.preventDefault(); scrollToSection(2); }}>সংগ্রহ</a></li>
            <li><a href="#craft" onClick={(e) => { e.preventDefault(); scrollToSection(3); }}>কারুকাজ</a></li>
            <li><a href="#story" onClick={(e) => { e.preventDefault(); scrollToSection(4); }}>আমাদের গল্প</a></li>
            <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection(5); }}>যোগাযোগ</a></li>
          </ul>
          <button className="nav-bag" onClick={() => setCartDrawerOpen(true)}>
            ব্যাগ <span className="nav-bag-count">{toBanglaNumber(cartCount)}</span>
          </button>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero reveal-item">
        <div className="hero-text rise">
          <div className="hero-season">শরৎ সংস্করণ ১৪৩১</div>
          <h1>সুতোয় বোনা <span className="accent">গল্প</span></h1>
          <p className="hero-desc dropcap">
            প্রতিটি পোশাকে লুকিয়ে আছে এক একটি বাংলার তাঁতির রাত জাগা শ্রম, মায়ের আঁচলের গন্ধ আর শতাব্দীর ঐতিহ্য।
          </p>
          <div className="hero-actions">
            <a href="#collection" className="btn-primary" onClick={(e) => { e.preventDefault(); scrollToSection(2); }}>
              সংগ্রহ দেখুন <span className="arrow">→</span>
            </a>
            <a href="#craft" className="btn-text" onClick={(e) => { e.preventDefault(); scrollToSection(3); }}>
              কারুকার্যের কথা
            </a>
          </div>
          <div className="hero-stats rise rise-d2">
            <div>
              <div className="hero-stat-val">২৫+</div>
              <div className="hero-stat-label">বছরের ঐতিহ্য</div>
            </div>
            <div>
              <div className="hero-stat-val">১২০</div>
              <div className="hero-stat-label">দক্ষ কারিগর</div>
            </div>
            <div>
              <div className="hero-stat-val">১০০%</div>
              <div className="hero-stat-label">হস্তনির্মিত</div>
            </div>
          </div>
        </div>
        <div className="hero-image rise rise-d1">
          <div className="hero-image-wrap">
            <img src={heroModel.src} alt="তানহা ফ্যাশনের জামদানি শাড়ি পরিহিতা মডেল" width="1280" height="1600" />
            <div className="hero-image-overlay">
              <div>
                <div className="hero-image-overlay-label">প্রচ্ছদ</div>
                <div className="hero-image-overlay-title">জামদানি — মৃত্তিকা</div>
              </div>
              <div className="hero-image-overlay-num">№ ০১ / ০৩</div>
            </div>
          </div>
          <div className="hero-glow" />
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-bar">
        <div className="marquee-track-animation">
          <div className="inline-flex">
            {Array.from({ length: 4 }).map((_, loopIdx) => (
              <span key={loopIdx} className="inline-flex">
                {["জামদানি", "মসলিন", "তসর সিল্ক", "খাদি", "তাঁতের শাড়ি", "পাঞ্জাবি", "কুর্তা"].map((w, wordIdx) => (
                  <span key={`${loopIdx}-${wordIdx}`} className="marquee-item">
                    {w} <span className="marquee-dot">✦</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="categories reveal-item" id="categories">
        <div className="categories-header">
          <div>
            <div className="section-label">বিভাগ</div>
            <h2 className="section-title">খুঁজে নিন <span className="accent">আপনার পছন্দ</span></h2>
          </div>
          <a href="#collection" className="btn-text" onClick={(e) => { e.preventDefault(); scrollToSection(2); }}>
            সম্পূর্ণ তালিকা →
          </a>
        </div>
        <div className="categories-grid">
          {[
            { name: "শাড়ি", img: catSaree, count: "৪৮টি পোশাক" },
            { name: "পাঞ্জাবি", img: catPanjabi, count: "৩২টি পোশাক" },
            { name: "কুর্তা", img: catKurta, count: "২৬টি পোশাক" },
            { name: "অনুষঙ্গ", img: catAccessories, count: "১৯টি পণ্য" },
            { name: "সালোয়ার কামিজ", img: catSalwar, count: "২৪টি পোশাক" },
            { name: "চাদর ও ওড়না", img: catShawl, count: "১৫টি পোশাক" },
          ].map((cat, idx) => (
            <a key={idx} href="#collection" className="cat-card" onClick={(e) => { e.preventDefault(); scrollToSection(2); }}>
              <div className="cat-card-img">
                <img src={cat.img.src} alt={cat.name} loading="lazy" width="900" height="900" />
              </div>
              <div className="cat-card-info">
                <div>
                  <div className="cat-card-name">{cat.name}</div>
                  <div className="cat-card-count">{cat.count}</div>
                </div>
                <div className="cat-card-arrow">→</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* COLLECTION */}
      <section id="collection" className="collection reveal-item">
        <div className="collection-header">
          <div>
            <div className="section-label">সংগ্রহশালা</div>
            <h2 className="collection-title">নির্বাচিত <span className="accent">পোশাক</span></h2>
          </div>
          <p>সীমিত সংস্করণে প্রতিটি পোশাক — যত্নে বোনা, যত্নে নির্বাচিত।</p>
        </div>
        <div className="collection-grid">
          {PRODUCTS.map((prod, idx) => (
            <article
              key={idx}
              className="product-card"
              onClick={() => openSpotlight(prod)}
            >
              <div className="product-card-img">
                <img src={prod.img.src || prod.img} alt={prod.name} loading="lazy" width="900" height="1100" />
                <span className="product-tag">{prod.tag}</span>
                <div className="product-actions">
                  <button
                    className="prod-action-btn quick-view"
                    onClick={(e) => {
                      e.stopPropagation();
                      openSpotlight(prod);
                    }}
                  >
                    দ্রুত দেখুন
                  </button>
                  <button
                    className="prod-action-btn add-to-bag"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(prod, 1, "M");
                      showToast(`"${prod.name}" ব্যাগে যোগ করা হয়েছে!`);
                    }}
                  >
                    ব্যাগে রাখুন
                  </button>
                </div>
              </div>
              <div className="product-info">
                <div>
                  <div className="product-id">{prod.id}</div>
                  <h3 className="product-name">{prod.name}</h3>
                </div>
                <div className="product-price">{prod.priceDisplay}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CRAFT */}
      <section id="craft" className="craft reveal-item">
        <div className="craft-inner">
          <div>
            <div className="craft-text-label">কারিগরের হাত</div>
            <h2 className="craft-title">
              প্রতিটি সুতোয় <br />
              <span className="accent">এক জীবনের</span> <br />
              সাধনা।
            </h2>
            <p className="craft-desc">
              ঢাকার রূপগঞ্জ থেকে টাঙ্গাইলের পাথরাইল — আমাদের প্রতিটি কাপড় তৈরি হয় তাঁতির হাতে, পুরনো কাঠের তাঁতে, দিনের আলোয়। মেশিনের শব্দ নেই — আছে শুধু সুতোর ছন্দ।
            </p>
            <a href="#story" className="craft-link" onClick={(e) => { e.preventDefault(); scrollToSection(4); }}>
              আরও জানুন →
            </a>
          </div>
          <div>
            <div className="craft-image">
              <img src={craftImg.src} alt="জামদানি তাঁতে কারিগরের হাত" loading="lazy" width="1400" height="900" />
            </div>
            <div className="craft-stats">
              <div>
                <div className="craft-stat-val">৭২ ঘন্টা</div>
                <div className="craft-stat-label">একটি শাড়ি বুনতে সময় লাগে</div>
              </div>
              <div>
                <div className="craft-stat-val">শূন্য</div>
                <div className="craft-stat-label">যন্ত্রের ব্যবহার — সম্পূর্ণ হাতে</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section id="story" className="quote-section reveal-item">
        <div className="section-label">আমাদের দর্শন</div>
        <blockquote>
          "ফ্যাশন মানে শুধু পোশাক নয় — এ এক <span className="accent">পরিচয়</span>। যে পরিচয় আমরা বহন করি মায়ের শাড়ির ভাঁজে, বাবার পাঞ্জাবির বোতামে, দাদীর আঁচলের সুবাসে।"
        </blockquote>
        <div className="quote-author">
          <span className="quote-author-line" />
          তানহা রহমান, প্রতিষ্ঠাতা
          <span className="quote-author-line" />
        </div>
      </section>

      {/* LOOKBOOK */}
      <section className="lookbook reveal-item" id="lookbook">
        <div className="lookbook-header">
          <div>
            <div className="section-label">লুকবুক</div>
            <h2 className="section-title">শরৎ '২৬ <span className="accent">গল্পচিত্র</span></h2>
          </div>
          <p>
            ঢাকার পুরনো গলি থেকে নদীর ধার — আমাদের ক্যামেরায় ধরা প্রতিটি মুহূর্ত। ছবির উপর কার্সার রেখে লোকেশন ও কাপড়ের গুণাগুণ দেখুন।
          </p>
        </div>
        <div className="lookbook-grid">
          <div
            className="lookbook-tall"
            onClick={() =>
              openSpotlight(
                "লালবাগ কেল্লা, ঢাকা",
                "মৃত্তিকা জামদানি শাড়ি",
                "পুরনো ঢাকার হেরিটেজ লাল ইটের কেল্লায় ধারণকৃত। মডেলের পরিহিত লাল সুতির জমিনে সোনালী জরি কাজ করা প্রিমিয়াম জামদানি শাড়ি, যা তৈরি করতে বুননশিল্পীদের ৯০ ঘণ্টা সময় লেগেছিল।",
                look1
              )
            }
          >
            <img src={look1.src} alt="পুরনো ঢাকার গলিতে মেরুন শাড়ি" loading="lazy" width="900" height="1100" />
            <div className="lookbook-hover-label">
              <span className="lookbook-lbl-subtitle">Spotlight ০১</span>
              <span className="lookbook-lbl-title">মৃত্তিকা জামদানি শাড়ি</span>
            </div>
          </div>
          <div className="lookbook-right">
            <div
              className="lookbook-wide"
              onClick={() =>
                openSpotlight(
                  "রূপগঞ্জের তাঁতশালা",
                  "তাঁতশালার বুননকর্ম",
                  "দিনের আলোয় কাঠের তাঁতে সূক্ষ্ম সুতোর কাজ করছেন রূপগঞ্জের প্রবীণ তাঁতি। মেশিনের কোনো ব্যবহার ছাড়া, সম্পূর্ণ প্রাকৃতিক সুতা দিয়ে বোনা হচ্ছে এই কাপড়।",
                  look3
                )
              }
            >
              <img src={look3.src} alt="হেরিটেজ জানালার পাশে জামদানি" loading="lazy" width="1400" height="900" />
              <div className="lookbook-hover-label">
                <span className="lookbook-lbl-subtitle">Spotlight ০২</span>
                <span className="lookbook-lbl-title">বুননকর্মীদের মেহনত</span>
              </div>
            </div>
            <div
              className="lookbook-wide"
              onClick={() =>
                openSpotlight(
                  "ধানমণ্ডি লেক, ঢাকা",
                  "মেঘলা পাঞ্জাবি লুক",
                  "বিকেলের আলোয় সুতি ও জ্যাকার্ড উইভিং কাজের মেঘলা পাঞ্জাবি। উৎসব ও সান্ধ্যকালীন অনুষ্ঠানের জন্য মানানসই ও অত্যন্ত আরামদায়ক।",
                  look2
                )
              }
            >
              <img src={look2.src} alt="তাঁতের কাপড়ের স্তুপ" loading="lazy" width="900" height="1100" />
              <div className="lookbook-hover-label">
                <span className="lookbook-lbl-subtitle">Spotlight ০৩</span>
                <span className="lookbook-lbl-title">মেঘলা পাঞ্জাবি কালেকশন</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OFFER */}
      <section className="offer reveal-item">
        <div className="offer-inner">
          <div>
            <div className="offer-label">পূজা ও ঈদ সংস্করণ</div>
            <h2 className="offer-title">
              উৎসবের আগমনে <br />
              <span className="accent">২০% ছাড়</span> — শুধু এই সপ্তাহে।
            </h2>
          </div>
          <div className="offer-right">
            <div className="offer-coupon-label">কুপন কোড</div>
            <div className="offer-coupon" onClick={() => copyCoupon("TANHA20")}>
              TANHA20
            </div>
            <a href="#collection" className="btn-offer" onClick={(e) => { e.preventDefault(); scrollToSection(2); }}>
              এখনই কিনুন →
            </a>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials reveal-item" id="testimonials">
        <div className="testimonials-header">
          <div className="section-label">ক্রেতাদের কথা</div>
          <h2 className="section-title">
            যাঁরা পরেছেন — <br />
            <span className="accent">তাঁরা বলেছেন</span>।
          </h2>
        </div>
        <div className="testimonials-grid">
          {[
            {
              initial: "ফ",
              name: "ফারিয়া আহমেদ",
              loc: "ঢাকা",
              quote: "তানহার শাড়ি পরে যখন বিয়ের অনুষ্ঠানে গিয়েছিলাম, সবাই বলেছিল — এ যেন নকশায় বোনা স্বপ্ন।",
            },
            {
              initial: "ত",
              name: "তানভীর রহমান",
              loc: "চট্টগ্রাম",
              quote: "মা'র জন্য কিনেছিলাম জামদানি — কাপড়ের মান আর কারুকাজ দেখে মা বললেন এ যেন তার তরুণ বয়সের শাড়ি।",
            },
            {
              initial: "ন",
              name: "নসরাত জাহান",
              loc: "সিলেট",
              quote: "প্রতিটি সেলাই, প্রতিটি ভাঁজ — সব কিছুতেই যত্নের ছাপ। বাংলার ঐতিহ্যকে এত সুন্দরভাবে কেউ ধরে রাখেনি।",
            },
          ].map((test, idx) => (
            <figure key={idx} className="test-card">
              <div className="test-quote-mark">"</div>
              <blockquote className="test-quote">{test.quote}</blockquote>
              <figcaption className="test-footer">
                <div className="test-avatar">{test.initial}</div>
                <div>
                  <div className="test-name">{test.name}</div>
                  <div className="test-role">{test.loc}</div>
                </div>
                <div className="test-stars">★★★★★</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="faq reveal-item">
        <div className="faq-left">
          <div className="section-label">জিজ্ঞাসা</div>
          <h2 className="section-title">
            প্রশ্ন আছে? <br />
            <span className="accent">উত্তরও আছে</span>।
          </h2>
          <p style={{ marginTop: "1.5rem", color: "var(--muted)", maxWidth: "24rem" }}>
            আপনার আরও কোনো প্রশ্ন থাকলে সরাসরি যোগাযোগ করুন — আমরা পাশে আছি।
          </p>
          <a href="#contact" className="faq-btn" onClick={(e) => { e.preventDefault(); scrollToSection(5); }}>
            সরাসরি কথা বলুন →
          </a>
        </div>
        <div className="faq-list" id="faqList">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className={`faq-item ${isOpen ? "open" : ""}`}>
                <button className="faq-question" onClick={() => setOpenFaq(isOpen ? null : idx)}>
                  <span>{faq.q}</span>
                  <span className="faq-toggle">+</span>
                </button>
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="cta reveal-item">
        <div className="cta-inner">
          <div className="cta-grid">
            <div>
              <h2 className="cta-title">
                নতুন সংগ্রহের <br />
                <span className="accent">খবর সবার আগে</span>।
              </h2>
              <p className="cta-desc">প্রতি ঋতুতে নতুন গল্প, নতুন রং, নতুন বুনন — সরাসরি আপনার ইনবক্সে।</p>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="cta-form">
              <input type="email" required placeholder="আপনার ই-মেইল" className="cta-input" />
              <button type="submit" className="cta-submit">
                যুক্ত হোন
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <div className="footer-brand">তানহা ফ্যাশন</div>
            <p className="footer-brand-desc">বাংলার সুতোয় বোনা আধুনিক পোশাকের ঠিকানা। ঢাকা, বাংলাদেশ।</p>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">দোকান</div>
            <ul>
              <li><a href="#collection" onClick={(e) => { e.preventDefault(); scrollToSection(2); }}>শাড়ি</a></li>
              <li><a href="#collection" onClick={(e) => { e.preventDefault(); scrollToSection(2); }}>পাঞ্জাবি</a></li>
              <li><a href="#collection" onClick={(e) => { e.preventDefault(); scrollToSection(2); }}>কুর্তা</a></li>
              <li><a href="#collection" onClick={(e) => { e.preventDefault(); scrollToSection(2); }}>অনুষঙ্গ</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">যোগাযোগ</div>
            <ul>
              <li>hello@tanha.com</li>
              <li>+৮৮০ ১৭০০ ০০০ ০০০</li>
              <li>ধানমন্ডি, ঢাকা</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-bottom-inner">
            <div>© ২০২৬ তানহা ফ্যাশন। সর্বস্বত্ব সংরক্ষিত।</div>
            <div className="footer-bottom-links">
              <a href="#">গোপনীয়তা</a>
              <a href="#">শর্তাবলী</a>
              <a href="#">ইনস্টাগ্রাম</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Spotlight Modal Backdrop */}
      <div className={`spotlight-modal-backdrop ${modalOpen ? "active" : ""}`} id="spotlight-backdrop" onClick={closeSpotlight}>
        <div className="spotlight-modal" onClick={(e) => e.stopPropagation()}>
          <img src={modalData.imgSrc?.src || modalData.imgSrc} id="spotlight-modal-img" className="spotlight-img" alt="Spotlight" />
          <div className="spotlight-body">
            <span className="spotlight-loc" id="spotlight-modal-loc">
              {modalData.location}
            </span>
            <h3 className="spotlight-title" id="spotlight-modal-title">
              {modalData.title}
            </h3>
            <p className="spotlight-desc" id="spotlight-modal-desc">
              {modalData.description}
            </p>
            {modalData.product && (
              <>
                <div className="spotlight-size-title">সাইজ নির্বাচন করুন:</div>
                <div className="size-picker">
                  {modalData.product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSize === size ? "active" : ""}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="spotlight-actions-row">
              {modalData.product && (
                <button
                  className="spotlight-add-btn"
                  onClick={() => {
                    if (modalData.product) {
                      addToCart(modalData.product, 1, selectedSize);
                      showToast(`"${modalData.product.name}" (${selectedSize}) ব্যাগে যোগ করা হয়েছে!`);
                      closeSpotlight();
                    }
                  }}
                >
                  ব্যাগে রাখুন
                </button>
              )}
              <button className="spotlight-close" onClick={closeSpotlight}>
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cart Button */}
      <button 
        className={`floating-cart ${showFloatingCart ? "active" : ""}`}
        onClick={() => setCartDrawerOpen(true)}
        aria-label="Shopping Bag"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="cart-icon">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
        <span className="floating-cart-count">{toBanglaNumber(cartCount)}</span>
      </button>

      {/* Cart Drawer Backdrop */}
      <div 
        className={`cart-drawer-backdrop ${cartDrawerOpen ? "active" : ""}`} 
        onClick={() => setCartDrawerOpen(false)} 
      />

      {/* Cart Drawer */}
      <div className={`cart-drawer ${cartDrawerOpen ? "active" : ""}`}>
        <div className="cart-drawer-header">
          <h2 className="cart-drawer-title">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "1.5rem", height: "1.5rem" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            আপনার ব্যাগ ({toBanglaNumber(cartCount)})
          </h2>
          <button className="cart-drawer-close" onClick={() => setCartDrawerOpen(false)} aria-label="Close cart">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "1.5rem", height: "1.5rem" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="cart-drawer-items">
          {items.length === 0 ? (
            <div className="cart-drawer-empty">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="cart-drawer-empty-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <div className="cart-drawer-empty-text">আপনার ব্যাগ বর্তমানে খালি আছে।</div>
              <button className="prod-action-btn" onClick={() => setCartDrawerOpen(false)} style={{ maxWidth: "200px", marginTop: "1rem", flex: "none" }}>
                কেনাকাটা চালিয়ে যান
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="cart-drawer-item">
                <img src={item.img.src || item.img} alt={item.name} className="cart-item-img" />
                <div className="cart-item-details">
                  <div>
                    <h3 className="cart-item-title">{item.name}</h3>
                    <div className="cart-item-size">সাইজ: {item.size}</div>
                    <div className="cart-item-price">{item.priceDisplay}</div>
                  </div>
                  <div className="cart-item-controls">
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}>-</button>
                      <span className="qty-val">{toBanglaNumber(item.quantity)}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}>+</button>
                    </div>
                    <button className="cart-item-remove" onClick={() => removeFromCart(item.id, item.size)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "1rem", height: "1rem" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 9m-4.72 0-.34-9m9.96-3.243.5 8.625c.01.233-.03.468-.12.692a1.875 1.875 0 0 1-.502.825c-.29.297-.677.464-1.082.464H7.25c-.405 0-.792-.167-1.082-.464a1.875 1.875 0 0 1-.622-1.517l.5-8.625m15.3 0a12.07 12.07 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a12.11 12.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                      বাদ দিন
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row">
              <span>উপমোট</span>
              <span>{formatBanglaPriceWithCommas(subtotal)}</span>
            </div>
            
            {appliedCoupon ? (
              <div className="coupon-applied">
                <span>কুপন কোড ({appliedCoupon}) যুক্ত হয়েছে (২০%)</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>-{formatBanglaPriceWithCommas(discount)}</span>
                  <button className="coupon-remove-btn" onClick={removeCoupon}>বাদ দিন</button>
                </div>
              </div>
            ) : (
              <div className="coupon-section">
                <input
                  type="text"
                  placeholder="কুপন কোড (যেমন: TANHA20)"
                  className="coupon-input"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
                <button 
                  className="coupon-btn"
                  onClick={() => {
                    const res = applyCoupon(couponInput);
                    showToast(res.message);
                    if (res.success) setCouponInput("");
                  }}
                >
                  প্রয়োগ করুন
                </button>
              </div>
            )}

            <div className="cart-summary-row total">
              <span>সর্বমোট</span>
              <span>{formatBanglaPriceWithCommas(subtotal - discount)}</span>
            </div>

            <Link href="/checkout" className="checkout-btn" onClick={() => setCartDrawerOpen(false)}>
              চেকআউট করুন
            </Link>
          </div>
        )}
      </div>

      {/* Toast Notification Alert */}
      <div className={`toast ${toastActive ? "active" : ""}`} id="toast">
        {toastMsg}
      </div>
    </div>
  );
}
