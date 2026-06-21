import type { Metadata } from "next";
import ShowroomClient from "./ShowroomClient";

export const metadata: Metadata = {
  title: "আমাদের শোরুম আউটলেট — তানহা ফ্যাশন",
  description: "তানহা ফ্যাশনের ফিজিক্যাল শোরুম আউটলেট এর ঠিকানা, খোলা-বন্ধের সময়সূচী ও কন্টাক্ট নম্বর। সরাসরি এসে পোশাক পরখ করে সংগ্রহ করুন।",
};

export default function ShowroomPage() {
  return <ShowroomClient />;
}
