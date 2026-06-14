import React, { useState, useEffect } from "react";
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
                <img
                  src={slide.img.src}
                  alt={slide.subtitle}
                  className="w-full h-full object-cover"
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
    </section>
  );
}
