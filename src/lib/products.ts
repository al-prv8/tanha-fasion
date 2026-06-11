import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";

export interface Product {
  id: string; // Display ID (e.g. "০১")
  numericId: number;
  name: string;
  img: any;
  price: number;
  priceDisplay: string;
  tag: string;
  loc: string;
  title: string;
  desc: string;
  sizes: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: "০১",
    numericId: 1,
    name: "জামদানি কথা",
    img: product1,
    price: 8400,
    priceDisplay: "৳ ৮,৪০০",
    tag: "নতুন",
    loc: "রূপগঞ্জের তাঁতশালা",
    title: "জামদানি কথা — নির্বাচিত শাড়ি",
    desc: "খাঁটি সুতোয় বোনা এই ঐতিহ্যবাহী জামদানি শাড়িটিতে রয়েছে সূক্ষ্ম ফুল ও লতার কাজ। এটি তৈরিতে দুই তাঁতি শিল্পীর সময় লেগেছে ৪ দিন।",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "০২",
    numericId: 2,
    name: "রক্তিম সন্ধ্যা",
    img: product2,
    price: 12900,
    priceDisplay: "৳ ১২,৯০০",
    tag: "সীমিত",
    loc: "পাথরাইল, টাঙ্গাইল",
    title: "রক্তিম সন্ধ্যা — নির্বাচিত শাড়ি",
    desc: "উজ্জ্বল লাল তসর সিল্কের উপর সোনালী জরি সুতো দিয়ে নিখুঁত নকশা করা। যেকোনো জমকালো ও মাঙ্গলিক অনুষ্ঠানের জন্য একটি অনুপম পোশাক।",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "০৩",
    numericId: 3,
    name: "মেঘলা পাঞ্জাবি",
    img: product3,
    price: 4600,
    priceDisplay: "৳ ৪,৬০০",
    tag: "ক্লাসিক",
    loc: "সিরাজগঞ্জের বুননশালা",
    title: "মেঘলা পাঞ্জাবি — প্রিমিয়াম উইভিং",
    desc: "প্রিমিয়াম জ্যাকার্ড সুতির তৈরি রাজকীয় ডিজাইনের পাঞ্জাবি। অত্যন্ত আরামদায়ক ও আভিজাত্যপূর্ণ পোশাক।",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "০৪",
    numericId: 4,
    name: "নীল কদম কুর্তা",
    img: product4,
    price: 3800,
    priceDisplay: "৳ ৩,৮০০",
    tag: "নতুন",
    loc: "কুমিল্লা খাদি ঘর",
    title: "নীল কদম কুর্তা — ঐতিহ্য খাদি",
    desc: "খাদি কাপড়ে তৈরি নকশাদার নীল কুর্তা। গরমে আরামদায়ক ও দৈনন্দিন ব্যবহারের জন্য এটি দারুণ উপযোগী।",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "০৫",
    numericId: 5,
    name: "বসন্ত উৎসব সালোয়ার",
    img: product5,
    price: 6500,
    priceDisplay: "৳ ৬,৫০০",
    tag: "নতুন",
    loc: "রূপগঞ্জ, ঢাকা",
    title: "বসন্ত উৎসব সালোয়ার — হস্তশিল্প",
    desc: "বসন্তের উৎসবমুখর আবহে তৈরি সূক্ষ্ম এমব্রয়ডারি ও চমৎকার সালোয়ার কামিজ সেট। এটি অত্যন্ত মানানসই ও আরামদায়ক।",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "০৬",
    numericId: 6,
    name: "সোনালী জরি শাল",
    img: product6,
    price: 5200,
    priceDisplay: "৳ ৫,২০০",
    tag: "নতুন",
    loc: "টাঙ্গাইলের তাঁতঘর",
    title: "সোনালী জরি শাল — হেরিটেজ চাদর",
    desc: "টাঙ্গাইলের ঐতিহ্যবাহী তাঁতে বোনা উজ্জ্বল পান্না সবুজ সিল্কের উপর সূক্ষ্ম সোনালী জরি সুতোর কারুকাজ করা শাল। এটি শীতে দারুণ মানানসই ও জমকালো।",
    sizes: ["S", "M", "L", "XL"],
  },
];

export function getProductById(id: string | number): Product | undefined {
  return PRODUCTS.find(
    (p) => p.id === id.toString() || p.numericId === Number(id)
  );
}

// Helper to convert number to Bangla numerals
export function toBanglaNumber(n: number): string {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return n
    .toString()
    .split("")
    .map((char) => (isNaN(Number(char)) ? char : banglaDigits[Number(char)]))
    .join("");
}

// Helper to format currency in Bangla format (e.g. ৳ ৮,৪০০)
export function formatBanglaPrice(price: number): string {
  const formattedPriceStr = price.toLocaleString("en-US"); // Formats with commas like 8,400
  return `৳ ${toBanglaNumber(Number(formattedPriceStr.replace(/,/g, "")))}`;
}

// Convert English numbers to Bangla representation with commas preserved
export function formatBanglaPriceWithCommas(price: number): string {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const formatted = price.toLocaleString("en-US"); // e.g. "8,400"
  return "৳ " + formatted.split("").map(char => {
    if (char === ",") return ",";
    return banglaDigits[Number(char)] || char;
  }).join("");
}
