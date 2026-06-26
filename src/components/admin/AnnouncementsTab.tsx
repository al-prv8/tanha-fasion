"use client";

import React, { useState, useEffect } from "react";
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Search, 
  CheckCircle, 
  AlertCircle,
  RefreshCw
} from "lucide-react";

interface AnnouncementItem {
  id: string;
  text: string;
  buttonText: string | null;
  link: string | null;
  isActive: boolean;
  createdAt: string;
}

interface AnnouncementsTabProps {
  showToast: (msg: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function AnnouncementsTab({ showToast, onRefresh, isLoading = false }: AnnouncementsTabProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Add/Edit Form states
  const [text, setText] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [link, setLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data.map((c, idx) => ({ name: c.name, target: (idx + 2).toString() })));
        }
      })
      .catch((err) => console.error("Failed to load categories for select", err));
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/announcements`);
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (e) {
      console.error("Failed to fetch announcements in admin", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      alert("ঘোষণার বিবরণ অবশ্যই দিতে হবে।");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/announcements/${editingId}` 
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/announcements`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: text.trim(), 
          buttonText: buttonText.trim() || null, 
          link: link.trim() || null, 
          isActive 
        }),
        credentials: "include"
      });

      if (res.ok) {
        showToast(editingId ? "ঘোষণা সফলভাবে আপডেট করা হয়েছে।" : "নতুন ঘোষণা সফলভাবে তৈরি হয়েছে।");
        setText("");
        setButtonText("");
        setLink("");
        setIsActive(true);
        setEditingId(null);
        setShowAddForm(false);
        fetchAnnouncements();
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        alert(err.error || "ঘোষণা সংরক্ষণ করা যায়নি।");
      }
    } catch (err) {
      console.error(err);
      alert("সংযোগ ব্যর্থ হয়েছে।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (ann: AnnouncementItem) => {
    setEditingId(ann.id);
    setText(ann.text);
    setButtonText(ann.buttonText || "");
    setLink(ann.link || "");
    setIsActive(ann.isActive);
    setShowAddForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setText("");
    setButtonText("");
    setLink("");
    setIsActive(true);
    setShowAddForm(false);
  };

  const handleToggleActive = async (ann: AnnouncementItem) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/announcements/${ann.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !ann.isActive }),
        credentials: "include"
      });

      if (res.ok) {
        showToast(ann.isActive ? "ঘোষণাটি নিষ্ক্রিয় করা হয়েছে।" : "ঘোষণাটি সক্রিয় করা হয়েছে।");
        fetchAnnouncements();
        if (onRefresh) onRefresh();
      } else {
        alert("স্ট্যাটাস পরিবর্তন করা যায়নি।");
      }
    } catch (err) {
      console.error(err);
      alert("সংযোগ ব্যর্থ হয়েছে।");
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই ঘোষণাটি মুছে ফেলতে চান?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/announcements/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (res.ok) {
        showToast("ঘোষণাটি মুছে ফেলা হয়েছে।");
        if (editingId === id) {
          handleCancelEdit();
        }
        fetchAnnouncements();
        if (onRefresh) onRefresh();
      } else {
        alert("ঘোষণাটি মুছে ফেলা যায়নি।");
      }
    } catch (err) {
      console.error(err);
      alert("সংযোগ ব্যর্থ হয়েছে।");
    }
  };

  const getLinkLabel = (linkVal: string | null) => {
    if (!linkVal) return "কোনো অ্যাকশন নেই";
    if (linkVal === "/categories") return "সব পোশাক পেজ";
    if (linkVal === "/showroom") return "শোরুম আউটলেট পেজ";
    if (linkVal === "/contact") return "যোগাযোগ করুন পেজ";
    if (linkVal === "/track") return "অর্ডার ট্র্যাকিং পেজ";
    
    // Check if it's a number (scroll target)
    const idx = parseInt(linkVal, 10);
    if (!isNaN(idx)) {
      const found = categories.find(c => c.target === linkVal);
      return found ? `${found.name} কালেকশন (স্ক্রোল)` : `হোমপেজ সেকশন ${idx} (স্ক্রোল)`;
    }
    return linkVal;
  };

  const filteredAnnouncements = (() => {
    let matched = announcements;
    if (searchQuery.trim()) {
      matched = announcements.filter(ann => 
        ann.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ann.buttonText && ann.buttonText.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return matched;
  })();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const paginatedAnnouncements = filteredAnnouncements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toBanglaNumber = (num: number) => {
    return num.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-foreground">
      
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
            ঘোষণা ও অফার পরিচালনা (Announcements)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">ওয়েবসাইটের সবার উপরে থাকা অ্যানাউন্সমেন্ট বারের অফার টেক্সট ও লিংক পরিচালনা করুন।</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground font-bold font-sans bg-white border border-border/80 px-3.5 py-2 rounded-xl shadow-3xs">
            মোট: <span className="text-primary font-black">{announcements.length}</span> টি
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={async () => { await fetchAnnouncements(); if (onRefresh) onRefresh(); }}
              disabled={loading || isLoading}
              className="py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center gap-1.5 text-xs font-bold disabled:opacity-50"
              title="রিলোড করুন"
            >
              <RefreshCw size={13} className={(loading || isLoading) ? "animate-spin" : ""} />
              <span>রিফ্রেশ</span>
            </button>
          )}
          {!showAddForm && (
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-primary hover:bg-primary/95 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98] border-none"
            >
              <Plus size={15} />
              <span>নতুন ঘোষণা যুক্ত করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Add / Edit Form Panel */}
      {showAddForm && (
        <div className="bg-white border border-border/80 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
              <Megaphone size={16} className="text-primary" />
              <span>{editingId ? "ঘোষণা এডিট করুন" : "নতুন ঘোষণা তৈরি করুন"}</span>
            </h3>
            <button 
              onClick={handleCancelEdit}
              className="text-muted-foreground hover:text-foreground p-1 hover:bg-secondary rounded-lg transition-colors border-none cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">ঘোষণার টেক্সট *</label>
              <textarea 
                rows={2}
                placeholder="যেমন: 🎉 পূজা ও ঈদ সংস্করণ — ২০% ছাড়ের জন্য TANHA20 ব্যবহার করুন!"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">বাটন টেক্সট (ঐচ্ছিক)</label>
                <input 
                  type="text" 
                  placeholder="যেমন: সংগ্রহ দেখুন →"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">বাটন অ্যাকশন / লিংক (ঐচ্ছিক)</label>
                <select
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border bg-[#FCFAF7] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground font-semibold"
                >
                  <option value="">কোনো লিংক নেই</option>
                  <optgroup label="নির্দিষ্ট পেজে নিয়ে যান (Static Pages)">
                    <option value="/categories">সব পোশাক (All Products)</option>
                    <option value="/showroom">শোরুম আউটলেট (Showroom Outlet)</option>
                    <option value="/contact">যোগাযোগ করুন (Contact Us)</option>
                    <option value="/track">অর্ডার ট্র্যাকিং (Order Tracking)</option>
                  </optgroup>
                  <optgroup label="হোমপেজে স্ক্রোল করুন (Categories Scroll)">
                    {categories.map((cat) => (
                      <option key={cat.target} value={cat.target}>
                        {cat.name} কালেকশন
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>            </div>

            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
              />
              <label htmlFor="isActive" className="text-xs font-bold text-foreground cursor-pointer select-none">
                এই ঘোষণাটি ওয়েবসাইটে সক্রিয় (Active) রাখুন
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-border/40">
              <button 
                type="button"
                onClick={handleCancelEdit}
                className="bg-transparent hover:bg-secondary text-foreground py-2 px-4 rounded-xl text-xs font-bold transition-all border border-border cursor-pointer"
              >
                বাতিল
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/95 text-white py-2 px-5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <span>{editingId ? "হালনাগাদ করুন" : "সংরক্ষণ করুন"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Table Panel */}
      <div className="bg-white border border-border/80 rounded-2xl shadow-sm overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-border/60 bg-white/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full sm:max-w-md">
            <div className="relative flex-grow">
              <input 
                type="text"
                placeholder="ঘোষণা খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
            </div>
          </div>
        </div>

        {/* Announcements List / Table */}
        {loading ? (
          <div className="py-12 text-center text-muted-foreground text-xs font-semibold">
            লোডিং হচ্ছে...
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
            <AlertCircle size={24} className="text-muted-foreground/60" />
            <span className="text-xs font-bold">কোনো ঘোষণা পাওয়া যায়নি।</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-secondary/40 border-b border-border/80 text-foreground font-extrabold">
                  <th className="py-3.5 px-4 font-bold w-12">নং</th>
                  <th className="py-3.5 px-4 font-bold">ঘোষণার টেক্সট</th>
                  <th className="py-3.5 px-4 font-bold">বাটন টেক্সট</th>
                  <th className="py-3.5 px-4 font-bold">বাটন অ্যাকশন</th>
                  <th className="py-3.5 px-4 font-bold w-24 text-center">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 font-bold w-28 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paginatedAnnouncements.map((ann, idx) => {
                  const actualIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                  return (
                    <tr key={ann.id} className="hover:bg-secondary/15 transition-colors">
                      <td className="py-4 px-4 font-bold text-muted-foreground">{actualIndex}</td>
                    <td className="py-4 px-4 font-semibold text-foreground max-w-sm whitespace-normal leading-relaxed">
                      {ann.text}
                    </td>
                    <td className="py-4 px-4 font-medium text-muted-foreground">
                      {ann.buttonText || <span className="italic text-muted-foreground/40">নেই</span>}
                    </td>
                    <td className="py-4 px-4 font-semibold text-muted-foreground">
                      {getLinkLabel(ann.link)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(ann)}
                        className="bg-transparent border-none cursor-pointer focus:outline-none p-1 text-muted-foreground hover:text-foreground transition-colors"
                        title={ann.isActive ? "নিষ্ক্রিয় করতে ক্লিক করুন" : "সক্রিয় করতে ক্লিক করুন"}
                      >
                        {ann.isActive ? (
                          <div className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-bold text-[10px]">
                            <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                            <span>সক্রিয়</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full font-bold text-[10px]">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                            <span>নিষ্ক্রিয়</span>
                          </div>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleStartEdit(ann)}
                          className="p-1.5 border border-border rounded-lg text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer bg-transparent"
                          title="সম্পাদনা করুন"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(ann.id)}
                          className="p-1.5 border border-border rounded-lg text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer bg-transparent"
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
