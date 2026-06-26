import React, { useState } from "react";
import { Tag, Plus, Trash2, ShieldAlert, CheckCircle, XCircle, Save, RefreshCw } from "lucide-react";
import { toBanglaNumber, formatBanglaPriceWithCommas } from "@/lib/products";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minSubtotal: number;
  isActive: boolean;
  createdAt: string;
}

interface CouponsTabProps {
  coupons: Coupon[];
  onCreateCoupon: (code: string, type: string, value: number, minSubtotal: number) => Promise<void>;
  onToggleCouponActive: (id: string, isActive: boolean) => Promise<void>;
  onDeleteCoupon: (id: string) => Promise<void>;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function CouponsTab({
  coupons,
  onCreateCoupon,
  onToggleCouponActive,
  onDeleteCoupon,
  onRefresh,
  isLoading = false
}: CouponsTabProps) {
  const [code, setCode] = useState("");
  const [type, setType] = useState("FLAT"); // FLAT or PERCENTAGE
  const [value, setValue] = useState("");
  const [minSubtotal, setMinSubtotal] = useState("0");
  const [showAddForm, setShowAddForm] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(coupons.length / itemsPerPage);
  const paginatedCoupons = coupons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value) {
      alert("কোড এবং মান আবশ্যক।");
      return;
    }
    await onCreateCoupon(code, type, Number(value), Number(minSubtotal || 0));
    setCode("");
    setValue("");
    setMinSubtotal("0");
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-foreground">
      
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">কুপন পরিচালনা ও প্রোমো কোড (Coupons)</h2>
          <p className="text-xs text-muted-foreground mt-0.5">গ্রাহকদের জন্য বিশেষ ছাড়, প্রোমো কোড এবং পার্সেন্টেজ ডিসকাউন্ট কুপন তৈরি ও নিয়ন্ত্রণ করুন।</p>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 py-2.5 px-4 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-2xs border-none"
        >
          {showAddForm ? <XCircle size={14} /> : <Plus size={14} />}
          <span>{showAddForm ? "ফর্ম বন্ধ করুন" : "নতুন কুপন যুক্ত করুন"}</span>
        </button>
      </div>

      {/* 1. CREATOR PANEL */}
      {showAddForm && (
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-2xs animate-fade-in">
          <h3 className="text-sm font-bold text-foreground mb-4 pb-2 border-b border-border/40 font-display flex items-center gap-1.5">
            <Tag size={16} className="text-primary" />
            <span>নতুন ডিসকাউন্ট কুপন তৈরি করুন</span>
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold">
            <div>
              <label className="block text-muted-foreground mb-1">কুপন কোড (Coupon Code) *</label>
              <input 
                type="text" 
                required
                placeholder="যেমন: WINTER50, EID200"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-border bg-secondary/30 focus:bg-white rounded-lg text-foreground focus:outline-none focus:border-primary transition-all font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">ছাড়ের ধরন (Discount Type) *</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-2.5 py-2 border border-border bg-secondary/30 focus:bg-white rounded-lg text-foreground font-bold focus:outline-none focus:border-primary transition-all"
              >
                <option value="FLAT">স্থির ছাড় (FLAT Amount in ৳)</option>
                <option value="PERCENTAGE">শতকরা ছাড় (Percentage %)</option>
              </select>
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">ছাড়ের পরিমাণ (Value) *</label>
              <input 
                type="number" 
                required
                min={1}
                placeholder={type === "FLAT" ? "৳ এর পরিমাণ" : "% এর পরিমাণ"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-secondary/30 focus:bg-white rounded-lg text-foreground focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">সর্বনিম্ন ক্রয়সীমা (Min. Purchase ৳)</label>
              <input 
                type="number" 
                min={0}
                placeholder="৳০ মানে কোনো সীমা নেই"
                value={minSubtotal}
                onChange={(e) => setMinSubtotal(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-secondary/30 focus:bg-white rounded-lg text-foreground focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <div className="md:col-span-4 flex gap-2 justify-end border-t border-border/40 pt-3 mt-1">
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

      {/* 2. COUPON TABLE LIST */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-3xs p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold font-display font-black">সক্রিয় কুপন তালিকা</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">মোট {toBanglaNumber(coupons.length)}টি কুপন কোড ডাটাবেজে রয়েছে।</p>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2 bg-white hover:bg-slate-50 text-slate-655 hover:text-slate-800 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center gap-1.5"
              title="রিলোড করুন"
            >
              <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
              <span className="text-[10px] font-bold hidden sm:inline">রিফ্রেশ</span>
            </button>
          )}
        </div>
        {coupons.length === 0 ? (
          <div className="py-16 text-center text-slate-450 text-xs font-semibold flex flex-col items-center gap-3">
            <Tag size={28} className="text-slate-300" />
            <span>কোনো কুপন কোড পাওয়া যায়নি। নতুন কুপন যোগ করতে উপরের বাটনে ক্লিক করুন।</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-400 font-black text-[9px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-display">কুপন কোড</th>
                  <th className="py-3 px-4 font-display">ছাড়ের ধরন</th>
                  <th className="py-3 px-4 text-right font-display">ছাড়ের মান</th>
                  <th className="py-3 px-4 text-right font-display">ন্যূনতম ক্রয়সীমা</th>
                  <th className="py-3 px-4 text-center font-display">অবস্থা</th>
                  <th className="py-3 px-4 text-center font-display">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {paginatedCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/40 transition-colors">
                    {/* Code */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary rounded-lg font-mono font-extrabold text-[11px]">
                        {c.code}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 font-bold text-slate-600">
                      {c.type === "PERCENTAGE" ? "শতকরা ছাড় (%)" : "স্থির ছাড় (৳)"}
                    </td>

                    {/* Value */}
                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      {c.type === "PERCENTAGE" ? `${toBanglaNumber(c.value)}%` : formatBanglaPriceWithCommas(c.value)}
                    </td>

                    {/* Min Subtotal */}
                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      {c.minSubtotal === 0 ? "সীমা নেই" : formatBanglaPriceWithCommas(c.minSubtotal)}
                    </td>

                    {/* Active Toggle Status */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onToggleCouponActive(c.id, !c.isActive)}
                        className={`inline-flex items-center gap-1 py-1 px-2.5 text-[9px] font-black rounded-lg cursor-pointer border transition-colors ${
                          c.isActive 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" 
                            : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100"
                        }`}
                      >
                        {c.isActive ? (
                          <>
                            <CheckCircle size={10} />
                            <span>সচল</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={10} />
                            <span>অচল</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <button 
                        onClick={() => onDeleteCoupon(c.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-100 hover:border-rose-600 text-rose-600 rounded-lg cursor-pointer transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
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
