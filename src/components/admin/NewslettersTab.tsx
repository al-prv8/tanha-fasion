"use client";

import React, { useState, useEffect } from "react";
import { Search, Trash2, Download, Mail, RefreshCw } from "lucide-react";
import { toBanglaNumber } from "@/lib/products";

interface SubscriberItem {
  id: string;
  email: string;
  createdAt: string;
}

interface NewslettersTabProps {
  subscribers: SubscriberItem[];
  onDeleteSubscriber: (id: string) => Promise<void>;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function NewslettersTab({
  subscribers,
  onDeleteSubscriber,
  onRefresh,
  isLoading = false
}: NewslettersTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter subscribers based on search query
  const filteredSubscribers = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Client-side CSV export
  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      alert("ডাউনলোড করার জন্য কোনো গ্রাহক তালিকা নেই।");
      return;
    }

    const headers = ["ID", "Email Address", "Subscription Date"];
    const rows = subscribers.map((sub) => [
      sub.id,
      sub.email,
      new Date(sub.createdAt).toISOString()
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `tanha_fashion_subscribers_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
            নিউজলেটার সাবস্ক্রিপশন (Newsletter)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            আপনার ইমেল প্রচারণার জন্য গ্রাহকদের সাবস্ক্রিপশন ডাটাবেস পরিচালনা করুন।
          </p>
        </div>

        <button 
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 py-2 px-4 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-xs border-none"
        >
          <Download size={13} />
          <span>CSV ফাইল ডাউনলোড (Export)</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Search Bar Section */}
        <div className="p-5 border-b border-border/60 bg-white/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:max-w-md">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="গ্রাহকের ইমেইল দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-border bg-[#FCFAF7] rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
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

          <div className="text-xs text-muted-foreground font-bold font-sans">
            মোট ফলাফল: <span className="text-primary font-black">{toBanglaNumber(filteredSubscribers.length)}</span> জন
          </div>
        </div>

        {/* Table Listing */}
        {filteredSubscribers.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">কোনো নিউজলেটার গ্রাহক পাওয়া যায়নি</p>
              <p className="text-xs text-muted-foreground mt-0.5">আপনার নিউজলেটারে এখনও কোনো গ্রাহক সাবস্ক্রাইব করেননি।</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-border/80 text-[10px] uppercase font-bold tracking-wider text-muted-foreground font-sans">
                  <th className="py-3 px-6 text-center w-16">ক্রম</th>
                  <th className="py-3 px-6">ইমেইল এড্রেস</th>
                  <th className="py-3 px-6">সাবস্ক্রিপশন তারিখ</th>
                  <th className="py-3 px-6 text-center w-28">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs text-foreground font-sans">
                {paginatedSubscribers.map((sub, index) => {
                  const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-3 px-6 text-center font-bold text-muted-foreground">
                        {toBanglaNumber(actualIndex)}
                      </td>
                    <td className="py-3 px-6 font-semibold select-all">
                      {sub.email}
                    </td>
                    <td className="py-3 px-6 text-muted-foreground font-semibold">
                      {new Date(sub.createdAt).toLocaleDateString("bn-BD", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <button
                        onClick={() => onDeleteSubscriber(sub.id)}
                        className="p-1.5 border border-border hover:border-rose-200 hover:bg-rose-50 text-muted-foreground hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                        title="গ্রাহক মুছে ফেলুন"
                      >
                        <Trash2 size={13} />
                      </button>
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
