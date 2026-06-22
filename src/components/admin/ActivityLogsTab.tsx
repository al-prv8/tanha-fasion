"use client";

import React, { useState } from "react";
import { Search, Activity, Calendar } from "lucide-react";
import { toBanglaNumber } from "@/lib/products";

interface ActivityLogItem {
  id: string;
  adminName: string;
  email: string;
  action: string;
  details: string;
  createdAt: string;
}

interface ActivityLogsTabProps {
  logs: ActivityLogItem[];
  isLoading: boolean;
}

export default function ActivityLogsTab({ logs, isLoading }: ActivityLogsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = logs.filter((log) =>
    log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActionBadgeColor = (action: string) => {
    if (action.includes("CREATE")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-250";
    }
    if (action.includes("UPDATE")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (action.includes("DELETE") || action.includes("UNSUBSCRIBE")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    return "bg-purple-50 text-purple-700 border-purple-200";
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "PRODUCT_CREATE": return "পণ্য তৈরি";
      case "PRODUCT_UPDATE": return "পণ্য পরিবর্তন";
      case "PRODUCT_DELETE": return "পণ্য মুছে ফেলা";
      case "ORDER_UPDATE": return "অর্ডার আপডেট";
      case "ORDER_DELETE": return "অর্ডার মুছে ফেলা";
      case "CATEGORY_CREATE": return "ক্যাটাগরি তৈরি";
      case "CATEGORY_UPDATE": return "ক্যাটাগরি আপডেট";
      case "CATEGORY_DELETE": return "ক্যাটাগরি মুছে ফেলা";
      case "COUPON_CREATE": return "কুপন তৈরি";
      case "COUPON_UPDATE": return "কুপন আপডেট";
      case "COUPON_DELETE": return "কুপন মুছে ফেলা";
      case "FAQ_CREATE": return "এফএকিউ তৈরি";
      case "FAQ_UPDATE": return "এফএকিউ আপডেট";
      case "FAQ_DELETE": return "এফএকিউ মুছে ফেলা";
      case "ANNOUNCEMENT_CREATE": return "ঘোষণা তৈরি";
      case "ANNOUNCEMENT_UPDATE": return "ঘোষণা আপডেট";
      case "ANNOUNCEMENT_DELETE": return "ঘোষণা মুছে ফেলা";
      case "IMAGE_UPLOAD": return "ছবি আপলোড";
      case "NEWSLETTER_UNSUBSCRIBE": return "নিউজলেটার আনসাবস্ক্রাইব";
      case "REVIEW_DELETE": return "রিভিউ মুছে ফেলা";
      default: return action;
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
            অ্যাডমিন অ্যাক্টিভিটি লগ (Admin Logs)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            সিস্টেমে অ্যাডমিনদের দ্বারা করা সকল গুরুত্বপূর্ণ পরিবর্তন এবং কার্যক্রমের ইতিহাস দেখুন।
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Search Bar Section */}
        <div className="p-5 border-b border-border/60 bg-white/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="অ্যাডমিন, অ্যাকশন বা বিবরণ দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border bg-[#FCFAF7] rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
          </div>

          <div className="text-xs text-muted-foreground font-bold font-sans">
            মোট রেকর্ড: <span className="text-primary font-black">{toBanglaNumber(filteredLogs.length)}</span> টি
          </div>
        </div>

        {/* Table Listing */}
        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground text-xs font-semibold">অ্যাক্টিভিটি লগ লোড হচ্ছে...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">কোনো অ্যাক্টিভিটি রেকর্ড পাওয়া যায়নি</p>
              <p className="text-xs text-muted-foreground mt-0.5">অনুসন্ধানের সাথে মিলে যায় এমন কোনো লগ পাওয়া যায়নি।</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-border/80 text-[10px] uppercase font-bold tracking-wider text-muted-foreground font-sans">
                  <th className="py-3 px-6 text-center w-16">ক্রম</th>
                  <th className="py-3 px-6 w-52">অ্যাডমিন বিবরণ</th>
                  <th className="py-3 px-6 w-44">অ্যাকশন ধরন</th>
                  <th className="py-3 px-6">কার্যক্রম বিবরণ</th>
                  <th className="py-3 px-6 w-48">তারিখ ও সময়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs text-foreground font-sans">
                {filteredLogs.map((log, index) => (
                  <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-6 text-center font-bold text-muted-foreground">
                      {toBanglaNumber(index + 1)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{log.adminName}</div>
                      <div className="text-[10px] text-muted-foreground/80 mt-0.5 select-all">{log.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadgeColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-semibold leading-relaxed">
                      {log.details}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground font-semibold flex items-center gap-1.5 mt-1.5 border-none font-sans">
                      <Calendar size={12} className="text-slate-400" />
                      <span>
                        {new Date(log.createdAt).toLocaleDateString("bn-BD", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
