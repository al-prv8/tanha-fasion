import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "তানহা ফ্যাশন — V1 Editorial Magazine",
  description: "তানহা ফ্যাশন — হস্তনির্মিত জামদানি, সিল্ক ও কটনে গড়া আধুনিক বাঙালি পোশাকের ঠিকানা।",
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

