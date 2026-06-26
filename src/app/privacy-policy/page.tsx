import type { Metadata } from "next";
import PrivacyPolicyClient from "./PrivacyPolicyClient";

export const metadata: Metadata = {
  title: "গোপনীয়তা নীতি (Privacy Policy) — তানহা ফ্যাশন",
  description: "তানহা ফ্যাশন তার সম্মানিত গ্রাহকদের ব্যক্তিগত তথ্যের সর্বোচ্চ নিরাপত্তা বজায় রাখতে প্রতিশ্রুতিবদ্ধ। আমাদের গোপনীয়তা নীতি জেনে নিন।",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
