import React, { useState } from "react";
import { Product } from "@/lib/products";
import { ShoppingBag, Eye } from "lucide-react";

interface CategoryShowcaseProps {
  title: string;
  englishTitle: string;
  bannerImg: any;
  products: Product[];
  openSpotlight: (product: Product) => void;
  addToCart: (product: Product, size: string) => void;
  showToast: (msg: string) => void;
  sectionId: string;
}

export default function CategoryShowcase({
  title,
  englishTitle,
  bannerImg,
  products,
  openSpotlight,
  addToCart,
  showToast,
  sectionId,
}: CategoryShowcaseProps) {
  const [selectedSizes, setSelectedSizes] = useState<{ [productId: string]: string }>({});

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddClick = (product: Product) => {
    const size = selectedSizes[product.id] || product.sizes[0] || "M";
    addToCart(product, size);
    showToast(`"${product.name}" (${size}) ব্যাগ-এ যুক্ত করা হয়েছে!`);
  };

  return (
    <section id={sectionId} className="w-full py-8 max-w-[1440px] mx-auto px-4 md:px-8 reveal-item">
      {/* FULL WIDTH CATEGORY BANNER */}
      <div className="relative w-full h-[180px] sm:h-[220px] md:h-[260px] lg:h-[300px] overflow-hidden rounded-md mb-8 shadow-sm">
        <img
          src={bannerImg.src}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Dark overlay & Text details */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex flex-col justify-center px-6 sm:px-12 md:px-16 text-white">
          <span className="text-xs md:text-sm font-semibold text-primary uppercase tracking-[0.2em] mb-1">
            EXQUISITE COLLECTION
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wider mb-2 font-display">
            {englishTitle}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-zinc-200 opacity-90 max-w-md mb-0">
            {title} — নতুন এবং আকর্ষণীয় ডিজাইনের চমৎকার প্রিমিয়াম সংগ্রহ।
          </p>
        </div>
      </div>

      {/* 4 PRODUCT CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((prod) => {
          const activeSize = selectedSizes[prod.id] || prod.sizes[0] || "M";
          return (
            <div
              key={prod.id}
              className="bg-background border border-border/60 hover:border-primary/50 rounded overflow-hidden flex flex-col justify-between group transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1"
            >
              {/* Product Image and badges */}
              <div className="relative aspect-[3/4] bg-secondary overflow-hidden w-full cursor-pointer" onClick={() => openSpotlight(prod)}>
                <img
                  src={prod.img.src}
                  alt={prod.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Hot/New Tag Badges */}
                {prod.tag && (
                  <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[9px] sm:text-[10px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wider shadow-sm">
                    {prod.tag}
                  </span>
                )}

                {/* Quick actions hover overlay (Desktop only) */}
                <div className="hidden md:flex absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center gap-3 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openSpotlight(prod);
                    }}
                    className="w-10 h-10 rounded-full bg-white hover:bg-primary text-foreground hover:text-white flex items-center justify-center shadow-md transition-colors border-none cursor-pointer"
                    title="Quick View"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-3 sm:p-4 flex flex-col gap-2.5">
                {/* Product Name */}
                <div>
                  <h3
                    className="text-xs sm:text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors cursor-pointer"
                    onClick={() => openSpotlight(prod)}
                  >
                    {prod.name}
                  </h3>
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

                {/* Price & Add to Cart */}
                <div className="flex items-center justify-between border-t border-border/40 pt-2.5 mt-1">
                  <span className="text-xs sm:text-sm font-extrabold text-foreground">
                    {prod.priceDisplay}
                  </span>
                  <button
                    onClick={() => handleAddClick(prod)}
                    className="bg-foreground hover:bg-primary text-background hover:text-white border-none py-1.5 px-3 rounded-full text-[10px] sm:text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ShoppingBag size={12} />
                    <span>কিনুন</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
