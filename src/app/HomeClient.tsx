"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { Product, PRODUCTS } from "@/lib/products";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

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

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    
    // Fetch products dynamically from Express backend
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const mapped = data.map((p: any) => {
            let sizesObj: { [sz: string]: number } = {};
            try {
              sizesObj = JSON.parse(p.sizesJson || "{}");
            } catch (e) {}
            const sizesKeys = Object.keys(sizesObj);
            const totalStock = Object.values(sizesObj).reduce((acc: number, val: any) => acc + Number(val || 0), 0);
            return {
              id: p.id,
              sku: p.sku,
              name: p.name,
              price: p.price,
              priceDisplay: `৳${p.price}`,
              loc: p.category,
              img: { src: p.imgUrl },
              sizes: sizesKeys.length > 0 ? sizesKeys : ["S", "M", "L", "XL"],
              sizesJson: p.sizesJson,
              desc: `${p.name} - Premium Quality Collection.`,
              tag: totalStock === 0 ? "স্টক শেষ" : "নতুন"
            };
          });
          setProductsList(mapped);
        } else {
          setProductsList(PRODUCTS);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch live products, falling back to static:", err);
        setProductsList(PRODUCTS);
        setIsLoading(false);
      });
  }, []);

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

  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSizes, setSelectedSizes] = useState<{ [productId: string]: string }>({});

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddClick = (product: Product) => {
    const size = selectedSizes[product.id] || product.sizes[0] || "M";
    addToCart(product, 1, size);
    showToast(`"${product.name}" (${size}) ব্যাগ-এ যুক্ত করা হয়েছে!`);
  };

  const handleBuyNowClick = (product: Product) => {
    const size = selectedSizes[product.id] || product.sizes[0] || "M";
    addToCart(product, 1, size);
    router.push("/checkout");
  };

  useEffect(() => {
    const secParam = searchParams.get("sec");
    if (secParam) {
      const index = parseInt(secParam, 10);
      if (!isNaN(index)) {
        const timer = setTimeout(() => {
          scrollToSection(index);
        }, 450);
        return () => clearTimeout(timer);
      }
    }
    const searchParam = searchParams.get("search");
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);


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
  const cottonProducts = productsList.filter((p) => p.loc === "সুতি থ্রি-পিস");
  const georgetteProducts = productsList.filter((p) => p.loc === "জর্জেট থ্রি-পিস");
  const linenProducts = productsList.filter((p) => p.loc === "লিলেন থ্রি-পিস");
  const casualAbayaProducts = productsList.filter((p) => p.loc === "ক্যাজুয়াল আবায়া");
  const festiveBorkaProducts = productsList.filter((p) => p.loc === "উৎসবের বোরকা");
  const comboProducts = productsList.filter((p) => p.loc === "কম্বো সেট");

  // Filter products by search query
  const filteredProducts = productsList.filter(
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
              {filteredProducts.map((prod) => {
                const activeSize = selectedSizes[prod.id] || prod.sizes[0] || "M";
                return (
                  <div
                    key={prod.id}
                    className="bg-background border border-border/60 hover:border-primary/50 rounded overflow-hidden flex flex-col justify-between group transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1"
                  >
                    {/* Product Image Link */}
                    <Link href={`/products/${prod.id}`} className="relative aspect-[3/4] bg-secondary overflow-hidden w-full block cursor-pointer">
                      <img
                        src={prod.img?.src || prod.img}
                        alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {prod.tag && (
                        <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[9px] sm:text-[10px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wider shadow-sm">
                          {prod.tag}
                        </span>
                      )}
                    </Link>

                    {/* Product Details */}
                    <div className="p-3 sm:p-4 flex flex-col gap-2.5">
                      <div>
                        <Link
                          href={`/products/${prod.id}`}
                          className="text-xs sm:text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors cursor-pointer block no-underline"
                        >
                          {prod.name}
                        </Link>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{prod.loc}</p>
                      </div>

                      {/* Sizes Row */}
                      <div className="flex flex-col gap-1.5">
                        <div className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">সাইজ সিলেক্ট করুন:</div>
                        <div className="flex flex-wrap gap-1">
                          {prod.sizes.map((sz) => (
                            <button
                              key={sz}
                              onClick={() => handleSizeSelect(prod.id, sz)}
                              className={`text-[10px] font-bold w-6 h-6 sm:w-7 sm:h-7 rounded border flex items-center justify-center transition-all cursor-pointer ${
                                activeSize === sz
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "bg-background border-border text-foreground hover:border-primary/50"
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="flex flex-col gap-2 border-t border-border/40 pt-2.5 mt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-extrabold text-foreground">
                            {prod.priceDisplay}
                          </span>
                          <Link
                            href={`/products/${prod.id}`}
                            className="text-[10px] sm:text-xs text-primary hover:underline font-semibold no-underline"
                          >
                            বিস্তারিত
                          </Link>
                        </div>
                        <div className="flex gap-1.5 mt-0.5">
                          {/* Add to Cart button */}
                          <button
                            onClick={() => handleAddClick(prod)}
                            className="flex-1 bg-secondary hover:bg-secondary-foreground/10 text-foreground border border-border/80 py-1.5 px-2 rounded-sm text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            title="ব্যাগে যোগ করুন"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                            <span className="hidden sm:inline">ব্যাগে রাখুন</span>
                          </button>
                          {/* Buy Now button */}
                          <button
                            onClick={() => handleBuyNowClick(prod)}
                            className="flex-1 bg-primary hover:bg-primary/95 text-white border-none py-1.5 px-2 rounded-sm text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>এখনই কিনুন</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
            <div className="relative w-full h-[100px] sm:h-[130px] md:h-[160px] overflow-hidden rounded-md cursor-pointer group shadow-sm border border-border" onClick={() => router.push("/showroom")}>
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
