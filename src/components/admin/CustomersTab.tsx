import React, { useState, useMemo } from "react";
import { 
  Search, 
  User, 
  ShoppingBag, 
  CreditCard, 
  Calendar, 
  MapPin, 
  History,
  TrendingUp,
  Award
} from "lucide-react";
import { formatBanglaPriceWithCommas, toBanglaNumber } from "@/lib/products";

interface CustomersTabProps {
  orders: any[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function CustomersTab({ orders = [], onRefresh, isLoading = false }: CustomersTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  // Group and aggregate orders by customer phone number
  const aggregatedCustomers = useMemo(() => {
    const customerMap = new Map<string, any>();
    
    // Aggregate only from non-cancelled orders for realistic spending metrics
    const activeOrders = orders.filter(o => o.orderStatus !== "CANCELLED");

    for (const o of activeOrders) {
      if (!o.phone) continue;
      const phone = o.phone.trim();
      
      if (!customerMap.has(phone)) {
        customerMap.set(phone, {
          name: o.name || "শোরুম কাস্টমার",
          phone: phone,
          address: `${o.address || ""}, ${o.city || ""}`.trim().replace(/^,\s*/, "").replace(/,\s*$/, ""),
          totalSpent: 0,
          ordersCount: 0,
          lastOrderDate: o.createdAt,
          ordersList: []
        });
      }

      const client = customerMap.get(phone);
      client.totalSpent += o.grandTotal;
      client.ordersCount += 1;
      client.ordersList.push(o);

      if (new Date(o.createdAt) > new Date(client.lastOrderDate)) {
        client.lastOrderDate = o.createdAt;
      }
    }

    // Sort by total spent descending (Highest spending customer first)
    return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Apply search query filter
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return aggregatedCustomers;
    const q = searchQuery.toLowerCase();
    return aggregatedCustomers.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.phone.includes(q)
    );
  }, [aggregatedCustomers, searchQuery]);

  // Calculate totals
  const metrics = useMemo(() => {
    const totalCount = aggregatedCustomers.length;
    const totalSpentSum = aggregatedCustomers.reduce((acc, c) => acc + c.totalSpent, 0);
    const avgSpent = totalCount > 0 ? Math.round(totalSpentSum / totalCount) : 0;
    
    // Top customer threshold (e.g. top 10% highest spenders)
    const thresholdIndex = Math.max(0, Math.floor(totalCount * 0.1) - 1);
    const vipThresholdPrice = totalCount > 0 && aggregatedCustomers[thresholdIndex] ? aggregatedCustomers[thresholdIndex].totalSpent : 5000;

    return {
      totalCount,
      totalSpentSum,
      avgSpent,
      vipThresholdPrice
    };
  }, [aggregatedCustomers]);

  const getFormattedDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">গ্রাহক ও কেনাকাটা বিবরণী (Customers)</h2>
          <p className="text-xs text-muted-foreground mt-0.5">গ্রাহক তালিকা, মোট ক্রয়ের পরিমাণ ও অর্ডারের ইতিবৃত্ত পর্যালোচনা করুন।</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground font-bold font-sans bg-white border border-border/80 px-3.5 py-2 rounded-xl shadow-3xs">
            মোট কাস্টমার: <span className="text-primary font-black">{toBanglaNumber(metrics.totalCount)}</span> জন
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center gap-1.5 text-xs font-bold disabled:opacity-50"
            >
              <span>রিফ্রেশ</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">সর্বমোট গ্রাহক কেনাকাটা</span>
            <span className="text-xl sm:text-2xl font-black text-foreground block mt-1.5">
              {formatBanglaPriceWithCommas(metrics.totalSpentSum)}
            </span>
          </div>
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">গড় কেনাকাটার পরিমাণ</span>
            <span className="text-xl sm:text-2xl font-black text-foreground block mt-1.5">
              {formatBanglaPriceWithCommas(metrics.avgSpent)}
            </span>
          </div>
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
            <CreditCard size={20} />
          </div>
        </div>

        <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">VIP গ্রাহক লিমিট</span>
            <span className="text-xl sm:text-2xl font-black text-foreground block mt-1.5">
              {formatBanglaPriceWithCommas(metrics.vipThresholdPrice)}+
            </span>
          </div>
          <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center text-amber-600 flex-shrink-0">
            <Award size={20} />
          </div>
        </div>
      </div>

      {/* Listing Content */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-2xs overflow-hidden">
        {/* Search Header */}
        <div className="p-5 border-b border-border/60 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:max-w-xs">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 focus:border-primary rounded-xl text-xs font-semibold focus:outline-none transition-all shadow-3xs"
            />
          </div>
          <div className="text-xs font-bold text-muted-foreground">
            ফিল্টারকৃত গ্রাহক: <span className="text-foreground">{toBanglaNumber(filteredCustomers.length)}</span> জন
          </div>
        </div>

        {/* Table list */}
        {filteredCustomers.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center text-slate-400 font-bold">
            <User size={36} className="mb-2 text-slate-300" />
            <span>কোনো গ্রাহক পাওয়া যায়নি</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-border/80 text-[10px] font-black text-muted-foreground uppercase tracking-wider select-none">
                  <th className="py-3 px-5 text-center w-12">#</th>
                  <th className="py-3 px-4">গ্রাহক নাম ও ফোন</th>
                  <th className="py-3 px-4">ঠিকানা</th>
                  <th className="py-3 px-4 text-center">মোট অর্ডার</th>
                  <th className="py-3 px-4 text-right">সর্বমোট কেনাকাটা</th>
                  <th className="py-3 px-4 text-center">সর্বশেষ ক্রয়ের তারিখ</th>
                  <th className="py-3 px-5 text-center w-24">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredCustomers.map((c, idx) => {
                  const isVip = c.totalSpent >= metrics.vipThresholdPrice;
                  return (
                    <tr key={c.phone} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3.5 px-5 text-center font-sans text-muted-foreground">{toBanglaNumber(idx + 1)}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-bold text-slate-900 block">{c.name}</span>
                            <span className="text-[10px] text-muted-foreground block font-sans mt-0.5">{c.phone}</span>
                          </div>
                          {isVip && (
                            <span className="py-0.5 px-1.5 bg-amber-500/10 text-amber-600 rounded text-[9px] font-black tracking-wide uppercase flex items-center gap-0.5">
                              <Award size={9} />
                              <span>VIP</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px] truncate text-muted-foreground" title={c.address}>
                        {c.address || "শোরুম ওয়াক-ইন"}
                      </td>
                      <td className="py-3.5 px-4 text-center font-sans">{toBanglaNumber(c.ordersCount)} টি</td>
                      <td className="py-3.5 px-4 text-right font-sans text-slate-900 font-extrabold">{formatBanglaPriceWithCommas(c.totalSpent)}</td>
                      <td className="py-3.5 px-4 text-center font-sans text-muted-foreground">{getFormattedDate(c.lastOrderDate)}</td>
                      <td className="py-3.5 px-5 text-center">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="py-1 px-2.5 bg-slate-100 hover:bg-primary hover:text-white border border-slate-200 hover:border-primary text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1 mx-auto"
                        >
                          <History size={11} />
                          <span>ইতিবৃত্ত</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Orders History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col transition-all duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedCustomer.name}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">মোবাইল: {selectedCustomer.phone} | সর্বমোট কেনাকাটা: {formatBanglaPriceWithCommas(selectedCustomer.totalSpent)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable order lists */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 border-l-2 border-primary pl-2 mb-2">
                <ShoppingBag size={14} className="text-primary" />
                <span>ক্রয়ের ইতিহাস (Purchase History)</span>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-muted-foreground uppercase">
                      <th className="py-2.5 px-4">অর্ডার নম্বর</th>
                      <th className="py-2.5 px-4">তারিখ</th>
                      <th className="py-2.5 px-4">চ্যানেল</th>
                      <th className="py-2.5 px-4 text-center">ডেলিভারি স্থিতি</th>
                      <th className="py-2.5 px-4 text-center">পেমেন্ট স্থিতি</th>
                      <th className="py-2.5 px-4 text-right">মূল্য</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-slate-700">
                    {selectedCustomer.ordersList.map((o: any) => (
                      <tr key={o.id} className="hover:bg-slate-50/20">
                        <td className="py-3 px-4 font-mono font-black text-slate-900">{o.orderNumber}</td>
                        <td className="py-3 px-4 text-muted-foreground">{getFormattedDate(o.createdAt)}</td>
                        <td className="py-3 px-4">
                          {o.isShowroom ? (
                            <span className="py-0.5 px-1.5 bg-slate-100 text-slate-600 rounded text-[9px]">শোরুম POS</span>
                          ) : (
                            <span className="py-0.5 px-1.5 bg-blue-50 text-blue-600 rounded text-[9px]">অনলাইন শপ</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`py-0.5 px-1.5 rounded text-[9px] ${
                            o.orderStatus === "DELIVERED" ? "bg-emerald-50 text-emerald-600" :
                            o.orderStatus === "SHIPPED" ? "bg-blue-50 text-blue-600" :
                            o.orderStatus === "PROCESSING" ? "bg-amber-50 text-amber-600" :
                            "bg-slate-100 text-slate-500"
                          }`}>
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`py-0.5 px-1.5 rounded text-[9px] ${
                            o.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                          }`}>
                            {o.paymentStatus === "PAID" ? "পরিশোধিত" : "বকেয়া"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-900">{formatBanglaPriceWithCommas(o.grandTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="py-2 px-5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs cursor-pointer shadow-3xs"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
