import type { Metadata } from "next";
import RefundPolicyClient from "./RefundPolicyClient";

export const metadata: Metadata = {
  title: "রিটার্ন ও রিফান্ড পলিসি (Return & Refund) — তানহা ফ্যাশন",
  description: "তানহা ফ্যাশন সবসময় কাস্টমারদের সর্বোচ্চ সন্তুষ্টি নিশ্চিত করতে কাজ করে। আমাদের সহজ রিটার্ন ও রিফান্ড পলিসি জেনে নিন।",
};

export default function RefundPolicyPage() {
  return <RefundPolicyClient />;
}
