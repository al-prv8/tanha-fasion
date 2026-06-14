import React from "react";

export default function Story() {
  return (
    <section id="story" className="max-w-[1100px] mx-auto py-16 px-4 md:py-28 md:px-12 text-center reveal-item">
      <div className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">আমাদের দর্শন</div>
      <blockquote className="mt-8 text-xl md:text-3xl lg:text-4xl font-medium leading-snug tracking-tight text-balance">
        "ফ্যাশন মানে শুধু পোশাক নয় — এ এক <span className="text-primary font-bold">পরিচয়</span>। যে পরিচয় আমরা বহন করি মায়ের শাড়ির ভাঁজে, বাবার পাঞ্জাবির বোতামে, দাদীর আঁচলের সুবাসে।"
      </blockquote>
      <div className="mt-10 inline-flex items-center gap-4 text-sm font-semibold text-muted-foreground">
        <span className="w-12 h-[1px] bg-ink/30" />
        তানহা রহমান, প্রতিষ্ঠাতা
        <span className="w-12 h-[1px] bg-ink/30" />
      </div>
    </section>
  );
}
