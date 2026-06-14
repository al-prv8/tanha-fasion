import React from "react";

interface LogoProps {
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function Logo({ className = "flex items-baseline gap-2 no-underline text-foreground", onClick }: LogoProps) {
  return (
    <a href="#" className={className} onClick={onClick}>
      <span className="text-2xl font-bold tracking-tight">তানহা</span>
      <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">ফ্যাশন</span>
    </a>
  );
}
