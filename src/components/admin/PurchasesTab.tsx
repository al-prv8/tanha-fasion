import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  Trash, 
  Truck, 
  ShoppingBag, 
  Calendar, 
  User, 
  TrendingUp, 
  Database,
  ArrowRight
} from "lucide-react";
import { formatBanglaPriceWithCommas, toBanglaNumber } from "@/lib/products";

interface PurchasesTabProps {
  products: any[];
  suppliers: any[];
  purchases: any[];
  onAddSupplier: (supplier: { name: string; phone?: string; company?: string }) => Promise<void>;
  onDeleteSupplier: (id: string) => Promise<void>;
  onAddPurchase: (purchase: { supplierId?: string; productId: string; size: string; quantity: number; buyingPrice: number }) => Promise<void>;
}

export default function PurchasesTab({
  products,
  suppliers,
  purchases,
  onAddSupplier,
  onDeleteSupplier,
  onAddPurchase
}: PurchasesTabProps) {
  // Tabs within PurchasesTab: "LOGS" | "SUPPLIERS"
  const [activeSubTab, setActiveSubTab] = useState<"LOGS" | "SUPPLIERS">("LOGS");

  // Form states
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);

  // Purchase Form fields
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [qty, setQty] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [purchaseNote, setPurchaseNote] = useState("");
  const [isSubmittingPurchase, setIsSubmittingPurchase] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  // Supplier Form fields
  const [supplierName, setSupplierName] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierCompany, setSupplierCompany] = useState("");
  const [isSubmittingSupplier, setIsSubmittingSupplier] = useState(false);
  const [supplierError, setSupplierError] = useState("");

  // Search filter
  const [purchaseSearch, setPurchaseSearch] = useState("");

  // Get dynamic sizes of the selected product
  const getProductSizes = () => {
    if (!selectedProductId) return [];
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return [];
    try {
      const parsed = JSON.parse(prod.showroomSizesJson || prod.sizesJson || "{}");
      return Object.keys(parsed);
    } catch (e) {
      return ["S", "M", "L", "XL", "XXL"];
    }
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPurchaseError("");
    if (!selectedProductId || !selectedSize || !qty || !buyingPrice) {
      setPurchaseError("অনুগ্রহ করে প্রোডাক্ট, সাইজ, পরিমাণ ও ক্রয়মূল্য ইনপুট দিন।");
      return;
    }

    const parsedQty = parseInt(qty);
    const parsedPrice = parseFloat(buyingPrice);

    if (isNaN(parsedQty) || parsedQty <= 0) {
      setPurchaseError("ক্রয়ের পরিমাণ অবশ্যই ধনাত্মক সংখ্যা হতে হবে।");
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setPurchaseError("ক্রয়মূল্য অবশ্যই ধনাত্মক সংখ্যা হতে হবে।");
      return;
    }

    setIsSubmittingPurchase(true);
    try {
      await onAddPurchase({
        supplierId: selectedSupplierId || undefined,
        productId: selectedProductId,
        size: selectedSize,
        quantity: parsedQty,
        buyingPrice: parsedPrice
      });
      // Reset form
      setSelectedProductId("");
      setSelectedSize("");
      setSelectedSupplierId("");
      setQty("");
      setBuyingPrice("");
      setShowAddPurchase(false);
    } catch (err: any) {
      setPurchaseError(err.response?.data?.error || err.message || "ক্রয় এন্ট্রি করতে ব্যর্থ হয়েছে।");
    } finally {
      setIsSubmittingPurchase(false);
    }
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupplierError("");
    if (!supplierName) {
      setSupplierError("সরবরাহকারীর নাম আবশ্যক।");
      return;
    }

    setIsSubmittingSupplier(true);
    try {
      await onAddSupplier({
        name: supplierName,
        phone: supplierPhone || undefined,
        company: supplierCompany || undefined
      });
      setSupplierName("");
      setSupplierPhone("");
      setSupplierCompany("");
      setShowAddSupplierModal(false);
    } catch (err: any) {
      setSupplierError(err.response?.data?.error || err.message || "সরবরাহকারী যুক্ত করতে ব্যর্থ হয়েছে।");
    } finally {
      setIsSubmittingSupplier(false);
    }
  };

  // Filtered purchase logs
  const filteredPurchases = purchases.filter(p => {
    const term = purchaseSearch.toLowerCase();
    const matchesProduct = p.product?.name?.toLowerCase().includes(term) || p.product?.sku?.toLowerCase().includes(term);
    const matchesSupplier = p.supplier?.name?.toLowerCase().includes(term) || p.supplier?.company?.toLowerCase().includes(term);
    return matchesProduct || matchesSupplier;
  });

  // Calculate metrics
  const totalPurchaseCost = purchases.reduce((sum, p) => sum + p.totalCost, 0);
  const totalPurchaseQty = purchases.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-800">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">পাইকারি ইনভেন্টরি ক্রয় ও সরবরাহকারী পরিচালনা</h2>
          <p className="text-xs text-muted-foreground mt-0.5">শোরুম ও শপের জন্য পোশাক ক্রয় লগ, স্টক রিস্টকিং ও সরবরাহকারী বিবরণী ট্র্যাক করুন।</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveSubTab("SUPPLIERS");
              setShowAddSupplierModal(true);
            }}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-3xs"
          >
            <Plus size={13} />
            <span>নতুন সরবরাহকারী</span>
          </button>
          <button 
            onClick={() => {
              setActiveSubTab("LOGS");
              setShowAddPurchase(prev => !prev);
            }}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-2xs border-none"
          >
            <Plus size={13} />
            <span>নতুন ক্রয় এন্ট্রি</span>
          </button>
        </div>
      </div>

      {/* Analytics Summaries */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">সর্বমোট ক্রয় খরচ</span>
            <span className="text-xl font-black text-foreground block mt-1.5">
              {formatBanglaPriceWithCommas(totalPurchaseCost)}
            </span>
          </div>
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">সর্বমোট রিস্টক পোশাক</span>
            <span className="text-xl font-black text-foreground block mt-1.5">
              {toBanglaNumber(totalPurchaseQty)} টি
            </span>
          </div>
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600 flex-shrink-0">
            <ShoppingBag size={20} />
          </div>
        </div>

        <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">নিবন্ধিত সরবরাহকারী</span>
            <span className="text-xl font-black text-foreground block mt-1.5">
              {toBanglaNumber(suppliers.length)} জন
            </span>
          </div>
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
            <Truck size={20} />
          </div>
        </div>

        <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">মোট ক্রয় রেকর্ড</span>
            <span className="text-xl font-black text-foreground block mt-1.5">
              {toBanglaNumber(purchases.length)} টি
            </span>
          </div>
          <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center text-amber-600 flex-shrink-0">
            <Database size={20} />
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-3xs p-6">
        
        {/* Sub-tabs selection */}
        <div className="flex border-b border-slate-100 pb-3 mb-6 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveSubTab("LOGS")}
            className={`pb-3 cursor-pointer transition-colors border-b-2 border-transparent ${
              activeSubTab === "LOGS" ? "text-primary border-primary" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            ক্রয় লগ ইতিহাস (Purchase Logs)
          </button>
          <button
            onClick={() => setActiveSubTab("SUPPLIERS")}
            className={`pb-3 cursor-pointer transition-colors border-b-2 border-transparent ${
              activeSubTab === "SUPPLIERS" ? "text-primary border-primary" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            সরবরাহকারী তালিকা (Suppliers List)
          </button>
        </div>

        {activeSubTab === "LOGS" && (
          <div className="flex flex-col gap-6">
            {/* Purchase Collapsible Form */}
            {showAddPurchase && (
              <form onSubmit={handlePurchaseSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 text-xs font-semibold animate-fade-in">
                <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-200 pb-2 mb-1">নতুন পাইকারি স্টক ক্রয় এন্ট্রি</h3>
                
                {purchaseError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-600 p-2.5 rounded-lg">
                    {purchaseError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Select Product */}
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">প্রোডাক্ট বা পোশাক *</label>
                    <select
                      required
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        setSelectedSize("");
                      }}
                      className="w-full px-2.5 py-1.5 border border-border bg-white rounded-lg text-foreground focus:outline-none focus:border-primary font-sans"
                    >
                      <option value="">নির্বাচন করুন</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku}) - ৳{p.price}</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Size */}
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">সাইজ *</label>
                    <select
                      required
                      disabled={!selectedProductId}
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-border bg-white rounded-lg text-foreground focus:outline-none focus:border-primary font-sans disabled:opacity-50"
                    >
                      <option value="">নির্বাচন করুন</option>
                      {getProductSizes().map(sz => (
                        <option key={sz} value={sz}>{sz}</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Supplier */}
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">সরবরাহকারী (ঐচ্ছিক)</label>
                    <select
                      value={selectedSupplierId}
                      onChange={(e) => setSelectedSupplierId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-border bg-white rounded-lg text-foreground focus:outline-none focus:border-primary font-sans"
                    >
                      <option value="">সরবরাহকারী নেই</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name} {s.company ? `(${s.company})` : ""}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Quantity */}
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">পরিমাণ (পিস) *</label>
                    <input
                      type="number"
                      required
                      placeholder="যেমন: ১০"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-border bg-white rounded-lg text-foreground focus:outline-none focus:border-primary font-sans"
                    />
                  </div>

                  {/* Unit Buying Price */}
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">ইউনিট পাইকারি ক্রয়মূল্য *</label>
                    <input
                      type="number"
                      required
                      placeholder="৳ যেমন: ৩৫০"
                      value={buyingPrice}
                      onChange={(e) => setBuyingPrice(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-border bg-white rounded-lg text-foreground focus:outline-none focus:border-primary font-sans"
                    />
                  </div>

                  {/* Total Cost Display */}
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">মোট আনুমানিক ক্রয়মূল্য</label>
                    <div className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-bold font-sans">
                      ৳ {formatBanglaPriceWithCommas((parseInt(qty) || 0) * (parseFloat(buyingPrice) || 0))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingPurchase}
                    className="py-1.5 px-4 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg border-none cursor-pointer flex items-center gap-1 shadow-xs disabled:opacity-50"
                  >
                    <span>ক্রয় সংরক্ষণ করুন</span>
                    <ArrowRight size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPurchase(false)}
                    className="py-1.5 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-lg cursor-pointer"
                  >
                    <span>বাতিল</span>
                  </button>
                </div>
              </form>
            )}

            {/* Filter & Table controls */}
            <div className="flex justify-between items-center gap-4">
              <div className="relative w-full max-w-xs">
                <input 
                  type="text" 
                  placeholder="পোশাক বা সরবরাহকারী দিয়ে খুঁজুন..."
                  value={purchaseSearch}
                  onChange={(e) => setPurchaseSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs text-foreground placeholder-slate-400 transition-all font-sans"
                />
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Purchases Table */}
            {filteredPurchases.length === 0 ? (
              <div className="py-12 text-center text-slate-450 text-xs font-semibold">কোনো ক্রয়ের ইতিহাস পাওয়া যায়নি।</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-400 font-black text-[9px] uppercase tracking-wider">
                      <th className="py-2.5 px-4">তারিখ</th>
                      <th className="py-2.5 px-4">পোশাক (SKU)</th>
                      <th className="py-2.5 px-4 text-center">সাইজ</th>
                      <th className="py-2.5 px-4 text-center">পরিমাণ</th>
                      <th className="py-2.5 px-4 text-right">ইউনিট ক্রয়মূল্য</th>
                      <th className="py-2.5 px-4 text-right">মোট খরচ</th>
                      <th className="py-2.5 px-4">সরবরাহকারী (কোম্পানি)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredPurchases.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-slate-50/40">
                        <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                          {new Date(p.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "numeric", day: "numeric" })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{p.product?.name || "মুছে ফেলা প্রোডাক্ট"}</div>
                          <div className="text-slate-400 font-mono text-[9px] mt-0.5">{p.product?.sku || "SKU N/A"}</div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-700">{p.size}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-900">{toBanglaNumber(p.quantity)} পিস</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-700">{formatBanglaPriceWithCommas(p.buyingPrice)}</td>
                        <td className="py-3 px-4 text-right font-black text-primary">{formatBanglaPriceWithCommas(p.totalCost)}</td>
                        <td className="py-3 px-4">
                          {p.supplier ? (
                            <div>
                              <div className="font-bold text-slate-800">{p.supplier.name}</div>
                              {p.supplier.company && <div className="text-slate-400 text-[9px] mt-0.5">{p.supplier.company}</div>}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">কোনোটিই নয়</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeSubTab === "SUPPLIERS" && (
          <div className="flex flex-col gap-6">
            
            {/* Add Supplier Form Modal/Panel */}
            {showAddSupplierModal && (
              <form onSubmit={handleSupplierSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 text-xs font-semibold animate-fade-in">
                <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-200 pb-2 mb-1">নতুন পাইকারি সরবরাহকারী (Supplier) যুক্ত করুন</h3>
                
                {supplierError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-600 p-2.5 rounded-lg">
                    {supplierError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">সরবরাহকারীর নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: জামাল উদ্দিন"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-border bg-white rounded-lg text-foreground focus:outline-none focus:border-primary font-sans"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">মোবাইল নম্বর</label>
                    <input
                      type="text"
                      placeholder="যেমন: 01712XXXXXX"
                      value={supplierPhone}
                      onChange={(e) => setSupplierPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-border bg-white rounded-lg text-foreground focus:outline-none focus:border-primary font-sans"
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">কোম্পানির নাম (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      placeholder="যেমন: ঢাকা ফেব্রিক্স লিমিটেড"
                      value={supplierCompany}
                      onChange={(e) => setSupplierCompany(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-border bg-white rounded-lg text-foreground focus:outline-none focus:border-primary font-sans"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingSupplier}
                    className="py-1.5 px-4 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg border-none cursor-pointer flex items-center gap-1 shadow-xs disabled:opacity-50"
                  >
                    <span>সংরক্ষণ করুন</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSupplierModal(false)}
                    className="py-1.5 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-lg cursor-pointer"
                  >
                    <span>বাতিল</span>
                  </button>
                </div>
              </form>
            )}

            {/* Suppliers Table */}
            {suppliers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">কোনো সরবরাহকারী পাওয়া যায়নি।</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-400 font-black text-[9px] uppercase tracking-wider">
                      <th className="py-2.5 px-4">সরবরাহকারীর নাম</th>
                      <th className="py-2.5 px-4">কোম্পানি</th>
                      <th className="py-2.5 px-4">মোবাইল নং</th>
                      <th className="py-2.5 px-4 text-center">যোগদানের তারিখ</th>
                      <th className="py-2.5 px-4 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {suppliers.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/40">
                        <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{s.company || <span className="text-slate-400 italic">কোনোটিই নয়</span>}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-600">{s.phone || <span className="text-slate-400 italic">-</span>}</td>
                        <td className="py-3 px-4 text-center font-mono text-[10px] text-slate-400">
                          {new Date(s.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "numeric", day: "numeric" })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              if (confirm(`${s.name} সরবরাহকারীকে মুছে ফেলতে চান?`)) {
                                onDeleteSupplier(s.id);
                              }
                            }}
                            className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-100 hover:border-rose-600 text-rose-600 rounded-lg cursor-pointer transition-colors"
                            title="সরবরাহকারী মুছুন"
                          >
                            <Trash size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
