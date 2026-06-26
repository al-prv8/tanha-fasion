import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "তানহা ফ্যাশন — প্রিমিয়াম ঐতিহ্যবাহী ও আধুনিক বাঙালি পোশাকের বিশ্বস্ত অনলাইন শপ",
  description: "তানহা ফ্যাশন — প্রিমিয়াম জামদানি, সিল্ক, সুতি থ্রি-পিস, আবায়া ও উৎসবের বোরকা সহ আধুনিক ও ঐতিহ্যবাহী বাঙালি পোশাকের বিশ্বস্ত অনলাইন ফ্যাশন শপ। দেশজুড়ে ক্যাশ অন ডেলিভারি।",
};

export default function Page() {
  return (
    <Suspense fallback={
      <div className="grain-bg min-h-screen flex items-center justify-center text-foreground font-semibold">
        লোড হচ্ছে...
      </div>
    }>
      <HomeClient />
    </Suspense>
  );
}

