import React from "react";
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  Package, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  Users,
  Tag,
  Star,
  Activity,
  CheckCircle2,
  Truck,
  XCircle,
  BadgePercent
} from "lucide-react";
import { formatBanglaPriceWithCommas, toBanglaNumber, getProductTotalStock } from "@/lib/products";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardTabProps {
  analytics: {
    totalEarnings: number;
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders?: number;
    shippedOrders?: number;
    deliveredOrders?: number;
    cancelledOrders?: number;
    activeOrders: number;
    totalProducts: number;
    totalCustomers?: number;
    totalCoupons?: number;
    totalReviews?: number;
    salesChartData: Array<{ date: string; sales: number }>;
  };
  products: any[];
  setActiveTab: (tab: any) => void;
  adminName?: string;
}

export default function DashboardTab({
  analytics,
  products,
  setActiveTab,
  adminName = "অ্যাডমিন"
}: DashboardTabProps) {
  // Filter products that are running low on stock (total stock < 5)
  const lowStockProducts = products.filter(p => {
    const total = getProductTotalStock(p);
    return total < 5;
  });

  const avgOrderValue = analytics.totalOrders > 0 
    ? Math.round(analytics.totalEarnings / analytics.totalOrders) 
    : 0;

  return (
    <div className="flex flex-col gap-8 font-sans">
      {/* 1. Welcoming Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 rounded-2xl flex items-center justify-between flex-wrap gap-4 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2 font-display">
            <Sparkles className="text-primary animate-pulse" size={20} />
            শুভ দিন, {adminName}!
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">
            আজকে আপনার তানহা ফ্যাশন স্টোরের বিবরণ এবং অর্ডারের সংক্ষিপ্ত পরিসংখ্যান নিচে দেওয়া হলো।
          </p>
        </div>
        <button 
          onClick={() => setActiveTab("orders")}
          className="bg-primary hover:bg-primary/95 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 border-none cursor-pointer transition-all shadow-xs"
        >
          <span>অর্ডার পর্যালোচনা করুন</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* 2. Primary Analytics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Earnings Card */}
        <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between transition-transform duration-300 hover:-translate-y-0.5">
          <div className="min-w-0">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">সর্বমোট বিক্রি</span>
            <span className="text-xl sm:text-2xl font-black text-foreground block mt-1.5 truncate">
              {formatBanglaPriceWithCommas(analytics.totalEarnings || 0)}
            </span>
          </div>
          <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary flex-shrink-0">
            <DollarSign size={20} />
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between transition-transform duration-300 hover:-translate-y-0.5">
          <div className="min-w-0">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">সর্বমোট অর্ডার</span>
            <span className="text-xl sm:text-2xl font-black text-foreground block mt-1.5">
              {toBanglaNumber(analytics.totalOrders || 0)} টি
            </span>
          </div>
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
            <ShoppingBag size={20} />
          </div>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between transition-transform duration-300 hover:-translate-y-0.5">
          <div className="min-w-0">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">পেনন্ডিং অর্ডার</span>
            <span className="text-xl sm:text-2xl font-black text-foreground block mt-1.5">
              {toBanglaNumber(analytics.pendingOrders || 0)} টি
            </span>
          </div>
          <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center text-amber-600 flex-shrink-0">
            <Clock size={20} />
          </div>
        </div>

        {/* Registered Customers Card */}
        <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between transition-transform duration-300 hover:-translate-y-0.5">
          <div className="min-w-0">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">নিবন্ধিত ক্রেতা</span>
            <span className="text-xl sm:text-2xl font-black text-foreground block mt-1.5">
              {toBanglaNumber(analytics.totalCustomers || 0)} জন
            </span>
          </div>
          <div className="w-10 h-10 bg-purple-50 border border-purple-100 rounded-full flex items-center justify-center text-purple-650 flex-shrink-0">
            <Users size={20} />
          </div>
        </div>
      </div>

      {/* 3. Secondary Metrics Overview Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Products Card */}
        <div className="bg-white border border-border/60 p-4 rounded-xl flex items-center gap-3.5 shadow-3xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <Package size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">সক্রিয় পণ্য</span>
            <span className="text-sm font-black text-foreground mt-0.5 block">{toBanglaNumber(analytics.totalProducts || 0)} টি</span>
          </div>
        </div>

        {/* Active Coupons Card */}
        <div className="bg-white border border-border/60 p-4 rounded-xl flex items-center gap-3.5 shadow-3xs">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center flex-shrink-0">
            <BadgePercent size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">সক্রিয় কুপন</span>
            <span className="text-sm font-black text-foreground mt-0.5 block">{toBanglaNumber(analytics.totalCoupons || 0)} টি</span>
          </div>
        </div>

        {/* Customer Reviews Card */}
        <div className="bg-white border border-border/60 p-4 rounded-xl flex items-center gap-3.5 shadow-3xs">
          <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 border border-yellow-100 flex items-center justify-center flex-shrink-0">
            <Star size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">কাস্টমার রিভিউ</span>
            <span className="text-sm font-black text-foreground mt-0.5 block">{toBanglaNumber(analytics.totalReviews || 0)} টি</span>
          </div>
        </div>

        {/* Avg Order Value Card */}
        <div className="bg-white border border-border/60 p-4 rounded-xl flex items-center gap-3.5 shadow-3xs">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center flex-shrink-0">
            <Activity size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">গড় অর্ডার মূল্য</span>
            <span className="text-sm font-black text-foreground mt-0.5 block">{formatBanglaPriceWithCommas(avgOrderValue)}</span>
          </div>
        </div>
      </div>

      {/* 4. Analytics Graphs & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sales Chart Container */}
        <div className="lg:col-span-8 bg-card border border-border/80 p-6 rounded-2xl shadow-2xs">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-sm font-bold text-foreground font-display">বিক্রির সাম্প্রতিক পরিসংখ্যান (টাকা ৳)</h3>
            <span className="text-[10px] bg-secondary text-muted-foreground py-1 px-3 rounded-full font-bold">গত ৭ দিন</span>
          </div>
          {analytics.salesChartData && analytics.salesChartData.length > 0 ? (
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value) => [`৳${value}`, "বিক্রি"]} 
                    contentStyle={{ background: "var(--card)", borderColor: "var(--border)", borderRadius: "10px", fontSize: "11px", color: "var(--foreground)" }} 
                  />
                  <Bar dataKey="sales" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-20 text-center text-muted-foreground text-xs">গ্রাফ তৈরি করার জন্য কোনো ডাটা নেই।</div>
          )}
        </div>

        {/* Side Panel: Distribution & Stock Alerts */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Low Stock Alerts */}
          <div className="bg-card border border-border/80 p-6 rounded-2xl shadow-2xs flex-grow flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground font-display flex items-center gap-1.5 mb-4">
                <AlertCircle className="text-primary" size={16} />
                কম স্টক সতর্কতা
              </h3>
              
              {lowStockProducts.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-xs font-semibold">
                  সব পণ্যের পর্যাপ্ত স্টক রয়েছে! 👍
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[160px] overflow-y-auto pr-1">
                  {lowStockProducts.slice(0, 3).map((p) => {
                    const totalStock = getProductTotalStock(p);
                    return (
                      <div key={p.id} className="flex items-center justify-between bg-secondary/50 p-2.5 rounded-lg border border-border/40 text-xs">
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-foreground truncate">{p.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">SKU: {p.sku}</div>
                        </div>
                        <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0">
                          স্টক: {totalStock} টি
                        </span>
                      </div>
                    );
                  })}
                  {lowStockProducts.length > 3 && (
                    <div className="text-[10px] text-primary font-bold text-right cursor-pointer hover:underline" onClick={() => setActiveTab("products")}>
                      আরও {toBanglaNumber(lowStockProducts.length - 3)}টি পোশাক দেখুন...
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setActiveTab("products")}
              className="w-full mt-4 bg-secondary hover:bg-primary/5 text-foreground hover:text-primary border border-border hover:border-primary/20 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <span>স্টক আপডেট করুন</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Detailed Fulfillment Lifecycle Info */}
          <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-2xs text-xs font-semibold text-slate-700 flex flex-col gap-2.5 bg-white/40">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2.5 border-b border-border/40 pb-1.5">অর্ডার বিতরণ অবস্থা</h3>
            
            <div className="flex justify-between items-center border-b border-border/30 pb-1.5">
              <span className="text-muted-foreground flex items-center gap-1.5"><Clock size={12} className="text-amber-500" /> অপেক্ষমান (Pending)</span>
              <span className="font-bold text-amber-600 font-sans">{toBanglaNumber(analytics.pendingOrders || 0)} টি</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-border/30 pb-1.5">
              <span className="text-muted-foreground flex items-center gap-1.5"><CheckCircle2 size={12} className="text-indigo-500" /> নিশ্চিতকৃত (Confirmed)</span>
              <span className="font-bold text-indigo-600 font-sans">{toBanglaNumber(analytics.confirmedOrders || 0)} টি</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-border/30 pb-1.5">
              <span className="text-muted-foreground flex items-center gap-1.5"><Truck size={12} className="text-blue-500" /> শিপড (Shipped)</span>
              <span className="font-bold text-blue-600 font-sans">{toBanglaNumber(analytics.shippedOrders || 0)} টি</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-border/30 pb-1.5">
              <span className="text-muted-foreground flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> ডেলিভারড (Delivered)</span>
              <span className="font-bold text-emerald-600 font-sans">{toBanglaNumber(analytics.deliveredOrders || 0)} টি</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-border/30 pb-1.5">
              <span className="text-muted-foreground flex items-center gap-1.5"><XCircle size={12} className="text-rose-500" /> বাতিলকৃত (Cancelled)</span>
              <span className="font-bold text-rose-600 font-sans">{toBanglaNumber(analytics.cancelledOrders || 0)} টি</span>
            </div>
            
            <div className="flex justify-between items-center pt-1">
              <span className="text-foreground font-extrabold flex items-center gap-1.5"><Activity size={12} className="text-foreground" /> সর্বমোট অর্ডার (Total)</span>
              <span className="font-extrabold text-foreground font-sans">{toBanglaNumber(analytics.totalOrders || 0)} টি</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
