import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, X, Store, MapPin, Phone, Clock, Calendar, Mail, AlertTriangle, RefreshCw } from "lucide-react";
import { toBanglaNumber } from "@/lib/products";

interface Branch {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  city: string;
  timings: string;
  holiday: string;
  location?: string | null;
  createdAt: string;
}

interface ShowroomsTabProps {
  branches: Branch[];
  onCreateBranch: (payload: any) => Promise<void>;
  onUpdateBranch: (id: string, payload: any) => Promise<void>;
  onDeleteBranch: (id: string) => Promise<void>;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function ShowroomsTab({ branches, onCreateBranch, onUpdateBranch, onDeleteBranch, onRefresh, isLoading = false }: ShowroomsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredBranches = branches.filter(b => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      b.name.toLowerCase().includes(query) ||
      (b.address && b.address.toLowerCase().includes(query)) ||
      (b.phone && b.phone.includes(query)) ||
      b.city.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage) || 1;
  const paginatedBranches = filteredBranches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Form states
  const [nameInput, setNameInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [cityInput, setCityInput] = useState("Dhaka");
  const [timingsInput, setTimingsInput] = useState("সকাল ১০:০০ টা - রাত ৯:০০ টা");
  const [holidayInput, setHolidayInput] = useState("বুধবার (সাপ্তাহিক বন্ধ)");
  const [locationInput, setLocationInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingBranch(null);
    setNameInput("");
    setAddressInput("");
    setPhoneInput("");
    setCityInput("Dhaka");
    setTimingsInput("সকাল ১০:০০ টা - রাত ৯:০০ টা");
    setHolidayInput("বুধবার (সাপ্তাহিক বন্ধ)");
    setLocationInput("");
    setIsModalOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setNameInput(branch.name);
    setAddressInput(branch.address || "");
    setPhoneInput(branch.phone || "");
    setCityInput(branch.city || "Dhaka");
    setTimingsInput(branch.timings || "সকাল ১০:০০ টা - রাত ৯:০০ টা");
    setHolidayInput(branch.holiday || "বুধবার (সাপ্তাহিক বন্ধ)");
    setLocationInput(branch.location || "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      alert("অনুগ্রহ করে শোরুমের নাম প্রদান করুন।");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: nameInput.trim(),
      address: addressInput.trim() || null,
      phone: phoneInput.trim() || null,
      city: cityInput.trim(),
      timings: timingsInput.trim(),
      holiday: holidayInput.trim(),
      location: locationInput.trim() || null
    };

    try {
      if (editingBranch) {
        await onUpdateBranch(editingBranch.id, payload);
      } else {
        await onCreateBranch(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2">
            <Store className="text-primary" />
            <span>শোরুম আউটলেট পরিচালনা (Showroom Management)</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            সুপার অ্যাডমিন এখান থেকে নতুন শোরুমের অবস্থান যুক্ত করতে পারেন এবং তাদের বিবরণ পরিবর্তন বা বাতিল করতে পারেন।
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground font-bold font-sans bg-white border border-border/80 px-3.5 py-2 rounded-xl shadow-3xs">
            মোট: <span className="text-primary font-black">{toBanglaNumber(branches.length)}</span> টি
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-border rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center gap-1.5 text-xs font-bold disabled:opacity-50"
              title="রিলোড করুন"
            >
              <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
              <span>রিফ্রেশ</span>
            </button>
          )}
          <button
            onClick={() => { setEditingBranch(null); setIsModalOpen(true); }}
            className="bg-primary hover:bg-primary/95 text-white font-bold text-xs py-3 px-5 rounded-xl border-none cursor-pointer flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Plus size={15} />
            <span>শোরুম যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="শোরুমের নাম, শহর বা ঠিকানা দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border bg-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-foreground"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Store size={15} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto text-left">
          <table className="w-full border-collapse text-xs text-slate-700">
            <thead>
              <tr className="bg-secondary/40 border-b border-border/80 text-muted-foreground font-black uppercase text-[10px] tracking-wider">
                <th className="py-4 px-6">শোরুম আউটলেট</th>
                <th className="py-4 px-6">শহর (City)</th>
                <th className="py-4 px-6">ঠিকানা (Address)</th>
                <th className="py-4 px-6">খোলা থাকার সময় ও বন্ধের দিন</th>
                <th className="py-4 px-6">ফোন নম্বর</th>
                <th className="py-4 px-6 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    কোনো শোরুম আউটলেট খুঁজে পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                paginatedBranches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-foreground flex items-center gap-1.5">
                        <Store size={14} className="text-primary flex-shrink-0" />
                        <span>{b.name}</span>
                      </div>
                      <div className="text-[9px] text-muted-foreground font-mono mt-0.5">ID: {b.id.slice(0, 8)}...</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        {b.city}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-650 max-w-[200px] truncate" title={b.address || ""}>
                      {b.address || "—"}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-slate-600 font-medium">
                          <Clock size={11} className="text-primary" /> {b.timings}
                        </div>
                        <div className="text-[10px] text-rose-600 font-bold">
                          {b.holiday}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-600">
                      {b.phone || "—"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/10 rounded-lg transition-all cursor-pointer"
                          title="সম্পাদনা করুন"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteBranch(b.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-card border border-border/80 shadow-xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-6 py-4 bg-white border-b border-border/80 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                <Store size={16} className="text-primary" />
                <span>{editingBranch ? "শোরুম তথ্য পরিবর্তন করুন" : "নতুন শোরুম আউটলেট যুক্ত করুন"}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg border-none bg-transparent cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">শোরুমের নাম (Showroom Name) <span className="text-primary">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Boktaboli Branch"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-foreground bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">শহর (City)</label>
                <input
                  type="text"
                  placeholder="যেমন: Narayanganj"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-foreground bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">ফোন নম্বর (Phone Number)</label>
                <input
                  type="text"
                  placeholder="যেমন: 01711111111"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-foreground bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">খোলা থাকার সময় (Timings)</label>
                <input
                  type="text"
                  placeholder="যেমন: সকাল ১০:০০ টা - রাত ৯:০০ টা"
                  value={timingsInput}
                  onChange={(e) => setTimingsInput(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-foreground bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">সাপ্তাহিক বন্ধের দিন (Weekly Holiday)</label>
                <input
                  type="text"
                  placeholder="যেমন: বুধবার (সাপ্তাহিক বন্ধ)"
                  value={holidayInput}
                  onChange={(e) => setHolidayInput(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-foreground bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">গুগল ম্যাপ লিঙ্ক (Google Maps Link / URL)</label>
                <input
                  type="text"
                  placeholder="যেমন: https://maps.app.goo.gl/..."
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-foreground bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">ঠিকানা (Full Address)</label>
                <textarea
                  placeholder="যেমন: Boktaboli, Fatullah, Narayanganj 1421"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-foreground bg-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 cursor-pointer bg-white"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl border-none cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  {isSubmitting ? "সংরক্ষণ করা হচ্ছে..." : "সংরক্ষণ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
