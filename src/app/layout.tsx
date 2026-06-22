import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: {
    template: "%s | তানহা ফ্যাশন",
    default: "তানহা ফ্যাশন",
  },
  description: "তানহা ফ্যাশন — হস্তনির্মিত জামদানি, সিল্ক ও কটনে গড়া বাঙালি সাজের বিশ্বস্ত ঠিকানা।",
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

