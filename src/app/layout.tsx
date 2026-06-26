import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: {
    template: "%s | তানহা ফ্যাশন",
    default: "তানহা ফ্যাশন",
  },
  description: "তানহা ফ্যাশন — প্রিমিয়াম ট্র্যাডিশনাল ও আধুনিক বাঙালি পোশাকের বিশ্বস্ত অনলাইন শপ।",
  authors: [{ name: "Tanha Fashion" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

