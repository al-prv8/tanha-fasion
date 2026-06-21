import React, { useState } from "react";
import { Plus, Trash2, Edit3, Save, X, Layers, AlertCircle } from "lucide-react";
import { toBanglaNumber } from "@/lib/products";

interface Category {
  id: string;
  name: string;
  createdAt: string;
}

interface CategoriesTabProps {
  categories: Category[];
  products: any[];
  onCreateCategory: (name: string) => Promise<void>;
  onUpdateCategory: (id: string, name: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export default function CategoriesTab({
  categories,
  products,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory
}: CategoriesTabProps) {
  const [nameInput, setNameInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateCategory(nameInput.trim());
      setNameInput("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) return;
    setIsSubmitting(true);
    try {
      await onUpdateCategory(id, editingName.trim());
      setEditingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 font-sans text-foreground">
      
      {/* Left Column: Form to Add/Edit Category */}
      <div className="xl:col-span-5 flex flex-col gap-6">
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-2xs">
          <h3 className="text-sm font-bold mb-4 pb-2 border-b border-border/40 font-display flex items-center gap-1.5">
            <Layers size={16} className="text-primary" />
            <span>{editingId ? "ক্যাটাগরি সংশোধন (Edit Category)" : "নতুন ক্যাটাগরি যুক্ত করুন (Add Category)"}</span>
          </h3>

          <form onSubmit={editingId ? (e) => { e.preventDefault(); handleSaveEdit(editingId); } : handleSubmit} className="flex flex-col gap-4 text-xs font-semibold">
            <div>
              <label className="block text-muted-foreground mb-1">ক্যাটাগরির নাম *</label>
              <input
                type="text"
                required
                placeholder="যেমন: জয়পুরী সুতি থ্রি-পিস"
                value={editingId ? editingName : nameInput}
                onChange={(e) => editingId ? setEditingName(e.target.value) : setNameInput(e.target.value)}
                className="w-full px-3 py-2.5 border border-border bg-secondary/30 focus:bg-white rounded-lg text-foreground focus:outline-none focus:border-primary transition-all font-sans"
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl border-none cursor-pointer transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {editingId ? <Save size={13} /> : <Plus size={13} />}
                <span>{editingId ? "হালনাগাদ করুন" : "যুক্ত করুন"}</span>
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="py-2.5 px-4 bg-secondary hover:bg-secondary-foreground/15 border border-border text-foreground font-bold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1"
                >
                  <X size={13} />
                  <span>বাতিল</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Safety Guard Warning Info Box */}
        <div className="bg-amber-50/50 border border-amber-250 p-4 rounded-xl text-xs leading-relaxed font-semibold text-amber-700 flex gap-2.5">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-extrabold text-[11px] uppercase tracking-wider mb-1">গুরুত্বপূর্ণ তথ্য</h5>
            একটি ক্যাটাগরির নাম পরিবর্তন করলে সেই ক্যাটাগরির অধীনে থাকা সকল পোশাকের ক্যাটাগরির নাম ডাটাবেজে স্বয়ংক্রিয়ভাবে হালনাগাদ হবে। কোনো ক্যাটাগরির অধীনে পোশাক থাকলে তা মুছে ফেলা যাবে না।
          </div>
        </div>
      </div>

      {/* Right Column: Listing Categories */}
      <div className="xl:col-span-7 bg-card border border-border/80 rounded-2xl p-6 shadow-2xs">
        <div className="mb-6">
          <h3 className="text-sm font-bold font-display font-black">সক্রিয় ক্যাটাগরি তালিকা</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">মোট {toBanglaNumber(categories.length)}টি ক্যাটাগরি ডাটাবেজে রয়েছে।</p>
        </div>

        {categories.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-xs font-semibold">কোনো ক্যাটাগরি পাওয়া যায়নি।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-405 font-black text-[9px] uppercase tracking-wider">
                  <th className="py-3 px-4 w-16 text-center">নং</th>
                  <th className="py-3 px-4">ক্যাটাগরি নাম</th>
                  <th className="py-3 px-4 text-center">পোশাকের সংখ্যা</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {categories.map((cat, index) => {
                  const productCount = products.filter(p => p.category === cat.name).length;
                  const isEditingThis = editingId === cat.id;

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Serial Number */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {toBanglaNumber(index + 1)}
                      </td>
                      
                      {/* Name */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {isEditingThis ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="px-2.5 py-1.5 border border-border bg-white rounded-md text-xs font-bold text-slate-900 focus:outline-none focus:border-primary font-sans w-full max-w-xs"
                            autoFocus
                          />
                        ) : (
                          cat.name
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
                            <>
                              <button
                                onClick={() => handleSaveEdit(cat.id)}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-100 text-emerald-600 rounded-lg cursor-pointer transition-colors"
                                title="সংরক্ষণ"
                              >
                                <Save size={13} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1.5 bg-slate-55 hover:bg-slate-800 hover:text-white border border-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                                title="বাতিল"
                              >
                                <X size={13} />
                              </button>
                            </>
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
      </div>

    </div>
  );
}
