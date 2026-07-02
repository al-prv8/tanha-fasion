import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Package, 
  AlertTriangle,
  Image as ImageIcon,
  ChevronDown,
  X,
  Save,
  Layers,
  Barcode,
  RefreshCw,
  Upload
} from "lucide-react";
import { formatBanglaPriceWithCommas, toBanglaNumber, getProductTotalStock } from "@/lib/products";

interface ProductsTabProps {
  products: any[];
  productSearch: string;
  setProductSearch: (search: string) => void;
  editingProduct: any;
  setEditingProduct: (product: any) => void;
  productForm: {
    sku: string;
    name: string;
    price: string;
    originalPrice: string;
    tag: string;
    category: string;
    imgUrl: string;
    imagesJson: string;
    videoUrlsJson: string;
    sizesJson: string;
    sizePricesJson: string;
  };
  setProductForm: React.Dispatch<React.SetStateAction<{
    sku: string;
    name: string;
    price: string;
    originalPrice: string;
    tag: string;
    category: string;
    imgUrl: string;
    imagesJson: string;
    videoUrlsJson: string;
    sizesJson: string;
    sizePricesJson: string;
  }>>;
  onProductSubmit: (e: React.FormEvent) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onStartEditProduct: (product: any) => void;
  CATEGORIES: string[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

const STATIC_PRODUCT_ASSETS = [
  { value: "/assets/cotton_1.png", label: "কটন ১ (cotton_1.png)" },
  { value: "/assets/cotton_2.png", label: "কটন ২ (cotton_2.png)" },
  { value: "/assets/cotton_3.png", label: "কটন ৩ (cotton_3.png)" },
  { value: "/assets/cotton_4.png", label: "কটন ৪ (cotton_4.png)" },
  { value: "/assets/georgette_1.png", label: "জর্জেট ১ (georgette_1.png)" },
  { value: "/assets/georgette_2.png", label: "জর্জেট ২ (georgette_2.png)" },
  { value: "/assets/georgette_3.png", label: "জর্জেট ৩ (georgette_3.png)" },
  { value: "/assets/georgette_4.png", label: "জর্জেট ৪ (georgette_4.png)" },
  { value: "/assets/linen_1.png", label: "লিলেন ১ (linen_1.png)" },
  { value: "/assets/linen_2.png", label: "লিলেন ২ (linen_2.png)" },
  { value: "/assets/linen_3.png", label: "লিলেন ৩ (linen_3.png)" },
  { value: "/assets/linen_4.png", label: "লিলেন ৪ (linen_4.png)" },
  { value: "/assets/casual_abaya_1.png", label: "আবায়া ১ (casual_abaya_1.png)" },
  { value: "/assets/casual_abaya_2.png", label: "আবায়া ২ (casual_abaya_2.png)" },
  { value: "/assets/casual_abaya_3.png", label: "আবায়া ৩ (casual_abaya_3.png)" },
  { value: "/assets/casual_abaya_4.png", label: "আবায়া ৪ (casual_abaya_4.png)" },
  { value: "/assets/festive_borka_1.png", label: "বোরকা ১ (festive_borka_1.png)" },
  { value: "/assets/festive_borka_2.png", label: "বোরকা ২ (festive_borka_2.png)" },
  { value: "/assets/festive_borka_3.png", label: "বোরকা ৩ (festive_borka_3.png)" },
  { value: "/assets/festive_borka_4.png", label: "বোরকা ৪ (festive_borka_4.png)" },
  { value: "/assets/combo_1.png", label: "কম্বো ১ (combo_1.png)" },
  { value: "/assets/combo_2.png", label: "কম্বো ২ (combo_2.png)" },
  { value: "/assets/combo_3.png", label: "কম্বো ৩ (combo_3.png)" },
  { value: "/assets/combo_4.png", label: "কম্বো ৪ (combo_4.png)" },
];

export default function ProductsTab({
  products,
  productSearch,
  setProductSearch,
  editingProduct,
  setEditingProduct,
  productForm,
  setProductForm,
  onProductSubmit,
  onDeleteProduct,
  onStartEditProduct,
  CATEGORIES,
  onRefresh,
  isLoading = false
}: ProductsTabProps) {
  // Tracking if Custom URL mode or Upload mode is active
  const [imageMode, setImageMode] = useState<"preset" | "custom" | "upload">("preset");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Barcode Print Modal State
  const [barcodeProduct, setBarcodeProduct] = useState<any>(null);
  const [barcodeSize, setBarcodeSize] = useState<string>("M");

  const getProductSizes = (prod: any) => {
    try {
      const sizesObj = JSON.parse(prod.sizesJson || "{}");
      const keys = Object.keys(sizesObj);
      return keys.length > 0 ? keys : ["S", "M", "L", "XL"];
    } catch (e) {
      return ["S", "M", "L", "XL"];
    }
  };

  const getProductNumericId = (prod: any) => {
    if (prod.numericId !== undefined && prod.numericId !== null) {
      return prod.numericId;
    }
    if (prod.id) {
      const englishDigits = prod.id.split("").map((c: string) => {
        const idx = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"].indexOf(c);
        return idx !== -1 ? idx : c;
      }).join("");
      const parsed = parseInt(englishDigits, 10);
      return !isNaN(parsed) ? parsed : 999;
    }
    return 999;
  };

  const handlePrintBarcode = (prod: any, size: string) => {
    const numId = getProductNumericId(prod);
    const sku = `TF-${numId}-${size}`;
    // Uses the open-source, free bwip-js API to render Code 128 barcodes as high-quality PNGs
    const barcodeUrl = `https://api-bwipjs.metafloor.com/?bcid=code128&text=${sku}&scale=2&height=10`;

    let resolvedPrice = prod.price;
    if (prod.sizePricesJson) {
      try {
        const sizePrices = typeof prod.sizePricesJson === "string" 
          ? JSON.parse(prod.sizePricesJson) 
          : prod.sizePricesJson;
        if (sizePrices && sizePrices[size] !== undefined && sizePrices[size] !== null && Number(sizePrices[size]) > 0) {
          resolvedPrice = Number(sizePrices[size]);
        }
      } catch (e) {}
    }

    const printWindow = window.open("", "_blank", "width=600,height=400");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>প্রিন্ট বারকোড - ${prod.name}</title>
          <style>
            @page {
              size: 50mm 30mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 2mm;
              font-family: Arial, sans-serif;
              background: white;
              color: black;
              -webkit-print-color-adjust: exact;
            }
            .label-container {
              width: 46mm;
              height: 26mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              box-sizing: border-box;
            }
            .title {
              font-size: 8pt;
              font-weight: bold;
              text-align: center;
              border-bottom: 0.5px solid black;
              padding-bottom: 2px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .name {
              font-size: 7pt;
              font-weight: bold;
              margin-top: 2px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              font-size: 6pt;
              margin-top: 1px;
              font-weight: bold;
            }
            .barcode-area {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 2px;
            }
            .barcode-img {
              height: 7mm;
              max-width: 28mm;
              object-fit: contain;
            }
            .price-block {
              text-align: right;
            }
            .price-label {
              font-size: 5pt;
              color: #555;
              display: block;
            }
            .price-val {
              font-size: 9pt;
              font-weight: 900;
              white-space: nowrap;
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="title">TANHA FASHION (তানহা ফ্যাশন)</div>
            <div class="name">${prod.name}</div>
            <div class="meta-row">
              <span>কোড: ${numId}</span>
              <span>SKU: ${prod.sku || ""}</span>
              <span>সাইজ: ${size}</span>
            </div>
            <div class="barcode-area">
              <div style="display: flex; flex-direction: column; align-items: center;">
                <img class="barcode-img" src="${barcodeUrl}" alt="${sku}" />
                <span style="font-size: 5.5pt; font-family: monospace; font-weight: bold; margin-top: 1px; letter-spacing: 0.5px;">${sku}</span>
              </div>
              <div class="price-block">
                <span class="price-label">মূল্য:</span>
                <div class="price-val">${formatBanglaPriceWithCommas(resolvedPrice)}</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  
  // Selection states for inline row expansion
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  
  // Category Pill Filter
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("ALL");

  // Show inline Add Product form panel
  const [showAddForm, setShowAddForm] = useState(false);

  // File Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Dynamic Sizes Local Form State
  const [newSizeName, setNewSizeName] = useState("");
  const [newSizeStock, setNewSizeStock] = useState("10");
  const [newSizePrice, setNewSizePrice] = useState("");

  const lowStockProducts = products.filter(p => {
    try {
      const sizesObj = JSON.parse(p.sizesJson || "{}");
      return Object.values(sizesObj).some((qty: any) => Number(qty) < 5);
    } catch(e) {
      return false;
    }
  });

  const updateSizeStock = (size: string, stockVal: string) => {
    let currentSizes: { [sz: string]: number } = {};
    try {
      currentSizes = JSON.parse(productForm.sizesJson || "{}");
    } catch (e) {}
    currentSizes[size] = Number(stockVal || 0);
    setProductForm(prev => ({ ...prev, sizesJson: JSON.stringify(currentSizes) }));
  };

  const updateSizePrice = (size: string, priceVal: string) => {
    let currentPrices: { [sz: string]: number } = {};
    try {
      currentPrices = JSON.parse(productForm.sizePricesJson || "{}");
    } catch (e) {}
    if (priceVal === "" || isNaN(Number(priceVal))) {
      delete currentPrices[size];
    } else {
      currentPrices[size] = Number(priceVal);
    }
    setProductForm(prev => ({ ...prev, sizePricesJson: JSON.stringify(currentPrices) }));
  };

  const removeSizeKey = (size: string) => {
    let currentSizes: { [sz: string]: number } = {};
    let currentPrices: { [sz: string]: number } = {};
    try {
      currentSizes = JSON.parse(productForm.sizesJson || "{}");
    } catch (e) {}
    try {
      currentPrices = JSON.parse(productForm.sizePricesJson || "{}");
    } catch (e) {}
    delete currentSizes[size];
    delete currentPrices[size];
    setProductForm(prev => ({ 
      ...prev, 
      sizesJson: JSON.stringify(currentSizes),
      sizePricesJson: JSON.stringify(currentPrices)
    }));
  };

  const addNewSize = () => {
    if (!newSizeName.trim()) return;
    let currentSizes: { [sz: string]: number } = {};
    let currentPrices: { [sz: string]: number } = {};
    try {
      currentSizes = JSON.parse(productForm.sizesJson || "{}");
    } catch (e) {}
    try {
      currentPrices = JSON.parse(productForm.sizePricesJson || "{}");
    } catch (e) {}
    currentSizes[newSizeName.trim()] = Number(newSizeStock || 0);
    if (newSizePrice.trim() && !isNaN(Number(newSizePrice))) {
      currentPrices[newSizeName.trim()] = Number(newSizePrice);
    }
    setProductForm(prev => ({ 
      ...prev, 
      sizesJson: JSON.stringify(currentSizes),
      sizePricesJson: JSON.stringify(currentPrices)
    }));
    setNewSizeName("");
    setNewSizeStock("10");
    setNewSizePrice("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("ফাইলের সাইজ ৫ মেগাবাইটের বেশি হওয়া যাবে না।");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("শুধুমাত্র ছবি আপলোড করা যাবে।");
      return;
    }

    setIsUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/upload`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "ফাইল আপলোড ব্যর্থ হয়েছে।");
      }

      const data = await res.json();
      if (data.url) {
        setProductForm(prev => ({ ...prev, imgUrl: data.url }));
      }
    } catch (err: any) {
      console.error("Upload failed:", err);
      setUploadError(err.message || "সার্ভারের সাথে সংযোগ স্থাপন করা যাচ্ছে না।");
    } finally {
      setIsUploading(false);
    }
  };

  // Synchronize preset vs custom dropdown selection mode when productForm.imgUrl changes
  useEffect(() => {
    const isPreset = STATIC_PRODUCT_ASSETS.some(a => a.value === productForm.imgUrl);
    if (isPreset || productForm.imgUrl === "") {
      setImageMode("preset");
    } else if (productForm.imgUrl.includes("/uploads/")) {
      setImageMode("upload");
    } else {
      setImageMode("custom");
    }
  }, [productForm.imgUrl]);

  // Synchronize dynamic editing values when row expands/collapses or starts edit
  useEffect(() => {
    if (expandedProductId) {
      const prod = products.find(p => p.id === expandedProductId);
      if (prod) {
        onStartEditProduct(prod);
      }
    } else {
      setEditingProduct(null);
    }
  }, [expandedProductId]);

  const handlePresetSelect = (value: string) => {
    if (value === "custom") {
      setImageMode("custom");
    } else {
      setProductForm(prev => ({ ...prev, imgUrl: value }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onProductSubmit(e);
    setShowAddForm(false);
    setExpandedProductId(null);
  };

  // Filter products by search text and active category pill
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase());
      
    const matchesCategory = 
      activeCategoryFilter === "ALL" || 
      p.category === activeCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [productSearch, activeCategoryFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6 font-sans text-foreground">
      
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">পণ্য সম্ভার ও ইনভেন্টরি সেন্টার (Products)</h2>
          <p className="text-xs text-muted-foreground mt-0.5">পোশাকের স্টক কোড (SKU), মূল্য, ছবি এবং সাইজ ভিত্তিক স্টক লেভেল পরিচালনা করুন।</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground font-bold font-sans bg-white border border-border/80 px-3.5 py-2 rounded-xl shadow-3xs">
            মোট: <span className="text-primary font-black">{toBanglaNumber(products.length)}</span> টি
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center gap-1.5 text-xs font-bold disabled:opacity-50"
              title="রিলোড করুন"
            >
              <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
              <span>রিফ্রেশ</span>
            </button>
          )}
          <button
            onClick={() => {
              setExpandedProductId(null);
              setEditingProduct(null);
              setProductForm({
                sku: "",
                name: "",
                price: "",
                originalPrice: "",
                tag: "",
                category: CATEGORIES[0] || "",
                imgUrl: "/assets/cotton_1.png",
                imagesJson: "[]",
                videoUrlsJson: "[]",
                sizesJson: '{"S":10,"M":15,"L":15,"XL":5}',
                sizePricesJson: '{}'
              });
              setShowAddForm(!showAddForm);
            }}
            className="inline-flex items-center gap-1.5 py-2.5 px-4 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-2xs border-none"
          >
            {showAddForm ? <X size={14} /> : <Plus size={14} />}
            <span>{showAddForm ? 'ফর্ম বন্ধ করুন' : 'নতুন পণ্য যুক্ত করুন (Add Product)'}</span>
          </button>
        </div>
      </div>

      {/* 1. CREATOR PANEL (Toggled at Top) */}
      {showAddForm && (
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-2xs animate-fade-in">
          <h3 className="text-sm font-bold text-foreground mb-4 pb-2 border-b border-border/40 font-display flex items-center gap-1.5">
            <Plus size={16} className="text-primary" />
            <span>নতুন পোশাক যুক্ত করুন (Add Product)</span>
          </h3>
          
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs font-semibold">
            {/* Left section of inputs */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-muted-foreground mb-1">পণ্য কোড (SKU) *</label>
                <input 
                  type="text" 
                  required
                  placeholder="যেমন: TF-COT-101"
                  value={productForm.sku}
                  onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                  className="w-full px-3 py-2 border border-border bg-secondary/30 focus:bg-white rounded-lg text-foreground focus:outline-none focus:border-primary transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">পোশাকের নাম *</label>
                <input 
                  type="text" 
                  required
                  placeholder="যেমন: হ্যান্ডলুম সুতি থ্রি-পিস"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-border bg-secondary/30 focus:bg-white rounded-lg text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground mb-1">বিক্রয় মূল্য (৳) *</label>
                  <input 
                    type="number" 
                    required
                    placeholder="৳"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-border bg-secondary/30 focus:bg-white rounded-lg text-foreground focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">নিয়মিত মূল্য (৳ - ঐচ্ছিক)</label>
                  <input 
                    type="number" 
                    placeholder="৳"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-border bg-secondary/30 focus:bg-white rounded-lg text-foreground focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">পণ্য ট্যাগ (যেমন: নতুন, জনপ্রিয়, হট ডিল - ঐচ্ছিক)</label>
                <input 
                  type="text" 
                  placeholder="যেমন: নতুন"
                  value={productForm.tag}
                  onChange={(e) => setProductForm(prev => ({ ...prev, tag: e.target.value }))}
                  className="w-full px-3 py-2 border border-border bg-secondary/30 focus:bg-white rounded-lg text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Additional Images (Slots 2 to 5) */}
              <div className="bg-secondary/20 p-4 rounded-xl border border-border mt-3">
                <span className="text-xs font-bold text-foreground block mb-3">অতিরিক্ত ছবিসমূহ (Additional Images - সর্বোচ্চ ৪টি)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[2, 3, 4, 5].map((num) => {
                    const idx = num - 2;
                    let currentImagesList: string[] = [];
                    try {
                      currentImagesList = JSON.parse(productForm.imagesJson || "[]");
                    } catch (e) {}
                    const val = currentImagesList[idx] || "";
                    
                    const handleSlotChange = (newVal: string) => {
                      const updated = [...currentImagesList];
                      updated[idx] = newVal;
                      setProductForm(prev => ({ ...prev, imagesJson: JSON.stringify(updated.filter(u => u !== undefined && u !== null && u.trim() !== "")) }));
                    };
                    
                    const handleSlotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const formData = new FormData();
                      formData.append("file", file);
                      
                      try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/upload`, {
                          method: "POST",
                          body: formData,
                          credentials: "include"
                        });
                        if (res.ok) {
                          const data = await res.json();
                          if (data.url) {
                            handleSlotChange(data.url);
                          }
                        }
                      } catch (err) {
                        console.error("Slot upload failed:", err);
                      }
                    };

                    return (
                      <div key={num} className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-muted-foreground">ছবি {toBanglaNumber(num)} (URL বা ফাইল আপলোড)</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder={`ছবি ${num} এর URL`}
                            value={val}
                            onChange={(e) => handleSlotChange(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 border border-border bg-white rounded-lg text-xs font-mono"
                          />
                          <label className="py-1.5 px-3 bg-white hover:bg-slate-200 border border-border text-foreground text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-center shrink-0">
                            <Upload size={12} className="mr-1" /> আপলোড
                            <input type="file" accept="image/*" className="hidden" onChange={handleSlotUpload} />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Facebook & TikTok Videos */}
              <div className="bg-secondary/20 p-4 rounded-xl border border-border mt-3">
                <span className="text-xs font-bold text-foreground block mb-3">ভিডিও রিভিউ ও ডেমো লিংকসমূহ (Facebook / TikTok)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(() => {
                    let currentVideosList: string[] = [];
                    try {
                      currentVideosList = JSON.parse(productForm.videoUrlsJson || "[]");
                    } catch (e) {}
                    
                    const fbVal = currentVideosList[0] || "";
                    const ttVal = currentVideosList[1] || "";
                    
                    const handleVideoChange = (idx: number, newVal: string) => {
                      const updated = [...currentVideosList];
                      updated[idx] = newVal;
                      setProductForm(prev => ({ ...prev, videoUrlsJson: JSON.stringify(updated.filter(u => u !== undefined && u !== null && u.trim() !== "")) }));
                    };

                    return (
                      <>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-muted-foreground">ফেসবুক ভিডিও লিংক</label>
                          <input 
                            type="text" 
                            placeholder="যেমন: https://www.facebook.com/watch/?v=..."
                            value={fbVal}
                            onChange={(e) => handleVideoChange(0, e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-border bg-white rounded-lg text-xs"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-muted-foreground">টিকটক ভিডিও লিংক</label>
                          <input 
                            type="text" 
                            placeholder="যেমন: https://www.tiktok.com/@username/video/..."
                            value={ttVal}
                            onChange={(e) => handleVideoChange(1, e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-border bg-white rounded-lg text-xs"
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div>
                             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {(() => {
                    let sizesObj: { [sz: string]: number } = {};
                    try {
                      sizesObj = JSON.parse(productForm.sizesJson || "{}");
                    } catch (e) {}
                    
                    return Object.entries(sizesObj).map(([sz, qty]) => {
                      let szPrice = "";
                      try {
                        const priceObj = JSON.parse(productForm.sizePricesJson || "{}");
                        szPrice = priceObj[sz] !== undefined ? String(priceObj[sz]) : "";
                      } catch (e) {}

                      return (
                        <div key={sz} className="relative bg-white border border-border p-3 rounded-lg flex flex-col gap-1 text-left">
                          <button
                            type="button"
                            onClick={() => removeSizeKey(sz)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-[9px] border-none cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            &times;
                          </button>
                          <div className="text-[10px] font-black text-slate-700 border-b border-border/45 pb-0.5 mb-1">
                            <span>সাইজ: {sz}</span>
                          </div>
                          <div className="space-y-1.5 text-[9px]">
                            <div>
                              <span className="text-muted-foreground block mb-0.5">স্টক:</span>
                              <input 
                                type="number" 
                                min={0}
                                value={qty}
                                onChange={(e) => updateSizeStock(sz, e.target.value)}
                                className="w-full px-1.5 py-0.5 border border-slate-200 rounded text-xs font-bold focus:outline-none"
                              />
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-0.5">মূল্য (ঐচ্ছিক):</span>
                              <input 
                                type="number" 
                                min={0}
                                placeholder="বেস মূল্য"
                                value={szPrice}
                                onChange={(e) => updateSizePrice(sz, e.target.value)}
                                className="w-full px-1.5 py-0.5 border border-slate-200 rounded text-xs font-bold focus:outline-none font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Add size inline form */}
                <div className="flex gap-2 items-center bg-white/60 border border-dashed border-slate-200 p-2 rounded-lg">
                  <input 
                    type="text" 
                    placeholder="সাইজ (যেমন: XXL, 40)"
                    value={newSizeName}
                    onChange={(e) => setNewSizeName(e.target.value)}
                    className="flex-grow px-2 py-1 border border-slate-250 bg-white rounded text-[10px] font-bold focus:outline-none"
                  />
                  <input 
                    type="number" 
                    min={0}
                    placeholder="স্টক"
                    value={newSizeStock}
                    onChange={(e) => setNewSizeStock(e.target.value)}
                    className="w-12 px-1 py-1 border border-slate-250 bg-white rounded text-center text-[10px] font-bold focus:outline-none"
                  />
                  <input 
                    type="number" 
                    min={0}
                    placeholder="মূল্য (ঐচ্ছিক)"
                    value={newSizePrice}
                    onChange={(e) => setNewSizePrice(e.target.value)}
                    className="w-20 px-1 py-1 border border-slate-250 bg-white rounded text-center text-[10px] font-bold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addNewSize}
                    className="py-1 px-3 bg-slate-900 text-white font-bold text-[10px] rounded cursor-pointer border-none"
                  >
                    যোগ করুন
                  </button>
                </div>
              </div>
            </div>

            {/* Right section: Media presets & uploads */}
            <div className="lg:col-span-4 border border-border/60 bg-secondary/20 p-3.5 rounded-xl flex flex-col justify-between gap-3">
              <div>
                <span className="block text-[10px] text-primary font-black uppercase tracking-wider mb-2">মিডিয়া ও ছবি সংযোজন</span>
                <div className="flex gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => setImageMode("preset")}
                    className={`flex-1 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${imageMode === "preset" ? "bg-primary border-primary text-white" : "bg-white border-border text-muted-foreground"}`}
                  >
                    স্টক ইমেজ
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode("upload")}
                    className={`flex-1 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${imageMode === "upload" ? "bg-primary border-primary text-white" : "bg-white border-border text-muted-foreground"}`}
                  >
                    আপলোড করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode("custom")}
                    className={`flex-1 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${imageMode === "custom" ? "bg-primary border-primary text-white" : "bg-white border-border text-muted-foreground"}`}
                  >
                    কাস্টম লিঙ্ক
                  </button>
                </div>

                {imageMode === "preset" ? (
                  <select 
                    value={productForm.imgUrl}
                    onChange={(e) => handlePresetSelect(e.target.value)}
                    className="w-full px-2.5 py-2 border border-border bg-white rounded-lg text-foreground font-bold focus:outline-none focus:border-primary"
                  >
                    {STATIC_PRODUCT_ASSETS.map((asset) => (
                      <option key={asset.value} value={asset.value}>{asset.label}</option>
                    ))}
                  </select>
                ) : imageMode === "upload" ? (
                  <div className="flex flex-col gap-2">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-primary/60 bg-white rounded-xl p-4 cursor-pointer transition-all duration-200 text-center relative group min-h-[90px]">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        disabled={isUploading}
                      />
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                          <span className="text-[10px] text-muted-foreground font-semibold">ছবি আপলোড হচ্ছে...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          <ImageIcon size={18} className="text-slate-400 group-hover:text-primary transition-colors duration-200" />
                          <span className="text-[10px] text-slate-700 font-bold">এখানে ক্লিক করে ছবি সিলেক্ট করুন</span>
                          <span className="text-[9px] text-slate-400">JPG, PNG, WEBP (সর্বোচ্চ ৫ মেগাবাইট)</span>
                        </div>
                      )}
                    </label>
                    {uploadError && (
                      <span className="text-[9px] text-rose-500 font-bold block mt-1">{uploadError}</span>
                    )}
                  </div>
                ) : (
                  <input 
                    type="text" 
                    required
                    placeholder="কাস্টম ইমেজ URL"
                    value={productForm.imgUrl}
                    onChange={(e) => setProductForm(prev => ({ ...prev, imgUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-border bg-white rounded-lg text-foreground font-mono focus:outline-none"
                  />
                )}
              </div>

              {/* Preview */}
              <div className="flex gap-3 items-center bg-white border border-border/80 p-2.5 rounded-lg">
                <div className="w-10 h-13 bg-secondary rounded overflow-hidden flex-shrink-0 flex items-center justify-center text-muted-foreground/60 border border-border">
                  {productForm.imgUrl ? (
                    <Image src={productForm.imgUrl || "/assets/cotton_1.png"} alt="Preview" width={40} height={52} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={16} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold text-foreground">ছবির লাইভ প্রিভিউ</div>
                  <div className="text-[9px] text-muted-foreground truncate font-mono mt-0.5">{productForm.imgUrl || "সিলেক্ট করা হয়নি"}</div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="lg:col-span-12 flex gap-2 justify-end border-t border-border/40 pt-3">
              <button 
                type="submit" 
                className="py-2 px-5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl border-none cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Save size={13} />
                <span>সংরক্ষণ করুন</span>
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="py-2 px-5 bg-secondary hover:bg-secondary-foreground/15 border border-border text-foreground font-bold rounded-xl cursor-pointer"
              >
                <span>বাতিল</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. PRODUCTS DIRECTORY (List view) */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-2xs text-left">
        
        {lowStockProducts.length > 0 && (
          <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl text-xs leading-relaxed font-semibold text-amber-700 flex gap-2.5 text-left mb-6">
            <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-extrabold text-[11px] uppercase tracking-wider mb-1">স্টক সতর্কতা (Low Stock Alert)</h5>
              আপনার তালিকায় <span className="font-extrabold text-amber-900 font-sans">{toBanglaNumber(lowStockProducts.length)}</span> টি পোশাকের কিছু সাইজ স্টক শেষ অথবা প্রায় শেষের পথে (৫টির কম)। দ্রুত স্টক বাড়ানোর জন্য পোশাকগুলোর সাইজ ইনভেন্টরি হালনাগাদ করুন।
            </div>
          </div>
        )}

        {/* Filter pills and search control row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* Categories Pill Tabs */}
          <div className="flex gap-1.5 overflow-x-auto whitespace-nowrap py-1">
            <button
              onClick={() => setActiveCategoryFilter("ALL")}
              className={`px-3.5 py-1.5 border text-[11px] font-black rounded-lg cursor-pointer transition-all ${
                activeCategoryFilter === "ALL"
                  ? "bg-slate-900 border-slate-900 text-white shadow-3xs"
                  : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>সব পোশাক</span>
              <span className={`text-[9px] ml-1.5 px-1.5 py-0.5 rounded-md ${activeCategoryFilter === "ALL" ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-550 border border-slate-200'}`}>
                {toBanglaNumber(products.length)}
              </span>
            </button>
            {CATEGORIES.map((cat, idx) => {
              const count = products.filter(p => p.category === cat).length;
              const isActive = activeCategoryFilter === cat;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 border text-[11px] font-black rounded-lg cursor-pointer transition-all ${
                    isActive
                      ? "bg-slate-900 border-slate-900 text-white shadow-3xs"
                      : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[9px] ml-1.5 px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-550 border border-slate-200'}`}>
                    {toBanglaNumber(count)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:max-w-xs">
              <input 
                type="text" 
                placeholder="পণ্য বা SKU কোড খুঁজুন..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs text-foreground placeholder-slate-405 transition-all"
              />
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>


          </div>
        </div>

        {/* Products Table */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-slate-450 text-xs font-semibold">কোনো পণ্য পাওয়া যায়নি।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-400 font-black text-[9px] uppercase tracking-wider">
                  <th className="py-3 px-2 w-8 text-center"></th>

                  <th className="py-3 px-3 w-12 text-center font-display">ছবি</th>
                  <th className="py-3 px-3">পোশাক ও ক্যাটাগরি</th>
                  <th className="py-3 px-3">SKU কোড</th>
                  <th className="py-3 px-3 text-right">মূল্য</th>
                  <th className="py-3 px-3 text-center">সাইজ ও স্টক</th>
                  <th className="py-3 px-3 text-center">মোট স্টক</th>
                  <th className="py-3 px-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {paginatedProducts.map((p) => {
                  const isExpanded = expandedProductId === p.id;
                  const totalStock = getProductTotalStock(p);

                  return (
                    <React.Fragment key={p.id}>
                      {/* Product Row */}
                      <tr className={`hover:bg-slate-50/40 transition-colors ${isExpanded ? 'bg-slate-50/50' : ''}`}>
                        {/* Chevron Expand Toggle */}
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => setExpandedProductId(isExpanded ? null : p.id)}
                            className="p-1 hover:bg-slate-200 rounded-md text-slate-500 cursor-pointer transition-colors"
                            title="ইনভেন্টরি ও বিবরণ সংশোধন"
                          >
                            <ChevronDown size={14} className={`transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        </td>



                        {/* Image */}
                        <td className="py-2.5 px-3 text-center">
                          <Image 
                            src={p.imgUrl || "/assets/cotton_1.png"} 
                            alt={p.name} 
                            width={36}
                            height={48}
                            className="w-9 h-12 object-cover bg-secondary border border-border/80 rounded-md mx-auto" 
                          />
                        </td>

                        {/* Name & Category */}
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900 truncate max-w-[200px]" title={p.name}>{p.name}</div>
                          <div className="text-slate-400 text-[10px] mt-0.5">{p.category}</div>
                        </td>

                        {/* SKU */}
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-550">{p.sku}</td>

                        {/* Price */}
                        <td className="py-2.5 px-3 text-right font-black text-slate-900">৳{toBanglaNumber(p.price)}</td>

                        {/* Sizes */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex flex-wrap gap-1 justify-center max-w-[200px] mx-auto">
                            {(() => {
                              try {
                                const sizesObj = JSON.parse(p.sizesJson || "{}");
                                return Object.entries(sizesObj).map(([sz, qty]) => {
                                  const quantity = Number(qty || 0);
                                  let badgeClass = "bg-secondary text-foreground border-border";
                                  if (quantity === 0) {
                                    badgeClass = "bg-rose-50 text-rose-600 border-rose-200";
                                  } else if (quantity < 5) {
                                    badgeClass = "bg-amber-50 text-amber-700 border-amber-250";
                                  }
                                  return (
                                    <span key={sz} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${badgeClass}`}>
                                      <span className="font-extrabold">{sz}:</span>
                                      <span>{toBanglaNumber(quantity)}</span>
                                    </span>
                                  );
                                });
                              } catch (e) {
                                return <span className="text-[10px] text-rose-500">ত্রুটি</span>;
                              }
                            })()}
                          </div>
                        </td>

                        {/* Total Stock status badge */}
                        <td className="py-2.5 px-3 text-center">
                          {totalStock === 0 ? (
                            <span className="inline-flex items-center py-0.5 px-2 text-[9px] font-black bg-rose-50 text-rose-600 border border-rose-200 rounded-md">স্টক শেষ</span>
                          ) : totalStock < 5 ? (
                            <span className="inline-flex items-center py-0.5 px-2 text-[9px] font-black bg-amber-50 text-amber-600 border border-amber-250 rounded-md">সীমিত: {toBanglaNumber(totalStock)}</span>
                          ) : (
                            <span className="inline-flex items-center py-0.5 px-2 text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md">{toBanglaNumber(totalStock)} টি</span>
                          )}
                        </td>

                        {/* Action icons */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => setExpandedProductId(isExpanded ? null : p.id)}
                              className="p-1.5 bg-slate-55 hover:bg-primary/10 border border-slate-250 hover:border-primary text-slate-700 hover:text-primary rounded-lg cursor-pointer transition-colors"
                              title="সম্পাদনা"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button 
                              onClick={() => onDeleteProduct(p.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-100 hover:border-rose-600 text-rose-600 rounded-lg cursor-pointer transition-colors"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable sub-row details panel */}
                      {isExpanded && (
                        <tr className="bg-[#FAF9F5]">
                          <td colSpan={12} className="p-6 border-b border-slate-200">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                              
                              {/* Left Column: Storefront Mockup Preview Card */}
                              <div className="lg:col-span-5 flex flex-col gap-4">
                                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-slate-800 flex flex-col gap-3">
                                  <span className="block text-[9px] font-black uppercase text-primary tracking-wider border-b border-slate-200 pb-1.5">গ্রাহক ভিউ প্রিভিউ (Storefront Preview)</span>
                                  
                                  <div className="relative aspect-[3/4] bg-secondary overflow-hidden w-full rounded-lg border border-slate-100">
                                    <Image
                                      src={productForm.imgUrl || p.imgUrl || "/assets/cotton_1.png"}
                                      alt={productForm.name || p.name}
                                      fill
                                      sizes="(max-width: 1024px) 50vw, 25vw"
                                      className="object-cover"
                                    />
                                    {totalStock === 0 && (
                                      <span className="absolute top-3 left-3 bg-rose-600 text-white text-[9px] font-bold py-1 px-2.5 rounded-full uppercase">
                                        স্টক শেষ
                                      </span>
                                    )}
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-bold text-slate-900">{productForm.name || p.name}</h4>
                                    <div className="text-[10px] text-slate-400 mt-0.5">ক্যাটাগরি: {productForm.category || p.category}</div>
                                  </div>

                                  <div className="flex flex-col gap-1 border-t border-slate-100 pt-2.5">
                                    <div className="text-[9px] uppercase tracking-wider font-bold text-slate-400">সাইজ সিলেক্ট করুন:</div>
                                    <div className="flex gap-1.5 mt-0.5 flex-wrap">
                                      {(() => {
                                        let sizesObj: { [sz: string]: number } = {};
                                        try {
                                          sizesObj = JSON.parse(editingProduct ? productForm.sizesJson : p.sizesJson || "{}");
                                        } catch (e) {}
                                        
                                        return Object.entries(sizesObj).map(([sz, qty]) => {
                                          const hasStock = qty > 0;
                                          return (
                                            <button
                                              key={sz}
                                              type="button"
                                              disabled={!hasStock}
                                              className={`text-[10px] font-bold px-2 h-7 rounded border flex items-center justify-center transition-all ${
                                                hasStock
                                                  ? "bg-white border-slate-250 text-slate-800 hover:border-slate-800"
                                                  : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed line-through"
                                              }`}
                                            >
                                              {sz}
                                            </button>
                                          );
                                        });
                                      })()}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1.5">
                                    <span className="text-sm font-extrabold text-slate-900">{formatBanglaPriceWithCommas(Number(productForm.price || p.price))}</span>
                                    <span className="text-[10px] text-primary font-bold">SKU Code: {productForm.sku || p.sku}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Right Column: Interactive Editor Form */}
                              <div className="lg:col-span-7 flex flex-col gap-5">
                                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                                  <h4 className="font-bold text-xs text-foreground font-display flex items-center gap-1.5 border-b border-border/40 pb-2 mb-4">
                                    <Edit3 size={13} className="text-primary" />
                                    <span>পোশাকের তথ্য সংশোধন (Edit Details)</span>
                                  </h4>

                                  <form onSubmit={handleFormSubmit} className="grid grid-cols-2 gap-4 text-xs font-semibold">
                                    <div>
                                      <label className="block text-muted-foreground mb-1">পণ্য কোড (SKU) *</label>
                                      <input 
                                        type="text" 
                                        required
                                        value={productForm.sku}
                                        onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                                        className="w-full px-2.5 py-1.5 border border-border bg-slate-50 focus:bg-white rounded-lg text-foreground focus:outline-none focus:border-primary font-mono"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-muted-foreground mb-1">পোশাকের নাম *</label>
                                      <input 
                                        type="text" 
                                        required
                                        value={productForm.name}
                                        onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-2.5 py-1.5 border border-border bg-slate-50 focus:bg-white rounded-lg text-foreground focus:outline-none focus:border-primary"
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-muted-foreground mb-1">বিক্রয় মূল্য (৳) *</label>
                                        <input 
                                          type="number" 
                                          required
                                          value={productForm.price}
                                          onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                                          className="w-full px-2.5 py-1.5 border border-border bg-slate-50 focus:bg-white rounded-lg text-foreground focus:outline-none focus:border-primary"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-muted-foreground mb-1">নিয়মিত মূল্য (৳)</label>
                                        <input 
                                          type="number" 
                                          value={productForm.originalPrice}
                                          onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                                          className="w-full px-2.5 py-1.5 border border-border bg-slate-50 focus:bg-white rounded-lg text-foreground focus:outline-none focus:border-primary"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-muted-foreground mb-1">পণ্য ট্যাগ (যেমন: নতুন, জনপ্রিয়, হট ডিল - ঐচ্ছিক)</label>
                                      <input 
                                        type="text" 
                                        value={productForm.tag}
                                        onChange={(e) => setProductForm(prev => ({ ...prev, tag: e.target.value }))}
                                        className="w-full px-2.5 py-1.5 border border-border bg-slate-50 focus:bg-white rounded-lg text-foreground focus:outline-none focus:border-primary"
                                      />
                                    </div>

                                    {/* Additional Images (Slots 2 to 5) - Edit */}
                                    <div className="bg-slate-50 p-4 rounded-xl border border-border mt-3">
                                      <span className="text-xs font-bold text-foreground block mb-3">অতিরিক্ত ছবিসমূহ (Additional Images - সর্বোচ্চ ৪টি)</span>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[2, 3, 4, 5].map((num) => {
                                          const idx = num - 2;
                                          let currentImagesList: string[] = [];
                                          try {
                                            currentImagesList = JSON.parse(productForm.imagesJson || "[]");
                                          } catch (e) {}
                                          const val = currentImagesList[idx] || "";
                                          
                                          const handleSlotChange = (newVal: string) => {
                                            const updated = [...currentImagesList];
                                            updated[idx] = newVal;
                                            setProductForm(prev => ({ ...prev, imagesJson: JSON.stringify(updated.filter(u => u !== undefined && u !== null && u.trim() !== "")) }));
                                          };
                                          
                                          const handleSlotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            
                                            const formData = new FormData();
                                            formData.append("file", file);
                                            
                                            try {
                                              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/upload`, {
                                                method: "POST",
                                                body: formData,
                                                credentials: "include"
                                              });
                                              if (res.ok) {
                                                const data = await res.json();
                                                if (data.url) {
                                                  handleSlotChange(data.url);
                                                }
                                              }
                                            } catch (err) {
                                              console.error("Slot upload failed:", err);
                                            }
                                          };

                                          return (
                                            <div key={num} className="flex flex-col gap-1">
                                              <label className="text-[10px] font-bold text-muted-foreground">ছবি {toBanglaNumber(num)} (URL বা ফাইল আপলোড)</label>
                                              <div className="flex gap-2">
                                                <input 
                                                  type="text" 
                                                  placeholder={`ছবি ${num} এর URL`}
                                                  value={val}
                                                  onChange={(e) => handleSlotChange(e.target.value)}
                                                  className="flex-1 px-2.5 py-1.5 border border-border bg-white rounded-lg text-xs font-mono"
                                                />
                                                <label className="py-1.5 px-3 bg-white hover:bg-slate-200 border border-border text-foreground text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-center shrink-0">
                                                  <Upload size={12} className="mr-1" /> আপলোড
                                                  <input type="file" accept="image/*" className="hidden" onChange={handleSlotUpload} />
                                                </label>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Facebook & TikTok Videos - Edit */}
                                    <div className="bg-slate-50 p-4 rounded-xl border border-border mt-3">
                                      <span className="text-xs font-bold text-foreground block mb-3">ভিডিও রিভিউ ও ডেমো লিংকসমূহ (Facebook / TikTok)</span>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {(() => {
                                          let currentVideosList: string[] = [];
                                          try {
                                            currentVideosList = JSON.parse(productForm.videoUrlsJson || "[]");
                                          } catch (e) {}
                                          
                                          const fbVal = currentVideosList[0] || "";
                                          const ttVal = currentVideosList[1] || "";
                                          
                                          const handleVideoChange = (idx: number, newVal: string) => {
                                            const updated = [...currentVideosList];
                                            updated[idx] = newVal;
                                            setProductForm(prev => ({ ...prev, videoUrlsJson: JSON.stringify(updated.filter(u => u !== undefined && u !== null && u.trim() !== "")) }));
                                          };

                                          return (
                                            <>
                                              <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-bold text-muted-foreground">ফেসবুক ভিডিও লিংক</label>
                                                <input 
                                                  type="text" 
                                                  placeholder="যেমন: https://www.facebook.com/watch/?v=..."
                                                  value={fbVal}
                                                  onChange={(e) => handleVideoChange(0, e.target.value)}
                                                  className="w-full px-2.5 py-1.5 border border-border bg-white rounded-lg text-xs"
                                                />
                                              </div>
                                              <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-bold text-muted-foreground">টিকটক ভিডিও লিংক</label>
                                                <input 
                                                  type="text" 
                                                  placeholder="যেমন: https://www.tiktok.com/@username/video/..."
                                                  value={ttVal}
                                                  onChange={(e) => handleVideoChange(1, e.target.value)}
                                                  className="w-full px-2.5 py-1.5 border border-border bg-white rounded-lg text-xs"
                                                />
                                              </div>
                                            </>
                                          );
                                        })()}
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-muted-foreground mb-1">ক্যাটাগরি *</label>
                                      <select 
                                        value={productForm.category}
                                        onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-2.5 py-1.5 border border-border bg-slate-50 focus:bg-white rounded-lg text-foreground font-bold focus:outline-none focus:border-primary"
                                      >
                                        {CATEGORIES.map((cat, idx) => (
                                          <option key={idx} value={cat}>{cat}</option>
                                        ))}
                                      </select>
                                    </div>

                                    {/* Image Selector & Upload */}
                                    <div className="col-span-2 border border-border/60 bg-secondary/10 p-3.5 rounded-xl">
                                      <span className="block text-[10px] text-primary font-black uppercase tracking-wider mb-2">ছবি পরিবর্তন</span>
                                      
                                      <div className="flex gap-1.5 mb-2">
                                        <button
                                          type="button"
                                          onClick={() => setImageMode("preset")}
                                          className={`flex-1 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${imageMode === "preset" ? "bg-primary border-primary text-white" : "bg-white border-border text-muted-foreground"}`}
                                        >
                                          স্টক গ্যালারি
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setImageMode("upload")}
                                          className={`flex-1 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${imageMode === "upload" ? "bg-primary border-primary text-white" : "bg-white border-border text-muted-foreground"}`}
                                        >
                                          আপলোড করুন
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setImageMode("custom")}
                                          className={`flex-1 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${imageMode === "custom" ? "bg-primary border-primary text-white" : "bg-white border-border text-muted-foreground"}`}
                                        >
                                          কাস্টম লিঙ্ক
                                        </button>
                                      </div>

                                      {imageMode === "preset" ? (
                                        <select 
                                          value={productForm.imgUrl}
                                          onChange={(e) => handlePresetSelect(e.target.value)}
                                          className="w-full px-2.5 py-1.5 border border-border bg-white rounded-lg text-foreground font-bold focus:outline-none"
                                        >
                                          {STATIC_PRODUCT_ASSETS.map((asset) => (
                                            <option key={asset.value} value={asset.value}>{asset.label}</option>
                                          ))}
                                        </select>
                                      ) : imageMode === "upload" ? (
                                        <div className="flex flex-col gap-2">
                                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-primary/60 bg-white rounded-xl p-3.5 cursor-pointer transition-all duration-200 text-center relative group min-h-[90px]">
                                            <input 
                                              type="file" 
                                              accept="image/*" 
                                              onChange={handleFileUpload} 
                                              className="hidden" 
                                              disabled={isUploading}
                                            />
                                            {isUploading ? (
                                              <div className="flex flex-col items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                                <span className="text-[10px] text-muted-foreground font-semibold">ছবি আপলোড হচ্ছে...</span>
                                              </div>
                                            ) : (
                                              <div className="flex flex-col items-center gap-1.5">
                                                <ImageIcon size={18} className="text-slate-400 group-hover:text-primary transition-colors duration-200" />
                                                <span className="text-[10px] text-slate-700 font-bold">এখানে ক্লিক করে ছবি সিলেক্ট করুন</span>
                                                <span className="text-[9px] text-slate-400">JPG, PNG, WEBP (সর্বোচ্চ ৫ মেগাবাইট)</span>
                                              </div>
                                            )}
                                          </label>
                                          {uploadError && (
                                            <span className="text-[9px] text-rose-500 font-bold block mt-1">{uploadError}</span>
                                          )}
                                        </div>
                                      ) : (
                                        <input 
                                          type="text" 
                                          required
                                          value={productForm.imgUrl}
                                          onChange={(e) => setProductForm(prev => ({ ...prev, imgUrl: e.target.value }))}
                                          className="w-full px-2.5 py-1.5 border border-border bg-white rounded-lg text-foreground font-mono focus:outline-none"
                                        />
                                      )}
                                    </div>

                                    {/* Sizes */}
                                    <div className="col-span-2 border border-border/60 bg-secondary/10 p-3.5 rounded-xl">
                                      <span className="block text-[10px] text-primary font-black uppercase tracking-wider mb-2">সাইজ ভিত্তিক স্টক (Variant Inventory)</span>
                                      
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                                        {(() => {
                                          let sizesObj: { [sz: string]: number } = {};
                                          try {
                                            sizesObj = JSON.parse(productForm.sizesJson || "{}");
                                          } catch (e) {}
                                          
                                          return Object.entries(sizesObj).map(([sz, qty]) => {
                                            let szPrice = "";
                                            try {
                                              const priceObj = JSON.parse(productForm.sizePricesJson || "{}");
                                              szPrice = priceObj[sz] !== undefined ? String(priceObj[sz]) : "";
                                            } catch (e) {}

                                            return (
                                              <div key={sz} className="relative bg-white border border-border p-3 rounded-lg flex flex-col gap-1 text-left">
                                                <button
                                                  type="button"
                                                  onClick={() => removeSizeKey(sz)}
                                                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-[9px] border-none cursor-pointer"
                                                  title="মুছে ফেলুন"
                                                >
                                                  &times;
                                                </button>
                                                <div className="text-[10px] font-black text-slate-700 border-b border-border/45 pb-0.5 mb-1 font-display">
                                                  <span>সাইজ: {sz}</span>
                                                </div>
                                                <div className="space-y-1.5 text-[9px]">
                                                  <div>
                                                    <span className="text-muted-foreground block mb-0.5">স্টক:</span>
                                                    <input 
                                                      type="number" 
                                                      min={0}
                                                      value={qty}
                                                      onChange={(e) => updateSizeStock(sz, e.target.value)}
                                                      className="w-full px-1.5 py-0.5 border border-slate-200 rounded text-xs font-bold focus:outline-none"
                                                    />
                                                  </div>
                                                  <div>
                                                    <span className="text-muted-foreground block mb-0.5">মূল্য (ঐচ্ছিক):</span>
                                                    <input 
                                                      type="number" 
                                                      min={0}
                                                      placeholder="বেস মূল্য"
                                                      value={szPrice}
                                                      onChange={(e) => updateSizePrice(sz, e.target.value)}
                                                      className="w-full px-1.5 py-0.5 border border-slate-200 rounded text-xs font-bold focus:outline-none font-mono"
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          });
                                        })()}
                                      </div>

                                      {/* Add size inline form */}
                                      <div className="flex gap-2 items-center bg-white/60 border border-dashed border-slate-200 p-2 rounded-lg">
                                        <input 
                                          type="text" 
                                          placeholder="সাইজ (যেমন: XXL, 40)"
                                          value={newSizeName}
                                          onChange={(e) => setNewSizeName(e.target.value)}
                                          className="flex-grow px-2 py-1 border border-slate-250 bg-white rounded text-[10px] font-bold focus:outline-none"
                                        />
                                        <input 
                                          type="number" 
                                          min={0}
                                          placeholder="স্টক"
                                          value={newSizeStock}
                                          onChange={(e) => setNewSizeStock(e.target.value)}
                                          className="w-12 px-1 py-1 border border-slate-250 bg-white rounded text-center text-[10px] font-bold focus:outline-none"
                                        />
                                        <input 
                                          type="number" 
                                          min={0}
                                          placeholder="মূল্য (ঐচ্ছিক)"
                                          value={newSizePrice}
                                          onChange={(e) => setNewSizePrice(e.target.value)}
                                          className="w-20 px-1 py-1 border border-slate-250 bg-white rounded text-center text-[10px] font-bold focus:outline-none"
                                        />
                                        <button
                                          type="button"
                                          onClick={addNewSize}
                                          className="py-1 px-3 bg-slate-900 text-white font-bold text-[10px] rounded cursor-pointer border-none"
                                        >
                                          যোগ করুন
                                        </button>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="col-span-2 flex gap-2 justify-end border-t border-slate-100 pt-3.5 mt-1.5">
                                      <button 
                                        type="submit" 
                                        className="py-1.5 px-4 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg border-none cursor-pointer flex items-center gap-1 shadow-xs"
                                      >
                                        <Save size={11} />
                                        <span>সংরক্ষণ করুন</span>
                                      </button>
                                      <button 
                                        type="button" 
                                        onClick={() => setExpandedProductId(null)}
                                        className="py-1.5 px-4 bg-secondary hover:bg-slate-100 border border-border text-foreground font-bold rounded-lg cursor-pointer"
                                      >
                                        <span>বাতিল</span>
                                      </button>
                                    </div>
                                  </form>
                                </div>

                                {/* Danger Zone (Delete Product) */}
                                <div className="bg-rose-50/50 border border-rose-200/80 rounded-xl p-5 shadow-2xs">
                                  <h4 className="font-bold text-xs text-rose-700 font-display flex items-center gap-1.5 border-b border-rose-250 pb-2 mb-3">
                                    <AlertTriangle size={13} className="text-rose-600" />
                                    <span>ডেঞ্জার জোন (Danger Zone)</span>
                                  </h4>
                                  <p className="text-[10px] text-rose-650 leading-relaxed mb-3 font-semibold">
                                    পণ্যটি মুছে ফেললে ডাটাবেজ থেকে পণ্যটি এবং এর সংশ্লিষ্ট সকল রিভিউ ও অর্ডার আইটেম সম্পর্কসমূহ সম্পূর্ণরূপে ডিলিট হয়ে যাবে।
                                  </p>
                                  <button
                                    onClick={() => {
                                      onDeleteProduct(p.id);
                                      setExpandedProductId(null);
                                    }}
                                    className="w-full py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg border-none cursor-pointer flex items-center justify-center gap-2 transition-colors shadow-3xs"
                                  >
                                    <Trash2 size={14} />
                                    <span>পণ্যটি ডাটাবেজ থেকে মুছুন</span>
                                  </button>
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-4 mt-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-3xs"
            >
              পূর্ববর্তী (Prev)
            </button>
            <span className="text-xs font-bold text-muted-foreground">
              পৃষ্ঠা {toBanglaNumber(currentPage)} / {toBanglaNumber(totalPages)}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-3xs"
            >
              পরবর্তী (Next)
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
