"use client";

import React, { useState, useEffect } from "react";
import { Search, Activity, Calendar, RefreshCw, X } from "lucide-react";
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
  onRefresh?: () => void;
}

const ACTION_CATEGORIES = [
  { value: "ALL", label: "সকল অ্যাকশন (All Actions)" },
  { value: "PRODUCT", label: "পণ্য (Product Operations)" },
  { value: "ORDER", label: "অর্ডার (Order Modifications)" },
  { value: "CATEGORY", label: "ক্যাটাগরি (Category Operations)" },
  { value: "COUPON", label: "কুপন (Coupon Codes)" },
  { value: "FAQ", label: "এফএকিউ (FAQ Section)" },
  { value: "ANNOUNCEMENT", label: "ঘোষণা (Announcements)" },
  { value: "IMAGE", label: "ছবি আপলোড (Uploads)" },
  { value: "NEWSLETTER", label: "নিউজলেটার (Newsletters)" },
  { value: "REVIEW", label: "রিভিউ (Customer Reviews)" }
];

export default function ActivityLogsTab({ logs, isLoading, onRefresh }: ActivityLogsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActionCat, setSelectedActionCat] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesActionCat = 
      selectedActionCat === "ALL" || 
      log.action.startsWith(selectedActionCat) ||
      (selectedActionCat === "IMAGE" && log.action.includes("IMAGE"));

    let matchesDate = true;
    if (startDate) {
      const logTime = new Date(log.createdAt).getTime();
      const startDateTime = new Date(startDate + "T00:00:00").getTime();
      matchesDate = matchesDate && logTime >= startDateTime;
    }
    if (endDate) {
      const logTime = new Date(log.createdAt).getTime();
      const endDateTime = new Date(endDate + "T23:59:59").getTime();
      matchesDate = matchesDate && logTime <= endDateTime;
    }

    return matchesSearch && matchesActionCat && matchesDate;
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedActionCat, startDate, endDate]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display text-left">
            অ্যাডমিন অ্যাক্টিভিটি লগ (Admin Logs)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 text-left">
            সিস্টেমে অ্যাডমিনদের দ্বারা করা সকল গুরুত্বপূর্ণ পরিবর্তন এবং কার্যক্রমের ইতিহাস দেখুন।
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="text-xs text-muted-foreground font-bold font-sans bg-white border border-border/80 px-3.5 py-2 rounded-xl shadow-3xs">
            মোট রেকর্ড: <span className="text-primary font-black">{toBanglaNumber(filteredLogs.length)}</span> টি
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="py-2 px-4 bg-white hover:bg-slate-50 text-slate-705 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center gap-1.5 text-xs font-bold disabled:opacity-50"
              title="রিলোড করুন"
            >
              <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
              <span>রিফ্রেশ</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Search Bar & Filters Section */}
        <div className="p-5 border-b border-border/60 bg-white/50 flex flex-col gap-4 text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className="relative">
              <label className="block text-[10px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">অনুসন্ধান করুন</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="অ্যাডমিন, অ্যাকশন বা বিবরণ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-border bg-[#FCFAF7] rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
              </div>
            </div>

            {/* Action Type Dropdown */}
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">অ্যাকশন টাইপ</label>
              <select
                value={selectedActionCat}
                onChange={(e) => setSelectedActionCat(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-[#FCFAF7] rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold text-slate-700"
              >
                {ACTION_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">শুরুর তারিখ</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-[#FCFAF7] rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold text-slate-705 font-sans"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">শেষের তারিখ</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-[#FCFAF7] rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold text-slate-705 font-sans"
              />
            </div>

          </div>

          {(searchQuery || selectedActionCat !== "ALL" || startDate || endDate) && (
            <div className="flex justify-start border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedActionCat("ALL");
                  setStartDate("");
                  setEndDate("");
                }}
                className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold"
                title="ফিল্টার মুছে ফেলুন"
              >
                <X size={13} />
                <span>ফিল্টার রিসেট</span>
              </button>
            </div>
          )}
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
                {paginatedLogs.map((log, index) => {
                  const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-6 text-center font-bold text-muted-foreground">
                        {toBanglaNumber(actualIndex)}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-4">
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
