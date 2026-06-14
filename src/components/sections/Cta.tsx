import React from "react";
import { Phone, Mail, MapPin, Facebook, Youtube, Send, ArrowRight } from "lucide-react";
import Logo from "../layout/Logo";

interface CtaProps {
  scrollToSection: (index: number) => void;
}

export default function Cta({ scrollToSection }: CtaProps) {
  return (
    <>
      {/* LIGHT PREMIUM NEWSLETTER SECTION (White Background) */}
      <section className="relative w-full bg-white py-16 md:py-24 px-4 md:px-8 border-t border-border/60 overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[6fr_5fr] gap-10 items-center">
          
          {/* Centered on mobile, Left-aligned on desktop */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
            <span className="text-primary text-[10px] uppercase font-bold tracking-[0.3em] block">
              JOIN THE CONNOISSEURS CLUB
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-[1.2] font-display">
              নতুন কালেকশন ও স্পেশাল <br />
              অফারের খোঁজ পান সবার আগে
            </h3>
            <p className="text-muted-foreground text-xs md:text-sm max-w-lg leading-relaxed mx-auto lg:mx-0">
              তানহা ফ্যাশনের প্রিমিয়াম থ্রি-পিস ও উৎসবের দুবাই চেরি বোরকা লঞ্চের নোটিফিকেশন, এক্সক্লুসিভ ডিসকাউন্ট ও গিফট ভাউচার সরাসরি আপনার ইনবক্সে পেতে আজই সাবস্ক্রাইব করুন।
            </p>
          </div>

          <div className="w-full">
            <form 
              onSubmit={(e) => e.preventDefault()} 
              className="bg-zinc-50 border border-border/80 p-5 md:p-8 rounded-2xl shadow-sm space-y-4 w-full"
            >
              <div className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block text-center lg:text-left">
                ইমেল সাবস্ক্রিপশন
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <input
                    type="email"
                    required
                    placeholder="আপনার ইমেল এড্রেস"
                    className="w-full bg-background border border-border py-3 px-4 pr-12 rounded-xl text-xs outline-none text-foreground placeholder-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                </div>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white py-3 px-6 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95 border-none"
                >
                  <span>যুক্ত হোন</span>
                  <Send size={10} />
                </button>
              </div>
              <p className="text-[9px] text-muted-foreground/75 text-center lg:text-left mt-1">
                * আমরা কোনো স্প্যাম মেইল পাঠাবো না এবং যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন।
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* LIGHT E-COMMERCE PREMIUM FOOTER (Distinct Soft-Gray Background) */}
      <footer className="bg-zinc-50 text-muted-foreground pt-12 pb-8 border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-[4fr_2.5fr_2.5fr_3fr] gap-x-8 gap-y-10 mb-12">
          
          {/* Logo & Corporate profile - Left-aligned */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1 flex flex-col items-start text-left space-y-5">
            <Logo className="flex items-baseline gap-2 no-underline text-foreground scale-105 origin-left" />
            <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-sm">
              তানহা ফ্যাশন — বাংলার মার্জিত ও ঐতিহ্যবাহী নারীদের নান্দনিক সাজের এক বিশ্বস্ত গন্তব্য। প্রিমিয়াম কোয়ালিটির থ্রি-পিস ও রয়্যাল ডিজাইনার বোরকা-আবায়ার আধুনিক রূপ নিয়ে আমাদের নিরলস যাত্রা।
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-border hover:border-primary hover:bg-primary/5 flex items-center justify-center text-muted-foreground hover:text-primary transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook size={15} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-border hover:border-primary hover:bg-primary/5 flex items-center justify-center text-muted-foreground hover:text-primary transition-all duration-300"
                aria-label="YouTube"
              >
                <Youtube size={15} />
              </a>
            </div>
          </div>

          {/* Quick links: Categories - 1 column on Mobile, Left-aligned */}
          <div className="col-span-1 flex flex-col items-start text-left space-y-4">
            <h4 className="text-foreground text-xs uppercase tracking-[0.2em] font-bold relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-6 after:h-0.5 after:bg-primary">
              পোশাক ক্যাটাগরি
            </h4>
            <ul className="list-none p-0 m-0 space-y-2.5 flex flex-col items-start">
              {[
                { name: "সুতি থ্রি-পিস", target: 2 },
                { name: "জর্জেট থ্রি-পিস", target: 3 },
                { name: "লিলেন থ্রি-পিস", target: 4 },
                { name: "ক্যাজুয়াল আবায়া", target: 5 },
                { name: "উৎসবের বোরকা", target: 6 },
                { name: "বিশেষ কম্বো সেট", target: 7 }
              ].map((cat) => (
                <li key={cat.name}>
                  <a
                    href={`#category-${cat.target}`}
                    className="text-muted-foreground hover:text-primary text-xs md:text-sm no-underline transition-all duration-200 flex items-center gap-1.5 group"
                    onClick={(e) => { e.preventDefault(); scrollToSection(cat.target); }}
                  >
                    <ArrowRight size={10} className="hidden lg:inline-block opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 group-hover:text-primary transition-all duration-200" />
                    <span>{cat.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links: Company services - 1 column on Mobile, Left-aligned */}
          <div className="col-span-1 flex flex-col items-start text-left space-y-4">
            <h4 className="text-foreground text-xs uppercase tracking-[0.2em] font-bold relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-6 after:h-0.5 after:bg-primary">
              গ্রাহক সেবা
            </h4>
            <ul className="list-none p-0 m-0 space-y-2.5 flex flex-col items-start">
              {[
                { name: "আমাদের সম্পর্কে", target: 8, isScroll: true },
                { name: "যোগাযোগ করুন", target: 8, isScroll: true },
                { name: "গোপনীয়তা নীতি", target: 0, isScroll: false },
                { name: "শর্তাবলী ও নিয়ম", target: 0, isScroll: false },
                { name: "রিটার্ন ও রিফান্ড পলিসি", target: 0, isScroll: false }
              ].map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.isScroll ? "#contact" : "#"} 
                    className="text-muted-foreground hover:text-primary text-xs md:text-sm no-underline transition-all duration-200 flex items-center gap-1.5 group"
                    onClick={(e) => { 
                      if (link.isScroll) {
                        e.preventDefault(); 
                        scrollToSection(link.target); 
                      }
                    }}
                  >
                    <ArrowRight size={10} className="hidden lg:inline-block opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 group-hover:text-primary transition-all duration-200" />
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details & Showroom - Full Width on Mobile, Left-aligned */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1 flex flex-col items-start text-left space-y-5 w-full">
            <h4 className="text-foreground text-xs uppercase tracking-[0.2em] font-bold relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-6 after:h-0.5 after:bg-primary">
              যোগাযোগ ও আউটলেট
            </h4>
            <ul className="list-none p-0 m-0 space-y-4 flex flex-col items-start w-full">
              
              <li className="flex flex-row items-start gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-primary flex-shrink-0 mt-0.5 border border-border/40">
                  <Phone size={14} />
                </div>
                <div className="flex flex-col">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">২৪/৭ কাস্টমার কেয়ার</div>
                  <a href="tel:+8801700000000" className="text-foreground hover:text-primary text-sm font-extrabold transition-colors no-underline block mt-0.5">
                    +৮৮০ ১৭০০ ০০০০০০
                  </a>
                  <div className="text-[9px] text-muted-foreground mt-0.5">প্রতিদিন (সকাল ১০:০০ - রাত ০৮:০০)</div>
                </div>
              </li>

              <li className="flex flex-row items-start gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-primary flex-shrink-0 mt-0.5 border border-border/40">
                  <Mail size={14} />
                </div>
                <div className="flex flex-col">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">অফিসিয়াল ইমেইল</div>
                  <a href="mailto:info@tanhafashion.com" className="text-foreground hover:text-primary text-xs transition-colors no-underline block mt-1">
                    info@tanhafashion.com
                  </a>
                </div>
              </li>

              <li className="flex flex-row items-start gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-primary flex-shrink-0 mt-0.5 border border-border/40">
                  <MapPin size={14} />
                </div>
                <div className="flex flex-col">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">ফ্ল্যাগশিপ শোরুম</div>
                  <p className="text-muted-foreground/80 text-xs leading-relaxed mt-1 mb-0 max-w-[280px] xs:max-w-md sm:max-w-none">
                    লেভেল ৪, ব্লক সি, শপ নং ৪৫, বসুন্ধরা সিটি শপিং কমপ্লেক্স, পান্থপথ, ঢাকা-১২১৫।
                  </p>
                </div>
              </li>

            </ul>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT ROW */}
        <div className="border-t border-border/40 pt-8 mt-8">
          <div className="max-w-[1440px] mx-auto px-4 md:px-12 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground text-center sm:text-left">
            <div>© ২০২৬ তানহা ফ্যাশন। সর্বস্বত্ব সংরক্ষিত।</div>
            <div className="flex gap-1.5 items-center text-[10px] uppercase font-bold tracking-wider text-muted-foreground/45">
              <span>Made with premium quality fabrics</span>
              <span className="text-primary">✦</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
