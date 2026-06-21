import type { Metadata } from "next";
import CategoriesClient from "./CategoriesClient";

export const metadata: Metadata = {
  title: "পোশাকের ক্যাটাগরি ও কালেকশন — তানহা ফ্যাশন",
  description: "তানহা ফ্যাশনের প্রিমিয়াম পোশাক সম্ভার। ক্যাটাগরি অনুযায়ী বেছে নিন আপনার পছন্দের সুতি থ্রি-পিস, জর্জেট, লিলেন, আবায়া ও বোরকা কম্বো প্যাক।",
};

export default function CategoriesPage() {
  return <CategoriesClient />;
}
