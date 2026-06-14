import React from "react";

export default function Testimonials() {
  const reviews = [
    {
      initial: "ফ",
      name: "ফারিয়া আহমেদ",
      loc: "ঢাকা",
      quote: "তানহার শাড়ি পরে যখন বিয়ের অনুষ্ঠানে গিয়েছিলাম, সবাই বলেছিল — এ যেন নকশায় বোনা স্বপ্ন।",
    },
    {
      initial: "ত",
      name: "তানভীর রহমান",
      loc: "চট্টগ্রাম",
      quote: "মা'র জন্য কিনেছিলাম জামদানি — কাপড়ের মান আর কারুকাজ দেখে মা বললেন এ যেন তার তরুণ বয়সের শাড়ি।",
    },
    {
      initial: "ন",
      name: "নসরাত জাহান",
      loc: "সিলেট",
      quote: "প্রতিটি সেলাই, প্রতিটি ভাঁজ — সব কিছুতেই যত্নের ছাপ। বাংলার ঐতিহ্যকে এত সুন্দরভাবে কেউ ধরে রাখেনি।",
    },
  ];

  return (
    <section className="max-w-[1440px] mx-auto py-16 px-4 md:py-20 md:px-12 reveal-item" id="testimonials">
      <div className="mb-10 md:mb-12 max-w-lg">
        <div className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground mb-3">ক্রেতাদের কথা</div>
        <h2 className="text-3xl md:text-5xl font-bold leading-none tracking-tight">
          যাঁরা পরেছেন — <br />
          <span className="text-primary font-bold">তাঁরা বলেছেন</span>।
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((test, idx) => (
          <figure key={idx} className="border border-ink/10 rounded-sm p-6 md:p-8 bg-card flex flex-col justify-between transition-colors duration-300 hover:border-ink/30">
            <div className="text-4xl md:text-5xl font-bold text-primary leading-none">"</div>
            <blockquote className="mt-4 flex-1 text-sm md:text-base leading-relaxed text-foreground/90">{test.quote}</blockquote>
            <figcaption className="mt-8 flex items-center gap-3 border-t border-ink/10 pt-5">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{test.initial}</div>
              <div>
                <div className="text-sm font-semibold">{test.name}</div>
                <div className="text-xs text-muted-foreground">{test.loc}</div>
              </div>
              <div className="ml-auto text-xs text-primary">★★★★★</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
