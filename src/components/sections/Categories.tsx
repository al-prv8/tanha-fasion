import React from "react";
import cotton3pcImg from "@/assets/cotton_1.png";
import georgette3pcImg from "@/assets/georgette_1.png";
import linen3pcImg from "@/assets/linen_1.png";
import casualAbayaImg from "@/assets/casual_abaya_1.png";
import festiveBorkaImg from "@/assets/festive_borka_1.png";
import comboPackImg from "@/assets/combo_1.png";

interface CategoriesProps {
  scrollToSection: (index: number) => void;
}

export default function Categories({ scrollToSection }: CategoriesProps) {
  const categoriesList = [
    { name: "সুতি থ্রি-পিস", img: cotton3pcImg, sectionIndex: 2 },
    { name: "জর্জেট থ্রি-পিস", img: georgette3pcImg, sectionIndex: 3 },
    { name: "লিলেন থ্রি-পিস", img: linen3pcImg, sectionIndex: 4 },
    { name: "ক্যাজুয়াল আবায়া", img: casualAbayaImg, sectionIndex: 5 },
    { name: "উৎসবের বোরকা", img: festiveBorkaImg, sectionIndex: 6 },
    { name: "কম্বো সেট", img: comboPackImg, sectionIndex: 7 },
  ];

  return (
    <section className="max-w-[1440px] mx-auto py-10 px-4 md:px-8 reveal-item" id="categories">
      <div className="text-center mb-8">
        <h3 className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-bold mb-2">বিভাগ সমূহ</h3>
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">টপ ক্যাটাগরি</h2>
        <div className="w-12 h-0.5 bg-primary mx-auto mt-3 rounded-full" />
      </div>

      <div className="flex flex-wrap justify-center gap-6 md:gap-10">
        {categoriesList.map((cat, idx) => (
          <a
            key={idx}
            href={`#category-${cat.sectionIndex}`}
            className="flex flex-col items-center gap-3 group text-foreground no-underline hover:-translate-y-1 transition-transform duration-300"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(cat.sectionIndex);
            }}
          >
            {/* Circular Thumbnail Container */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-all duration-300 shadow-sm flex items-center justify-center bg-secondary">
              <img
                src={cat.img.src}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            {/* Category Name */}
            <span className="text-xs md:text-sm font-semibold group-hover:text-primary transition-colors text-center">
              {cat.name}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
