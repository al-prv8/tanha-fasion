import type { Metadata } from "next";
import TermsConditionsClient from "./TermsConditionsClient";

export const metadata: Metadata = {
  title: "শর্তাবলী ও নিয়ম (Terms & Conditions) — তানহা ফ্যাশন",
  description: "তানহা ফ্যাশন ওয়েবসাইট ভিজিট এবং কেনাকাটা করার জন্য প্রযোজ্য শর্তাবলী ও ব্যবহারের নিয়মাবলী বিস্তারিত জানুন।",
};

export default function TermsConditionsPage() {
  return <TermsConditionsClient />;
}
