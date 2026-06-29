import React from "react";
import Image from "next/image";
import { PRODUCTS, Product, toBanglaNumber, getProductPriceDisplayRange, formatBanglaPriceWithCommas } from "@/lib/products";

interface CollectionProps {
  openSpotlight: (product: Product) => void;
  addToCart: (product: Product, quantity: number, size: string) => void;
  showToast: (msg: string) => void;
}

export default function Collection({
  openSpotlight,
  addToCart,
  showToast,
}: CollectionProps) {
  return (
    <section id="collection" className="max-w-[1440px] mx-auto py-12 px-4 md:py-24 md:px-12 reveal-item">
      <div className="flex flex-wrap justify-between items-end gap-6 mb-10 md:mb-16">
        <div>
          <div className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground mb-3">সংগ্রহশালা</div>
          <h2 className="text-3xl md:text-5xl font-bold leading-none tracking-tight">নির্বাচিত <span className="text-primary font-bold">পোশাক</span></h2>
        </div>
        <p className="max-w-xs text-sm md:text-base text-muted-foreground">সীমিত সংস্করণে প্রতিটি পোশাক — যত্নে বোনা, যত্নে নির্বাচিত।</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {PRODUCTS.map((prod, idx) => (
          <article
            key={idx}
            className={`relative cursor-pointer group ${idx === 1 ? "lg:mt-16" : ""}`}
            onClick={() => openSpotlight(prod)}
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-card">
              <Image src={prod.img?.src || prod.img} alt={prod.name} fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
              <span className="absolute top-3 left-3 md:top-4 md:left-4 bg-background/90 py-1 px-3 rounded-full text-[9px] md:text-[10px] font-semibold uppercase tracking-wide">{prod.tag}</span>
              <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 flex gap-1.5 md:gap-2 transition-all duration-300 z-10 opacity-100 translate-y-0 lg:opacity-0 lg:translate-y-2 lg:group-hover:opacity-100 lg:group-hover:translate-y-0">
                <button
                  className="flex-1 bg-background/95 text-foreground py-2 px-1.5 rounded text-[11px] md:text-xs font-semibold border border-ink/15 cursor-pointer transition-colors duration-200 hover:bg-primary hover:text-white flex items-center justify-center min-h-[38px] md:min-h-[44px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSpotlight(prod);
                  }}
                >
                  দ্রুত দেখুন
                </button>
                <button
                  className="flex-1 bg-primary text-white py-2 px-1.5 rounded text-[11px] md:text-xs font-semibold border border-primary cursor-pointer transition-colors duration-200 hover:bg-foreground hover:border-foreground hover:text-background flex items-center justify-center min-h-[38px] md:min-h-[44px]"
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
            <div className="mt-4 md:mt-5 flex justify-between items-start gap-4">
              <div className="min-w-0 flex-grow">
                <div className="text-[10px] md:text-[11px] text-muted-foreground">{prod.id}</div>
                <h3 className="mt-1 text-sm md:text-lg font-semibold text-foreground truncate">{prod.name}</h3>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm md:text-lg font-semibold text-foreground">{getProductPriceDisplayRange(prod)}</div>
                {prod.originalPrice && prod.originalPrice > prod.price && (
                  <div className="text-[11px] md:text-xs text-muted-foreground line-through decoration-red-500 font-medium mt-0.5">
                    {formatBanglaPriceWithCommas(prod.originalPrice)}
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
