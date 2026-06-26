import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Search, 
  Clock, 
  CheckCircle, 
  Truck, 
  Package, 
  XCircle,
  Printer,
  Edit,
  Save,
  Trash,
  CreditCard,
  User,
  Mail,
  Phone,
  AlertTriangle,
  ChevronDown,
  ShoppingBag,
  RefreshCw
} from "lucide-react";
import { formatBanglaPriceWithCommas, toBanglaNumber } from "@/lib/products";

interface OrdersTabProps {
  orders: any[];
  orderSearch: string;
  setOrderSearch: (search: string) => void;
  onUpdateOrderStatus: (orderId: string, status: string) => Promise<void>;
  onUpdatePaymentStatus: (orderId: string, status: string) => Promise<void>;
  onUpdateOrderInfo: (orderId: string, info: any) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
  onBookSteadfast?: (orderId: string, codAmount: number, note: string) => Promise<any>;
  onSyncSteadfast?: (orderId: string) => Promise<any>;
  onRefresh?: () => void;
  isLoading?: boolean;
}

interface CourierBookingFormProps {
  order: any;
  onBook: (codAmount: number, note: string) => Promise<void>;
}

function CourierBookingForm({ order, onBook }: CourierBookingFormProps) {
  const defaultCod = order.paymentMethod === "cod" && order.paymentStatus === "UNPAID" ? order.grandTotal : 0;
  const [codAmount, setCodAmount] = useState<string>(String(defaultCod));
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const parsedCod = parseFloat(codAmount);
      await onBook(isNaN(parsedCod) ? 0 : parsedCod, note);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs font-semibold text-slate-800">
      <div className="grid grid-cols-2 gap-2 text-left">
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">সিওডি (COD) পরিমাণ *</label>
          <input 
            type="number" 
            required
            value={codAmount}
            onChange={(e) => setCodAmount(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-border bg-slate-50 focus:bg-white rounded-lg text-foreground focus:outline-none focus:border-primary font-sans"
          />
        </div>
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">অর্ডার মোট মূল্য</label>
          <div className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-bold font-sans">
            ৳ {formatBanglaPriceWithCommas(order.grandTotal)}
          </div>
        </div>
      </div>
      <div className="text-left">
        <label className="block text-[10px] text-muted-foreground mb-1">কুরিয়ার ডেলিভারি নোট</label>
        <input 
          type="text" 
          placeholder="যেমন: সাবধানে ডেলিভারি করুন"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-2 py-1.5 border border-border bg-slate-50 focus:bg-white rounded-lg text-foreground focus:outline-none focus:border-primary font-sans"
        />
      </div>
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full py-2 bg-primary hover:bg-primary/95 text-white border-none font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1 shadow-2xs disabled:opacity-50"
      >
        <span>Steadfast এ বুক করুন</span>
      </button>
    </form>
  );
}

export default function OrdersTab({
  orders,
  orderSearch,
  setOrderSearch,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
  onUpdateOrderInfo,
  onDeleteOrder,
  onBookSteadfast,
  onSyncSteadfast,
  onRefresh,
  isLoading = false
}: OrdersTabProps) {
  // Tab-level filter status: "ALL" | "UNFULFILLED" | "UNPAID" | "PAID" | "DELIVERED" | "CANCELLED"
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [channelFilter, setChannelFilter] = useState<"ALL" | "ONLINE" | "SHOWROOM">("ALL");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "bkash": return "বিকাশ";
      case "nagad": return "নগদ";
      case "cod": return "ক্যাশ অন ডেলিভারি";
      case "card": return "কার্ড";
      default: return method;
    }
  };

  // Selection states for inline row expansion
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // Editing state for detailed client fields
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formPostcode, setFormPostcode] = useState("");
  const [formTrxId, setFormTrxId] = useState("");
  const [formPaymentMethod, setFormPaymentMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status transitions states inside row selects
  const [isUpdatingPayment, setIsUpdatingPayment] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Initialize fields on editing selection change
  useEffect(() => {
    if (editingOrderId) {
      const editingOrder = orders.find(o => o.id === editingOrderId);
      if (editingOrder) {
        setFormName(editingOrder.name || "");
        setFormPhone(editingOrder.phone || "");
        setFormEmail(editingOrder.email || "");
        setFormAddress(editingOrder.address || "");
        setFormCity(editingOrder.city || "Dhaka");
        setFormPostcode(editingOrder.postcode || "");
        setFormTrxId(editingOrder.trxId || "");
        setFormPaymentMethod(editingOrder.paymentMethod || "cod");
      }
    } else {
      setFormName("");
      setFormPhone("");
      setFormEmail("");
      setFormAddress("");
      setFormCity("Dhaka");
      setFormPostcode("");
      setFormTrxId("");
      setFormPaymentMethod("cod");
    }
  }, [editingOrderId, orders]);

  const handleSaveInfo = async (e: React.FormEvent, orderId: string) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdateOrderInfo(orderId, {
        name: formName,
        phone: formPhone,
        email: formEmail,
        address: formAddress,
        city: formCity,
        postcode: formPostcode,
        trxId: formTrxId,
        paymentMethod: formPaymentMethod
      });
      setEditingOrderId(null);
    } catch (err) {
      console.error("Error updating order info:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectPrint = (o: any) => {
    setExpandedOrderId(o.id);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Filter orders by text search, status tab, and channel selection
  const filteredOrders = orders.filter((o) => {
    // 1. Text Search Filter
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.includes(orderSearch);
      
    // 2. Status Tab Filter
    let matchesStatus = true;
    if (activeFilter === "UNFULFILLED") {
      matchesStatus = ["PENDING", "CONFIRMED", "SHIPPED"].includes(o.orderStatus);
    } else if (activeFilter === "UNPAID") {
      matchesStatus = o.paymentStatus === "UNPAID";
    } else if (activeFilter === "PAID") {
      matchesStatus = o.paymentStatus === "PAID";
    } else if (activeFilter === "DELIVERED") {
      matchesStatus = o.orderStatus === "DELIVERED";
    } else if (activeFilter === "CANCELLED") {
      matchesStatus = o.orderStatus === "CANCELLED";
    }

    // 3. Channel Filter
    let matchesChannel = true;
    if (channelFilter === "ONLINE") {
      matchesChannel = !o.isShowroom;
    } else if (channelFilter === "SHOWROOM") {
      matchesChannel = o.isShowroom;
    }
    
    return matchesSearch && matchesStatus && matchesChannel;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [orderSearch, activeFilter, channelFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusCount = (status: string) => {
    let baseOrders = orders;
    if (channelFilter === "ONLINE") {
      baseOrders = orders.filter(o => !o.isShowroom);
    } else if (channelFilter === "SHOWROOM") {
      baseOrders = orders.filter(o => o.isShowroom);
    }

    if (status === "ALL") return baseOrders.length;
    if (status === "UNFULFILLED") return baseOrders.filter(o => ["PENDING", "CONFIRMED", "SHIPPED"].includes(o.orderStatus)).length;
    if (status === "UNPAID") return baseOrders.filter(o => o.paymentStatus === "UNPAID").length;
    if (status === "PAID") return baseOrders.filter(o => o.paymentStatus === "PAID").length;
    if (status === "DELIVERED") return baseOrders.filter(o => o.orderStatus === "DELIVERED").length;
    if (status === "CANCELLED") return baseOrders.filter(o => o.orderStatus === "CANCELLED").length;
    return 0;
  };

  const filterTabs = [
    { id: "ALL", label: "সব" },
    { id: "UNFULFILLED", label: "অসম্পূর্ণ" },
    { id: "UNPAID", label: "অপরিশোধিত" },
    { id: "PAID", label: "পরিশোধিত" },
    { id: "DELIVERED", label: "সম্পন্ন" },
    { id: "CANCELLED", label: "বাতিল" },
  ];

  // Metric variables
  const totalOrdersCount = orders.length;
  const totalItemsSold = orders.reduce((sum, o) => {
    if (o.orderStatus === "CANCELLED") return sum;
    return sum + (o.items ? o.items.reduce((s: number, i: any) => s + i.quantity, 0) : 0);
  }, 0);
  const totalCancelledCount = orders.filter(o => o.orderStatus === "CANCELLED").length;
  const totalDeliveredCount = orders.filter(o => o.orderStatus === "DELIVERED").length;
  const activeOrderToPrint = orders.find(o => o.id === expandedOrderId);

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* CSS Print Stylesheets to print only the active invoice sheet */}
      {expandedOrderId && (
        <style dangerouslySetInnerHTML={{
          __html: `
            @media screen {
              [id^="printable-invoice-sheet-"] {
                display: none !important;
              }
            }
            @media print {
              html, body {
                height: auto !important;
                min-height: 0 !important;
                overflow: visible !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }
              body > *:not([id^="printable-invoice-sheet-"]) {
                display: none !important;
              }
              [id^="printable-invoice-sheet-"] {
                display: block !important;
                position: relative !important;
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                z-index: 9999999 !important;
                box-shadow: none !important;
                border: none !important;
                margin: 0 !important;
                padding: 1.5cm !important;
                background: white !important;
                color: black !important;
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
                page-break-before: avoid !important;
              }
              @page {
                size: auto;
                margin: 0;
              }
            }
          `
        }} />
      )}

      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print-inline">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">অর্ডার ও শিপমেন্ট সেন্টার (Orders)</h2>
          <p className="text-xs text-muted-foreground mt-0.5">সব গ্রাহকের কেনাকাটা, পেমেন্ট ট্র্যাকিং ও শিপমেন্ট স্থিতি পরিচালনা করুন।</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => alert("অর্ডার ডেটা CSV ফাইল হিসেবে ডাউনলোডের জন্য প্রস্তুত হচ্ছে...")}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-3xs"
          >
            <Printer size={12} />
            <span>অর্ডার এক্সপোর্ট (Export)</span>
          </button>
          <button 
            onClick={() => alert("ম্যানুয়াল অর্ডার তৈরি করার ফর্মটি লোড হচ্ছে...")}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-2xs border-none"
          >
            <span>নতুন অর্ডার তৈরি (Create Order)</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Grid (Aligned with DashboardTab UI/UX) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 no-print-inline">
        {/* Total Orders Card */}
        <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between transition-transform duration-300 hover:-translate-y-0.5">
          <div className="min-w-0">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">সর্বমোট অর্ডার</span>
            <span className="text-xl sm:text-2xl font-black text-foreground block mt-1.5">
              {toBanglaNumber(totalOrdersCount)} টি
            </span>
          </div>
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
            <ShoppingBag size={20} />
          </div>
        </div>

        {/* Total Items Sold Card */}
        <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between transition-transform duration-300 hover:-translate-y-0.5">
          <div className="min-w-0">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">বিক্রীত পোশাক</span>
            <span className="text-xl sm:text-2xl font-black text-foreground block mt-1.5">
              {toBanglaNumber(totalItemsSold)} টি
            </span>
          </div>
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
            <Package size={20} />
          </div>
        </div>

        {/* Cancelled Orders Card */}
        <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between transition-transform duration-300 hover:-translate-y-0.5">
          <div className="min-w-0">
            <span className="text-[10px] font-black text-slate-505 uppercase tracking-wider block">বাতিলকৃত অর্ডার</span>
            <span className="text-xl sm:text-2xl font-black text-foreground block mt-1.5">
              {toBanglaNumber(totalCancelledCount)} টি
            </span>
          </div>
          <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-600 flex-shrink-0">
            <XCircle size={20} />
          </div>
        </div>

        {/* Delivered/Fulfilled Card */}
        <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between transition-transform duration-300 hover:-translate-y-0.5">
          <div className="min-w-0">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">ডেলিভারকৃত অর্ডার</span>
            <span className="text-xl sm:text-2xl font-black text-foreground block mt-1.5">
              {toBanglaNumber(totalDeliveredCount)} টি
            </span>
          </div>
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600 flex-shrink-0">
            <CheckCircle size={20} />
          </div>
        </div>
      </div>

      {/* Grid container for filters and table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-3xs p-6">
        
        {/* Filter tabs and search control row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          
          {/* ShopZen outline tabs */}
          <div className="flex gap-1.5 overflow-x-auto whitespace-nowrap py-1">
            {filterTabs.map((tab) => {
              const count = getStatusCount(tab.id);
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3.5 py-1.5 border text-[11px] font-black rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-slate-900 border-slate-900 text-white shadow-3xs"
                      : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {toBanglaNumber(count)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Channel Selector */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setChannelFilter("ALL")}
                className={`px-3 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all border-none ${
                  channelFilter === "ALL"
                    ? "bg-white text-slate-800 shadow-3xs"
                    : "bg-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                সব চ্যানেল
              </button>
              <button
                type="button"
                onClick={() => setChannelFilter("ONLINE")}
                className={`px-3 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all border-none ${
                  channelFilter === "ONLINE"
                    ? "bg-white text-slate-800 shadow-3xs"
                    : "bg-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                অনলাইন স্টোর
              </button>
              <button
                type="button"
                onClick={() => setChannelFilter("SHOWROOM")}
                className={`px-3 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all border-none ${
                  channelFilter === "SHOWROOM"
                    ? "bg-white text-slate-800 shadow-3xs"
                    : "bg-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                শোরুম কাউন্টার
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:max-w-xs">
              <input 
                type="text" 
                placeholder="নাম, ফোন বা অর্ডার নং..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs text-foreground placeholder-slate-405 transition-all"
              />
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
        </div>

        {/* Orders Table Grid */}
        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs font-semibold">কোনো অর্ডার পাওয়া যায়নি।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-400 font-black text-[9px] uppercase tracking-wider">
                  <th className="py-3 px-2 w-8 text-center"></th>
                  <th className="py-3 px-4 w-12 text-center">
                    <input type="checkbox" className="w-3.5 h-3.5 border-slate-200 rounded accent-slate-900 cursor-pointer" readOnly checked={false} />
                  </th>
                  <th className="py-3 px-4">অর্ডার নং</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">ক্রেতা</th>
                  <th className="py-3 px-4 text-center">পেমেন্ট স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">সর্বমোট</th>
                  <th className="py-3 px-4 text-right">ডেলিভারি খরচ</th>
                  <th className="py-3 px-4 text-center">পোশাক</th>
                  <th className="py-3 px-4 text-center">ফুলফিলমেন্ট স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {paginatedOrders.map((o) => {
                  const isExpanded = expandedOrderId === o.id;
                  const isEditingThisOrder = editingOrderId === o.id;

                  return (
                    <React.Fragment key={o.id}>
                      {/* Standard row */}
                      <tr className={`hover:bg-slate-50/40 transition-colors ${isExpanded ? 'bg-slate-50/50' : ''}`}>
                        {/* Chevron Expand Toggle */}
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : o.id)}
                            className="p-1 hover:bg-slate-200 rounded-md text-slate-500 cursor-pointer transition-colors"
                            title="ইনভয়েস ও বিবরণ দেখুন"
                          >
                            <ChevronDown size={14} className={`transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        </td>
                        
                        {/* Checkbox */}
                        <td className="py-3 px-4 text-center">
                          <input type="checkbox" className="w-3.5 h-3.5 border-slate-200 rounded accent-slate-900 cursor-pointer" readOnly checked={false} />
                        </td>
                        
                        {/* Order Number */}
                        <td className="py-3 px-4 font-mono select-all">
                          <div className="font-bold text-primary">#{o.orderNumber}</div>
                          <span className={`inline-block text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-1 border ${
                            o.isShowroom
                              ? "bg-amber-50 text-amber-600 border-amber-250"
                              : "bg-blue-50 text-blue-600 border-blue-250"
                          }`}>
                            {o.isShowroom ? "শোরুম" : "অনলাইন"}
                          </span>
                        </td>
                        
                        {/* Date */}
                        <td className="py-3 px-4 font-mono text-slate-400 text-[10px]">
                          {new Date(o.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "numeric", day: "numeric" })}
                        </td>
                        
                        {/* Customer Info */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{o.name}</div>
                          <div className="text-slate-400 font-mono text-[9px] mt-0.5">{o.phone}</div>
                        </td>
                        
                        {/* Interactive Payment dropdown in row */}
                        <td className="py-3 px-4 text-center">
                          <select
                            value={o.paymentStatus}
                            disabled={isUpdatingPayment === o.id}
                            onChange={async (e) => {
                              setIsUpdatingPayment(o.id);
                              try {
                                await onUpdatePaymentStatus(o.id, e.target.value);
                              } finally {
                                setIsUpdatingPayment(null);
                              }
                            }}
                            className={`py-1 px-2.5 text-[10px] font-black rounded-lg border focus:outline-none cursor-pointer transition-colors select-none ${
                              o.paymentStatus === "PAID"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-250"
                                : "bg-amber-50 text-amber-600 border-amber-250"
                            }`}
                          >
                            <option value="UNPAID">পেন্ডিং</option>
                            <option value="PAID">পরিশোধিত</option>
                          </select>
                        </td>
                        
                        {/* Total Price */}
                        <td className="py-3 px-4 text-right font-black text-slate-900">
                          {formatBanglaPriceWithCommas(o.grandTotal)}
                        </td>
                        
                        {/* Shipping Fee */}
                        <td className="py-3 px-4 text-right font-mono text-slate-400">
                          {formatBanglaPriceWithCommas(o.shippingCost)}
                        </td>
                        
                        {/* Items Count */}
                        <td className="py-3 px-4 text-center font-bold text-[10px]">
                          {toBanglaNumber(o.items ? o.items.reduce((s: number, i: any) => s + i.quantity, 0) : 0)} টি
                        </td>
                        
                        {/* Interactive Fulfillment dropdown in row */}
                        <td className="py-3 px-4 text-center">
                          <select
                            value={o.orderStatus}
                            disabled={isUpdatingStatus === o.id}
                            onChange={async (e) => {
                              setIsUpdatingStatus(o.id);
                              try {
                                await onUpdateOrderStatus(o.id, e.target.value);
                              } finally {
                                setIsUpdatingStatus(null);
                              }
                            }}
                            className={`py-1 px-2.5 text-[10px] font-black rounded-lg border focus:outline-none cursor-pointer transition-colors ${
                              o.orderStatus === "PENDING"
                                ? "bg-rose-50 text-rose-600 border-rose-200"
                                : o.orderStatus === "CONFIRMED"
                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                : o.orderStatus === "SHIPPED"
                                ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                                : o.orderStatus === "DELIVERED"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-255"
                                : "bg-slate-50 text-slate-500 border-slate-200"
                            }`}
                          >
                            <option value="PENDING">পেন্ডিং</option>
                            <option value="CONFIRMED">নিশ্চিত</option>
                            <option value="SHIPPED">কুরিয়ারে</option>
                            <option value="DELIVERED">ডেলিভার্ড</option>
                            <option value="CANCELLED">বাতিল</option>
                          </select>
                        </td>
                        
                        {/* Row Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => handleDirectPrint(o)}
                              className="p-1.5 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-250 hover:border-slate-900 text-slate-700 rounded-lg cursor-pointer transition-colors"
                              title="রসিদ প্রিন্ট"
                            >
                              <Printer size={12} />
                            </button>
                            <button 
                              onClick={() => onDeleteOrder(o.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-100 hover:border-rose-600 text-rose-600 rounded-lg cursor-pointer transition-colors"
                              title="অর্ডার ডিলিট"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable sub-row details panel */}
                      {isExpanded && (
                        <tr className="bg-[#FAF9F5] no-print-inline">
                          <td colSpan={11} className="p-6 border-b border-slate-200">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                              
                              {/* Left Column: Clean Invoice Sheet */}
                              <div className="lg:col-span-7 flex flex-col gap-4">
                                <div 
                                  id={`preview-invoice-sheet-${o.id}`}
                                  className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs text-slate-800 animate-fade-in"
                                >
                                  {/* Brand Letterhead */}
                                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-6">
                                    <div>
                                      <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">তানহা ফ্যাশন</h1>
                                      <p className="text-[10px] text-slate-500 font-semibold mt-1">তানহা ফ্যাশন — অনন্য কালেকশন</p>
                                      {o.branch ? (
                                        <p className="text-[9px] text-slate-400 mt-0.5">
                                          আউটলেট: {o.branch.name} | {o.branch.address || o.branch.city} | হটলাইন: {o.branch.phone}
                                        </p>
                                      ) : (
                                        <p className="text-[9px] text-slate-400 mt-0.5">Mirpur, Dhaka, Bangladesh | Hotline: ০৯৬১২-৩৪৫৬৭৮</p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">রসিদ / ইনভয়েস</div>
                                      <div className="text-base font-mono font-black text-slate-900 mt-1">#{o.orderNumber}</div>
                                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                                        তারিখ: {new Date(o.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Customer Contact Card */}
                                  <div className="grid grid-cols-2 gap-6 text-[11px] mb-6">
                                    <div>
                                      <h4 className="font-extrabold text-slate-900 border-b border-slate-200 pb-1.5 mb-2 uppercase tracking-wide text-[9px]">ডেলিভারি ঠিকানা</h4>
                                      <div className="font-black text-slate-900 text-xs mb-1">{o.name}</div>
                                      <div className="text-slate-655 leading-relaxed font-semibold">{o.address}</div>
                                      <div className="text-slate-655 font-bold mt-1">{o.city} - {o.postcode}</div>
                                    </div>
                                    <div>
                                      <h4 className="font-extrabold text-slate-900 border-b border-slate-200 pb-1.5 mb-2 uppercase tracking-wide text-[9px]">পেমেন্ট ও কন্টাক্ট</h4>
                                      <div className="flex items-center gap-1.5 text-slate-700 font-mono font-bold">
                                        <Phone size={10} className="text-slate-400" /> {o.phone}
                                      </div>
                                      {o.email && (
                                        <div className="flex items-center gap-1.5 text-slate-700 font-mono mt-1">
                                          <Mail size={10} className="text-slate-400" /> {o.email}
                                        </div>
                                      )}
                                      <div className="mt-2.5">
                                        <span className="text-[9px] font-black text-slate-400 uppercase block">পেমেন্ট পদ্ধতি:</span>
                                        <span className="font-extrabold text-slate-900 uppercase text-[10px] mt-0.5 block">
                                          {getPaymentMethodLabel(o.paymentMethod)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Items List Table */}
                                  <div className="border border-slate-200 rounded-lg overflow-hidden mb-6 text-[11px] bg-slate-50/50">
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-100 border-b border-slate-200 text-[9px] font-black text-slate-500 uppercase tracking-wider">
                                          <th className="py-2 px-3">আইটেম বিবরণ</th>
                                          <th className="py-2 px-3 text-center">সাইজ</th>
                                          <th className="py-2 px-3 text-center">পরিমাণ</th>
                                          <th className="py-2 px-3 text-right">ইউনিট মূল্য</th>
                                          <th className="py-2 px-3 text-right">মোট মূল্য</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-200 text-slate-800">
                                        {o.items && o.items.map((item: any, idx: number) => (
                                          <tr key={idx} className="hover:bg-slate-100/30">
                                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                                              <div>{item.product?.name || "ডিজাইনার ড্রেস"}</div>
                                              <div className="text-[9px] text-slate-400 font-mono mt-0.5">ID/SKU: {item.product?.sku || item.productId}</div>
                                            </td>
                                            <td className="py-2.5 px-3 text-center font-bold">{item.size}</td>
                                            <td className="py-2.5 px-3 text-center font-bold">{toBanglaNumber(item.quantity)}</td>
                                            <td className="py-2.5 px-3 text-right font-mono">{formatBanglaPriceWithCommas(item.price)}</td>
                                            <td className="py-2.5 px-3 text-right font-mono font-bold">{formatBanglaPriceWithCommas(item.price * item.quantity)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>

                                  {/* Sums Section */}
                                  <div className="max-w-xs ml-auto text-[11px] flex flex-col gap-1.5 border-t border-slate-200 pt-3 mb-4">
                                    <div className="flex justify-between text-slate-500 font-semibold">
                                      <span>উপমোট:</span>
                                      <span className="font-bold text-slate-800">{formatBanglaPriceWithCommas(o.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 font-semibold">
                                      <span>ডেলিভারি খরচ:</span>
                                      <span className="font-bold text-slate-800">{formatBanglaPriceWithCommas(o.shippingCost)}</span>
                                    </div>
                                    {o.discount > 0 && (
                                      <div className="flex justify-between text-rose-600 font-bold">
                                        <span>ছাড় (কুপন):</span>
                                        <span>-{formatBanglaPriceWithCommas(o.discount)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between text-xs font-black border-t border-dashed border-slate-300 pt-2 text-slate-900">
                                      <span>সর্বমোট পরিশোধযোগ্য:</span>
                                      <span className="text-primary font-display">{formatBanglaPriceWithCommas(o.grandTotal)}</span>
                                    </div>
                                  </div>

                                  {/* Transaction ID */}
                                  {o.trxId && (
                                    <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg text-[9px] font-bold text-slate-600 text-center font-mono">
                                      লেনদেন আইডি (TrxID): <span className="text-slate-900 select-all font-black">{o.trxId}</span>
                                    </div>
                                  )}

                                  {/* Signatures bottom panel */}
                                  <div className="grid grid-cols-2 gap-8 mt-8 pt-6 border-t border-dashed border-slate-200 text-[9px] text-slate-400 font-bold">
                                    <div className="text-left">
                                      <div className="h-6"></div>
                                      <div className="border-t border-slate-200 pt-1.5 w-24">ক্রেতার স্বাক্ষর</div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                      <div className="h-6"></div>
                                      <div className="border-t border-slate-200 pt-1.5 w-36 text-center">তানহা ফ্যাশন অনুমোদিত স্বাক্ষর</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Right Column: Customer Info & Danger Zone */}
                              <div className="lg:col-span-5 flex flex-col gap-5">
                                
                                {/* Customer Info Editor (View / Edit Toggle) */}
                                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                                  {!isEditingThisOrder ? (
                                    /* VIEW INFO SUMMARY */
                                    <div className="flex flex-col gap-3 text-xs animate-fade-in">
                                      <div className="flex justify-between items-center pb-2 border-b border-border/40">
                                        <h4 className="font-bold text-foreground font-display flex items-center gap-1.5">
                                          <User size={13} className="text-primary" />
                                          <span>গ্রাহকের কন্টাক্ট ইনফো</span>
                                        </h4>
                                        <button 
                                          onClick={() => setEditingOrderId(o.id)}
                                          className="inline-flex items-center gap-1 py-1 px-2.5 bg-secondary hover:bg-primary hover:text-white border border-border hover:border-primary text-foreground text-[10px] font-bold rounded-md cursor-pointer transition-colors"
                                        >
                                          <Edit size={10} />
                                          <span>সম্পাদনা</span>
                                        </button>
                                      </div>
                                      
                                      <div className="flex flex-col gap-2 text-[11px] text-muted-foreground font-semibold">
                                        <div>নাম: <strong className="text-foreground">{o.name}</strong></div>
                                        <div>মোবাইল: <strong className="text-foreground font-mono">{o.phone}</strong></div>
                                        {o.email && <div>ই-মেইল: <strong className="text-foreground font-mono">{o.email}</strong></div>}
                                        <div>শহর: <strong className="text-foreground">{o.city}</strong></div>
                                        <div>ঠিকানা: <strong className="text-foreground">{o.address}</strong></div>
                                        <div>পোস্টকোড: <strong className="text-foreground font-mono">{o.postcode}</strong></div>
                                      </div>
                                    </div>
                                  ) : (
                                    /* EDIT FORM */
                                    <form onSubmit={(e) => handleSaveInfo(e, o.id)} className="flex flex-col gap-3.5 text-xs font-semibold animate-fade-in">
                                      <h4 className="font-bold text-primary border-b border-border/60 pb-1.5 mb-1 font-display">গ্রাহকের তথ্য পরিবর্তন</h4>
                                      
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[10px] text-muted-foreground mb-1">ক্রেতার নাম *</label>
                                          <input 
                                            type="text" 
                                            required
                                            value={formName}
                                            onChange={(e) => setFormName(e.target.value)}
                                            className="w-full px-2 py-1.5 border border-border bg-slate-50 focus:bg-white rounded-lg text-foreground focus:outline-none focus:border-primary font-sans"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] text-muted-foreground mb-1">মোবাইল নম্বর *</label>
                                          <input 
                                            type="text" 
                                            required
                                            value={formPhone}
                                            onChange={(e) => setFormPhone(e.target.value)}
                                            className="w-full px-2 py-1.5 border border-border bg-slate-50 focus:bg-white rounded-lg text-foreground font-mono focus:outline-none focus:border-primary"
                                          />
                                        </div>
                                      </div>

                                      <div>
                                        <label className="block text-[10px] text-muted-foreground mb-1">ই-মেইল ঠিকানা</label>
                                        <input 
                                          type="email" 
                                          value={formEmail}
                                          onChange={(e) => setFormEmail(e.target.value)}
                                          className="w-full px-2 py-1.5 border border-border bg-slate-50 focus:bg-white rounded-lg text-foreground focus:outline-none focus:border-primary font-sans"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[10px] text-muted-foreground mb-1">পূর্ণ ডেলিভারি ঠিকানা *</label>
                                        <input 
                                          type="text" 
                                          required
                                          value={formAddress}
                                          onChange={(e) => setFormAddress(e.target.value)}
                                          className="w-full px-2 py-1.5 border border-border bg-slate-50 focus:bg-white rounded-lg text-foreground focus:outline-none focus:border-primary font-sans"
                                        />
                                      </div>

                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[10px] text-muted-foreground mb-1">শহর *</label>
                                          <select
                                            value={formCity}
                                            onChange={(e) => setFormCity(e.target.value)}
                                            className="w-full px-2.5 py-1.5 border border-border bg-slate-50 focus:bg-white rounded-lg text-foreground font-bold focus:outline-none focus:border-primary font-sans"
                                          >
                                            <option value="Dhaka">ঢাকা</option>
                                            <option value="Chittagong">চট্টগ্রাম</option>
                                            <option value="Sylhet">সিলেট</option>
                                            <option value="Rajshahi">রাজশাহী</option>
                                            <option value="Khulna">খুলনা</option>
                                            <option value="Barisal">বরিশাল</option>
                                            <option value="Rangpur">রংপুর</option>
                                            <option value="Mymensingh">ময়মনসিংহ</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-[10px] text-muted-foreground mb-1">পোস্টকোড *</label>
                                          <input 
                                            type="text" 
                                            required
                                            value={formPostcode}
                                            onChange={(e) => setFormPostcode(e.target.value)}
                                            className="w-full px-2 py-1.5 border border-border bg-slate-50 focus:bg-white rounded-lg text-foreground font-mono focus:outline-none focus:border-primary"
                                          />
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[10px] text-muted-foreground mb-1">পেমেন্ট মেথড *</label>
                                          <select
                                            value={formPaymentMethod}
                                            onChange={(e) => setFormPaymentMethod(e.target.value)}
                                            className="w-full px-2 py-1.5 border border-border bg-slate-50 focus:bg-white rounded-lg text-foreground font-bold focus:outline-none focus:border-primary font-sans"
                                          >
                                            <option value="bkash">বিকাশ</option>
                                            <option value="nagad">নগদ</option>
                                            <option value="cod">ক্যাশ অন ডেলিভারি</option>
                                            <option value="card">কার্ড</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-[10px] text-muted-foreground mb-1">TrxID / বিবরণ</label>
                                          <input 
                                            type="text" 
                                            value={formTrxId}
                                            onChange={(e) => setFormTrxId(e.target.value)}
                                            className="w-full px-2 py-1.5 border border-border bg-slate-50 focus:bg-white rounded-lg text-foreground font-mono focus:outline-none focus:border-primary"
                                          />
                                        </div>
                                      </div>

                                      <div className="flex gap-2 justify-end mt-1">
                                        <button 
                                          type="submit" 
                                          disabled={isSubmitting}
                                          className="py-1.5 px-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg border-none cursor-pointer flex items-center gap-1 shadow-xs disabled:opacity-50"
                                        >
                                          <Save size={11} />
                                          <span>সংরক্ষণ</span>
                                        </button>
                                        <button 
                                          type="button"
                                          onClick={() => setEditingOrderId(null)}
                                          className="py-1.5 px-3 bg-secondary hover:bg-slate-100 border border-border text-foreground font-bold rounded-lg cursor-pointer font-sans"
                                        >
                                          <span>বাতিল</span>
                                        </button>
                                      </div>
                                    </form>
                                  )}
                                </div>

                                {/* Steadfast Courier Integration Card */}
                                {o.paymentMethod !== "showroom" && (
                                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col gap-3">
                                    <h4 className="font-bold text-xs text-foreground font-display flex items-center gap-1.5 border-b border-border/40 pb-2 mb-1">
                                      <Truck size={13} className="text-primary" />
                                      <span>কুরিয়ার বুকিং (Steadfast Courier)</span>
                                    </h4>
                                    
                                    {!o.courierConsignmentId ? (
                                      /* Booking Form */
                                      <CourierBookingForm 
                                        order={o} 
                                        onBook={async (cod, note) => {
                                          if (onBookSteadfast) {
                                            await onBookSteadfast(o.id, cod, note);
                                          }
                                        }} 
                                      />
                                    ) : (
                                      /* Booking Details */
                                      <div className="flex flex-col gap-3 text-xs text-muted-foreground font-semibold">
                                        <div className="flex justify-between items-center bg-[#F4F9F4] text-emerald-800 border border-emerald-150 p-2.5 rounded-lg text-[10px] font-black">
                                          <span>স্ট্যাটাস: {o.courierStatus || "বুকড"}</span>
                                          <span>Steadfast Courier</span>
                                        </div>
                                        <div className="flex flex-col gap-1 text-[11px] text-muted-foreground text-left font-semibold">
                                          <div>কনসাইনমেন্ট আইডি: <strong className="text-slate-800 font-mono">{o.courierConsignmentId}</strong></div>
                                          <div>ট্র্যাকিং কোড: <strong className="text-slate-800 font-mono">{o.courierTrackingCode}</strong></div>
                                        </div>
                                        
                                        <div className="flex gap-2 justify-end mt-1">
                                          <button
                                            type="button"
                                            onClick={async () => {
                                              if (onSyncSteadfast) {
                                                await onSyncSteadfast(o.id);
                                              }
                                            }}
                                            className="py-1.5 px-3 bg-secondary hover:bg-slate-100 border border-border text-foreground font-bold rounded-lg cursor-pointer flex items-center gap-1"
                                          >
                                            <span>স্ট্যাটাস সিঙ্ক করুন</span>
                                          </button>
                                          <a
                                            href="https://portal.steadfast.com.bd"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="py-1.5 px-3 bg-primary hover:bg-primary/95 text-white border-none font-bold rounded-lg cursor-pointer no-underline text-center flex items-center justify-center font-sans"
                                          >
                                            <span>কুরিয়ার পোর্টাল</span>
                                          </a>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
 
                                {/* Danger Zone (Delete Order) */}
                                <div className="bg-rose-50/50 border border-rose-200/80 rounded-xl p-5 shadow-2xs">
                                  <h4 className="font-bold text-xs text-rose-700 font-display flex items-center gap-1.5 border-b border-rose-250 pb-2 mb-3">
                                    <AlertTriangle size={13} className="text-rose-600" />
                                    <span>ডেঞ্জার জোন (Danger Zone)</span>
                                  </h4>
                                  <p className="text-[10px] text-rose-650 leading-relaxed mb-3 font-semibold">
                                    অর্ডারটি মুছে ফেললে ডাটাবেজ থেকে সম্পূর্ণ মুছে যাবে। স্টক থাকলে তা স্বয়ংক্রিয়ভাবে পণ্য তালিকায় ফেরত যুক্ত হবে।
                                  </p>
                                  <button
                                    onClick={() => onDeleteOrder(o.id)}
                                    className="w-full py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg border-none cursor-pointer flex items-center justify-center gap-2 transition-colors shadow-3xs"
                                  >
                                    <Trash size={14} />
                                    <span>অর্ডারটি সম্পূর্ণরূপে মুছুন</span>
                                  </button>
                                </div>
                                
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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

      {isClient && activeOrderToPrint && createPortal(
        <div 
          id={`printable-invoice-sheet-${activeOrderToPrint.id}`}
          className="bg-white p-8 text-slate-800"
        >
          {/* Brand Letterhead */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-6">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">তানহা ফ্যাশন</h1>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">তানহা ফ্যাশন — অনন্য কালেকশন</p>
              {activeOrderToPrint.branch ? (
                <p className="text-[9px] text-slate-400 mt-0.5">
                  আউটলেট: {activeOrderToPrint.branch.name} | {activeOrderToPrint.branch.address || activeOrderToPrint.branch.city} | হটলাইন: {activeOrderToPrint.branch.phone}
                </p>
              ) : (
                <p className="text-[9px] text-slate-400 mt-0.5">Mirpur, Dhaka, Bangladesh | Hotline: ০৯৬১২-৩৪৫৬৭৮</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">রসিদ / ইনভয়েস</div>
              <div className="text-base font-mono font-black text-slate-900 mt-1">#{activeOrderToPrint.orderNumber}</div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                তারিখ: {new Date(activeOrderToPrint.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
          </div>

          {/* Customer Contact Card */}
          <div className="grid grid-cols-2 gap-6 text-[11px] mb-6">
            <div>
              <h4 className="font-extrabold text-slate-900 border-b border-slate-200 pb-1.5 mb-2 uppercase tracking-wide text-[9px]">ডেলিভারি ঠিকানা</h4>
              <div className="font-black text-slate-900 text-xs mb-1">{activeOrderToPrint.name}</div>
              <div className="text-slate-655 leading-relaxed font-semibold">{activeOrderToPrint.address}</div>
              <div className="text-slate-655 font-bold mt-1">{activeOrderToPrint.city} - {activeOrderToPrint.postcode}</div>
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 border-b border-slate-200 pb-1.5 mb-2 uppercase tracking-wide text-[9px]">পেমেন্ট ও কন্টাক্ট</h4>
              <div className="flex items-center gap-1.5 text-slate-700 font-mono font-bold">
                <Phone size={10} className="text-slate-400" /> {activeOrderToPrint.phone}
              </div>
              {activeOrderToPrint.email && (
                <div className="flex items-center gap-1.5 text-slate-700 font-mono mt-1">
                  <Mail size={10} className="text-slate-400" /> {activeOrderToPrint.email}
                </div>
              )}
              <div className="mt-2.5">
                <span className="text-[9px] font-black text-slate-400 uppercase block">পেমেন্ট পদ্ধতি:</span>
                <span className="font-extrabold text-slate-900 uppercase text-[10px] mt-0.5 block">
                  {getPaymentMethodLabel(activeOrderToPrint.paymentMethod)}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden mb-6 text-[11px] bg-slate-50/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[9px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-2 px-3">আইটেম বিবরণ</th>
                  <th className="py-2 px-3 text-center">সাইজ</th>
                  <th className="py-2 px-3 text-center">পরিমাণ</th>
                  <th className="py-2 px-3 text-right">ইউনিট মূল্য</th>
                  <th className="py-2 px-3 text-right">মোট মূল্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {activeOrderToPrint.items && activeOrderToPrint.items.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-100/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <div>{item.product?.name || "ডিজাইনার ড্রেস"}</div>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">ID/SKU: {item.product?.sku || item.productId}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">{item.size}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{toBanglaNumber(item.quantity)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatBanglaPriceWithCommas(item.price)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">{formatBanglaPriceWithCommas(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sums Section */}
          <div className="max-w-xs ml-auto text-[11px] flex flex-col gap-1.5 border-t border-slate-200 pt-3 mb-4">
            <div className="flex justify-between text-slate-500 font-semibold">
              <span>উপমোট:</span>
              <span className="font-bold text-slate-800">{formatBanglaPriceWithCommas(activeOrderToPrint.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-semibold">
              <span>ডেলিভারি খরচ:</span>
              <span className="font-bold text-slate-800">{formatBanglaPriceWithCommas(activeOrderToPrint.shippingCost)}</span>
            </div>
            {activeOrderToPrint.discount > 0 && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>ছাড় (কুপন):</span>
                <span>-{formatBanglaPriceWithCommas(activeOrderToPrint.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-black border-t border-dashed border-slate-300 pt-2 text-slate-900">
              <span>সর্বমোট পরিশোধযোগ্য:</span>
              <span className="text-primary font-display">{formatBanglaPriceWithCommas(activeOrderToPrint.grandTotal)}</span>
            </div>
          </div>

          {/* Transaction ID */}
          {activeOrderToPrint.trxId && (
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg text-[9px] font-bold text-slate-600 text-center font-mono">
              লেনদেন আইডি (TrxID): <span className="text-slate-900 select-all font-black">{activeOrderToPrint.trxId}</span>
            </div>
          )}

          {/* Signatures bottom panel */}
          <div className="grid grid-cols-2 gap-8 mt-8 pt-6 border-t border-dashed border-slate-200 text-[9px] text-slate-400 font-bold">
            <div className="text-left">
              <div className="h-6"></div>
              <div className="border-t border-slate-200 pt-1.5 w-24">ক্রেতার স্বাক্ষর</div>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="h-6"></div>
              <div className="border-t border-slate-200 pt-1.5 w-36 text-center">তানহা ফ্যাশন অনুমোদিত স্বাক্ষর</div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
