import type { Metadata } from "next";
import LoginClient from "./LoginClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "লগইন ও রেজিস্ট্রেশন —  তানহা ফ্যাশন",
  description: "তানহা ফ্যাশন গ্রাহক পোর্টালে লগইন করুন অথবা নতুন অ্যাকাউন্ট তৈরি করুন।",
};

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="grain-bg min-h-screen flex items-center justify-center text-foreground font-semibold">
        লোড হচ্ছে...
      </div>
    }>
      <LoginClient />
    </Suspense>
  );
}
