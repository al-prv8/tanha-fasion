import React, { useState } from "react";
import { useWishlist } from "@/lib/wishlist-context";
import Image from "next/image";
import { Product, formatBanglaPriceWithCommas } from "@/lib/products";
import { ShoppingBag, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CategoryShowcaseProps {
  title: string;
  englishTitle: string;
  bannerImg: any;
  products: Product[];
  openSpotlight: (product: Product) => void;
  addToCart: (product: Product, size: string) => void;
  showToast: (msg: string) => void;
  sectionId: string;
  bannerSubtitle?: string;
  bannerDescription?: string;
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
  bannerSubtitle,
  bannerDescription,
}: CategoryShowcaseProps) {
  const [selectedSizes, setSelectedSizes] = useState<{ [productId: string]: string }>({});
  const router = useRouter();
  const { toggleWishlist, isFavorite } = useWishlist();

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddClick = (product: Product) => {
    const size = selectedSizes[product.id] || product.sizes[0] || "M";
    addToCart(product, size);
    showToast(`"${product.name}" (${size}) ব্যাগ-এ যুক্ত করা হয়েছে!`);
  };

  const handleBuyNowClick = (product: Product) => {
    const size = selectedSizes[product.id] || product.sizes[0] || "M";
    addToCart(product, size);
    router.push("/checkout");
  };

  return (

    <section id={sectionId} className="w-full py-8 max-w-[1440px] mx-auto px-4 md:px-8 reveal-item">
      {/* FULL WIDTH CATEGORY BANNER */}
      <div className="relative w-full h-[180px] sm:h-[220px] md:h-[260px] lg:h-[300px] overflow-hidden rounded-md mb-8 shadow-sm">
        <Image
          src={bannerImg?.src || bannerImg || "/assets/cotton_3pc_banner.png"}
          alt={title}
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay & Text details */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex flex-col justify-center px-6 sm:px-12 md:px-16 text-white">
          <span className="text-xs md:text-sm font-semibold text-primary uppercase tracking-[0.2em] mb-1">
            {bannerSubtitle || "EXQUISITE COLLECTION"}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wider mb-2 font-display">
            {englishTitle}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-zinc-200 opacity-90 max-w-md mb-0">
            {bannerDescription || `${title} — নতুন এবং আকর্ষণীয় ডিজাইনের চমৎকার প্রিমিয়াম সংগ্রহ।`}
          </p>
        </div>
      </div>

      {/* 4 PRODUCT CARDS GRID */}
      {products.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-muted-foreground"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>
          </div>
          <p className="text-sm font-bold text-foreground">এই ক্যাটাগরিতে এখনো কোনো পোশাক নেই</p>
          <p className="text-xs text-muted-foreground">শীঘ্রই নতুন কালেকশন আসছে...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((prod) => {
            const activeSize = selectedSizes[prod.id] || prod.sizes[0] || "M";
            return (
              <div
                key={prod.id}
                className="bg-background border border-border/60 hover:border-primary/50 rounded overflow-hidden flex flex-col justify-between group transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative aspect-[3/4] bg-secondary overflow-hidden w-full">
                  <Link href={`/products/${prod.id}`} className="relative block w-full h-full cursor-pointer">
                    <Image
                      src={prod.img?.src || prod.img}
                      alt={prod.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => { 
                      e.preventDefault(); 
                      e.stopPropagation(); 
                      const added = toggleWishlist(prod.id);
                      showToast(added ? `"${prod.name}" পছন্দের তালিকায় যোগ করা হয়েছে!` : `"${prod.name}" পছন্দের তালিকা থেকে বাদ দেওয়া হয়েছে!`);
                    }}
                    className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer border-none ${
                      isFavorite(prod.id) ? "bg-rose-50 text-rose-500" : "bg-white/90 text-slate-400 hover:text-rose-500"
                    }`}
                    title={isFavorite(prod.id) ? "পছন্দের তালিকা থেকে বাদ দিন" : "পছন্দের তালিকায় যোগ করুন"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill={isFavorite(prod.id) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                  </button>

                  {/* Out-of-stock overlay */}
                  {prod.tag === 'স্টক শেষ' && (
                    <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                      <span className="bg-slate-900/80 text-white text-[10px] font-black px-3 py-1.5 rounded-full tracking-wider uppercase">স্টক শেষ</span>
                    </div>
                  )}

                  {/* Hot/New Tag Badges */}
                  {prod.tag && (
                    <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[9px] sm:text-[10px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wider shadow-sm">
                      {prod.tag}
                    </span>
                  )}

                  {/* Quick actions hover overlay (Desktop only) */}
                  <Link
                    href={`/products/${prod.id}`}
                    className="hidden md:flex absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center gap-3 z-10 cursor-pointer"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        openSpotlight(prod);
                      }}
                      className="w-10 h-10 rounded-full bg-white hover:bg-primary text-foreground hover:text-white flex items-center justify-center shadow-md transition-colors border-none cursor-pointer"
                      title="Quick View"
                    >
                      <Eye size={18} />
                    </button>
                  </Link>

                </div>

                {/* Product Details */}
                <div className="p-3 sm:p-4 flex flex-col gap-2.5">
                  {/* Product Name */}
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
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="text-xs sm:text-sm font-extrabold text-foreground">
                          {(() => {
                            const size = selectedSizes[prod.id] || prod.sizes[0] || "M";
                            let activePrice = prod.price;
                            const p = prod as any;
                            if (p.sizePricesJson) {
                              try {
                                const sizePrices = typeof p.sizePricesJson === 'string'
                                  ? JSON.parse(p.sizePricesJson)
                                  : p.sizePricesJson;
                                if (sizePrices && sizePrices[size] !== undefined && sizePrices[size] !== null && Number(sizePrices[size]) > 0) {
                                  activePrice = Number(sizePrices[size]);
                                }
                              } catch (e) {}
                            }
                            return formatBanglaPriceWithCommas(activePrice);
                          })()}
                        </span>
                        {(() => {
                          const size = selectedSizes[prod.id] || prod.sizes[0] || "M";
                          let activePrice = prod.price;
                          const p = prod as any;
                          if (p.sizePricesJson) {
                            try {
                              const sizePrices = typeof p.sizePricesJson === 'string'
                                ? JSON.parse(p.sizePricesJson)
                                : p.sizePricesJson;
                              if (sizePrices && sizePrices[size] !== undefined && sizePrices[size] !== null && Number(sizePrices[size]) > 0) {
                                activePrice = Number(sizePrices[size]);
                              }
                            } catch (e) {}
                          }
                          if (p.originalPrice && p.originalPrice > p.price) {
                            const activeOriginalPrice = Math.round(activePrice * (p.originalPrice / p.price));
                            return (
                              <span className="text-[10px] sm:text-xs text-muted-foreground line-through decoration-red-500 font-medium">
                                {formatBanglaPriceWithCommas(activeOriginalPrice)}
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
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
                        className="flex-grow bg-secondary hover:bg-secondary-foreground/10 text-foreground border border-border/80 py-1.5 px-2 rounded-sm text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title="ব্যাগে যোগ করুন"
                      >
                        <ShoppingBag size={11} />
                        <span className="hidden sm:inline">ব্যাগে রাখুন</span>
                      </button>
                      {/* Buy Now button */}
                      <button
                        onClick={() => handleBuyNowClick(prod)}
                        className="flex-grow bg-primary hover:bg-primary/95 text-white border-none py-1.5 px-2 rounded-sm text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
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

      {/* View All Link */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => router.push(`/categories?type=${encodeURIComponent(title)}`)}
          className="inline-flex items-center gap-2 py-2.5 px-7 border-2 border-primary text-primary font-bold text-xs rounded-full hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer bg-transparent"
        >
          <span>সব {title} দেখুন</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
        </button>
      </div>
    </section>
  );
}
