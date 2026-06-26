import type { Metadata } from "next";
import ShowroomAdminClient from "./ShowroomAdminClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "শোরুম ও পিওএস কন্ট্রোল প্যানেল (Showroom Panel) —  তানহা ফ্যাশন",
  description: "তানহা ফ্যাশন শোরুম ও পিওএস কন্ট্রোল প্যানেল।",
};

export default function ShowroomAdminPage() {
  return (
    <Suspense fallback={
      <div className="grain-bg min-h-screen flex items-center justify-center text-foreground font-semibold">
        লোড হচ্ছে...
      </div>
    }>
      <ShowroomAdminClient />
    </Suspense>
  );
}
