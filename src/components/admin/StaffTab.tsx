import React, { useState } from "react";
import { Plus, Trash2, Edit3, X, User, ShieldCheck, Mail, Phone, Lock, Key, AlertTriangle, CheckSquare, Square } from "lucide-react";
import { toBanglaNumber } from "@/lib/products";

interface Branch {
  id: string;
  name: string;
}

interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
  branchId?: string | null;
  branch?: Branch | null;
  allowedModules?: string | null;
  createdAt: string;
}

interface StaffTabProps {
  staff: StaffUser[];
  branches: Branch[];
  onCreateStaff: (payload: any) => Promise<void>;
  onUpdateStaff: (id: string, payload: any) => Promise<void>;
  onDeleteStaff: (id: string) => Promise<void>;
}

const MODULES_MAP = {
  online: [
    { id: "online_dashboard", label: "ড্যাশবোর্ড (Dashboard)" },
    { id: "online_orders", label: "অনলাইন অর্ডার (Web Orders)" },
    { id: "online_products", label: "অনলাইন পণ্য ক্যাটালগ (Products)" },
    { id: "online_categories", label: "ক্যাটাগরি পরিচালনা (Categories)" },
    { id: "online_coupons", label: "কুপন পরিচালনা (Coupons)" },
    { id: "online_reviews", label: "রিভিউ মডারেশন (Reviews)" },
    { id: "online_faqs", label: "এফএকিউ পরিচালনা (FAQs)" },
    { id: "online_announcements", label: "ঘোষণা পরিচালনা (Announcements)" },
    { id: "online_newsletters", label: "নিউজলেটার গ্রাহক (Newsletters)" },
    { id: "online_logs", label: "অ্যাক্টিভিটি লগ (Activity Logs)" },
  ],
  showroom: [
    { id: "showroom_pos", label: "পিওএস ক্যাশিয়ার কাউন্টার (POS Counter)" },
    { id: "showroom_stock", label: "শোরুম স্টক ও বারকোড (Stock & Barcode)" },
    { id: "showroom_purchases", label: "পাইকারি ক্রয় এন্ট্রি (Wholesale)" },
    { id: "showroom_orders", label: "শোরুম বিক্রয় ইতিহাস (Sales History)" },
    { id: "showroom_expenses", label: "শোরুম ব্যয় রেজিস্ট্রি (Expenses Log)" },
  ]
};

export default function StaffTab({ staff, branches, onCreateStaff, onUpdateStaff, onDeleteStaff }: StaffTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);

  // Form states
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [roleInput, setRoleInput] = useState("BRANCH_MANAGER");
  const [branchIdInput, setBranchIdInput] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingStaff(null);
    setNameInput("");
    setEmailInput("");
    setPasswordInput("");
    setPhoneInput("");
    setRoleInput("BRANCH_MANAGER");
    setBranchIdInput(branches.length > 0 ? branches[0].id : "");
    // Default allowed modules for manager
    setSelectedModules([
      "showroom_pos",
      "showroom_stock",
      "showroom_purchases",
      "showroom_orders",
      "showroom_expenses"
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (user: StaffUser) => {
    setEditingStaff(user);
    setNameInput(user.name);
    setEmailInput(user.email);
    setPasswordInput(""); // Empty for security
    setPhoneInput(user.phone || "");
    setRoleInput(user.role === "ADMIN" ? "SUPER_ADMIN" : user.role);
    setBranchIdInput(user.branchId || (branches.length > 0 ? branches[0].id : ""));
    
    // Parse current modules
    if (user.allowedModules) {
      setSelectedModules(user.allowedModules.split(",").map(m => m.trim()));
    } else if (user.role === "BRANCH_MANAGER") {
      // Default fallback
      setSelectedModules([
        "showroom_pos",
        "showroom_stock",
        "showroom_purchases",
        "showroom_orders",
        "showroom_expenses"
      ]);
    } else {
      setSelectedModules([]);
    }
    
    setIsModalOpen(true);
  };

  const toggleModule = (moduleId: string) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSelectAllShowroom = () => {
    const ids = MODULES_MAP.showroom.map(m => m.id);
    const otherSelected = selectedModules.filter(m => !ids.includes(m));
    if (ids.every(id => selectedModules.includes(id))) {
      setSelectedModules(otherSelected);
    } else {
      setSelectedModules([...otherSelected, ...ids]);
    }
  };

  const handleSelectAllOnline = () => {
    const ids = MODULES_MAP.online.map(m => m.id);
    const otherSelected = selectedModules.filter(m => !ids.includes(m));
    if (ids.every(id => selectedModules.includes(id))) {
      setSelectedModules(otherSelected);
    } else {
      setSelectedModules([...otherSelected, ...ids]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !emailInput.trim() || (!editingStaff && !passwordInput.trim())) {
      alert("অনুগ্রহ করে সব আবশ্যক ফিল্ড পূরণ করুন।");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: nameInput.trim(),
      email: emailInput.trim(),
      phone: phoneInput.trim() || null,
      role: roleInput,
      branchId: roleInput === "BRANCH_MANAGER" ? branchIdInput : null,
      allowedModules: roleInput === "SUPER_ADMIN" ? null : selectedModules.join(","),
      ...(passwordInput.trim() && { password: passwordInput.trim() })
    };

    try {
      if (editingStaff) {
        await onUpdateStaff(editingStaff.id, payload);
      } else {
        await onCreateStaff(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = staff.filter(user => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.phone && user.phone.includes(query))
    );
  });

  const getRoleLabel = (role: string) => {
    if (role === "SUPER_ADMIN" || role === "ADMIN") return "সুপার অ্যাডমিন";
    if (role === "BRANCH_MANAGER") return "শোরুম ম্যানেজার";
    return role;
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2">
            <User className="text-primary" />
            <span>কর্মী ও প্যানেল মডারেটর তালিকা (Staff Management)</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            সুপার অ্যাডমিন এখান থেকে নতুন শোরুম ম্যানেজার বা অ্যাডমিন যুক্ত করতে পারেন এবং তাদের ব্যক্তিগত মডিউল অ্যাক্সেস কন্ট্রোল করতে পারেন।
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-primary hover:bg-primary/95 text-white font-bold text-xs py-3 px-5 rounded-xl border-none cursor-pointer flex items-center justify-center gap-2 transition-all shadow-xs self-start"
        >
          <Plus size={15} />
          <span>কর্মী যুক্ত করুন</span>
        </button>
      </div>

      {/* Control bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="কর্মীর নাম, ইমেইল বা মোবাইল দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border bg-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-foreground"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <User size={15} />
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto text-left">
          <table className="w-full border-collapse text-xs text-slate-700">
            <thead>
              <tr className="bg-secondary/40 border-b border-border/80 text-muted-foreground font-black uppercase text-[10px] tracking-wider">
                <th className="py-4 px-6">কর্মীর নাম ও পরিচিতি</th>
                <th className="py-4 px-6">ভূমিকা (Role)</th>
                <th className="py-4 px-6">কর্মক্ষেত্র (Branch)</th>
                <th className="py-4 px-6">অনুমোদিত মডিউলসমূহ</th>
                <th className="py-4 px-6">যোগদানের তারিখ</th>
                <th className="py-4 px-6 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    কোনো কর্মী খুঁজে পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredStaff.map((user) => {
                  const allowedList = user.allowedModules 
                    ? user.allowedModules.split(",").map(m => m.replace(/^(online_|showroom_)/, "")) 
                    : user.role === "SUPER_ADMIN" || user.role === "ADMIN"
                      ? ["All Modules"]
                      : ["showroom_pos", "showroom_stock", "showroom_purchases", "showroom_orders", "showroom_expenses"].map(m => m.replace("showroom_", ""));

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-foreground">{user.name}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Mail size={10} /> {user.email}
                          {user.phone && (
                            <>
                              <span className="text-slate-300">|</span>
                              <Phone size={10} /> {user.phone}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          user.role === "SUPER_ADMIN" || user.role === "ADMIN"
                            ? "bg-indigo-50 border-indigo-250 text-indigo-700"
                            : "bg-emerald-50 border-emerald-250 text-emerald-700"
                        }`}>
                          <ShieldCheck size={11} />
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-600">
                        {user.role === "SUPER_ADMIN" || user.role === "ADMIN" ? (
                          <span className="text-slate-400 font-medium">অনলাইন প্রধান কার্যালয়</span>
                        ) : (
                          user.branch?.name || "কোনো শাখা নেই"
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1 max-w-[280px]">
                          {allowedList.map((m, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-bold border border-slate-200 uppercase tracking-tight">
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-muted-foreground text-[10px]">
                        {new Date(user.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "numeric", day: "numeric" })}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/10 rounded-lg transition-all cursor-pointer"
                            title="সম্পাদনা করুন"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteStaff(user.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-card border border-border/80 shadow-xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-6 py-4 bg-white border-b border-border/80 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                <User size={16} className="text-primary" />
                <span>{editingStaff ? "কর্মী তথ্য পরিবর্তন করুন" : "নতুন কর্মী নিবন্ধন"}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg border-none bg-transparent cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
              {/* Name */}
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">নাম (Full Name) <span className="text-primary">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: আবদুর রহমান"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-foreground bg-white"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">ইমেইল (Email) <span className="text-primary">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="যেমন: rahman@tanha.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-foreground bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">মোবাইল নম্বর (Phone)</label>
                  <input
                    type="tel"
                    placeholder="যেমন: 017XXXXXXXX"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-foreground bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">
                  পাসওয়ার্ড (Password) {!editingStaff && <span className="text-primary">*</span>}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required={!editingStaff}
                    placeholder={editingStaff ? "পরিবর্তন করতে চাইলে টাইপ করুন, অন্যথায় খালি রাখুন" : "কমপক্ষে ৬ সংখ্যার পাসওয়ার্ড"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-foreground bg-white"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Key size={14} />
                  </div>
                </div>
              </div>

              {/* Role & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">ভূমিকা (Role) <span className="text-primary">*</span></label>
                  <select
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-foreground bg-white"
                  >
                    <option value="BRANCH_MANAGER">শোরুম ম্যানেজার (Branch Manager)</option>
                    <option value="SUPER_ADMIN">সুপার অ্যাডমিন (Super Admin)</option>
                  </select>
                </div>
                {roleInput === "BRANCH_MANAGER" && (
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">কর্মক্ষেত্র শোরুম (Branch) <span className="text-primary">*</span></label>
                    <select
                      value={branchIdInput}
                      onChange={(e) => setBranchIdInput(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-foreground bg-white"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Allowed Modules Checklist (Hidden for Super Admins since they always have full access) */}
              {roleInput !== "SUPER_ADMIN" && (
                <div className="border border-border/80 rounded-xl p-4 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-foreground uppercase tracking-wider">মডিউল অ্যাক্সেস কন্ট্রোল</h5>
                    <span className="text-[10px] text-muted-foreground font-semibold">প্যানেল মডিউল যুক্ত বা বাদ দিন</span>
                  </div>

                  {/* Showroom Modules Block */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-border/50">
                      <span className="text-[10px] font-black text-slate-500 uppercase">শোরুম মডিউল (Showroom Panels)</span>
                      <button
                        type="button"
                        onClick={handleSelectAllShowroom}
                        className="text-[9px] text-primary font-bold hover:underline border-none bg-transparent cursor-pointer"
                      >
                        All
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {MODULES_MAP.showroom.map(m => {
                        const isChecked = selectedModules.includes(m.id);
                        return (
                          <div
                            key={m.id}
                            onClick={() => toggleModule(m.id)}
                            className="flex items-center gap-2 cursor-pointer select-none text-[11px] font-semibold text-slate-700 hover:text-foreground"
                          >
                            <span className="text-primary">
                              {isChecked ? <CheckSquare size={14} /> : <Square size={14} />}
                            </span>
                            <span>{m.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Online Modules Block */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between pb-1 border-b border-border/50">
                      <span className="text-[10px] font-black text-slate-500 uppercase">অনলাইন স্টোর মডিউল (Online Store Panels)</span>
                      <button
                        type="button"
                        onClick={handleSelectAllOnline}
                        className="text-[9px] text-primary font-bold hover:underline border-none bg-transparent cursor-pointer"
                      >
                        All
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {MODULES_MAP.online.map(m => {
                        const isChecked = selectedModules.includes(m.id);
                        return (
                          <div
                            key={m.id}
                            onClick={() => toggleModule(m.id)}
                            className="flex items-center gap-2 cursor-pointer select-none text-[11px] font-semibold text-slate-700 hover:text-foreground"
                          >
                            <span className="text-primary">
                              {isChecked ? <CheckSquare size={14} /> : <Square size={14} />}
                            </span>
                            <span>{m.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

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
