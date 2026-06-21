"use client";

import React from "react";
import { Product } from "@/lib/products";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalData: {
    location: string;
    title: string;
    description: string;
    imgSrc: any;
    product?: Product;
  };
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  addToCart: (product: Product, quantity: number, size: string) => void;
  showToast: (msg: string) => void;
}

export default function SpotlightModal({
  isOpen,
  onClose,
  modalData,
  selectedSize,
  setSelectedSize,
  addToCart,
  showToast,
}: SpotlightModalProps) {
  const router = useRouter();

  return (
    <div 
      className={`fixed inset-0 bg-ink/60 backdrop-blur-md z-[10000] transition-opacity duration-300 flex items-center justify-center p-4 md:p-8 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} 
      id="spotlight-backdrop" 
      onClick={onClose}
    >
      <div 
        className={`bg-background border border-ink/15 rounded-sm max-w-[600px] w-full overflow-hidden shadow-2xl transition-all duration-300 ${isOpen ? "scale-100" : "scale-95"}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={modalData.imgSrc?.src || modalData.imgSrc} 
          id="spotlight-modal-img" 
          className="aspect-[16/10] w-full object-cover" 
          alt="Spotlight" 
        />
        <div className="p-6 md:p-8">
          <span className="text-xs uppercase tracking-[0.2em] text-primary mb-2 block" id="spotlight-modal-loc">
            {modalData.location}
          </span>
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-4 text-foreground" id="spotlight-modal-title">
            {modalData.title}
          </h3>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6" id="spotlight-modal-desc">
            {modalData.description}
          </p>
          
          {modalData.product && (
            <>
              <div className="text-sm font-semibold text-foreground mt-5 mb-2">সাইজ নির্বাচন করুন:</div>
              <div className="flex gap-2 mb-5">
                {modalData.product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`w-10 h-10 border border-ink/15 font-semibold text-sm cursor-pointer flex items-center justify-center transition-colors rounded ${selectedSize === size ? "bg-foreground text-background border-foreground" : "hover:border-foreground"}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </>
          )}
          
          {modalData.product && (
            <div className="text-center mb-4">
              <Link 
                href={`/products/${modalData.product.id}`} 
                className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
                onClick={onClose}
              >
                বিস্তারিত বিবরণ দেখুন →
              </Link>
            </div>
          )}

          <div className="flex gap-3 mt-4 items-center">
            {modalData.product && (
              <>
                <button
                  className="flex-1 bg-secondary text-foreground py-3 px-4 rounded-full font-bold text-xs sm:text-sm cursor-pointer border border-border transition-colors hover:bg-ink/5"
                  onClick={() => {
                    if (modalData.product) {
                      addToCart(modalData.product, 1, selectedSize);
                      showToast(`"${modalData.product.name}" (${selectedSize}) ব্যাগে যোগ করা হয়েছে!`);
                      onClose();
                    }
                  }}
                >
                  ব্যাগে রাখুন
                </button>
                <button
                  className="flex-1 bg-primary text-bone py-3 px-4 rounded-full font-bold text-xs sm:text-sm cursor-pointer transition-colors duration-300 hover:bg-foreground"
                  onClick={() => {
                    if (modalData.product) {
                      addToCart(modalData.product, 1, selectedSize);
                      router.push("/checkout");
                      onClose();
                    }
                  }}
                >
                  এখনই কিনুন
                </button>
              </>
            )}
            <button className="bg-foreground text-background py-3 px-5 rounded-full font-bold text-xs sm:text-sm cursor-pointer transition-colors duration-300 hover:bg-primary hover:text-white" onClick={onClose}>
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

