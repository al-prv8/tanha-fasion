import React from "react";

export default function Marquee() {
  return (
    <div className="border-t border-b border-ink/10 bg-foreground text-background overflow-hidden">
      <div className="marquee-track py-3 md:py-4 text-lg md:text-xl font-medium tracking-wide">
        <div className="inline-flex">
          {Array.from({ length: 4 }).map((_, loopIdx) => (
            <span key={loopIdx} className="inline-flex">
              {["জামদানি", "মসলিন", "তসর সিল্ক", "খাদি", "তাঁতের শাড়ি", "পাঞ্জাবি", "কুর্তা"].map((w, wordIdx) => (
                <span key={`${loopIdx}-${wordIdx}`} className="inline-flex items-center gap-10 mx-10">
                  {w} <span className="opacity-40">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
