import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "যোগাযোগ করুন — তানহা ফ্যাশন",
  description: "তানহা ফ্যাশনের সাথে যেকোনো প্রয়োজনে সরাসরি যোগাযোগ করুন। আমাদের হেল্পলাইন নম্বর, ইমেইল এড্রেস এবং শোরুমের ঠিকানা এখানে পাবেন। অথবা একটি মেসেজ পাঠান।",
};

export default function ContactPage() {
  return <ContactClient />;
}
