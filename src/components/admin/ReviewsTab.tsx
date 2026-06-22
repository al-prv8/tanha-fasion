"use client";

import React, { useState } from "react";
import { Star, Trash2, Search } from "lucide-react";
import { toBanglaNumber } from "@/lib/products";

interface ReviewsTabProps {
  reviews: any[];
  onDeleteReview: (id: string) => Promise<void>;
}

export default function ReviewsTab({
  reviews,
  onDeleteReview
}: ReviewsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter reviews based on search query
  const filteredReviews = reviews.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.productName && r.productName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
            গ্রাহক রিভিউ মডারেশন (Review Moderation)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            গ্রাহকদের মন্তব্য পর্যালোচনা করুন এবং অপ্রীতিকর মন্তব্য মুছে ফেলুন।
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
              placeholder="গ্রাহকের নাম, পণ্য বা মন্তব্য দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border bg-[#FCFAF7] rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
          </div>

          <div className="text-xs text-muted-foreground font-bold font-sans">
            মোট ফলাফল: <span className="text-primary font-black">{toBanglaNumber(filteredReviews.length)}</span> টি
          </div>
        </div>

        {/* Table Listing */}
        {filteredReviews.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
              <Star size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">কোনো রিভিউ মন্তব্য পাওয়া যায়নি</p>
              <p className="text-xs text-muted-foreground mt-0.5">অনুসন্ধানের সাথে মিলে যায় এমন কোনো রিভিউ পাওয়া যায়নি।</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-border/80 text-[10px] uppercase font-bold tracking-wider text-muted-foreground font-sans">
                  <th className="py-3 px-6 text-center w-16">ক্রম</th>
                  <th className="py-3 px-6 w-40">গ্রাহকের নাম</th>
                  <th className="py-3 px-6 w-48">পণ্য/পোশাক</th>
                  <th className="py-3 px-6 w-28">রেটিং</th>
                  <th className="py-3 px-6">গ্রাহকের মন্তব্য</th>
                  <th className="py-3 px-6 w-36">রিভিউ তারিখ</th>
                  <th className="py-3 px-6 text-center w-24">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs text-foreground font-sans">
                {filteredReviews.map((r, index) => (
                  <tr key={r.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-6 text-center font-bold text-muted-foreground">
                      {toBanglaNumber(index + 1)}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {r.name}
                    </td>
                    <td className="py-4 px-6 font-semibold text-muted-foreground">
                      {r.productName || <span className="italic text-muted-foreground/40">অজানা</span>}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star 
                            key={idx} 
                            size={12} 
                            fill={idx < r.rating ? "currentColor" : "none"} 
                            stroke="currentColor" 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground font-medium italic leading-relaxed whitespace-pre-line max-w-xs md:max-w-md">
                      "{r.comment}"
                    </td>
                    <td className="py-4 px-6 text-muted-foreground font-semibold">
                      {new Date(r.createdAt || new Date()).toLocaleDateString("bn-BD", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => onDeleteReview(r.id)}
                        className="p-1.5 border border-border hover:border-rose-200 hover:bg-rose-50 text-muted-foreground hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                        title="রিভিউ মুছে ফেলুন"
                      >
                        <Trash2 size={13} />
                      </button>
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
