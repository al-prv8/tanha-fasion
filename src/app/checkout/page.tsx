import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "চেকআউট — তানহা ফ্যাশন",
  description: "তানহা ফ্যাশন থেকে আপনার অর্ডারটি সম্পন্ন করুন।",
};

export default function Page() {
  return <CheckoutClient />;
}
