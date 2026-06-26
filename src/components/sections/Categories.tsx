import React from "react";
import Image from "next/image";

interface CategoryItem {
  id: string;
  name: string;
  englishName?: string | null;
  imgUrl?: string | null;
  bannerUrl?: string | null;
}

interface CategoriesProps {
  scrollToSection: (index: number) => void;
  categories: CategoryItem[];
}

const getCategoryDefaultImage = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("সুতি") || n.includes("cotton")) return "/assets/cotton_1.png";
  if (n.includes("জর্জেট") || n.includes("georgette")) return "/assets/georgette_1.png";
  if (n.includes("লিলেন") || n.includes("linen")) return "/assets/linen_1.png";
  if (n.includes("আবায়া") || n.includes("abaya")) return "/assets/casual_abaya_1.png";
  if (n.includes("বোরকা") || n.includes("borka")) return "/assets/festive_borka_1.png";
  if (n.includes("কম্বো") || n.includes("combo")) return "/assets/combo_1.png";
  return "/assets/cotton_1.png";
};

export default function Categories({ scrollToSection, categories }: CategoriesProps) {
  return (
    <section className="max-w-[1440px] mx-auto py-10 px-4 md:px-8 reveal-item" id="categories">
      <div className="text-center mb-8">
        <h3 className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-bold mb-2">বিভাগ সমূহ</h3>
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight font-display">টপ ক্যাটাগরি</h2>
        <div className="w-12 h-0.5 bg-primary mx-auto mt-3 rounded-full" />
      </div>

      <div className="flex flex-wrap justify-center gap-6 md:gap-10">
        {categories.map((cat, idx) => {
          const sectionIndex = idx + 2;
          const imgSrc = cat.imgUrl || getCategoryDefaultImage(cat.name);
          return (
            <a
              key={cat.id || idx}
              href={`#category-${sectionIndex}`}
              className="flex flex-col items-center gap-3 group text-foreground no-underline hover:-translate-y-1 transition-transform duration-300"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(sectionIndex);
              }}
            >
              {/* Circular Thumbnail Container */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-all duration-300 shadow-sm flex items-center justify-center bg-secondary">
                <Image
                  src={imgSrc}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              {/* Category Name */}
              <span className="text-xs md:text-sm font-semibold group-hover:text-primary transition-colors text-center">
                {cat.name}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
