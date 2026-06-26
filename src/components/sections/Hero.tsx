import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Phone } from "lucide-react";
import heroEverydayBanner from "@/assets/hero_everyday_banner.png";
import showroomBanner from "@/assets/showroom_banner.png";
import comboPackImg from "@/assets/combo_pack_banner.png";

interface HeroProps {
  scrollToSection: (index: number) => void;
}

export default function Hero({ scrollToSection }: HeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      img: heroEverydayBanner,
      title: "EVERYDAY COLLECTION",
      subtitle: "আরাম ও আভিজাত্যের অনন্য সজ্জা",
      description: "প্রিমিয়াম সুতি থ্রি-পিস, গর্জিয়াস জর্জেট থ্রি-পিস ও দুবাই চেরি আবায়া-বোরকার এক্সক্লুসিভ কালেকশন।",
      btnText: "পোশাক সংগ্রহ দেখুন",
      btnAction: () => scrollToSection(2),
    },
    {
      img: comboPackImg,
      title: "EXCLUSIVE COMBO SETS",
      subtitle: "বিশেষ কম্বো ডিল",
      description: "আবায়া-নিকাব-হিজাব সেট এবং ডিজাইনার সালোয়ার কামিজের রাজকীয় কম্বো প্যাকগুলোতে পাচ্ছেন আকর্ষণীয় ছাড়।",
      btnText: "কম্বো অফার দেখুন",
      btnAction: () => scrollToSection(7),
    },
    {
      img: showroomBanner,
      title: "VISIT OUR SHOWROOM",
      subtitle: "আমাদের আউটলেট ও শোরুম",
      description: "লেভেল ৪, ব্লক সি, বসুন্ধরা সিটি শপিং কমপ্লেক্স, পান্থপথ, ঢাকায় অবস্থিত আমাদের স্টোর পরিদর্শন করুন।",
      btnText: "যোগাযোগ করুন",
      btnAction: () => scrollToSection(8),
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative w-full overflow-hidden bg-secondary/20">
      {/* Slider container */}
      <div className="relative min-h-[350px] sm:min-h-[450px] md:min-h-[550px] lg:min-h-[600px] w-full">
        {slides.map((slide, idx) => {
          const isActive = idx === activeSlide;
          return (
            <div
              key={idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 flex items-center ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Background Image with Darkened Top/Bottom Overlays */}
              <div className="absolute inset-0">
                <Image
                  src={slide.img}
                  alt={slide.subtitle}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={idx === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:from-black/70 md:via-black/30" />
              </div>

              {/* Text content card on left */}
              <div className="relative max-w-[1440px] mx-auto w-full px-4 md:px-12 lg:px-20 text-white z-20">
                <div key={activeSlide} className="max-w-xl rise-in">
                  <span className="inline-block text-xs md:text-sm font-bold tracking-[0.2em] text-primary uppercase bg-primary-foreground/10 backdrop-blur-md px-3 py-1 rounded mb-4">
                    {slide.title}
                  </span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white mb-4">
                    {slide.subtitle}
                  </h1>
                  <p className="text-sm md:text-base text-zinc-200 leading-relaxed mb-8 max-w-lg">
                    {slide.description}
                  </p>
                  <div className="flex flex-wrap gap-4 items-center">
                    <button
                      onClick={slide.btnAction}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-8 rounded-full text-xs md:text-sm font-semibold transition-transform duration-300 hover:scale-[1.03] shadow-md cursor-pointer"
                    >
                      {slide.btnText}
                    </button>
                    <a
                      href="tel:+8801700000000"
                      className="inline-flex items-center gap-2 border border-white/40 hover:border-white hover:bg-white/10 py-3 px-6 rounded-full text-xs md:text-sm font-semibold text-white no-underline transition-all duration-300 cursor-pointer"
                    >
                      <Phone size={14} />
                      <span>কল করুন</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors border-none cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors border-none cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Navigation dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSlide(idx)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 border-none cursor-pointer ${
              idx === activeSlide ? "bg-primary w-6 md:w-8" : "bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Trust Signals Strip */}
      <div className="relative z-20 bg-black/40 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>, label: 'দ্রুত ডেলিভারি', sub: '২-৩ কার্যদিবসে' },
              { icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>, label: 'সহজ রিটার্ন', sub: '৭ দিনের মধ্যে' },
              { icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>, label: 'নিরাপদ পেমেন্ট', sub: '১০০% সুরক্ষিত' },
              { icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>, label: 'অরিজিনাল পণ্য', sub: '১০০% আসল মালামাল' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-white">
                <div className="text-primary flex-shrink-0">{item.icon}</div>
                <div>
                  <div className="text-[11px] font-extrabold leading-tight">{item.label}</div>
                  <div className="text-[9px] text-white/60 font-medium">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
