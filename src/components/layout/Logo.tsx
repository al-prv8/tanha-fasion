import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function Logo({ className = "flex items-center gap-2.5 no-underline text-foreground", onClick }: LogoProps) {
  return (
    <a href="#" className={className} onClick={onClick}>
      <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-border/80 bg-white shadow-3xs flex-shrink-0 flex items-center justify-center">
        <Image
          src="/logo/tanha-logo-old.jpeg"
          alt="তানহা ফ্যাশন"
          fill
          priority
          sizes="36px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-sm font-black tracking-tight leading-none text-slate-800 font-display">তানহা ফ্যাশন</span>
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1">অনলাইন শপ</span>
      </div>
    </a>
  );
}
