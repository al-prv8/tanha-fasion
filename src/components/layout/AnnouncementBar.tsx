"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AnnouncementBarProps {
  scrollToSection: (index: number) => void;
}

interface Announcement {
  id: string;
  text: string;
  buttonText: string | null;
  link: string | null;
  isActive: boolean;
}

export default function AnnouncementBar({ scrollToSection }: AnnouncementBarProps) {
  const router = useRouter();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/announcements/active`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAnnouncement(data[0]); // Display the latest active announcement
        }
      })
      .catch((err) => {
        console.error("Failed to fetch active announcement, using fallback:", err);
      });
  }, []);

  const displayText = announcement ? announcement.text : "🎉 পূজা ও ঈদ সংস্করণ — ২০% ছাড়ের জন্য TANHA20 ব্যবহার করুন!";
  const displayButtonText = announcement ? announcement.buttonText : "সংগ্রহ দেখুন →";
  const displayLink = announcement ? announcement.link : "2";

  const handleButtonClick = () => {
    if (!displayLink) return;
    const sectionIndex = parseInt(displayLink, 10);
    if (!isNaN(sectionIndex)) {
      scrollToSection(sectionIndex);
    } else {
      router.push(displayLink);
    }
  };

  return (
    <div className="bg-accent text-bone text-xs md:text-sm py-2 px-4 text-center font-medium relative z-[101] border-b border-ink/10 flex items-center justify-center gap-1.5 shadow-sm">
      <span>{displayText}</span>
      {displayButtonText && (
        <button 
          onClick={handleButtonClick}
          className="text-bone hover:text-gold underline underline-offset-4 cursor-pointer font-bold transition-colors bg-transparent border-none p-0 inline-flex items-center gap-0.5 ml-1"
        >
          {displayButtonText}
        </button>
      )}
    </div>
  );
}
