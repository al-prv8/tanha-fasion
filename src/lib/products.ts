import cotton1 from "@/assets/cotton_1.png";
import cotton2 from "@/assets/cotton_2.png";
import cotton3 from "@/assets/cotton_3.png";
import cotton4 from "@/assets/cotton_4.png";

import georgette1 from "@/assets/georgette_1.png";
import georgette2 from "@/assets/georgette_2.png";
import georgette3 from "@/assets/georgette_3.png";
import georgette4 from "@/assets/georgette_4.png";

import linen1 from "@/assets/linen_1.png";
import linen2 from "@/assets/linen_2.png";
import linen3 from "@/assets/linen_3.png";
import linen4 from "@/assets/linen_4.png";

import casualAbaya1 from "@/assets/casual_abaya_1.png";
import casualAbaya2 from "@/assets/casual_abaya_2.png";
import casualAbaya3 from "@/assets/casual_abaya_3.png";
import casualAbaya4 from "@/assets/casual_abaya_4.png";

import festiveBorka1 from "@/assets/festive_borka_1.png";
import festiveBorka2 from "@/assets/festive_borka_2.png";
import festiveBorka3 from "@/assets/festive_borka_3.png";
import festiveBorka4 from "@/assets/festive_borka_4.png";

import combo1 from "@/assets/combo_1.png";
import combo2 from "@/assets/combo_2.png";
import combo3 from "@/assets/combo_3.png";
import combo4 from "@/assets/combo_4.png";

export interface Product {
  id: string; // Display ID (e.g. "০১")
  numericId: number;
  name: string;
  img: any;
  price: number;
  priceDisplay: string;
  tag: string;
  loc: string; // Used for Category / Collection details
  title: string;
  desc: string;
  sizes: string[];
  sizesJson?: string;
  sizePricesJson?: string;
  originalPrice?: number | null;
}

export const PRODUCTS: Product[] = [
  // --- Category 1: সুতি থ্রি-পিস (Cotton 3-Piece) ---
  {
    id: "০১",
    numericId: 1,
    name: "হ্যান্ডলুম পিওর কটন থ্রি-পিস",
    img: cotton1,
    price: 1450,
    priceDisplay: "৳ ১,৪৫০",
    tag: "নতুন",
    loc: "সুতি থ্রি-পিস",
    title: "হ্যান্ডলুম পিওর কটন থ্রি-পিস — আধুনিক ফ্যাশন",
    desc: "১০০% প্রিমিয়াম সুতি কাপড়ে তৈরি অত্যন্ত আরামদায়ক ও নিখুঁত সুতার কাজ করা থ্রি-পিস। গরমে আরামদায়ক ও দৈনন্দিন ব্যবহারের জন্য দারুণ উপযোগী।",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "০২",
    numericId: 2,
    name: "ক্ল্যাসিক ব্লক প্রিন্ট সুতি থ্রি-পিস",
    img: cotton2,
    price: 1650,
    priceDisplay: "৳ ১,৬৫০",
    tag: "জনপ্রিয়",
    loc: "সুতি থ্রি-পিস",
    title: "ক্ল্যাসিক ব্লক প্রিন্ট সুতি থ্রি-পিস — ঐতিহ্যবাহী লুক",
    desc: "চমৎকার ডিজাইনের ব্লক প্রিন্ট সমৃদ্ধ এবং আকর্ষণীয় ওড়না সহ স্টাইলিশ সুতি থ্রি-পিস। উৎসব ও ঘরোয়া যেকোনো অনুষ্ঠানে মানানসই।",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "০৩",
    numericId: 3,
    name: "নিপুণ কলার এমব্রয়ডারি সুতি থ্রি-পিস",
    img: cotton3,
    price: 1850,
    priceDisplay: "৳ ১,৮৫০",
    tag: "সীমিত স্টক",
    loc: "সুতি থ্রি-পিস",
    title: "কলার এমব্রয়ডারি সুতি থ্রি-পিস — এক্সক্লুসিভ কালেকশন",
    desc: "গলার অংশে চমৎকার নিখুঁত এমব্রয়ডারি কারুকাজ করা হাই-কোয়ালিটি কটন কাপড়ের থ্রি-পিস।",
    sizes: ["M", "L", "XL"],
  },
  {
    id: "০৪",
    numericId: 4,
    name: "এক্সক্লুসিভ জয়পুরি সুতি থ্রি-পিস",
    img: cotton4,
    price: 1550,
    priceDisplay: "৳ ১,৫৫০",
    tag: "নতুন",
    loc: "সুতি থ্রি-পিস",
    title: "জয়পুরি সুতি থ্রি-পিস — আকর্ষণীয় কালেকশন",
    desc: "মনোরম জয়পুরি ডিজাইনের কটন থ্রি-পিস। কাপড় অত্যন্ত সফট ও কালার গ্যারান্টি সহ সম্পূর্ণ আরামদায়ক।",
    sizes: ["S", "M", "L", "XL"],
  },

  // --- Category 2: জর্জেট থ্রি-পিস (Georgette 3-Piece) ---
  {
    id: "০৫",
    numericId: 5,
    name: "গর্জিয়াস জরি ওয়ার্ক জর্জেট থ্রি-পিস",
    img: georgette1,
    price: 2450,
    priceDisplay: "৳ ২,৪৫০",
    tag: "উৎসব স্পেশাল",
    loc: "জর্জেট থ্রি-পিস",
    title: "জরি ওয়ার্ক জর্জেট থ্রি-পিস — গর্জিয়াস পার্টি লুক",
    desc: "প্রিমিয়াম জর্জেট কাপড়ে আকর্ষণীয় জরি সুতার এমব্রয়ডারি ও মিরর বর্ডার কাজ করা ওড়না সহ জমকালো থ্রি-পিস সেট।",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "০৬",
    numericId: 6,
    name: "ডিজিটাল প্রিন্ট সিকোয়েন্স জর্জেট থ্রি-পিস",
    img: georgette2,
    price: 2850,
    priceDisplay: "৳ ২,৮৫০",
    tag: "নতুন",
    loc: "জর্জেট থ্রি-পিস",
    title: "ডিজিটাল প্রিন্ট জর্জেট থ্রি-পিস — মডার্ন প্যাটার্ন",
    desc: "এক্সক্লুসিভ ডিজিটাল প্রিন্টের সাথে হালকা সিকোয়েন্স কাজ করা চমৎকার ডিজাইনের লাক্সারি জর্জেট সালোয়ার কামিজ।",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "০৭",
    numericId: 7,
    name: "পার্টি ওয়ার্ক এমব্রয়ডারি জর্জেট থ্রি-পিস",
    img: georgette3,
    price: 3200,
    priceDisplay: "৳ ৩,২০০",
    tag: "জনপ্রিয়",
    loc: "জর্জেট থ্রি-পিস",
    title: "এমব্রয়ডারি জর্জেট থ্রি-পিস — রয়েল ফ্যাশন",
    desc: "উৎসবের আমেজে নিজেকে সাজাতে জমকালো এমব্রয়ডারি করা মাল্টি-কালার লাক্সারি জর্জেট থ্রি-পিস কালেকশন।",
    sizes: ["M", "L", "XL"],
  },
  {
    id: "০৮",
    numericId: 8,
    name: "লাক্সারি শিফন জর্জেট থ্রি-পিস সেট",
    img: georgette4,
    price: 2650,
    priceDisplay: "৳ ২,৬৫০",
    tag: "নতুন",
    loc: "জর্জেট থ্রি-পিস",
    title: "শিফন জর্জেট থ্রি-পিস — নিখুঁত আভিজাত্য",
    desc: "আরামদায়ক সফট শিফন জর্জেট ম্যাটেরিয়ালে তৈরি ক্লাসি ডিজাইনের উৎসব ও বিকেলের ভ্রমণের পোশাক।",
    sizes: ["S", "M", "L", "XL"],
  },

  // --- Category 3: লিলেন থ্রি-পিস (Linen 3-Piece) ---
  {
    id: "০৯",
    numericId: 9,
    name: "ডিজাইনার এম্বোশড লিলেন থ্রি-পিস",
    img: linen1,
    price: 1850,
    priceDisplay: "৳ ১,৮৫০",
    tag: "নতুন",
    loc: "লিলেন থ্রি-পিস",
    title: "এম্বোশড লিলেন থ্রি-পিস — ক্যাজুয়াল লাক্সারি",
    desc: "ডিজাইনার রেয়ন লিলেন মিক্সড ফ্যাব্রিকে তৈরি অত্যন্ত এলিগ্যান্ট এমব্রয়ডারি সহ স্টাইলিশ পোশাক সম্ভার।",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "১০",
    numericId: 10,
    name: "ক্যাজুয়াল রেগুলার লিলেন থ্রি-পিস",
    img: linen2,
    price: 1750,
    priceDisplay: "৳ ১,৭৫০",
    tag: "জনপ্রিয়",
    loc: "লিলেন থ্রি-পিস",
    title: "ক্যাজুয়াল লিলেন থ্রি-পিস — এলিগ্যান্ট লুক",
    desc: "অত্যন্ত ফ্লেক্সিবল ও প্রি-ওয়াশড লিলেন কাপড়ে তৈরি দৈনন্দিন অফিসে ও ক্লাসে পরার জন্য মার্জিত থ্রি-পিস।",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "১১",
    numericId: 11,
    name: "সেমি-ফরমাল রেয়ন লিলেন থ্রি-পিস",
    img: linen3,
    price: 1950,
    priceDisplay: "৳ ১,৯৫০",
    tag: "সীমিত স্টক",
    loc: "লিলেন থ্রি-পিস",
    title: "রেয়ন লিলেন থ্রি-পিস — আধুনিক বুনন",
    desc: "উজ্জ্বল রঙের কন্ট্রাস্ট ওড়না এবং আরামদায়ক ফিটিং প্যান্ট সহ প্রিমিয়াম সেমি-ফরমাল লিলেন সালোয়ার কামিজ।",
    sizes: ["M", "L", "XL"],
  },
  {
    id: "১২",
    numericId: 12,
    name: "আরামদায়ক সামার লিলেন থ্রি-পিস",
    img: linen4,
    price: 1650,
    priceDisplay: "৳ ১,৬৫০",
    tag: "নতুন",
    loc: "লিলেন থ্রি-পিস",
    title: "সামার লিলেন থ্রি-পিস — রিফ্রেশিং ডিজাইন",
    desc: "গরমের উপযোগী পাতলা অথচ টেকসই কোয়ালিটি লিলেনে চমৎকার ফ্লোরাল বর্ডার প্রিন্টের থ্রি-পিস সেট।",
    sizes: ["S", "M", "L", "XL"],
  },

  // --- Category 4: ক্যাজুয়াল আবায়া (Casual Abaya) ---
  {
    id: "১৩",
    numericId: 13,
    name: "সামার লিনেন ডেইলি আবায়া সেট",
    img: casualAbaya1,
    price: 1950,
    priceDisplay: "৳ ১,৯৫০",
    tag: "নতুন",
    loc: "ক্যাজুয়াল আবায়া",
    title: "লিনেন ডেইলি আবায়া — প্রতিদিনের আরাম",
    desc: "আমদানিকৃত আরামদায়ক হালকা লিনেন কাপড়ে তৈরি চমৎকার ও মার্জিত ক্যাজুয়াল আবায়া সেট। ফ্রন্ট-ওপেন বোতাম ডিজাইন।",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "১৪",
    numericId: 14,
    name: "স্লিম-ফিট ক্যাজুয়াল আবায়া",
    img: casualAbaya2,
    price: 1800,
    priceDisplay: "৳ ১,৮০০",
    tag: "জনপ্রিয়",
    loc: "ক্যাজুয়াল আবায়া",
    title: "স্লিম-ফিট আবায়া — স্মার্ট লুক",
    desc: "শালীন অথচ আধুনিক কাটের আরামদায়ক আবায়া সেট। বাইরে যাতায়াত ও শপিংয়ের জন্য দারুণ মানানসই।",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "১৫",
    numericId: 15,
    name: "সফট কটন রেগুলার আবায়া",
    img: casualAbaya3,
    price: 2100,
    priceDisplay: "৳ ২,১০০",
    tag: "নতুন",
    loc: "ক্যাজুয়াল আবায়া",
    title: "কটন রেগুলার আবায়া — বিশুদ্ধ আরাম",
    desc: "১০০% প্রি-ওয়াশড কটন সুতায় বোনা আরামদায়ক ব্লাক ও ন্যাভি ব্লু কালার রেগুলার ইউজেবল আবায়া।",
    sizes: ["M", "L", "XL"],
  },
  {
    id: "১৬",
    numericId: 16,
    name: "ক্লাসিক পকেট ক্যাজুয়াল আবায়া",
    img: casualAbaya4,
    price: 1750,
    priceDisplay: "৳ ১,৭৫০",
    tag: "সীমিত স্টক",
    loc: "ক্যাজুয়াল আবায়া",
    title: "পকেট আবায়া — ব্যবহারিক ডিজাইন",
    desc: "দুই পাশে পকেট সহ অত্যন্ত আরামদায়ক ও ট্রেন্ডি এ-লাইন কাটের সলিড কালার আবায়া।",
    sizes: ["S", "M", "L", "XL"],
  },

  // --- Category 5: উৎসবের বোরকা (Festive Borka) ---
  {
    id: "১৭",
    numericId: 17,
    name: "দুবাই চেরি এমব্রয়ডারি বোরকা সেট",
    img: festiveBorka1,
    price: 2950,
    priceDisplay: "৳ ২,৯৫০",
    tag: "হট কেক",
    loc: "উৎসবের বোরকা",
    title: "দুবাই চেরি বোরকা — মার্জিত উৎসব লুক",
    desc: "আমদানিকৃত প্রিমিয়াম দুবাই চেরি জর্জেট কাপড়ে তৈরি এমব্রয়ডারি করা গর্জিয়াস বোরকা সেট। বেল্ট ও হিজাব সহ সম্পূর্ণ সেট।",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "১৮",
    numericId: 18,
    name: "শিমারিং লাক্সারি পার্টি বোরকা",
    img: festiveBorka2,
    price: 3450,
    priceDisplay: "৳ ৩,৪৫০",
    tag: "নতুন",
    loc: "উৎসবের বোরকা",
    title: "পার্টি বোরকা — শিমারিং আভিজাত্য",
    desc: "চকচকে শিমারিং ফেব্রিকের নিখুঁত লেস এবং স্টোনের কাজে ঘেরা চমৎকার গর্জিয়াস ও আভিজাত্যপূর্ণ পার্টি বোরকা সেট।",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "১৯",
    numericId: 19,
    name: "রয়েল জর্জেট কুচি বোরকা সেট",
    img: festiveBorka3,
    price: 2800,
    priceDisplay: "৳ ২,৮০০",
    tag: "জনপ্রিয়",
    loc: "উৎসবের বোরকা",
    title: "কুচি বোরকা — ক্লাসিক রয়্যাল কাট",
    desc: "নিখুঁত ফ্রন্ট ও ব্যাক কুচি ডিজাইনে তৈরি সফট জর্জেট কাপড়ের অত্যন্ত আকর্ষণীয় বোরকা ও ম্যাচিং বেল্ট সেট।",
    sizes: ["M", "L", "XL"],
  },
  {
    id: "২০",
    numericId: 20,
    name: "লাক্সারি স্টোন ওয়ার্ক বোরকা সেট",
    img: festiveBorka4,
    price: 3600,
    priceDisplay: "৳ ৩,৬০০",
    tag: "প্রিমিয়াম",
    loc: "উৎসবের বোরকা",
    title: "স্টোন ওয়ার্ক বোরকা — elite উৎসব ফ্যাশন",
    desc: "সম্পূর্ণ হাতে বসানো হাই-কোয়ালিটি স্টোন কারুকাজে মোড়ানো অত্যন্ত গর্জিয়াস জর্জেট ও দুবাই চেরি বোরকা প্যাক।",
    sizes: ["S", "M", "L", "XL"],
  },

  // --- Category 6: বিশেষ কম্বো সেট (Combo) ---
  {
    id: "২১",
    numericId: 21,
    name: "থ্রি-পিস ও ম্যাচিং হিজাব কম্বো",
    img: combo1,
    price: 2200,
    priceDisplay: "৳ ২,২০০",
    tag: "নতুন",
    loc: "কম্বো সেট",
    title: "থ্রি-পিস ও হিজাব কম্বো — আদর্শ উপহার",
    desc: "একটি প্রিমিয়াম কটন থ্রি-পিস ও এর সাথে মানানসই ও ম্যাচিং কটন-জর্জেট হিজাবের আকর্ষণীয় কম্বো প্যাক।",
    sizes: ["M", "L", "XL"],
  },
  {
    id: "২২",
    numericId: 22,
    name: "আবায়া ও ম্যাচিং নিকাব লাক্সারি কম্বো",
    img: combo2,
    price: 2400,
    priceDisplay: "৳ ২,৪০০",
    tag: "জনপ্রিয়",
    loc: "কম্বো সেট",
    title: "আবায়া ও নিকাব কম্বো — মার্জিত আবৃত সাজ",
    desc: "প্রিমিয়াম ডেইলি ইউজ আবায়ার সাথে একই ম্যাচিং কালার শেডের ডাবল পার্ট নিকাব ও সফট জর্জেট হিজাব কম্বো।",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "২৩",
    numericId: 23,
    name: "ডাবল ওয়ান থ্রি-পিস প্যাক কম্বো",
    img: combo3,
    price: 3100,
    priceDisplay: "৳ ৩,১০০",
    tag: "সেরা মূল্য",
    loc: "কম্বো সেট",
    title: "ডাবল থ্রি-পিস কম্বো — সাশ্রয়ী প্যাকেজ",
    desc: "সাশ্রয়ী মূল্যে দুটি প্রিমিয়াম সেমি-স্টিচড সুতি ও লিলেন থ্রি-পিসের ডাবল প্যাক স্পেশাল কম্বো অফার।",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "২৪",
    numericId: 24,
    name: "উৎসবের বোরকা ও সুতি থ্রি-পিস কম্বো",
    img: combo4,
    price: 4500,
    priceDisplay: "৳ ৪,৫০০",
    tag: "সীমিত অফার",
    loc: "কম্বো সেট",
    title: "বোরকা ও থ্রি-পিস কম্বো — অল-ইন-ওয়ান লাক্সারি",
    desc: "আমাদের এক্সক্লুসিভ দুবাই চেরি উৎসবের বোরকা ও একটি গর্জিয়াস হ্যান্ডলুম সুতি থ্রি-পিসের রাজকীয় কম্বো বান্ডেল।",
    sizes: ["S", "M", "L", "XL"],
  },
];

export function getProductById(id: string | number): Product | undefined {
  return PRODUCTS.find(
    (p) => p.id === id.toString() || p.numericId === Number(id)
  );
}

// Helper to convert number to Bangla numerals
export function toBanglaNumber(n: number | string): string {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return n
    .toString()
    .split("")
    .map((char) => (isNaN(Number(char)) || char === " " ? char : banglaDigits[Number(char)]))
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

export function getProductTotalStock(p: any): number {
  if (p.sizesJson) {
    try {
      const sizes = JSON.parse(p.sizesJson);
      return Object.values(sizes).reduce((acc: number, val: any) => acc + Number(val || 0), 0);
    } catch (e) {
      return 0;
    }
  }
  return (p.stockS || 0) + (p.stockM || 0) + (p.stockL || 0) + (p.stockXL || 0);
}

export function getProductPriceDisplayRange(p: any): string {
  const basePrice = Number(p.price || 0);
  const prices: number[] = [basePrice];
  
  if (p.sizePricesJson) {
    try {
      const sizePrices = typeof p.sizePricesJson === 'string' 
        ? JSON.parse(p.sizePricesJson) 
        : p.sizePricesJson;
      if (sizePrices && typeof sizePrices === 'object') {
        Object.values(sizePrices).forEach((val) => {
          const num = Number(val);
          if (!isNaN(num) && num > 0) {
            prices.push(num);
          }
        });
      }
    } catch (e) {}
  }
  
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  if (minPrice === maxPrice || prices.length <= 1) {
    return formatBanglaPriceWithCommas(minPrice);
  } else {
    return `${formatBanglaPriceWithCommas(minPrice)} - ${formatBanglaPriceWithCommas(maxPrice)}`;
  }
}
