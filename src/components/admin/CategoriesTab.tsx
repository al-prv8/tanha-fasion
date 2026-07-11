import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit3, Save, X, Layers, AlertCircle, Upload, Image as ImageIcon, RefreshCw } from "lucide-react";
import { toBanglaNumber } from "@/lib/products";

interface Category {
  id: string;
  name: string;
  englishName?: string | null;
  imgUrl?: string | null;
  bannerUrl?: string | null;
  order?: number | null;
  bannerSubtitle?: string | null;
  bannerDescription?: string | null;
  createdAt: string;
}

interface CategoriesTabProps {
  categories: Category[];
  products: any[];
  onCreateCategory: (name: string, englishName?: string, imgUrl?: string, bannerUrl?: string, order?: number, bannerSubtitle?: string, bannerDescription?: string) => Promise<void>;
  onUpdateCategory: (id: string, name: string, englishName?: string, imgUrl?: string, bannerUrl?: string, order?: number, bannerSubtitle?: string, bannerDescription?: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const PRESET_THUMBNAILS = [
  { value: "/assets/cotton_1.png", label: "সুতি থাম্বনেইল (cotton_1.png)" },
  { value: "/assets/georgette_1.png", label: "জর্জেট থাম্বনেইল (georgette_1.png)" },
  { value: "/assets/linen_1.png", label: "লিলেন থাম্বনেইল (linen_1.png)" },
  { value: "/assets/casual_abaya_1.png", label: "আবায়া থাম্বনেইল (casual_abaya_1.png)" },
  { value: "/assets/festive_borka_1.png", label: "বোরকা থাম্বনেইল (festive_borka_1.png)" },
  { value: "/assets/combo_1.png", label: "কম্বো থাম্বনেইল (combo_1.png)" },
];

const PRESET_BANNERS = [
  { value: "/assets/cotton_3pc_banner.png", label: "সুতি ব্যানার (cotton_3pc_banner.png)" },
  { value: "/assets/georgette_3pc_banner.png", label: "জর্জেট ব্যানার (georgette_3pc_banner.png)" },
  { value: "/assets/linen_3pc_banner.png", label: "লিলেন ব্যানার (linen_3pc_banner.png)" },
  { value: "/assets/casual_abaya_banner.png", label: "আবায়া ব্যানার (casual_abaya_banner.png)" },
  { value: "/assets/festive_borka_banner.png", label: "বোরকা ব্যানার (festive_borka_banner.png)" },
  { value: "/assets/combo_pack_banner.png", label: "কম্বো ব্যানার (combo_pack_banner.png)" },
];

export default function CategoriesTab({
  categories,
  products,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onRefresh,
  isLoading = false
}: CategoriesTabProps) {
  // Form input states
  const [nameInput, setNameInput] = useState("");
  const [englishNameInput, setEnglishNameInput] = useState("");
  const [imgUrlInput, setImgUrlInput] = useState("/assets/cotton_1.png");
  const [bannerUrlInput, setBannerUrlInput] = useState("/assets/cotton_3pc_banner.png");
  const [orderInput, setOrderInput] = useState<number>(0);
  const [bannerSubtitleInput, setBannerSubtitleInput] = useState("");
  const [bannerDescriptionInput, setBannerDescriptionInput] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const paginatedCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Selection states (Preset vs Custom vs Upload)
  const [thumbMode, setThumbMode] = useState<"preset" | "custom" | "upload">("preset");
  const [bannerMode, setBannerMode] = useState<"preset" | "custom" | "upload">("preset");

  // Editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingEnglishName, setEditingEnglishName] = useState("");
  const [editingImgUrl, setEditingImgUrl] = useState("");
  const [editingBannerUrl, setEditingBannerUrl] = useState("");
  const [editingOrder, setEditingOrder] = useState<number>(0);
  const [editingBannerSubtitle, setEditingBannerSubtitle] = useState("");
  const [editingBannerDescription, setEditingBannerDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "thumb" | "banner") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("ফাইলের সাইজ ৫ মেগাবাইটের বেশি হওয়া যাবে না।");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("শুধুমাত্র ছবি আপলোড করা যাবে।");
      return;
    }

    if (type === "thumb") setIsUploadingThumb(true);
    else setIsUploadingBanner(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/upload`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "ফাইল আপলোড ব্যর্থ হয়েছে।");
      }

      const data = await res.json();
      if (data.url) {
        if (editingId) {
          if (type === "thumb") setEditingImgUrl(data.url);
          else setEditingBannerUrl(data.url);
        } else {
          if (type === "thumb") setImgUrlInput(data.url);
          else setBannerUrlInput(data.url);
        }
      }
    } catch (err: any) {
      console.error("Upload failed:", err);
      setUploadError(err.message || "সার্ভারের সাথে সংযোগ স্থাপন করা যাচ্ছে না।");
    } finally {
      setIsUploadingThumb(false);
      setIsUploadingBanner(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateCategory(
        nameInput.trim(),
        englishNameInput.trim() || undefined,
        imgUrlInput.trim() || undefined,
        bannerUrlInput.trim() || undefined,
        orderInput,
        bannerSubtitleInput.trim() || undefined,
        bannerDescriptionInput.trim() || undefined
      );
      setNameInput("");
      setEnglishNameInput("");
      setImgUrlInput("/assets/cotton_1.png");
      setBannerUrlInput("/assets/cotton_3pc_banner.png");
      setOrderInput(0);
      setBannerSubtitleInput("");
      setBannerDescriptionInput("");
      setThumbMode("preset");
      setBannerMode("preset");
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
    setEditingEnglishName(cat.englishName || "");
    setEditingImgUrl(cat.imgUrl || "");
    setEditingBannerUrl(cat.bannerUrl || "");
    setEditingOrder(cat.order !== undefined && cat.order !== null ? cat.order : 0);
    setEditingBannerSubtitle(cat.bannerSubtitle || "");
    setEditingBannerDescription(cat.bannerDescription || "");
    setShowAddForm(true);

    // Set correct modes for editing fields
    const isPresetThumb = PRESET_THUMBNAILS.some(t => t.value === cat.imgUrl);
    setThumbMode(isPresetThumb ? "preset" : cat.imgUrl ? "custom" : "preset");

    const isPresetBanner = PRESET_BANNERS.some(b => b.value === cat.bannerUrl);
    setBannerMode(isPresetBanner ? "preset" : cat.bannerUrl ? "custom" : "preset");

    // Smooth scroll to top of window so the edit form is immediately visible
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) return;
    setIsSubmitting(true);
    try {
      await onUpdateCategory(
        id,
        editingName.trim(),
        editingEnglishName.trim() || undefined,
        editingImgUrl.trim() || undefined,
        editingBannerUrl.trim() || undefined,
        editingOrder,
        editingBannerSubtitle.trim() || undefined,
        editingBannerDescription.trim() || undefined
      );
      setEditingId(null);
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-foreground">
      
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">ক্যাটাগরি পরিচালনা (Categories)</h2>
          <p className="text-xs text-muted-foreground mt-0.5">হোমপেজে প্রদর্শিত টপ ক্যাটাগরি, ব্যানার ইমেজ, ও সর্টিং ক্রম নিয়ন্ত্রণ করুন।</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground font-bold font-sans bg-white border border-border/80 px-3.5 py-2 rounded-xl shadow-3xs">
            মোট: <span className="text-primary font-black">{toBanglaNumber(categories.length)}</span> টি
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center gap-1.5 text-xs font-bold disabled:opacity-50"
              title="রিলোড করুন"
            >
              <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
              <span>রিফ্রেশ</span>
            </button>
          )}
          <button 
            onClick={() => {
              if (editingId) {
                setEditingId(null);
                setEditingName("");
                setEditingEnglishName("");
                setEditingImgUrl("");
                setEditingBannerUrl("");
                setEditingOrder(0);
                setEditingBannerSubtitle("");
                setEditingBannerDescription("");
              }
              setShowAddForm(!showAddForm);
            }}
            className="inline-flex items-center gap-1.5 py-2.5 px-4 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-2xs border-none"
          >
            {showAddForm || editingId ? <X size={14} /> : <Plus size={14} />}
            <span>{showAddForm || editingId ? "ফর্ম বন্ধ করুন" : "নতুন ক্যাটাগরি যুক্ত করুন (Add Category)"}</span>
          </button>
        </div>
      </div>

      {/* 1. CREATOR PANEL (Toggled at Top) */}
      {(showAddForm || !!editingId) && (
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-2xs text-left animate-fade-in">
          <h3 className="text-sm font-bold text-foreground mb-4 pb-2 border-b border-border/40 font-display flex items-center gap-1.5">
            <Layers size={16} className="text-primary" />
            <span>{editingId ? "ক্যাটাগরি সংশোধন (Edit Category)" : "নতুন ক্যাটাগরি যুক্ত করুন (Add Category)"}</span>
          </h3>

          <form 
            onSubmit={editingId ? (e) => { e.preventDefault(); handleSaveEdit(editingId); } : handleSubmit} 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-semibold"
          >
            {/* 1. Bangla Name */}
            <div>
              <label className="block text-muted-foreground mb-1">ক্যাটাগরির নাম (বাংলা) *</label>
              <input
                type="text"
                required
                placeholder="যেমন: জয়পুরী সুতি থ্রি-পিস"
                value={editingId ? editingName : nameInput}
                onChange={(e) => editingId ? setEditingName(e.target.value) : setNameInput(e.target.value)}
                className="w-full px-3 py-2.5 border border-border bg-secondary/30 focus:bg-white rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-sans font-bold"
              />
            </div>

            {/* 2. English Name */}
            <div>
              <label className="block text-muted-foreground mb-1">ক্যাটাগরির নাম (ইংরেজি)</label>
              <input
                type="text"
                placeholder="যেমন: JAIPURI COTTON 3-PIECE"
                value={editingId ? editingEnglishName : englishNameInput}
                onChange={(e) => editingId ? setEditingEnglishName(e.target.value) : setEnglishNameInput(e.target.value)}
                className="w-full px-3 py-2.5 border border-border bg-secondary/30 focus:bg-white rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-sans uppercase font-bold"
              />
            </div>

            {/* 2.5. Sorting Order */}
            <div>
              <label className="block text-muted-foreground mb-1">সর্টিং ক্রম (Sorting Order)</label>
              <input
                type="number"
                min="0"
                placeholder="যেমন: ১"
                value={editingId ? editingOrder : orderInput}
                onChange={(e) => editingId ? setEditingOrder(Number(e.target.value)) : setOrderInput(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-border bg-secondary/30 focus:bg-white rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-sans font-bold"
              />
            </div>

            {/* 3. Thumbnail Selection */}
            <div className="border border-border/60 p-3.5 rounded-xl bg-zinc-50/40">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-muted-foreground font-extrabold text-[10px] uppercase tracking-wider">থাম্বনেইল চিত্র (Thumbnail)</label>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setThumbMode("preset")} 
                    className={`py-0.5 px-2 rounded-md text-[9px] border cursor-pointer font-bold transition-all ${thumbMode === "preset" ? 'bg-primary text-white border-primary' : 'bg-white border-border text-slate-500'}`}
                  >
                    প্রিসেট
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setThumbMode("upload")} 
                    className={`py-0.5 px-2 rounded-md text-[9px] border cursor-pointer font-bold transition-all ${thumbMode === "upload" ? 'bg-primary text-white border-primary' : 'bg-white border-border text-slate-500'}`}
                  >
                    আপলোড
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setThumbMode("custom")} 
                    className={`py-0.5 px-2 rounded-md text-[9px] border cursor-pointer font-bold transition-all ${thumbMode === "custom" ? 'bg-primary text-white border-primary' : 'bg-white border-border text-slate-500'}`}
                  >
                    লিঙ্ক
                  </button>
                </div>
              </div>

              {thumbMode === "preset" && (
                <select
                  value={editingId ? editingImgUrl : imgUrlInput}
                  onChange={(e) => editingId ? setEditingImgUrl(e.target.value) : setImgUrlInput(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-white rounded-lg text-foreground focus:outline-none font-bold"
                >
                  {PRESET_THUMBNAILS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              )}

              {thumbMode === "custom" && (
                <input
                  type="text"
                  placeholder="চিত্রের সরাসরি URL লিঙ্ক দিন..."
                  value={editingId ? editingImgUrl : imgUrlInput}
                  onChange={(e) => editingId ? setEditingImgUrl(e.target.value) : setImgUrlInput(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-white rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold"
                />
              )}

              {thumbMode === "upload" && (
                <div className="flex flex-col gap-2">
                  <div className="relative border border-dashed border-border hover:border-primary/50 bg-white rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors">
                    <Upload size={14} className="text-muted-foreground" />
                    <span className="text-[10px] font-bold text-slate-600">
                      {isUploadingThumb ? "আপলোড হচ্ছে..." : "থাম্বনেইল সিলেক্ট করুন"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "thumb")}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      disabled={isUploadingThumb}
                    />
                  </div>
                  {(editingId ? editingImgUrl : imgUrlInput) && (
                    <div className="text-[10px] text-muted-foreground truncate font-mono">
                      আপলোডেড: {editingId ? editingImgUrl : imgUrlInput}
                    </div>
                  )}
                </div>
              )}

              {/* Thumb Preview */}
              {(editingId ? editingImgUrl : imgUrlInput) && (
                <div className="mt-3 flex items-center gap-2 border-t border-border/30 pt-2.5">
                  <Image 
                    src={(editingId ? editingImgUrl : imgUrlInput) || "/assets/cotton_1.png"} 
                    alt="Preview" 
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border object-cover"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <span className="text-[10px] text-muted-foreground">থাম্বনেইল প্রিভিউ</span>
                </div>
              )}
            </div>

            {/* 4. Banner Selection */}
            <div className="border border-border/60 p-3.5 rounded-xl bg-zinc-50/40">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-muted-foreground font-extrabold text-[10px] uppercase tracking-wider">শোকেস ব্যানার (Banner)</label>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setBannerMode("preset")} 
                    className={`py-0.5 px-2 rounded-md text-[9px] border cursor-pointer font-bold transition-all ${bannerMode === "preset" ? 'bg-primary text-white border-primary' : 'bg-white border-border text-slate-500'}`}
                  >
                    প্রিসেট
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setBannerMode("upload")} 
                    className={`py-0.5 px-2 rounded-md text-[9px] border cursor-pointer font-bold transition-all ${bannerMode === "upload" ? 'bg-primary text-white border-primary' : 'bg-white border-border text-slate-500'}`}
                  >
                    আপলোড
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setBannerMode("custom")} 
                    className={`py-0.5 px-2 rounded-md text-[9px] border cursor-pointer font-bold transition-all ${bannerMode === "custom" ? 'bg-primary text-white border-primary' : 'bg-white border-border text-slate-500'}`}
                  >
                    লিঙ্ক
                  </button>
                </div>
              </div>

              {bannerMode === "preset" && (
                <select
                  value={editingId ? editingBannerUrl : bannerUrlInput}
                  onChange={(e) => editingId ? setEditingBannerUrl(e.target.value) : setBannerUrlInput(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-white rounded-lg text-foreground focus:outline-none font-bold"
                >
                  {PRESET_BANNERS.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              )}

              {bannerMode === "custom" && (
                <input
                  type="text"
                  placeholder="ব্যানারের সরাসরি URL লিঙ্ক দিন..."
                  value={editingId ? editingBannerUrl : bannerUrlInput}
                  onChange={(e) => editingId ? setEditingBannerUrl(e.target.value) : setBannerUrlInput(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-white rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold"
                />
              )}

              {bannerMode === "upload" && (
                <div className="flex flex-col gap-2">
                  <div className="relative border border-dashed border-border hover:border-primary/50 bg-white rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors">
                    <Upload size={14} className="text-muted-foreground" />
                    <span className="text-[10px] font-bold text-slate-600">
                      {isUploadingBanner ? "আপলোড হচ্ছে..." : "ব্যানার সিলেক্ট করুন"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "banner")}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      disabled={isUploadingBanner}
                    />
                  </div>
                  {(editingId ? editingBannerUrl : bannerUrlInput) && (
                    <div className="text-[10px] text-muted-foreground truncate font-mono">
                      আপলোডেড: {editingId ? editingBannerUrl : bannerUrlInput}
                    </div>
                  )}
                </div>
              )}

              {/* Banner Preview */}
              {(editingId ? editingBannerUrl : bannerUrlInput) && (
                <div className="mt-3 border-t border-border/30 pt-2.5">
                  <div className="relative aspect-[3/1] rounded-lg overflow-hidden border border-border max-w-xs">
                    <Image 
                      src={(editingId ? editingBannerUrl : bannerUrlInput) || "/assets/cotton_3pc_banner.png"} 
                      alt="Banner Preview" 
                      fill
                      sizes="320px"
                      className="object-cover"
                      onError={(e) => { (e.target as HTMLElement).parentElement!.style.display = 'none'; }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground block mt-1">ব্যানার প্রিভিউ</span>
                </div>
              )}
            </div>

            {/* 4.5. Banner Subtitle */}
            <div>
              <label className="block text-muted-foreground mb-1">ব্যানার সাবটাইটেল (Banner Subtitle)</label>
              <input
                type="text"
                placeholder="যেমন: EXQUISITE COLLECTION"
                value={editingId ? editingBannerSubtitle : bannerSubtitleInput}
                onChange={(e) => editingId ? setEditingBannerSubtitle(e.target.value) : setBannerSubtitleInput(e.target.value)}
                className="w-full px-3 py-2.5 border border-border bg-secondary/30 focus:bg-white rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-sans uppercase font-bold"
              />
            </div>

            {/* 4.6. Banner Description */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-muted-foreground mb-1">ব্যানার বিবরণ (Banner Description)</label>
              <textarea
                placeholder="যেমন: নতুন এবং আকর্ষণীয় ডিজাইনের চমৎকার প্রিমিয়াম সংগ্রহ।"
                value={editingId ? editingBannerDescription : bannerDescriptionInput}
                onChange={(e) => editingId ? setEditingBannerDescription(e.target.value) : setBannerDescriptionInput(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 border border-border bg-secondary/30 focus:bg-white rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-sans font-semibold"
              />
            </div>

            {uploadError && <div className="md:col-span-2 lg:col-span-3 text-[10px] text-primary font-bold">{uploadError}</div>}

            {/* Submit & Cancel Buttons */}
            <div className="md:col-span-2 lg:col-span-3 flex gap-2 justify-end border-t border-border/40 pt-3 mt-1">
              <button
                type="submit"
                disabled={isSubmitting || isUploadingThumb || isUploadingBanner}
                className="py-2 px-5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl border-none cursor-pointer transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {editingId ? <Save size={13} /> : <Plus size={13} />}
                <span>{editingId ? "হালনাগাদ করুন" : "যুক্ত করুন"}</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                  setEditingName("");
                  setEditingEnglishName("");
                  setEditingImgUrl("");
                  setEditingBannerUrl("");
                  setEditingOrder(0);
                  setEditingBannerSubtitle("");
                  setEditingBannerDescription("");
                }}
                className="py-2 px-5 bg-secondary hover:bg-secondary-foreground/15 border border-border text-foreground font-bold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1"
              >
                <span>বাতিল</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Safety Guard Warning Info Box */}
      <div className="bg-amber-50/50 border border-amber-250 p-4 rounded-xl text-xs leading-relaxed font-semibold text-amber-700 flex gap-2.5 text-left">
        <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h5 className="font-extrabold text-[11px] uppercase tracking-wider mb-1">গুরুত্বপূর্ণ তথ্য</h5>
          একটি ক্যাটাগরির নাম পরিবর্তন করলে সেই ক্যাটাগরির অধীনে থাকা সকল পোশাকের ক্যাটাগরির নাম ডাটাবেজে স্বয়ংক্রিয়ভাবে হালনাগাদ হবে। কোনো ক্যাটাগরির অধীনে পোশাক থাকলে তা মুছে ফেলা যাবে না।
        </div>
      </div>

      {/* Listing Categories */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-2xs text-left">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold font-display font-black">সক্রিয় ক্যাটাগরি তালিকা</h3>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-xs font-semibold">কোনো ক্যাটাগরি পাওয়া যায়নি।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-405 font-black text-[9px] uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">থাম্ব</th>
                  <th className="py-3 px-4 w-16 text-center">ক্রম</th>
                  <th className="py-3 px-4">ক্যাটাগরি নাম (Bangla/English)</th>
                  <th className="py-3 px-4 text-center">পোশাকের সংখ্যা</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {paginatedCategories.map((cat) => {
                  const productCount = products.filter(p => p.category === cat.name).length;
                  const isEditingThis = editingId === cat.id;

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Thumbnail Preview */}
                      <td className="py-3 px-4 text-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-border/80 bg-slate-100 flex items-center justify-center mx-auto">
                          {cat.imgUrl ? (
                            <Image 
                              src={cat.imgUrl || "/assets/cotton_1.png"} 
                              alt={cat.name} 
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={14} className="text-slate-400" />
                          )}
                        </div>
                      </td>

                      {/* Sorting Order */}
                      <td className="py-3 px-4 text-center font-bold font-mono text-[11px]">
                        {toBanglaNumber(cat.order || 0)}
                      </td>
                      
                      {/* Name Details */}
                      <td className="py-3.5 px-4 font-bold">
                        <div className="text-slate-900 font-extrabold">{cat.name}</div>
                        {cat.englishName && (
                          <div className="text-[10px] text-muted-foreground uppercase font-mono mt-0.5 tracking-wider">
                            {cat.englishName}
                          </div>
                        )}
                        {cat.bannerSubtitle && (
                          <div className="text-[9px] text-primary/80 uppercase font-mono mt-1 font-bold">
                            ট্যাগ: {cat.bannerSubtitle}
                          </div>
                        )}
                        {cat.bannerDescription && (
                          <div className="text-[9px] text-slate-500 mt-0.5 italic max-w-xs truncate">
                            বিবরণ: {cat.bannerDescription}
                          </div>
                        )}
                      </td>
                      
                      {/* Product count */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center justify-center font-black px-2 py-0.5 rounded-md text-[10px] ${productCount > 0 ? "bg-primary/10 text-primary border border-primary/20" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                          {toBanglaNumber(productCount)} টি পোশাক
                        </span>
                      </td>
                      
                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isEditingThis ? (
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditingName("");
                                setEditingEnglishName("");
                                setEditingImgUrl("");
                                setEditingBannerUrl("");
                                setEditingOrder(0);
                                setEditingBannerSubtitle("");
                                setEditingBannerDescription("");
                                setShowAddForm(false);
                              }}
                              className="p-1.5 bg-slate-55 hover:bg-slate-800 hover:text-white border border-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                              title="সম্পাদনা মোড বন্ধ করুন"
                            >
                              <X size={13} />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStartEdit(cat)}
                                className="p-1.5 bg-secondary hover:bg-primary/10 border border-border hover:border-primary text-foreground hover:text-primary rounded-lg cursor-pointer transition-colors"
                                title="সম্পাদনা"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => onDeleteCategory(cat.id)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-100 hover:border-rose-600 text-rose-600 rounded-lg cursor-pointer transition-colors"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
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
          <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-4 mt-4">
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
