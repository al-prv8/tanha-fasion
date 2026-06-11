import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
});

export const metadata: Metadata = {
  title: {
    template: "%s | তানহা ফ্যাশন",
    default: "তানহা ফ্যাশন",
  },
  description: "তানহা ফ্যাশন — হস্তনির্মিত জামদানি, সিল্ক ও কটনে গড়া আধুনিক বাঙালি পোশাকের ঠিকানা।",
  authors: [{ name: "Tanha Fashion" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={hindSiliguri.variable}>
      <body className="antialiased">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
