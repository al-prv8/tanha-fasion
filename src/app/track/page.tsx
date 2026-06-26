import type { Metadata } from "next";
import TrackClient from "./TrackClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "অর্ডার ট্র্যাকিং (Order Tracking) —  তানহা ফ্যাশন",
  description: "আপনার অর্ডারের বর্তমান অবস্থা (শিপমেন্ট, ডেলিভারি ও পেমেন্ট স্ট্যাটাস) সহজে ট্র্যাক করুন।",
};

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="grain-bg min-h-screen flex items-center justify-center text-foreground font-semibold">
        লোড হচ্ছে...
      </div>
    }>
      <TrackClient />
    </Suspense>
  );
}
