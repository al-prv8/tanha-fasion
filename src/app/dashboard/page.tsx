import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "গ্রাহক প্রোফাইল ড্যাশবোর্ড —  তানহা ফ্যাশন",
  description: "তানহা ফ্যাশনে আপনার পূর্ববর্তী কেনাকাটা, পেমেন্ট ট্র্যাকিং ও ডেলিভারি তথ্য পরিচালনা করুন।",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
