import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function Logo({ className = "flex items-center no-underline text-foreground", onClick }: LogoProps) {
  return (
    <a href="#" className={className} onClick={onClick}>
      <div className="relative w-28 h-8 md:w-36 md:h-10 flex-shrink-0">
        <Image
          src="/logo/tanha-logo-transparent.png"
          alt="তানহা ফ্যাশন"
          fill
          priority
          sizes="(max-width: 768px) 112px, 144px"
          className="object-contain"
        />
      </div>
    </a>
  );
}
