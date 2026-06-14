import React from "react";

interface AnnouncementBarProps {
  scrollToSection: (index: number) => void;
}

export default function AnnouncementBar({ scrollToSection }: AnnouncementBarProps) {
  return (
    <div className="bg-accent text-bone text-xs md:text-sm py-2 px-4 text-center font-medium relative z-[101] border-b border-ink/10 flex items-center justify-center gap-1.5 shadow-sm">
      <span>🎉 পূজা ও ঈদ সংস্করণ — ২০% ছাড়ের জন্য <strong>TANHA20</strong> ব্যবহার করুন!</span>
      <button 
        onClick={() => scrollToSection(2)}
        className="text-bone hover:text-gold underline underline-offset-4 cursor-pointer font-bold transition-colors bg-transparent border-none p-0 inline-flex items-center gap-0.5 ml-1"
      >
        সংগ্রহ দেখুন →
      </button>
    </div>
  );
}
