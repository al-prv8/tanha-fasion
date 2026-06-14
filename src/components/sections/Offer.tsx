import React from "react";

interface OfferProps {
  copyCoupon: (code: string) => void;
  scrollToSection: (index: number) => void;
}

export default function Offer({ copyCoupon, scrollToSection }: OfferProps) {
  return (
    <section className="relative overflow-hidden border-t border-b border-ink/10 bg-accent text-bone reveal-item before:absolute before:inset-0 before:bg-[radial-gradient(oklch(0.97_0.02_80_/_0.04)_1px,transparent_1px)] before:bg-[size:3px_3px] before:opacity-30 before:pointer-events-none">
      <div className="max-w-[1440px] mx-auto py-12 px-4 md:py-16 md:px-12 grid grid-cols-1 lg:grid-cols-[2fr_1fr] items-center gap-8 relative text-center lg:text-left">
        <div>
          <div className="text-[11px] uppercase tracking-[0.4em] opacity-80 mb-3">পূজা ও ঈদ সংস্করণ</div>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            উৎসবের আগমনে <br />
            <span className="font-bold">২০% ছাড়</span> — শুধু এই সপ্তাহে।
          </h2>
        </div>
        <div className="flex flex-col items-center lg:items-end gap-3 md:gap-4">
          <div className="text-sm tracking-widest opacity-80">কুপন কোড</div>
          <div 
            className="border-2 border-dashed border-bone/60 py-3 px-6 text-xl md:text-2xl font-bold tracking-widest rounded-sm cursor-pointer transition-colors duration-300 hover:bg-bone/10" 
            onClick={() => copyCoupon("TANHA20")}
          >
            TANHA20
          </div>
          <a 
            href="#collection" 
            className="inline-flex items-center gap-2 bg-bone text-accent py-3 px-6 rounded-full text-sm font-semibold no-underline transition-transform duration-300 hover:scale-[1.03] w-full max-w-[240px] justify-center min-h-[44px]"
            onClick={(e) => { e.preventDefault(); scrollToSection(2); }}
          >
            এখনই কিনুন →
          </a>
        </div>
      </div>
    </section>
  );
}
