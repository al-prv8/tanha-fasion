"use client";

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
  BadgePercent,
  TrendingDown,
  TrendingUp,
  Store,
  Globe,
  BarChart2,
  Wallet,
  Zap,
} from "lucide-react";
import { formatBanglaPriceWithCommas, toBanglaNumber } from "@/lib/products";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface DashboardTabProps {
  analytics: {
    totalEarnings: number;
    onlineEarnings?: number;
    showroomEarnings?: number;
    totalOrders: number;
    onlineOrdersCount?: number;
    showroomOrdersCount?: number;
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
    totalCostOfGoods?: number;
    netProfit?: number;
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
  adminName = "অ্যাডমিন",
}: DashboardTabProps) {
  const lowStockProducts = products.filter((p) => {
    try {
      const sizesObj = JSON.parse(p.sizesJson || "{}");
      return Object.values(sizesObj).some((qty: any) => Number(qty) < 5);
    } catch (e) {
      return false;
    }
  });

  const avgOrderValue =
    analytics.totalOrders > 0
      ? Math.round(analytics.totalEarnings / analytics.totalOrders)
      : 0;

  const totalOrders = analytics.totalOrders || 0;
  const fulfillmentSteps = [
    { label: "অপেক্ষমান", labelEn: "Pending", count: analytics.pendingOrders || 0, color: "bg-amber-500", textColor: "text-amber-600", bgLight: "bg-amber-50", icon: <Clock size={13} /> },
    { label: "নিশ্চিত", labelEn: "Confirmed", count: analytics.confirmedOrders || 0, color: "bg-indigo-500", textColor: "text-indigo-600", bgLight: "bg-indigo-50", icon: <CheckCircle2 size={13} /> },
    { label: "শিপড", labelEn: "Shipped", count: analytics.shippedOrders || 0, color: "bg-blue-500", textColor: "text-blue-600", bgLight: "bg-blue-50", icon: <Truck size={13} /> },
    { label: "ডেলিভারড", labelEn: "Delivered", count: analytics.deliveredOrders || 0, color: "bg-emerald-500", textColor: "text-emerald-600", bgLight: "bg-emerald-50", icon: <CheckCircle2 size={13} /> },
    { label: "বাতিল", labelEn: "Cancelled", count: analytics.cancelledOrders || 0, color: "bg-rose-500", textColor: "text-rose-600", bgLight: "bg-rose-50", icon: <XCircle size={13} /> },
  ];

  const secondaryMetrics = [
    { label: "সক্রিয় পণ্য", value: `${toBanglaNumber(analytics.totalProducts || 0)} টি`, icon: <Package size={16} />, bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", tab: "products" },
    { label: "সক্রিয় কুপন", value: `${toBanglaNumber(analytics.totalCoupons || 0)} টি`, icon: <BadgePercent size={16} />, bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100", tab: "coupons" },
    { label: "মোট রিভিউ", value: `${toBanglaNumber(analytics.totalReviews || 0)} টি`, icon: <Star size={16} />, bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-100", tab: "reviews" },
    { label: "গড় অর্ডার মূল্য", value: formatBanglaPriceWithCommas(avgOrderValue), icon: <Activity size={16} />, bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-100", tab: "orders" },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">

      {/* ── Welcome Hero Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-rose-700 text-white rounded-2xl p-6 md:p-7 shadow-lg">
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-8 w-36 h-36 rounded-full bg-rose-900/20 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-rose-200 animate-pulse" />
              <span className="text-[10px] font-black text-rose-100/80 uppercase tracking-[0.18em]">তানহা ফ্যাশন অ্যাডমিন</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight font-display">
              শুভ দিন, {adminName}!
            </h2>
            <p className="text-sm text-rose-100/80 mt-1.5 font-semibold leading-relaxed max-w-lg">
              আপনার স্টোরের আজকের সারসংক্ষেপ। সব চ্যানেলের বিক্রয়, অর্ডার পরিস্থিতি এবং স্টক সতর্কতা এক নজরে দেখুন।
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab("orders")}
              className="bg-white hover:bg-rose-50 text-primary font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-1.5 border-none cursor-pointer transition-all shadow-xs whitespace-nowrap"
            >
              <span>অর্ডার দেখুন</span>
              <ArrowRight size={13} />
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className="bg-white/15 hover:bg-white/20 text-white font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-1.5 border border-white/25 cursor-pointer transition-all whitespace-nowrap"
            >
              <span>স্টক আপডেট</span>
            </button>
          </div>
        </div>

        {/* Inline KPI strip */}
        <div className="relative mt-5 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/15 rounded-xl overflow-hidden">
          {[
            { label: "মোট বিক্রি", value: formatBanglaPriceWithCommas(analytics.totalEarnings || 0), icon: <Wallet size={13} />, highlight: true },
            { label: "মোট অর্ডার", value: `${toBanglaNumber(totalOrders)} টি`, icon: <ShoppingBag size={13} /> },
            { label: "নিবন্ধিত ক্রেতা", value: `${toBanglaNumber(analytics.totalCustomers || 0)} জন`, icon: <Users size={13} /> },
            { label: "পেনন্ডিং অর্ডার", value: `${toBanglaNumber(analytics.pendingOrders || 0)} টি`, icon: <Clock size={13} /> },
          ].map((kpi, i) => (
            <div
              key={i}
              className={`flex flex-col gap-1 px-4 py-3.5 ${kpi.highlight ? "bg-white/15" : "bg-white/8"}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-100/70">
                {kpi.icon}
                {kpi.label}
              </div>
              <div className="text-lg font-black text-white leading-none font-sans">{kpi.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Revenue Split: Online vs Showroom ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Online */}
        <div className="group bg-card border border-border/80 rounded-2xl p-5 shadow-2xs text-left hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/80 rounded-full -translate-y-6 translate-x-6 pointer-events-none" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-3xs">
                  <Globe size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-[11px] text-slate-800 uppercase tracking-wider">অনলাইন স্টোর</h4>
                  <span className="text-[10px] text-muted-foreground font-semibold">Website & Payment Gateway</span>
                </div>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-black px-2.5 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                <ShoppingBag size={10} />
                {toBanglaNumber(analytics.onlineOrdersCount || 0)} টি অর্ডার
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 leading-none mb-1 font-sans">
              {formatBanglaPriceWithCommas(analytics.onlineEarnings || 0)}
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold mt-2">
              মোট বিক্রির{" "}
              <span className="text-blue-600 font-black">
                {analytics.totalEarnings > 0
                  ? `${Math.round(((analytics.onlineEarnings || 0) / analytics.totalEarnings) * 100)}%`
                  : "০%"}
              </span>{" "}
              অনলাইন চ্যানেল থেকে অর্জিত।
            </p>
            <div className="mt-3 h-1.5 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-700"
                style={{
                  width: analytics.totalEarnings > 0
                    ? `${Math.round(((analytics.onlineEarnings || 0) / analytics.totalEarnings) * 100)}%`
                    : "0%"
                }}
              />
            </div>
          </div>
        </div>

        {/* Showroom */}
        <div className="group bg-card border border-border/80 rounded-2xl p-5 shadow-2xs text-left hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/80 rounded-full -translate-y-6 translate-x-6 pointer-events-none" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-3xs">
                  <Store size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-[11px] text-slate-800 uppercase tracking-wider">শোরুম কাউন্টার</h4>
                  <span className="text-[10px] text-muted-foreground font-semibold">Physical POS Counter</span>
                </div>
              </div>
              <span className="text-[10px] bg-amber-50 text-amber-700 font-black px-2.5 py-1 rounded-full border border-amber-100 flex items-center gap-1">
                <Tag size={10} />
                {toBanglaNumber(analytics.showroomOrdersCount || 0)} টি রশিদ
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 leading-none mb-1 font-sans">
              {formatBanglaPriceWithCommas(analytics.showroomEarnings || 0)}
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold mt-2">
              মোট বিক্রির{" "}
              <span className="text-amber-600 font-black">
                {analytics.totalEarnings > 0
                  ? `${Math.round(((analytics.showroomEarnings || 0) / analytics.totalEarnings) * 100)}%`
                  : "০%"}
              </span>{" "}
              শোরুম পিওএস থেকে অর্জিত।
            </p>
            <div className="mt-3 h-1.5 bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{
                  width: analytics.totalEarnings > 0
                    ? `${Math.round(((analytics.showroomEarnings || 0) / analytics.totalEarnings) * 100)}%`
                    : "0%"
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Financial P&L Cards ── */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-rose-50/60 border border-rose-100 p-5 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-rose-600/80 uppercase tracking-wider block">পণ্যের পাইকারি মূল্য (COGS)</span>
            <span className="text-xl sm:text-2xl font-black text-rose-700 block mt-1.5 font-sans">
              {formatBanglaPriceWithCommas(analytics.totalCostOfGoods || 0)}
            </span>
          </div>
          <div className="w-11 h-11 bg-white border border-rose-100 rounded-full flex items-center justify-center text-rose-500 shadow-3xs flex-shrink-0">
            <TrendingDown size={22} />
          </div>
        </div>
        <div className="bg-emerald-50/60 border border-emerald-100 p-5 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-emerald-600/80 uppercase tracking-wider block">আনুমানিক নিট লাভ (Net Profit)</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700 block mt-1.5 font-sans">
              {formatBanglaPriceWithCommas(analytics.netProfit || 0)}
            </span>
          </div>
          <div className="w-11 h-11 bg-white border border-emerald-100 rounded-full flex items-center justify-center text-emerald-500 shadow-3xs flex-shrink-0">
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* ── Secondary Metric Pills ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {secondaryMetrics.map((m, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(m.tab)}
            className={`bg-white border border-border/60 p-4 rounded-xl flex items-center gap-3.5 shadow-3xs hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5 text-left cursor-pointer`}
          >
            <div className={`w-9 h-9 rounded-xl ${m.bg} ${m.text} border ${m.border} flex items-center justify-center flex-shrink-0`}>
              {m.icon}
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">{m.label}</span>
              <span className="text-sm font-black text-foreground mt-0.5 block">{m.value}</span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Chart + Fulfillment Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Sales Area Chart */}
        <div className="lg:col-span-8 bg-card border border-border/80 p-6 rounded-2xl shadow-2xs">
          <div className="mb-5 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-foreground font-display flex items-center gap-2">
                <BarChart2 size={16} className="text-primary" />
                বিক্রির ট্রেন্ড (Sales Trend)
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">সাম্প্রতিক বিক্রয় পরিসংখ্যান — টাকা (৳) এ</p>
            </div>
            <span className="text-[10px] bg-primary/10 text-primary py-1 px-3 rounded-full font-black border border-primary/20">গত ৭ দিন</span>
          </div>
          {analytics.salesChartData && analytics.salesChartData.length > 0 ? (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.salesChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value) => [`৳${Number(value).toLocaleString("bn-BD")}`, "বিক্রি"]}
                    contentStyle={{ background: "var(--card)", borderColor: "var(--border)", borderRadius: "12px", fontSize: "11px", color: "var(--foreground)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                    cursor={{ stroke: "var(--primary)", strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fill="url(#salesGrad)"
                    dot={{ fill: "var(--primary)", r: 3.5, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "var(--primary)", strokeWidth: 2, stroke: "white" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-20 text-center text-muted-foreground text-xs font-semibold flex flex-col items-center gap-2">
              <BarChart2 size={28} className="text-border" />
              গ্রাফ তৈরি করার জন্য কোনো ডাটা নেই।
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-5">

          {/* Fulfillment Pipeline */}
          <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-2xs flex-1">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Zap size={12} className="text-primary" />
              অর্ডার পাইপলাইন
            </h3>
            <div className="flex flex-col gap-2.5">
              {fulfillmentSteps.map((step, i) => {
                const pct = totalOrders > 0 ? Math.round((step.count / totalOrders) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`flex items-center gap-1.5 font-semibold text-muted-foreground`}>
                        <span className={step.textColor}>{step.icon}</span>
                        {step.label}
                        <span className="text-[9px] text-muted-foreground/60">({step.labelEn})</span>
                      </span>
                      <span className={`font-black font-sans ${step.textColor}`}>
                        {toBanglaNumber(step.count)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${step.color} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="mt-2 pt-2 border-t border-border/40 flex justify-between items-center text-xs">
                <span className="font-extrabold text-foreground flex items-center gap-1.5">
                  <Activity size={12} />
                  সর্বমোট (Total)
                </span>
                <span className="font-black text-foreground font-sans">{toBanglaNumber(totalOrders)} টি</span>
              </div>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={12} className="text-amber-500" />
                স্টক সতর্কতা
              </h3>
              {lowStockProducts.length > 0 && (
                <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 font-black px-2 py-0.5 rounded-full">
                  {toBanglaNumber(lowStockProducts.length)} টি পোশাক
                </span>
              )}
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground text-xs font-semibold flex flex-col items-center gap-1.5">
                <CheckCircle2 size={20} className="text-emerald-400" />
                সব পণ্যের পর্যাপ্ত স্টক!
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-0.5">
                {lowStockProducts.slice(0, 5).map((p) => {
                  let lowSizes: string[] = [];
                  try {
                    const sizesObj = JSON.parse(p.sizesJson || "{}");
                    lowSizes = Object.entries(sizesObj)
                      .filter(([, qty]: any) => Number(qty) < 5)
                      .map(([sz, qty]) => `${sz}:${qty}`);
                  } catch (e) {}

                  return (
                    <div key={p.id} className="flex items-center justify-between bg-amber-50/60 border border-amber-100 p-2.5 rounded-lg text-xs gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-800 truncate text-[11px]">{p.name}</div>
                        <div className="text-[9px] text-muted-foreground font-mono">{p.sku}</div>
                      </div>
                      <span className="bg-amber-100 border border-amber-200 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0 whitespace-nowrap">
                        {lowSizes.slice(0, 2).join(" ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setActiveTab("products")}
              className="w-full bg-secondary hover:bg-primary/5 text-foreground hover:text-primary border border-border hover:border-primary/20 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <span>স্টক আপডেট করুন</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
