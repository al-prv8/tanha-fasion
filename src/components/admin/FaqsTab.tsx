"use client";

import React, { useState, useEffect } from "react";
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Search, 
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { toBanglaNumber } from "@/lib/products";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
  createdAt: string;
}

interface FaqsTabProps {
  showToast: (msg: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function FaqsTab({ showToast, onRefresh, isLoading = false }: FaqsTabProps) {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Add/Edit Form states
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [order, setOrder] = useState("0");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/faqs`);
      if (res.ok) {
        const data = await res.json();
        setFaqs(data);
      }
    } catch (e) {
      console.error("Failed to fetch FAQs in admin", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      alert("প্রশ্ন ও উত্তর অবশ্যই দিতে হবে।");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/faqs/${editingId}` 
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/faqs`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, order: Number(order) }),
        credentials: "include"
      });

      if (res.ok) {
        showToast(editingId ? "এফএকিউ সফলভাবে আপডেট করা হয়েছে।" : "নতুন এফএকিউ সফলভাবে তৈরি হয়েছে।");
        setQuestion("");
        setAnswer("");
        setOrder("0");
        setEditingId(null);
        setShowAddForm(false);
        fetchFaqs();
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        alert(err.error || "এফএকিউ সংরক্ষণ করা যায়নি।");
      }
    } catch (err) {
      console.error(err);
      alert("সংযোগ ব্যর্থ হয়েছে।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (faq: FaqItem) => {
    setEditingId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setOrder(faq.order.toString());
    setShowAddForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setQuestion("");
    setAnswer("");
    setOrder("0");
    setShowAddForm(false);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই প্রশ্নটি মুছে ফেলতে চান?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/faqs/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (res.ok) {
        showToast("এফএকিউ মুছে ফেলা হয়েছে।");
        if (editingId === id) {
          handleCancelEdit();
        }
        fetchFaqs();
        if (onRefresh) onRefresh();
      } else {
        alert("এফএকিউ মুছে ফেলা যায়নি।");
      }
    } catch (err) {
      console.error(err);
      alert("সংযোগ ব্যর্থ হয়েছে।");
    }
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredFaqs.length / itemsPerPage);
  const paginatedFaqs = filteredFaqs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6 font-sans text-foreground">
      
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">এফএকিউ পরিচালনা (FAQs)</h2>
          <p className="text-xs text-muted-foreground mt-0.5">হোমপেজে প্রদর্শিত সচরাচর জিজ্ঞাসিত প্রশ্ন ও উত্তরগুলোর তালিকা এবং সর্টিং ক্রম নিয়ন্ত্রণ করুন।</p>
        </div>

        <button 
          onClick={() => {
            if (editingId) {
              handleCancelEdit();
            }
            setShowAddForm(!showAddForm);
          }}
          className="inline-flex items-center gap-1.5 py-2.5 px-4 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-2xs border-none"
        >
          {showAddForm || editingId ? <X size={14} /> : <Plus size={14} />}
          <span>{showAddForm || editingId ? "ফর্ম বন্ধ করুন" : "নতুন এফএকিউ যুক্ত করুন (Add FAQ)"}</span>
        </button>
      </div>

      {/* 1. CREATOR PANEL (Toggled at Top) */}
      {(showAddForm || !!editingId) && (
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-2xs text-left animate-fade-in">
          <h3 className="text-sm font-bold text-foreground mb-4 pb-2 border-b border-border/40 font-display flex items-center gap-1.5">
            <HelpCircle size={16} className="text-primary" />
            <span>{editingId ? "এফএকিউ সংশোধন (Edit FAQ)" : "নতুন এফএকিউ যুক্ত করুন (Add FAQ)"}</span>
          </h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 text-xs font-semibold">
            {/* 1. Question */}
            <div>
              <label className="block text-muted-foreground mb-1">প্রশ্ন (Question) *</label>
              <input
                type="text"
                required
                placeholder="যেমন: ক্যাশ অন ডেলিভারি আছে কি?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-3 py-2.5 border border-border bg-secondary/30 focus:bg-white rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-sans font-bold"
              />
            </div>

            {/* 2. Answer */}
            <div>
              <label className="block text-muted-foreground mb-1">উত্তর (Answer) *</label>
              <textarea
                required
                placeholder="যেমন: হ্যাঁ, সারা বাংলাদেশে কোনো এডভান্স পেমেন্ট ছাড়াই শতভাগ ক্যাশ অন ডেলিভারি সুবিধা রয়েছে।"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 border border-border bg-secondary/30 focus:bg-white rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-sans font-bold leading-relaxed"
              />
            </div>

            {/* 3. Sorting Order */}
            <div className="w-32">
              <label className="block text-muted-foreground mb-1">সর্টিং ক্রম (Order)</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full px-3 py-2.5 border border-border bg-secondary/30 focus:bg-white rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-mono font-bold"
                min="0"
              />
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex gap-2 justify-end border-t border-border/40 pt-3 mt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2 px-5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl border-none cursor-pointer transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {editingId ? <Save size={13} /> : <Plus size={13} />}
                <span>{editingId ? "হালনাগাদ করুন" : "সংরক্ষণ করুন"}</span>
              </button>
              
              <button
                type="button"
                onClick={handleCancelEdit}
                className="py-2 px-5 bg-secondary hover:bg-secondary-foreground/15 border border-border text-foreground font-bold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1"
              >
                <span>বাতিল</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Info Alert Box */}
      <div className="bg-amber-50/50 border border-amber-250 p-4 rounded-xl text-xs leading-relaxed font-semibold text-amber-700 flex gap-2.5 text-left">
        <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h5 className="font-extrabold text-[11px] uppercase tracking-wider mb-1">গুরুত্বপূর্ণ তথ্য</h5>
          এফএকিউ সর্টিং ক্রম (Sorting Order) অনুযায়ী হোমপেজে সাজানো হবে। সর্টিং ক্রম যত ছোট হবে, প্রশ্নটি হোমপেজে তত উপরে প্রদর্শিত হবে।
        </div>
      </div>

      {/* Listing FAQs */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-2xs text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-border/40 pb-4">
          <div>
            <h3 className="text-sm font-bold font-display font-black">সক্রিয় এফএকিউ তালিকা</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">মোট {toBanglaNumber(faqs.length)}টি এফএকিউ ডাটাবেজে রয়েছে।</p>
          </div>
          
          {/* Quick Search */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:max-w-md justify-end">
            <div className="relative flex-grow max-w-xs">
              <input 
                type="text" 
                placeholder="প্রশ্ন বা উত্তর খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs text-foreground placeholder-slate-405 transition-all font-semibold"
              />
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <button
              type="button"
              onClick={async () => {
                await fetchFaqs();
                if (onRefresh) onRefresh();
              }}
              className="p-2 bg-white hover:bg-slate-50 text-slate-655 hover:text-slate-800 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center gap-1.5"
              title="রিলোড করুন"
            >
              <RefreshCw size={13} className={(loading || isLoading) ? "animate-spin" : ""} />
              <span className="text-[10px] font-bold hidden sm:inline">রিফ্রেশ</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted-foreground text-xs font-semibold">এফএকিউ লোড হচ্ছে...</div>
        ) : filteredFaqs.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-xs font-semibold">কোনো এফএকিউ পাওয়া যায়নি।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-405 font-black text-[9px] uppercase tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">নং</th>
                  <th className="py-3 px-4">এফএকিউ বিবরণ</th>
                  <th className="py-3 px-4 w-16 text-center">ক্রম</th>
                  <th className="py-3 px-4 w-20 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {paginatedFaqs.map((faq, index) => {
                  const isEditingThis = editingId === faq.id;
                  const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr key={faq.id} className={`hover:bg-slate-50/40 transition-colors ${isEditingThis ? "bg-primary/5" : ""}`}>
                      {/* Serial Number */}
                      <td className="py-4 px-4 text-center font-bold text-slate-400">
                        {toBanglaNumber(actualIndex)}
                      </td>
                      
                      {/* FAQ Text Details */}
                      <td className="py-4 px-4">
                        <div className="text-slate-900 font-extrabold mb-1.5 leading-snug">{faq.question}</div>
                        <div className="text-[11px] text-muted-foreground font-semibold leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </div>
                      </td>
                      
                      {/* Sorting Order */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center font-black px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px]">
                          {toBanglaNumber(faq.order)}
                        </span>
                      </td>
                      
                      {/* Actions */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit(faq)}
                            disabled={isSubmitting}
                            className={`p-1.5 border rounded-lg cursor-pointer transition-colors ${
                              isEditingThis 
                                ? "bg-primary text-white border-primary" 
                                : "bg-secondary hover:bg-primary/10 border-border hover:border-primary text-foreground hover:text-primary"
                            }`}
                            title="সম্পাদনা"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(faq.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-100 hover:border-rose-600 text-rose-600 rounded-lg cursor-pointer transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
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
          <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-4 mt-4 bg-white">
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
