import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Search, 
  Barcode, 
  Save, 
  X, 
  AlertTriangle, 
  Edit3, 
  Package,
  RefreshCw
} from "lucide-react";
import { formatBanglaPriceWithCommas, toBanglaNumber } from "@/lib/products";

interface ShowroomStockTabProps {
  products: any[];
  CATEGORIES: string[];
  onUpdateProductShowroomStock: (id: string, showroomSizesJson: string) => Promise<void>;
  onTransferProductStock?: (id: string, size: string, qty: number, direction: "online_to_showroom" | "showroom_to_online") => Promise<void>;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function ShowroomStockTab({
  products,
  CATEGORIES,
  onUpdateProductShowroomStock,
  onTransferProductStock,
  onRefresh,
  isLoading = false
}: ShowroomStockTabProps) {
  const [productSearch, setProductSearch] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("ALL");

  // Batch Barcode print states
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [barcodeQueue, setBarcodeQueue] = useState<{ [productId: string]: { [size: string]: number } }>({});
  const [isQueueConfigOpen, setIsQueueConfigOpen] = useState(false);

  // Selection states for modal/editing
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingSizes, setEditingSizes] = useState<{ [size: string]: number }>({});
  
  // Barcode Printing State
  const [barcodeProduct, setBarcodeProduct] = useState<any>(null);
  const [barcodeSize, setBarcodeSize] = useState<string>("M");

  // Stock Transfer State
  const [transferProduct, setTransferProduct] = useState<any>(null);
  const [transferSize, setTransferSize] = useState<string>("M");
  const [transferQty, setTransferQty] = useState<number>(1);
  const [transferDirection, setTransferDirection] = useState<"online_to_showroom" | "showroom_to_online">("online_to_showroom");
  const [isTransferring, setIsTransferring] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getProductSizes = (prod: any) => {
    try {
      const sizesObj = JSON.parse(prod.showroomSizesJson || prod.sizesJson || "{}");
      const keys = Object.keys(sizesObj);
      return keys.length > 0 ? keys : ["S", "M", "L", "XL"];
    } catch (e) {
      return ["S", "M", "L", "XL"];
    }
  };

  const getProductTotalShowroomStock = (prod: any) => {
    try {
      const sizesObj = JSON.parse(prod.showroomSizesJson || "{}");
      return Object.values(sizesObj).reduce((sum: number, val: any) => sum + Number(val || 0), 0);
    } catch (e) {
      return 0;
    }
  };

  const lowStockShowroomProducts = products.filter(p => {
    try {
      const sizesObj = JSON.parse(p.showroomSizesJson || "{}");
      return Object.values(sizesObj).some((qty: any) => Number(qty) < 5);
    } catch(e) {
      return false;
    }
  });

  const getProductNumericId = (prod: any) => {
    if (!prod) return 999;
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


  const handleStartEdit = (prod: any) => {
    try {
      setEditingSizes(JSON.parse(prod.showroomSizesJson || "{}"));
      setEditingProductId(prod.id);
    } catch (e) {
      setEditingSizes({});
    }
  };

  const handleSizeStockChange = (size: string, val: string) => {
    setEditingSizes(prev => ({
      ...prev,
      [size]: Math.max(0, parseInt(val) || 0)
    }));
  };

  const handleSaveStock = async () => {
    if (!editingProductId) return;
    await onUpdateProductShowroomStock(editingProductId, JSON.stringify(editingSizes));
    setEditingProductId(null);
  };

  const handlePrintBarcode = (prod: any, size: string) => {
    const numId = getProductNumericId(prod);
    const sku = `TF-${numId}-${size}`;
    const barcodeUrl = `https://api-bwipjs.metafloor.com/?bcid=code128&text=${sku}&scale=2&height=10`;

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
                <div class="price-val">${formatBanglaPriceWithCommas(prod.price)}</div>
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

  const handlePrintBatchBarcodes = (config: typeof barcodeQueue) => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    let labelsHtml = "";
    
    for (const [prodId, sizesObj] of Object.entries(config)) {
      const prod = products.find(p => p.id === prodId);
      if (!prod) continue;

      for (const [size, qty] of Object.entries(sizesObj)) {
        const numQty = Number(qty);
        if (numQty <= 0) continue;

        const numId = getProductNumericId(prod);
        const sku = `TF-${numId}-${size}`;
        const barcodeUrl = `https://api-bwipjs.metafloor.com/?bcid=code128&text=${sku}&scale=2&height=10`;

        for (let i = 0; i < numQty; i++) {
          labelsHtml += `
            <div class="label-page">
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
                    <div class="price-val">${formatBanglaPriceWithCommas(prod.price)}</div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }
      }
    }

    if (!labelsHtml) {
      alert("প্রিন্ট করার জন্য কোনো পোশাকের পরিমাণ পাওয়া যায়নি!");
      printWindow.close();
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>ব্যাচ বারকোড প্রিন্ট</title>
          <style>
            @page {
              size: 50mm 30mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
              color: black;
              -webkit-print-color-adjust: exact;
            }
            .label-page {
              width: 50mm;
              height: 29.5mm;
              padding: 1.8mm;
              box-sizing: border-box;
              page-break-inside: avoid;
              page-break-after: always;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .label-page:last-child {
              page-break-after: avoid !important;
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
              font-family: Arial, sans-serif;
            }
            .name {
              font-size: 7pt;
              font-weight: bold;
              margin-top: 2px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              font-family: Arial, sans-serif;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              font-size: 6pt;
              margin-top: 1px;
              font-weight: bold;
              font-family: Arial, sans-serif;
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
              font-family: Arial, sans-serif;
            }
            .price-val {
              font-size: 9pt;
              font-weight: 900;
              white-space: nowrap;
              font-family: Arial, sans-serif;
            }
          </style>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 400);
            };
          </script>
        </head>
        <body>${labelsHtml.trim()}</body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase());
      
    const matchesCategory = 
      activeCategoryFilter === "ALL" || 
      p.category === activeCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Reset page when category filter or search input changes
  useEffect(() => {
    setCurrentPage(1);
  }, [productSearch, activeCategoryFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6 font-sans text-foreground">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2 text-left">
            <Package className="text-primary" />
            <span>শোরুম ইনভেন্টরি ও বারকোড সেন্টার (Showroom Stock)</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 text-left">
            বসুন্ধরা সিটি শোরুমের ফিজিক্যাল পোশাক স্টক নিরীক্ষণ, পরিমার্জন এবং কাস্টম বারকোড লেবেল তৈরি করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground font-bold font-sans bg-white border border-border/80 px-3.5 py-2 rounded-xl shadow-3xs">
            মোট: <span className="text-primary font-black">{toBanglaNumber(products.length)}</span> টি
          </div>
          {onRefresh && (
            <button
              onClick={() => onRefresh()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-705 text-xs font-bold rounded-xl cursor-pointer transition-all shadow-3xs disabled:opacity-50"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              <span>রিফ্রেশ</span>
            </button>
          )}
        </div>
      </div>

      {lowStockShowroomProducts.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl text-xs leading-relaxed font-semibold text-amber-700 flex gap-2.5 text-left">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-extrabold text-[11px] uppercase tracking-wider mb-1">শোরুম স্টক সতর্কতা</h5>
            শোরুমের তাকে থাকা <span className="font-extrabold text-amber-900 font-sans">{toBanglaNumber(lowStockShowroomProducts.length)}</span> টি পোশাকের কিছু সাইজ স্টক খালি বা ৫টির নিচে রয়েছে। কার্টন বা গুদাম থেকে এনে স্টক রি-ফিল করুন।
          </div>
        </div>
      )}

      {/* Control Filters */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-2xs text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* Categories Pills */}
          <div className="flex gap-1.5 overflow-x-auto whitespace-nowrap py-1">
            <button
              onClick={() => setActiveCategoryFilter("ALL")}
              className={`px-3.5 py-1.5 border text-[11px] font-black rounded-lg cursor-pointer transition-all ${
                activeCategoryFilter === "ALL"
                  ? "bg-slate-900 border-slate-900 text-white shadow-3xs"
                  : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>সব শোরুম পোশাক</span>
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
          <div className="relative w-full sm:max-w-xs">
            <input 
              type="text" 
              placeholder="পণ্য বা SKU কোড খুঁজুন..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs text-foreground placeholder-slate-400 transition-all"
            />
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Showroom Products Table */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-xs font-semibold flex flex-col items-center justify-center gap-2">
            <RefreshCw size={24} className="animate-spin text-primary" />
            <span>লোড হচ্ছে...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-slate-450 text-xs font-semibold">শোরুমে কোনো পণ্য পাওয়া যায়নি।</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-400 font-black text-[9px] uppercase tracking-wider">
                    <th className="py-3 px-3 w-10 text-center">
                      <input 
                        type="checkbox" 
                        checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProductIds.includes(p.id))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            const newIds = paginatedProducts.map(p => p.id).filter(id => !selectedProductIds.includes(id));
                            setSelectedProductIds(prev => [...prev, ...newIds]);
                            setBarcodeQueue(prev => {
                              const updated = { ...prev };
                              newIds.forEach(id => {
                                const prod = products.find(p => p.id === id);
                                const sizesList = getProductSizes(prod);
                                const sizesObj: { [s: string]: number } = {};
                                sizesList.forEach(s => { sizesObj[s] = 0; });
                                if (sizesObj["M"] !== undefined) sizesObj["M"] = 1;
                                updated[id] = sizesObj;
                              });
                              return updated;
                            });
                          } else {
                            const pageIds = paginatedProducts.map(p => p.id);
                            setSelectedProductIds(prev => prev.filter(id => !pageIds.includes(id)));
                            setBarcodeQueue(prev => {
                              const updated = { ...prev };
                              pageIds.forEach(id => { delete updated[id]; });
                              return updated;
                            });
                          }
                        }}
                        className="w-3.5 h-3.5 border-slate-200 rounded accent-slate-900 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3 w-12 text-center">ছবি</th>
                    <th className="py-3 px-3">পোশাক ও ক্যাটাগরি</th>
                    <th className="py-3 px-3">SKU কোড</th>
                    <th className="py-3 px-3 text-right">মূল্য</th>
                    <th className="py-3 px-3 text-center">সাইজ ও শোরুম স্টক</th>
                    <th className="py-3 px-3 text-center">মোট শোরুম স্টক</th>
                    <th className="py-3 px-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {paginatedProducts.map((p) => {
                    const totalStock = getProductTotalShowroomStock(p);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                        {/* Select Checkbox */}
                        <td className="py-2.5 px-3 text-center">
                          <input 
                            type="checkbox"
                            checked={selectedProductIds.includes(p.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProductIds(prev => [...prev, p.id]);
                                setBarcodeQueue(prev => {
                                  const sizesList = getProductSizes(p);
                                  const sizesObj: { [s: string]: number } = {};
                                  sizesList.forEach(s => { sizesObj[s] = 0; });
                                  if (sizesObj["M"] !== undefined) sizesObj["M"] = 1;
                                  return { ...prev, [p.id]: sizesObj };
                                });
                              } else {
                                setSelectedProductIds(prev => prev.filter(id => id !== p.id));
                                setBarcodeQueue(prev => {
                                  const updated = { ...prev };
                                  delete updated[p.id];
                                  return updated;
                                });
                              }
                            }}
                            className="w-3.5 h-3.5 border-slate-200 rounded accent-slate-900 cursor-pointer"
                          />
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

                        {/* Showroom Sizes */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex flex-wrap gap-1 justify-center max-w-[200px] mx-auto">
                            {(() => {
                              try {
                                const sizesObj = JSON.parse(p.showroomSizesJson || p.sizesJson || "{}");
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
                                return <span className="text-[10px] text-rose-500 font-bold">ত্রুটি</span>;
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

                        {/* Action buttons */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => handleStartEdit(p)}
                              className="p-1.5 bg-slate-50 hover:bg-primary/10 border border-slate-200 hover:border-primary text-slate-700 hover:text-primary rounded-lg cursor-pointer transition-colors"
                              title="শোরুম স্টক পরিমার্জন"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button 
                              onClick={() => {
                                const sizes = getProductSizes(p);
                                setTransferProduct(p);
                                setTransferSize(sizes[0] || "M");
                                setTransferQty(1);
                                setTransferDirection("online_to_showroom");
                              }}
                              className="p-1.5 bg-slate-50 hover:bg-emerald-100 border border-slate-200 hover:border-emerald-600 text-slate-700 hover:text-emerald-700 rounded-lg cursor-pointer transition-colors"
                              title="স্টক স্থানান্তর (Online ⇄ Showroom)"
                            >
                              <RefreshCw size={12} />
                            </button>
                            <button 
                              onClick={() => {
                                const sizes = getProductSizes(p);
                                setBarcodeProduct(p);
                                setBarcodeSize(sizes[0] || "M");
                              }}
                              className="p-1.5 bg-slate-50 hover:bg-slate-900 border border-slate-200 hover:border-slate-900 text-slate-700 hover:text-white rounded-lg cursor-pointer transition-colors"
                              title="বারকোড লেবেল প্রিন্ট"
                            >
                              <Barcode size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-4 mt-4">
                <button
                  type="button"
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
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-3xs"
                >
                  পরবর্তী (Next)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sticky Bottom Bar for Barcode Print Queue */}
      {selectedProductIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center justify-between gap-5 z-40 animate-in fade-in slide-in-from-bottom-5 duration-200 w-full max-w-lg border border-white/10">
          <div className="flex items-center gap-2">
            <Barcode size={18} className="text-primary animate-pulse" />
            <div>
              <div className="text-xs font-black">{toBanglaNumber(selectedProductIds.length)} টি পোশাক সিলেক্ট করা হয়েছে</div>
              <div className="text-[9px] text-slate-400 font-semibold mt-0.5">ব্যাচ বারকোড প্রিন্ট কিউ</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQueueConfigOpen(true)}
              className="bg-primary hover:bg-primary/95 text-white font-extrabold px-4 py-2 rounded-xl text-xs border-none cursor-pointer transition-all shadow-md active:scale-[0.98]"
            >
              প্রিন্ট সেটিংস
            </button>
            <button
              onClick={() => {
                setSelectedProductIds([]);
                setBarcodeQueue({});
              }}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-2 rounded-xl text-xs border-none cursor-pointer transition-all"
            >
              বাতিল
            </button>
          </div>
        </div>
      )}

      {/* Batch Barcode Queue Configuration Modal */}
      {isQueueConfigOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-border overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 font-sans">
            {/* Modal Header */}
            <div className="p-4 border-b border-border bg-[#FCFAF7]/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Barcode size={18} className="text-primary" />
                <h3 className="font-bold text-sm text-slate-800">বারকোড প্রিন্ট সেটিংস (Batch Print Configuration)</h3>
              </div>
              <button 
                onClick={() => setIsQueueConfigOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-455 border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto flex-grow flex flex-col gap-3.5 bg-slate-50/50">
              {selectedProductIds.map((prodId) => {
                const prod = products.find(p => p.id === prodId);
                if (!prod) return null;
                const sizesList = getProductSizes(prod);

                return (
                  <div key={prodId} className="bg-white border border-border rounded-xl p-3.5 shadow-3xs flex items-center gap-4">
                    <Image 
                      src={prod.imgUrl || "/assets/cotton_1.png"} 
                      alt={prod.name} 
                      width={40}
                      height={54}
                      className="w-10 h-14 object-cover bg-secondary border border-border/80 rounded-lg flex-shrink-0"
                    />
                    <div className="flex-grow min-w-0 text-left">
                      <div className="text-xs font-extrabold text-slate-800 truncate" title={prod.name}>{prod.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">SKU: {prod.sku}</div>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-2.5">
                        {sizesList.map((size) => {
                          const val = barcodeQueue[prodId]?.[size] ?? 0;
                          return (
                            <div key={size} className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-lg px-2 py-1">
                              <span className="text-[10px] font-black text-slate-500 w-4">{size}:</span>
                              <input 
                                type="number" 
                                min={0}
                                max={50}
                                value={val || ""}
                                onChange={(e) => {
                                  const qtyVal = Math.max(0, parseInt(e.target.value) || 0);
                                  setBarcodeQueue(prev => ({
                                    ...prev,
                                    [prodId]: {
                                      ...prev[prodId],
                                      [size]: qtyVal
                                    }
                                  }));
                                }}
                                className="w-10 border-none bg-transparent text-xs font-black font-sans text-slate-800 focus:outline-none p-0"
                                placeholder="0"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-[#FCFAF7]/40 flex items-center justify-end gap-2">
              <button 
                onClick={() => setIsQueueConfigOpen(false)}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all"
              >
                বন্ধ করুন
              </button>
              <button 
                onClick={() => {
                  handlePrintBatchBarcodes(barcodeQueue);
                  setIsQueueConfigOpen(false);
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-extrabold px-5 py-2 rounded-xl text-xs border-none cursor-pointer transition-all shadow-md"
              >
                প্রিন্ট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SHOWROOM STOCK EDIT MODAL */}
      {editingProductId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg border text-left flex flex-col gap-5 font-sans">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Edit3 size={16} className="text-primary" />
                <span>শোরুম স্টক পরিমার্জন</span>
              </h3>
              <button 
                onClick={() => setEditingProductId(null)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-450 border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-xs space-y-4">
              <div>
                <span className="text-muted-foreground block mb-0.5">পোশাকের নাম:</span>
                <span className="font-bold text-slate-900 text-[13px]">
                  {products.find(p => p.id === editingProductId)?.name}
                </span>
              </div>

              <div className="border border-border/60 bg-secondary/15 p-4 rounded-xl">
                <span className="block text-[10px] text-primary font-black uppercase tracking-wider mb-3">প্রতি সাইজের স্টক সংখ্যা:</span>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(editingSizes).map(([sz, qty]) => (
                    <div key={sz} className="bg-white border p-2.5 rounded-lg flex flex-col gap-1 items-center">
                      <span className="text-[9px] font-black text-slate-400">{sz}</span>
                      <input 
                        type="number" 
                        min={0}
                        value={qty}
                        onChange={(e) => handleSizeStockChange(sz, e.target.value)}
                        className="w-full px-1.5 py-0.5 border border-slate-200 text-center rounded text-xs font-bold focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t pt-3.5">
              <button
                onClick={handleSaveStock}
                className="py-2 px-5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl border-none cursor-pointer flex items-center gap-1 shadow-xs text-xs"
              >
                <Save size={13} />
                <span>সংরক্ষণ করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setEditingProductId(null)}
                className="py-2 px-5 bg-secondary hover:bg-slate-100 border border-border text-foreground font-bold rounded-xl cursor-pointer text-xs"
              >
                <span>বাতিল</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. BARCODE PRINT MODAL */}
      {barcodeProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg border text-left flex flex-col gap-5 font-sans">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Barcode size={16} className="text-primary" />
                <span>বারকোড লেবেল প্রিন্ট (Showroom)</span>
              </h3>
              <button 
                onClick={() => setBarcodeProduct(null)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-450 border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <span className="text-muted-foreground block mb-0.5">পোশাকের নাম:</span>
                <span className="font-bold text-slate-900 text-[13px]">{barcodeProduct.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block mb-0.5">পণ্য কোড:</span>
                  <span className="font-mono font-bold text-slate-800">{getProductNumericId(barcodeProduct)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">খুচরা মূল্য:</span>
                  <span className="font-bold text-slate-950">৳{toBanglaNumber(barcodeProduct.price)}</span>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block mb-1">সাইজ সিলেক্ট করুন (Size):</span>
                <div className="flex gap-1.5 flex-wrap">
                  {getProductSizes(barcodeProduct).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setBarcodeSize(sz)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                        barcodeSize === sz
                          ? "bg-slate-900 border-slate-900 text-white shadow-3xs"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Barcode Visual Preview Box */}
              <div className="border border-border/80 rounded-xl p-4 bg-zinc-50/50 flex flex-col items-center gap-3">
                <span className="text-[10px] font-black uppercase text-primary tracking-wider border-b w-full text-center pb-1">লেবেল প্রিভিউ (50mm x 30mm)</span>
                <div className="w-[180px] bg-white border p-2 flex flex-col gap-1 text-black font-sans text-left shadow-2xs">
                  <div className="text-[9px] font-black text-center border-b pb-0.5">TANHA FASHION</div>
                  <div className="text-[8px] font-bold truncate">{barcodeProduct.name}</div>
                  <div className="flex justify-between text-[7px] font-bold">
                    <span>কোড: {getProductNumericId(barcodeProduct)}</span>
                    <span>SKU: {barcodeProduct.sku || ""}</span>
                    <span>সাইজ: {barcodeSize}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex flex-col items-center">
                      <img 
                        src={`https://api-bwipjs.metafloor.com/?bcid=code128&text=TF-${getProductNumericId(barcodeProduct)}-${barcodeSize}&scale=2&height=10`}
                        alt="Barcode"
                        className="h-6 w-24 object-contain"
                      />
                      <span className="text-[5.5px] font-mono font-bold mt-0.5">TF-{getProductNumericId(barcodeProduct)}-{barcodeSize}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[6px] text-zinc-500">মূল্য:</div>
                      <div className="text-[10px] font-extrabold">৳{barcodeProduct.price}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t pt-3.5">
              <button
                onClick={() => {
                  handlePrintBarcode(barcodeProduct, barcodeSize);
                  setBarcodeProduct(null);
                }}
                className="py-2 px-5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl border-none cursor-pointer flex items-center gap-1 shadow-xs text-xs"
              >
                <span>বারকোড প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setBarcodeProduct(null)}
                className="py-2 px-5 bg-secondary hover:bg-slate-100 border border-border text-foreground font-bold rounded-xl cursor-pointer text-xs"
              >
                <span>বাতিল</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. STOCK TRANSFER MODAL */}
      {transferProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg border text-left flex flex-col gap-5 font-sans">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <RefreshCw size={16} className="text-emerald-600 animate-spin-slow" />
                <span>স্টক স্থানান্তর (Stock Transfer)</span>
              </h3>
              <button 
                onClick={() => setTransferProduct(null)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-450 border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-xs space-y-4">
              <div>
                <span className="text-muted-foreground block mb-0.5">পোশাকের নাম:</span>
                <span className="font-bold text-slate-900 text-[13px]">{transferProduct.name}</span>
              </div>

              {/* Sizes current stock comparison grid */}
              <div className="border border-border/80 rounded-xl p-3 bg-slate-50/50">
                <span className="block text-[10px] text-slate-400 font-extrabold uppercase mb-2">বর্তমান স্টক তুলনা (Online vs. Showroom)</span>
                <div className="grid grid-cols-3 text-center font-bold gap-1 text-[10px] border-b pb-1.5 mb-1.5 text-slate-500 uppercase">
                  <span>সাইজ</span>
                  <span>অনলাইন</span>
                  <span>শোরুম</span>
                </div>
                <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                  {Object.entries(
                    JSON.parse(transferProduct.sizesJson || "{}")
                  ).map(([sz, onlineVal]) => {
                    const onlineCount = Number(onlineVal || 0);
                    const showroomSizes = JSON.parse(transferProduct.showroomSizesJson || "{}");
                    const showroomCount = Number(showroomSizes[sz] || 0);

                    return (
                      <div key={sz} className="grid grid-cols-3 text-center text-xs font-semibold py-1 hover:bg-slate-150 rounded">
                        <span className="font-bold text-slate-800">{sz}</span>
                        <span className="text-slate-600 font-sans">{onlineCount}</span>
                        <span className="text-slate-600 font-sans">{showroomCount}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transfer Form inputs */}
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-muted-foreground block mb-1">সাইজ সিলেক্ট:</label>
                    <select
                      value={transferSize}
                      onChange={(e) => setTransferSize(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-bold focus:outline-none"
                    >
                      {getProductSizes(transferProduct).map((sz) => (
                        <option key={sz} value={sz}>{sz}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-muted-foreground block mb-1">স্থানান্তর পরিমাণ (Qty):</label>
                    <input
                      type="number"
                      min={1}
                      value={transferQty}
                      onChange={(e) => setTransferQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-bold focus:outline-none font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1.5">স্থানান্তরের দিক (Direction):</label>
                  <div className="grid grid-cols-2 border border-border rounded-xl overflow-hidden bg-slate-100 p-0.5">
                    <button
                      type="button"
                      onClick={() => setTransferDirection("online_to_showroom")}
                      className={`py-1.5 border-none rounded-lg text-[9px] font-black cursor-pointer transition-all ${
                        transferDirection === "online_to_showroom"
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-transparent text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      অনলাইন ➔ শোরুম
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransferDirection("showroom_to_online")}
                      className={`py-1.5 border-none rounded-lg text-[9px] font-black cursor-pointer transition-all ${
                        transferDirection === "showroom_to_online"
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-transparent text-slate-605 hover:text-slate-909"
                      }`}
                    >
                      শোরুম ➔ অনলাইন
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t pt-3.5">
              <button
                disabled={isTransferring}
                onClick={async () => {
                  if (onTransferProductStock) {
                    setIsTransferring(true);
                    try {
                      await onTransferProductStock(
                        transferProduct.id,
                        transferSize,
                        transferQty,
                        transferDirection
                      );
                      setTransferProduct(null);
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setIsTransferring(false);
                    }
                  }
                }}
                className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl border-none cursor-pointer flex items-center gap-1 shadow-xs text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>স্থানান্তর নিশ্চিত করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setTransferProduct(null)}
                className="py-2 px-5 bg-secondary hover:bg-slate-100 border border-border text-foreground font-bold rounded-xl cursor-pointer text-xs"
              >
                <span>বাতিল</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
