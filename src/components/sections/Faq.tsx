import React, { useState, useEffect } from "react";
import { ChevronDown, MessageSquare } from "lucide-react";

interface FaqProps {
  openFaq: number | null;
  setOpenFaq: (index: number | null) => void;
  scrollToSection: (index: number) => void;
}

export default function Faq({ openFaq, setOpenFaq, scrollToSection }: FaqProps) {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/faqs`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFaqs(data);
        }
      })
      .catch((err) => console.error("Failed to fetch FAQs:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="w-full bg-zinc-50/50 py-16 md:py-28 border-t border-border/40" id="faq">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-20">
        
        {/* Left Side Info - Centered on Mobile, Left-aligned on Desktop */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-[0.2em]">
            <MessageSquare size={12} />
            <span>সচরাচর জিজ্ঞাসিত প্রশ্নাবলী</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-[1.2] font-display">
            সাধারণ কিছু প্রশ্ন <br />
            ও তার <span className="text-primary relative inline-block">সহজ উত্তর<span className="absolute bottom-1 left-0 w-full h-1 bg-primary/20 rounded-full" /></span>
          </h2>
          <p className="text-muted-foreground text-xs md:text-sm max-w-sm leading-relaxed">
            তানহা ফ্যাশন থেকে কেনাকাটার নিয়ম, ডেলিভারি ও রিটার্ন পলিসি সম্পর্কে বিস্তারিত জানুন। আপনার যদি অন্য কোনো প্রশ্ন থাকে, আমাদের হেল্পলাইনে সরাসরি যোগাযোগ করতে পারেন।
          </p>
          <div className="pt-2">
            <a 
              href="#contact" 
              className="inline-flex items-center justify-center bg-foreground hover:bg-primary text-background hover:text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer no-underline border-none"
              onClick={(e) => { e.preventDefault(); scrollToSection(8); }}
            >
              সরাসরি যোগাযোগ করুন →
            </a>
          </div>
        </div>

        {/* Right Side Accordions */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-xs text-muted-foreground font-semibold">এফএকিউ লোড হচ্ছে...</div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-zinc-50/50 text-xs text-muted-foreground">
              কোনো প্রশ্ন পাওয়া যায়নি।
            </div>
          ) : (
            faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={faq.id || idx} 
                  className={`group border rounded-xl overflow-hidden transition-all duration-300 ${
                    isOpen 
                      ? "bg-background border-primary/30 shadow-sm" 
                      : "bg-background border-border/60 hover:border-foreground/20"
                  }`}
                >
                  <button 
                    className="flex justify-between items-center w-full px-5 py-4 bg-transparent border-none cursor-pointer text-left transition-colors" 
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                  >
                    <span className={`text-xs md:text-sm font-bold transition-colors duration-200 pr-4 ${isOpen ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                      {faq.question}
                    </span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? "bg-primary text-primary-foreground rotate-180" : "bg-secondary text-muted-foreground group-hover:bg-foreground/5 group-hover:text-foreground"}`}>
                      <ChevronDown size={14} />
                    </div>
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[300px] border-t border-border/40" : "max-h-0"
                    }`}
                  >
                    <div className="p-5 text-muted-foreground text-xs leading-relaxed bg-zinc-50/30 whitespace-pre-line">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
