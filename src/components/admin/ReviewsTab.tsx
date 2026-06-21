import React from "react";
import { Star, Trash2 } from "lucide-react";
import { toBanglaNumber } from "@/lib/products";

interface ReviewsTabProps {
  reviews: any[];
  onDeleteReview: (id: string) => Promise<void>;
}

export default function ReviewsTab({
  reviews,
  onDeleteReview
}: ReviewsTabProps) {
  return (
    <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-2xs font-sans text-foreground">
      <div className="mb-6">
        <h3 className="text-sm font-bold font-display">গ্রাহক রিভিউ মডারেশন (Review Moderation)</h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">গ্রাহকদের মন্তব্য পর্যালোচনা করুন এবং অপ্রীতিকর মন্তব্য মুছে ফেলুন।</p>
      </div>

      {reviews.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground text-xs font-semibold">কোনো রিভিউ মন্তব্য পাওয়া যায়নি।</div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((r) => (
            <div 
              key={r.id} 
              className="flex justify-between items-start border border-border/60 p-4 rounded-xl hover:border-primary/30 transition-all bg-white hover:shadow-2xs"
            >
              <div className="flex-grow min-w-0 pr-4">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xs font-bold text-foreground">{r.name}</span>
                  <span className="text-[9px] text-muted-foreground font-semibold">
                    পোশাক: <span className="text-foreground">{r.productName}</span>
                  </span>
                </div>
                
                {/* Rating Stars */}
                <div className="flex gap-0.5 my-1.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star 
                      key={idx} 
                      size={11} 
                      fill={idx < r.rating ? "currentColor" : "none"} 
                      stroke="currentColor" 
                    />
                  ))}
                </div>
                
                {/* Comment */}
                <p className="text-xs text-muted-foreground leading-relaxed italic font-medium">
                  "{r.comment}"
                </p>
                
                {/* Created Date */}
                <div className="text-[9px] text-muted-foreground/60 mt-2 font-mono">
                  {new Date(r.createdAt || new Date()).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}
                </div>
              </div>
              
              {/* Delete Button */}
              <button 
                onClick={() => onDeleteReview(r.id)}
                className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-lg cursor-pointer transition-colors ml-4 flex-shrink-0"
                title="রিভিউ মুছে ফেলুন"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
