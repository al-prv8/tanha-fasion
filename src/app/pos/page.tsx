import type { Metadata } from "next";
import POSTab from "@/components/admin/POSTab";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "স্মার্ট কাউন্টার পিওএস (Point of Sale) —  তানহা ফ্যাশন",
  description: "তানহা ফ্যাশন শোরুম বিলিং ও পিওএস কাউন্টার সিস্টেম।",
};

export default function POSPage() {
  return (
    <Suspense fallback={
      <div className="grain-bg min-h-screen flex items-center justify-center text-foreground font-semibold">
        লোড হচ্ছে...
      </div>
    }>
      <POSTab />
    </Suspense>
  );
}
