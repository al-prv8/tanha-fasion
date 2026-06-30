import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";
import { PRODUCTS, getProductById } from "@/lib/products";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchProduct(id: string) {
  const decodedId = decodeURIComponent(id);
  
  // 1. Get local static product first to inherit display metadata (description, custom tags, etc.)
  const localProduct = getProductById(decodedId);
  
  // 2. Fetch Express API database to override with real-time stock values
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/products`, { next: { revalidate: 0 } });
    if (res.ok) {
      const data = await res.json();
      const matchId = localProduct ? localProduct.id : decodedId;
      const dbProd = data.find((p: any) => p.id === matchId || p.sku === decodedId);
      
      if (dbProd) {
        const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
        const formattedPrice = dbProd.price.toLocaleString("en-US").split("").map((char: string) => {
          if (char === ",") return ",";
          return banglaDigits[Number(char)] || char;
        }).join("");

        let sizesObj: { [sz: string]: number } = {};
        try {
          sizesObj = JSON.parse(dbProd.sizesJson || "{}");
        } catch (e) {}
        const sizesKeys = Object.keys(sizesObj);
        const totalStock = Object.values(sizesObj).reduce((acc: number, val: any) => acc + Number(val || 0), 0);

        return {
          id: dbProd.id,
          numericId: localProduct ? localProduct.numericId : 999,
          sku: dbProd.sku,
          name: dbProd.name,
          price: dbProd.price,
          originalPrice: dbProd.originalPrice,
          priceDisplay: `৳ ${formattedPrice}`,
          loc: dbProd.category,
          img: { src: dbProd.imgUrl },
          sizes: sizesKeys.length > 0 ? sizesKeys : (localProduct ? localProduct.sizes : ["S", "M", "L", "XL"]),
          sizesJson: dbProd.sizesJson,
          sizePricesJson: dbProd.sizePricesJson,
          title: localProduct ? localProduct.title : `${dbProd.name} — তানহা ফ্যাশন`,
          desc: localProduct ? localProduct.desc : `${dbProd.name} - Premium Quality Collection.`,
          tag: totalStock === 0 ? "স্টক শেষ" : (dbProd.tag || (localProduct ? localProduct.tag : "নতুন")),
          imagesJson: dbProd.imagesJson,
          videoUrlsJson: dbProd.videoUrlsJson
        };
      }
    }
  } catch (err) {
    console.error("Error fetching product from Express backend:", err);
  }
  
  // Fallback to static local product with default stock counts if API is down
  if (localProduct) {
    return {
      ...localProduct,
      sizesJson: '{"S":10,"M":15,"L":15,"XL":5}'
    };
  }
  
  return null;
}

export async function generateStaticParams() {
  return PRODUCTS.flatMap((p) => [
    { id: p.id },
    { id: p.numericId.toString() },
  ]);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    return {
      title: "পোশাক পাওয়া যায়নি — তানহা ফ্যাশন",
    };
  }

  return {
    title: `${product.name} —  তানহা ফ্যাশন`,
    description: product.desc,
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
