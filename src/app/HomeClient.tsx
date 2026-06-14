"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { Product, PRODUCTS } from "@/lib/products";

// Layout Component imports
import Navbar from "@/components/layout/Navbar";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import MobileTabBar from "@/components/layout/MobileTabBar";
import MobileMenuDrawer from "@/components/layout/MobileMenuDrawer";
import CartDrawer from "@/components/layout/CartDrawer";

// Section Component imports
import Hero from "@/components/sections/Hero";
import Categories from "@/components/sections/Categories";
import CategoryShowcase from "@/components/sections/CategoryShowcase";
import Faq from "@/components/sections/Faq";
import Cta from "@/components/sections/Cta";

// Overlays imports
import SpotlightModal from "@/components/overlays/SpotlightModal";
import ToastNotification from "@/components/overlays/ToastNotification";

// Category Banners & Showroom assets
import cotton3pcBanner from "@/assets/cotton_3pc_banner.png";
import georgette3pcBanner from "@/assets/georgette_3pc_banner.png";
import linen3pcBanner from "@/assets/linen_3pc_banner.png";
import casualAbayaBanner from "@/assets/casual_abaya_banner.png";
import festiveBorkaBanner from "@/assets/festive_borka_banner.png";
import comboPackBanner from "@/assets/combo_pack_banner.png";
import showroomBanner from "@/assets/showroom_banner.png";

export default function HomeClient() {
  const {
    addToCart,
    cartCount,
    cartDrawerOpen,
    setCartDrawerOpen,
  } = useCart();

  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const [activeSection, setActiveSection] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("M");
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
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const sections = [
    { id: "hero", label: "হোম" },
    { id: "categories", label: "টপ ক্যাটাগরি" },
    { id: "category-2", label: "সুতি থ্রি-পিস" },
    { id: "category-3", label: "জর্জেট থ্রি-পিস" },
    { id: "category-4", label: "লিলেন থ্রি-পিস" },
    { id: "category-5", label: "ক্যাজুয়াল আবায়া" },
    { id: "category-6", label: "উৎসবের বোরকা" },
    { id: "category-7", label: "কম্বো সেট" },
    { id: "faq", label: "জিজ্ঞাসা" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const scrollPos = window.scrollY + windowHeight * 0.4;
      let activeIdx = 0;

      sections.forEach((sec, idx) => {
        const el = sec.id === "hero" ? document.body : document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            activeIdx = idx;
          }
        }
      });

      setActiveSection(activeIdx);
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
    if (!sec) return;
    const el = sec.id === "hero" ? document.body : document.getElementById(sec.id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 110, // adjusted offset for sticky search navbar
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
        title: prod.name,
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

  // Filter products by category
  const cottonProducts = PRODUCTS.filter((p) => p.loc === "সুতি থ্রি-পিস");
  const georgetteProducts = PRODUCTS.filter((p) => p.loc === "জর্জেট থ্রি-পিস");
  const linenProducts = PRODUCTS.filter((p) => p.loc === "লিলেন থ্রি-পিস");
  const casualAbayaProducts = PRODUCTS.filter((p) => p.loc === "ক্যাজুয়াল আবায়া");
  const festiveBorkaProducts = PRODUCTS.filter((p) => p.loc === "উৎসবের বোরকা");
  const comboProducts = PRODUCTS.filter((p) => p.loc === "কম্বো সেট");

  // Filter products by search query
  const filteredProducts = PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.loc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grain-bg min-h-screen pb-20 md:pb-0">
      {/* Top Announcement Offer Bar */}
      <AnnouncementBar scrollToSection={scrollToSection} />

      {/* Top Navbar Header (Sticky with Search functionality) */}
      <Navbar 
        cartCount={cartCount} 
        onOpenMenu={() => setMenuDrawerOpen(true)}
        onOpenCart={() => setCartDrawerOpen(true)}
        scrollToSection={scrollToSection}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {searchQuery ? (
        /* SEARCH RESULTS SCREEN */
        <main className="max-w-[1440px] mx-auto py-12 px-4 md:px-8">
          <div className="mb-8 border-b border-border pb-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              অনুসন্ধানের ফলাফল: <span className="text-primary">"{searchQuery}"</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              মোট {filteredProducts.length}টি পোশাক পাওয়া গিয়েছে।
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              দুঃখিত, আপনার অনুসন্ধান অনুযায়ী কোনো পোশাক পাওয়া যায়নি। অনুগ্রহ করে অন্য কি-ওয়ার্ড দিয়ে খুঁজুন।
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-background border border-border/60 rounded overflow-hidden flex flex-col justify-between group transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-primary/50"
                >
                  <div className="relative aspect-[3/4] bg-secondary overflow-hidden w-full cursor-pointer" onClick={() => openSpotlight(prod)}>
                    <img
                      src={prod.img.src}
                      alt={prod.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {prod.tag && (
                      <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[9px] sm:text-[10px] font-bold py-1 px-2 rounded-full">
                        {prod.tag}
                      </span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col gap-2">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1 cursor-pointer" onClick={() => openSpotlight(prod)}>
                        {prod.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{prod.loc}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/40 pt-2.5 mt-2">
                      <span className="text-xs sm:text-sm font-extrabold text-foreground">{prod.priceDisplay}</span>
                      <button
                        onClick={() => {
                          addToCart(prod, 1, "M");
                          showToast(`"${prod.name}" (M) ব্যাগ-এ যুক্ত করা হয়েছে!`);
                        }}
                        className="bg-primary hover:bg-primary/95 text-primary-foreground border-none py-1.5 px-3 rounded-full text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        কিনুন
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      ) : (
        /* MAIN LANDING PAGE SECTIONS */
        <main>
          {/* Hero Banner Section */}
          <Hero scrollToSection={scrollToSection} />

          {/* Categories Grid Section */}
          <Categories scrollToSection={scrollToSection} />

          {/* SHOWROOM OUTLET SLIM BANNER */}
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4">
            <div className="relative w-full h-[100px] sm:h-[130px] md:h-[160px] overflow-hidden rounded-md cursor-pointer group shadow-sm border border-border" onClick={() => scrollToSection(8)}>
              <img
                src={showroomBanner.src}
                alt="শোরুম আউটলেট"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-101"
              />
              <div className="absolute inset-0 bg-black/55 flex items-center justify-between px-4 sm:px-12 text-white">
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold">ভিজিট করুন আমাদের শোরুম আউটলেট</h3>
                  <p className="text-[10px] sm:text-xs text-zinc-300 mt-1">সরাসরি দেখে ও কাপড়ের গুণগত মান যাচাই করে সংগ্রহ করার সুযোগ রয়েছে।</p>
                </div>
                <button className="hidden sm:inline-block bg-white hover:bg-primary text-black hover:text-white py-2 px-5 rounded-full text-xs font-semibold transition-colors cursor-pointer border-none shadow-md">
                  শোরুমের ঠিকানা
                </button>
              </div>
            </div>
          </div>

          {/* Category-wise Showcase Stack */}
          <CategoryShowcase
            sectionId="category-2"
            title="সুতি থ্রি-পিস"
            englishTitle="COTTON 3-PIECE"
            bannerImg={cotton3pcBanner}
            products={cottonProducts}
            openSpotlight={openSpotlight}
            addToCart={(product, size) => addToCart(product, 1, size)}
            showToast={showToast}
          />

          <CategoryShowcase
            sectionId="category-3"
            title="জর্জেট থ্রি-পিস"
            englishTitle="GEORGETTE 3-PIECE"
            bannerImg={georgette3pcBanner}
            products={georgetteProducts}
            openSpotlight={openSpotlight}
            addToCart={(product, size) => addToCart(product, 1, size)}
            showToast={showToast}
          />

          <CategoryShowcase
            sectionId="category-4"
            title="লিলেন থ্রি-পিস"
            englishTitle="LINEN 3-PIECE"
            bannerImg={linen3pcBanner}
            products={linenProducts}
            openSpotlight={openSpotlight}
            addToCart={(product, size) => addToCart(product, 1, size)}
            showToast={showToast}
          />

          <CategoryShowcase
            sectionId="category-5"
            title="ক্যাজুয়াল আবায়া"
            englishTitle="CASUAL ABAYA"
            bannerImg={casualAbayaBanner}
            products={casualAbayaProducts}
            openSpotlight={openSpotlight}
            addToCart={(product, size) => addToCart(product, 1, size)}
            showToast={showToast}
          />

          <CategoryShowcase
            sectionId="category-6"
            title="উৎসবের বোরকা"
            englishTitle="FESTIVE BORKA"
            bannerImg={festiveBorkaBanner}
            products={festiveBorkaProducts}
            openSpotlight={openSpotlight}
            addToCart={(product, size) => addToCart(product, 1, size)}
            showToast={showToast}
          />

          <CategoryShowcase
            sectionId="category-7"
            title="বিশেষ কম্বো সেট"
            englishTitle="COMBO PACK DETAILS"
            bannerImg={comboPackBanner}
            products={comboProducts}
            openSpotlight={openSpotlight}
            addToCart={(product, size) => addToCart(product, 1, size)}
            showToast={showToast}
          />
        </main>
      )}

      {/* FAQ list section */}
      <section id="faq" className="reveal-item">
        <Faq 
          openFaq={openFaq} 
          setOpenFaq={setOpenFaq}
          scrollToSection={scrollToSection}
        />
      </section>

      {/* Newsletter & Global Footer */}
      <Cta scrollToSection={scrollToSection} />

      {/* Product spotlight / location details overlay popup */}
      <SpotlightModal 
        isOpen={modalOpen} 
        onClose={closeSpotlight}
        modalData={modalData}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        addToCart={addToCart}
        showToast={showToast}
      />

      {/* Shopping Cart Sidebar Drawer Panel */}
      <CartDrawer showToast={showToast} />

      {/* Mobile-only layout bottom sticky nav tabs */}
      <MobileTabBar 
        activeSection={activeSection}
        cartCount={cartCount}
        cartDrawerOpen={cartDrawerOpen}
        scrollToSection={scrollToSection}
        setCartDrawerOpen={setCartDrawerOpen}
        showToast={showToast}
      />

      {/* Mobile-only responsive navigation drawer menu */}
      <MobileMenuDrawer 
        isOpen={menuDrawerOpen}
        onClose={() => setMenuDrawerOpen(false)}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
      />

      {/* User Alerts toast popups notifications */}
      <ToastNotification isActive={toastActive} message={toastMsg} />
    </div>
  );
}
