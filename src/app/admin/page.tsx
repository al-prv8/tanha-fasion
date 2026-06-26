import type { Metadata } from "next";
import AdminClient from "./AdminClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "অনলাইন স্টোর কন্ট্রোল প্যানেল (Admin Panel) —  তানহা ফ্যাশন",
  description: "তানহা ফ্যাশন অনলাইন স্টোর কন্ট্রোল প্যানেল।",
};

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="grain-bg min-h-screen flex items-center justify-center text-foreground font-semibold">
        লোড হচ্ছে...
      </div>
    }>
      <AdminClient />
    </Suspense>
  );
}
