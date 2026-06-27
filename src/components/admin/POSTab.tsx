"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Search, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Printer, 
  ArrowLeft, 
  Barcode, 
  Tag, 
  User, 
  UserPlus, 
  Check, 
  Loader2,
  AlertCircle,
  Users,
  History,
  LogOut
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { toBanglaNumber } from "@/lib/products";
import "@/app/pos/receipt.css";

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  category: string;
  imgUrl: string;
  sizesJson: string; // JSON string e.g. '{"S":10,"M":15,"L":15,"XL":5}'
  showroomSizesJson?: string;
  sizePricesJson?: string;
}

interface CartItem {
  id: string; // product id
  sku: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  availableStock: number;
}

interface POSTabProps {
  embedded?: boolean;
  activeBranchId?: string;
}

const parseSplitPayment = (methodStr: string) => {
  if (!methodStr || !methodStr.startsWith("split:")) return null;
  const parts = methodStr.substring(6).split(",");
  const result: { method: string; amount: number }[] = [];
  parts.forEach(p => {
    const match = p.trim().match(/^(\w+)\((\d+)\)$/);
    if (match) {
      const amt = Number(match[2]);
      if (amt > 0) {
        result.push({ method: match[1], amount: amt });
      }
    }
  });
  return result.length > 0 ? result : null;
};

interface POSHistoryListProps {
  phone: string;
}

function POSHistoryList({ phone }: POSHistoryListProps) {
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/orders`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const filtered = data.filter((o: any) => o.phone && o.phone.trim() === phone.trim());
          setHistoryOrders(filtered);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [phone]);

  if (isLoading) {
    return (
      <div className="h-32 flex items-center justify-center flex-col gap-1.5">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
        <span className="text-[10px] text-muted-foreground font-bold">ইতিবৃত্ত লোড হচ্ছে...</span>
      </div>
    );
  }

  if (historyOrders.length === 0) {
    return (
      <div className="text-center p-6 text-slate-400 font-bold text-[10px]">
        কোনো অর্ডার রেকর্ড পাওয়া যায়নি
      </div>
    );
  }

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden text-[10px] font-bold text-slate-700">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100 text-[9px] text-muted-foreground uppercase">
            <th className="py-2 px-3">অর্ডার নম্বর</th>
            <th className="py-2 px-3">তারিখ</th>
            <th className="py-2 px-3 text-center">ডেলিভারি স্থিতি</th>
            <th className="py-2 px-3 text-center">পেমেন্ট স্থিতি</th>
            <th className="py-2 px-3 text-right">মূল্য</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-bold">
          {historyOrders.map((o) => (
            <tr key={o.id} className="hover:bg-slate-50/30">
              <td className="py-2 px-3 font-mono font-black text-slate-900">{o.orderNumber}</td>
              <td className="py-2 px-3 text-muted-foreground font-sans">{new Date(o.createdAt).toLocaleDateString("bn-BD")}</td>
              <td className="py-2 px-3 text-center">
                <span className={`py-0.5 px-1.5 rounded text-[8px] ${
                  o.orderStatus === "DELIVERED" ? "bg-emerald-50 text-emerald-600" :
                  o.orderStatus === "CANCELLED" ? "bg-rose-50 text-rose-600" :
                  "bg-slate-100 text-slate-600"
                }`}>
                  {o.orderStatus}
                </span>
              </td>
              <td className="py-2 px-3 text-center">
                <span className={`py-0.5 px-1.5 rounded text-[8px] ${
                  o.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                }`}>
                  {o.paymentStatus === "PAID" ? "পরিশোধিত" : "বকেয়া"}
                </span>
              </td>
              <td className="py-2 px-3 text-right text-slate-950 font-sans">৳{toBanglaNumber(o.grandTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function POSTab({ embedded = false, activeBranchId }: POSTabProps) {
  const router = useRouter();
  
  // Auth state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Branch states for SUPER_ADMIN
  const [branches, setBranches] = useState<any[]>([]);
  const [posActiveBranchId, setPosActiveBranchId] = useState<string>("");

  // POS operations state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [flatDiscount, setFlatDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "bkash" | "nagad" >("cash");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receivedCash, setReceivedCash] = useState<number>(0);
  
  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("Dhaka");
  const [customerPostcode, setCustomerPostcode] = useState("1215");
  const [isNewCustomerForm, setIsNewCustomerForm] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  // Dedicated POS Customer Modal States
  const [showPOSCustomersModal, setShowPOSCustomersModal] = useState(false);
  const [posCustomersList, setPOSCustomersList] = useState<any[]>([]);
  const [posCustomerSearchQuery, setPOSCustomerSearchQuery] = useState("");
  const [isPOSCustomersLoading, setIsPOSCustomersLoading] = useState(false);
  const [selectedHistoryCustomer, setSelectedHistoryCustomer] = useState<any | null>(null);

  const fetchPOSCustomersList = async (q = "") => {
    try {
      setIsPOSCustomersLoading(true);
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/customers` + (q ? `?query=${encodeURIComponent(q)}` : "");
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPOSCustomersList(data);
      }
    } catch (e) {
      console.error("Failed to load POS customers: ", e);
    } finally {
      setIsPOSCustomersLoading(false);
    }
  };

  useEffect(() => {
    if (showPOSCustomersModal) {
      fetchPOSCustomersList(posCustomerSearchQuery);
    }
  }, [showPOSCustomersModal]);

  // Modal size selector state
  const [selectedProdForSize, setSelectedProdForSize] = useState<Product | null>(null);
  const [modalSelectedSize, setModalSelectedSize] = useState<string>("");
  const [modalQuantity, setModalQuantity] = useState<number>(1);

  // Split payment states
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [splitCash, setSplitCash] = useState<number>(0);
  const [splitCard, setSplitCard] = useState<number>(0);
  const [splitBkash, setSplitBkash] = useState<number>(0);
  const [splitNagad, setSplitNagad] = useState<number>(0);
  const [splitCardTrx, setSplitCardTrx] = useState<string>("");
  const [splitBkashTrx, setSplitBkashTrx] = useState<string>("");
  const [splitNagadTrx, setSplitNagadTrx] = useState<string>("");

  // Printing state
  const [receiptOrder, setReceiptOrder] = useState<any>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (receiptOrder) {
      const timer = setTimeout(() => {
        window.print();
        setReceiptOrder(null);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [receiptOrder]);

  // Authenticate admin
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/me`, { credentials: "include" })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Unauthorized");
      })
      .then(data => {
        const isAllowed = data.user && (data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN" || data.user.role === "BRANCH_MANAGER");
        if (isAllowed) {
          setIsAdmin(true);
          setAdminUser(data.user);
        } else {
          toast.error("প্রবেশাধিকার সংরক্ষিত। শুধুমাত্র অ্যাডমিন ও ম্যানেজারদের জন্য।");
          if (!embedded) {
            router.push("/admin/showroom");
          }
        }
      })
      .catch(() => {
        toast.error("অনুগ্রহ করে লগইন করুন।");
        if (!embedded) {
          router.push("/admin/showroom");
        }
      })
      .finally(() => {
        setAuthChecking(false);
      });
  }, [embedded, router]);

  // Load branches list if SUPER_ADMIN
  useEffect(() => {
    if (!isAdmin || !adminUser) return;
    const userRole = adminUser.role === "ADMIN" ? "SUPER_ADMIN" : adminUser.role;
    if (userRole === "SUPER_ADMIN") {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/branches`, { credentials: "include" })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("Failed to load branches");
        })
        .then(data => {
          setBranches(data);
          if (data.length > 0) {
            setPosActiveBranchId(data[0].id);
          }
        })
        .catch(err => console.error("Error loading branches:", err));
    }
  }, [isAdmin, adminUser]);

  // Reload POS data when branch filters or authentication states update
  useEffect(() => {
    if (isAdmin) {
      const resolvedBranchId = activeBranchId || posActiveBranchId || adminUser?.branchId || "";
      loadPOSData(resolvedBranchId);
    }
  }, [activeBranchId, posActiveBranchId, isAdmin, adminUser]);

  // Fetch initial product catalog, categories and customer logs
  const loadPOSData = async (userBranchId?: string) => {
    setIsLoading(true);
    try {
      const branchQuery = userBranchId ? `?branchId=${userBranchId}` : "";
      const [prodRes, catRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/products${branchQuery}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/categories`)
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } catch (e) {
      console.error("Failed to load POS data", e);
      toast.error("শোরুম ডাটাবেজ লোড করা যায়নি।");
    } finally {
      setIsLoading(false);
    }
  };

  // Focus barcode scan input
  const focusBarcodeField = () => {
    barcodeInputRef.current?.focus();
  };

  useEffect(() => {
    if (isAdmin) {
      focusBarcodeField();
    }
  }, [isAdmin]);

  const processScannedCode = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    const parts = cleanCode.split("-");
    
    // 1. Try to parse as Code 128 barcode format: TF-[numericId]-[size] (e.g. TF-01-XL)
    if (parts.length >= 3 && parts[0].toUpperCase() === "TF" && !isNaN(parseInt(parts[1], 10))) {
      const rawId = parts[1];
      const size = parts[2].toUpperCase();
      const num = parseInt(rawId, 10);
      const paddedNum = num.toString().padStart(2, "0");
      const banglaId = toBanglaNumber(paddedNum);

      const matchedProduct = products.find(p => p.id === banglaId);
      if (matchedProduct) {
        const sizes = JSON.parse(matchedProduct.showroomSizesJson || matchedProduct.sizesJson || "{}");
        const stock = Number(sizes[size] || 0);

        if (stock <= 0) {
          toast.error(`"${matchedProduct.name}" (সাইজ: ${size}) এর পর্যাপ্ত শোরুম স্টক নেই!`);
          return;
        }

        addToCart(matchedProduct, size);
        toast.success(`সফলভাবে যুক্ত হয়েছে: ${matchedProduct.name} (${size})`);
        return;
      }
    }

    // 2. Fallback to original SKU or SKU-size search matching (e.g. TF-COT-001 or TF-COT-001-M)
    let targetSku = cleanCode;
    let targetSize = "M"; // default fallback size if not found

    if (parts.length > 2) {
      const possibleSize = parts[parts.length - 1].toUpperCase();
      if (["S", "M", "L", "XL", "XXL", "COMBO"].includes(possibleSize)) {
        targetSize = possibleSize;
        targetSku = parts.slice(0, parts.length - 1).join("-");
      }
    }

    const matchedProduct = products.find(
      p => p.sku.toLowerCase() === targetSku.toLowerCase() || p.sku.toLowerCase() === cleanCode.toLowerCase()
    );

    if (matchedProduct) {
      const sizes = JSON.parse(matchedProduct.showroomSizesJson || matchedProduct.sizesJson || "{}");
      let sizeToUse = targetSize;
      
      if (!sizes[sizeToUse] || sizes[sizeToUse] <= 0) {
        const availableSizes = Object.keys(sizes).filter(k => sizes[k] > 0);
        if (availableSizes.length > 0) {
          sizeToUse = availableSizes[0];
        } else {
          toast.error(`"${matchedProduct.name}" এর সব সাইজই স্টকআউট!`);
          return;
        }
      }

      addToCart(matchedProduct, sizeToUse);
      toast.success(`সফলভাবে যুক্ত হয়েছে: ${matchedProduct.name} (${sizeToUse})`);
    } else {
      toast.error("কোনো পণ্য মেলেনি। সঠিক SKU স্ক্যান করুন।");
    }
  };

  // Barcode / SKU Scan submit handler
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processScannedCode(searchQuery);
    setSearchQuery("");
  };

  // Global keydown listener for emulated hardware barcode scanner
  useEffect(() => {
    let lastKeyTime = Date.now();
    let barcodeBuffer = "";

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      // Ignore modifier keys
      if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") {
        return;
      }

      const isFast = timeDiff < 50;

      if (isFast) {
        if (e.key === "Enter") {
          if (barcodeBuffer.startsWith("TF-")) {
            e.preventDefault();
            e.stopPropagation();
            processScannedCode(barcodeBuffer);
          }
          barcodeBuffer = "";
        } else if (e.key.length === 1) {
          barcodeBuffer += e.key;
          if (barcodeBuffer.startsWith("T") || barcodeBuffer.startsWith("TF")) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      } else {
        if (e.key === "T" || e.key === "t") {
          barcodeBuffer = e.key.toUpperCase();
        } else {
          barcodeBuffer = "";
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown, true); // Capture phase to intercept input values
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, [products]);

  // Add Product to Cart
  const addToCart = (product: Product, size: string, qty: number = 1) => {
    const sizesObj = JSON.parse(product.showroomSizesJson || product.sizesJson || "{}");
    const stock = Number(sizesObj[size] || 0);

    if (stock <= 0) {
      toast.error(`"${product.name}" এর ${size} সাইজটি স্টকআউট!`);
      return;
    }

    let resolvedPrice = product.price;
    if (product.sizePricesJson) {
      try {
        const sizePrices = typeof product.sizePricesJson === "string" 
          ? JSON.parse(product.sizePricesJson) 
          : product.sizePricesJson;
        if (sizePrices && sizePrices[size] !== undefined && sizePrices[size] !== null && Number(sizePrices[size]) > 0) {
          resolvedPrice = Number(sizePrices[size]);
        }
      } catch (e) {}
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.size === size);
      if (existing) {
        const targetQty = existing.quantity + qty;
        if (targetQty > stock) {
          toast.warning(`স্টকের সীমায় পৌঁছে গেছেন (${stock} টি উপলব্ধ, কার্টে আছে ${existing.quantity} টি)`);
          return prev;
        }
        return prev.map(item => 
          item.id === product.id && item.size === size 
            ? { ...item, quantity: targetQty, price: resolvedPrice } 
            : item
        );
      }
      if (qty > stock) {
        toast.warning(`স্টকের সীমায় পৌঁছে গেছেন (${stock} টি উপলব্ধ)`);
        return prev;
      }
      return [
        ...prev, 
        { 
          id: product.id, 
          sku: product.sku, 
          name: product.name, 
          price: resolvedPrice, 
          quantity: qty, 
          size, 
          availableStock: stock 
        }
      ];
    });
  };

  // Handle product card click to open size selector modal
  const handleCardClick = (product: Product) => {
    const sizes = JSON.parse(product.showroomSizesJson || product.sizesJson || "{}");
    const availableSizes = Object.keys(sizes).filter(k => Number(sizes[k]) > 0);
    if (availableSizes.length === 0) {
      toast.error(`"${product.name}" এর সব সাইজই স্টকআউট!`);
      return;
    }
    setSelectedProdForSize(product);
    setModalSelectedSize(availableSizes[0]); // pre-select first available size
    setModalQuantity(1);
  };

  // Update item quantity in cart
  const updateQty = (id: string, size: string, change: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id && item.size === size) {
          const nextQty = item.quantity + change;
          if (nextQty <= 0) return null;
          if (nextQty > item.availableStock) {
            toast.warning(`সর্বোচ্চ স্টক সীমা: ${item.availableStock}`);
            return item;
          }
          return { ...item, quantity: nextQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  // Remove item from cart
  const removeFromCart = (id: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.size === size)));
    toast.info("পণ্যটি কার্ট থেকে সরানো হয়েছে।");
  };

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - flatDiscount);
  }, [subtotal, flatDiscount]);

  const changeDue = useMemo(() => {
    const targetAmount = isSplitPayment ? splitCash : grandTotal;
    if (receivedCash <= 0 || receivedCash < targetAmount) return 0;
    return receivedCash - targetAmount;
  }, [receivedCash, grandTotal, isSplitPayment, splitCash]);

  // Auto-initialize split cash when grandTotal changes or split payment is toggled
  useEffect(() => {
    if (isSplitPayment) {
      setSplitCash(grandTotal);
      setSplitCard(0);
      setSplitBkash(0);
      setSplitNagad(0);
    }
  }, [isSplitPayment, grandTotal]);

  // Categories list including All option
  const activeCategories = useMemo(() => {
    return ["All", ...categories.map(c => c.name)];
  }, [categories]);

  // Filter products by selected category and search input
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Select Customer Helper
  const handleSelectCustomer = (cust: any) => {
    setSelectedCustomer(cust);
    setCustomerName(cust.name);
    setCustomerPhone(cust.phone || "");
    setCustomerAddress(cust.address || "");
    setCustomerCity(cust.city || "Dhaka");
    setCustomerPostcode(cust.postcode || "1215");
    setIsNewCustomerForm(false);
    setCustomerSearchQuery("");
  };

  // Clear customer linkage
  const clearLinkedCustomer = () => {
    setSelectedCustomer(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCustomerCity("Dhaka");
    setCustomerPostcode("1215");
    setIsNewCustomerForm(false);
  };

  const handlePOSLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
      router.push("/admin");
    } catch (e) {
      console.error("Logout failed:", e);
      toast.error("লগআউট ব্যর্থ হয়েছে");
    }
  };

  // Submit POS Order Checkout
  const handlePOSCheckout = async () => {
    if (cart.length === 0) {
      toast.error("কার্ট খালি! প্রথমে পণ্য যুক্ত করুন।");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalPaymentMethod: string = paymentMethod;
      let finalTrxId: string | null = null;

      if (isSplitPayment) {
        const sum = splitCash + splitCard + splitBkash + splitNagad;
        if (Math.abs(sum - grandTotal) > 0.01) {
          toast.error(`বিভক্ত পেমেন্টের মোট যোগফল (৳${sum}) সর্বমোট বিলের (৳${grandTotal}) সমান হতে হবে!`);
          setIsSubmitting(false);
          return;
        }
        finalPaymentMethod = `split: cash(${splitCash}),card(${splitCard}),bkash(${splitBkash}),nagad(${splitNagad})`;
        
        const trxList: string[] = [];
        if (splitCard > 0 && splitCardTrx.trim()) trxList.push(`Card: ${splitCardTrx.trim()}`);
        if (splitBkash > 0 && splitBkashTrx.trim()) trxList.push(`bKash: ${splitBkashTrx.trim()}`);
        if (splitNagad > 0 && splitNagadTrx.trim()) trxList.push(`Nagad: ${splitNagadTrx.trim()}`);
        finalTrxId = trxList.join(", ") || null;
      }

      const payload = {
        name: customerName.trim() || "শোরুম কাস্টমার",
        phone: customerPhone.trim() || "01700000000",
        address: "বসুন্ধরা সিটি শোরুম",
        city: "Dhaka",
        postcode: "1215",
        paymentMethod: finalPaymentMethod,
        trxId: finalTrxId,
        shippingMethod: "showroom",
        branchId: activeBranchId || posActiveBranchId || adminUser?.branchId || null,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size
        })),
        discount: flatDiscount,
        orderStatus: "DELIVERED",
        paymentStatus: "PAID"
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (res.ok) {
        const orderData = await res.json();
        toast.success("অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!");
        
        // Save order context for thermal printing
        setReceiptOrder(orderData);
        
        // Reset states
        setCart([]);
        setFlatDiscount(0);
        setReceivedCash(0);
        clearLinkedCustomer();
        setPaymentMethod("cash");
        setIsSplitPayment(false);
        setSplitCash(0);
        setSplitCard(0);
        setSplitBkash(0);
        setSplitNagad(0);
        setSplitCardTrx("");
        setSplitBkashTrx("");
        setSplitNagadTrx("");
        loadPOSData(); // Reload inventory counts
      } else {
        const err = await res.json();
        toast.error(err.error || "অর্ডার সম্পন্ন করা যায়নি।");
      }
    } catch (e) {
      console.error(e);
      toast.error("সার্ভার কানেকশন এরর।");
    } finally {
      setIsSubmitting(false);
      focusBarcodeField();
    }
  };

  const getFormattedDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  if (authChecking) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-xs font-semibold text-muted-foreground">অ্যাডমিন প্রবেশাধিকার যাচাই করা হচ্ছে...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className={`text-foreground flex flex-col overflow-hidden relative ${embedded ? "h-[calc(100vh-140px)] border border-border/60 rounded-2xl bg-white shadow-3xs" : "h-screen"}`}>
      <Toaster position="top-right" richColors />

      {/* POS Top Bar Header - Hide if embedded */}
      {!embedded && (
        <header className="h-16 bg-white border-b border-border/80 px-6 flex items-center justify-between flex-shrink-0 z-10 print:hidden">
          <div className="flex items-center gap-3">
            <Link href="/admin/showroom" className="p-2 hover:bg-secondary rounded-xl text-muted-foreground hover:text-foreground transition-all">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-md font-extrabold font-display leading-tight flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full inline-block"></span>
                শোরুম পিওএস কাউন্টার (POS)
              </h1>
              <p className="text-[10px] text-muted-foreground font-semibold">Flagship Outlet Cashier Counter</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!embedded && adminUser?.role === "SUPER_ADMIN" && branches.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">ব্র্যাঞ্চ:</span>
                <select
                  value={posActiveBranchId}
                  onChange={(e) => setPosActiveBranchId(e.target.value)}
                  className="px-3 py-1.5 border border-border rounded-xl text-xs bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold min-w-[150px]"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-slate-800">{adminUser?.name || "অ্যাডমিন"}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">
                {posActiveBranchId ? branches.find(b => b.id === posActiveBranchId)?.name : "বসুন্ধরা সিটি শোরুম"}
              </div>
            </div>
            <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-2.5 py-1 rounded-full border border-amber-250 uppercase tracking-wider">
              Showroom Counter
            </span>
            <button
              onClick={handlePOSLogout}
              className="p-1.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500 border border-slate-200 hover:border-rose-200 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-[10px] font-bold"
              title="লগআউট (Logout)"
            >
              <LogOut size={12} />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        </header>
      )}

      {/* POS Work Area */}
      <div className="flex-grow flex overflow-hidden print:hidden min-h-0">
        
        {/* Left Screen: Catalog Panel */}
        <div className="w-[60%] flex flex-col border-r border-border/60 bg-white min-h-0">
          
          {/* Top Search & Filter controls */}
          <div className="p-4 border-b border-border/50 bg-[#FCFAF7]/40 flex flex-col gap-3 flex-shrink-0">
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <div className="relative flex-grow">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="SKU স্ক্যান করুন বা প্রোডাক্টের নাম দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-border bg-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground font-semibold"
                />
                <button 
                  type="button" 
                  onClick={focusBarcodeField}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-primary border-none bg-transparent cursor-pointer"
                  title="Focus scanner input"
                >
                  <Barcode size={16} />
                </button>
              </div>
              <button 
                type="submit"
                className="bg-primary hover:bg-primary/95 text-white font-bold px-5 rounded-xl border-none cursor-pointer text-xs transition-colors shadow-xs"
              >
                যুক্ত করুন
              </button>
            </form>

            {/* Category tabs list */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              {activeCategories.map((catName) => (
                <button
                  key={catName}
                  onClick={() => setSelectedCategory(catName)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex-shrink-0 ${
                    selectedCategory === catName
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-white border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  {catName === "All" ? "সকল পণ্য" : catName}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="flex-grow overflow-y-auto p-4 bg-[#FCFAF7]/20 min-h-0">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <span className="text-xs font-bold">প্রোডাক্ট ক্যাটালগ লোড হচ্ছে...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-10">
                <AlertCircle className="w-10 h-10 stroke-1 mb-2 text-slate-400" />
                <span className="text-xs font-semibold">কোনো প্রোডাক্ট পাওয়া যায়নি।</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((prod) => {
                  const sizes = JSON.parse(prod.showroomSizesJson || prod.sizesJson || "{}");
                  const hasStock = Object.values(sizes).some(qty => Number(qty) > 0);

                  return (
                    <div 
                      key={prod.id} 
                      onClick={() => handleCardClick(prod)}
                      className={`bg-white border border-border/80 p-3 rounded-xl shadow-xs flex flex-col justify-between transition-all duration-300 hover:shadow-sm cursor-pointer hover:border-primary/40 select-none ${
                        !hasStock ? "opacity-60 pointer-events-none" : ""
                      }`}
                    >
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-50 border border-slate-100 mb-2.5">
                        <Image 
                          src={prod.imgUrl || "/assets/cotton_1.png"} 
                          alt={prod.name} 
                          fill
                          sizes="(max-width: 1024px) 50vw, 25vw"
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.srcset = "";
                            target.src = "/assets/cotton_1.png";
                          }}
                        />
                        {!hasStock && (
                          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center">
                            <span className="bg-rose-500 text-white font-extrabold text-[8px] px-2 py-0.5 rounded uppercase tracking-wider">
                              Stock Out
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-[9px] font-mono text-muted-foreground tracking-tight truncate" title={prod.sku}>
                          {prod.sku}
                        </div>
                        <h3 className="text-xs font-bold text-slate-800 leading-tight mt-0.5 h-7 line-clamp-2" title={prod.name}>
                          {prod.name}
                        </h3>
                        <div className="text-xs font-black text-primary mt-1.5 font-sans">
                          ৳{prod.price}
                        </div>
                      </div>

                      {/* Sizes quick action row */}
                      <div className="mt-3 pt-2.5 border-t border-border/60">
                        <div className="text-[8px] font-extrabold text-slate-400 uppercase mb-1">Select Size:</div>
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(sizes).map((sizeKey) => {
                            const stockCount = Number(sizes[sizeKey] || 0);
                            const isOutOfStock = stockCount <= 0;

                            return (
                              <button
                                key={sizeKey}
                                disabled={isOutOfStock}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(prod, sizeKey);
                                }}
                                className={`text-[8px] font-black px-2 py-1 rounded border transition-all cursor-pointer ${
                                  isOutOfStock
                                    ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed"
                                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                                }`}
                              >
                                {sizeKey} ({stockCount})
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Screen: Cart & Checkout Panel */}
        <div className="w-[40%] flex flex-col bg-white shadow-lg border-l border-border/40 min-h-0">
          
          {/* Cart Header */}
          <div className="p-4 border-b border-border/80 bg-slate-900 text-white flex-shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-primary" />
              <span className="text-xs font-extrabold font-display">কার্ট আইটেম ({cart.reduce((sum, i) => sum + i.quantity, 0)} টি)</span>
            </div>
            {cart.length > 0 && (
              <button 
                onClick={() => {
                  if (confirm("কার্ট খালি করতে চান?")) setCart([]);
                }}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-bold border-none bg-transparent cursor-pointer flex items-center gap-1"
              >
                <Trash2 size={12} />
                <span>সব মুছুন</span>
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-2 bg-[#FCFAF7]/10 min-h-0">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60 py-20">
                <ShoppingBag className="w-12 h-12 stroke-1 mb-2 text-slate-300" />
                <span className="text-xs font-bold text-center">কার্ট সম্পূর্ণ খালি। বামদিকের ক্যাটালগ থেকে সাইজ সিলেক্ট করুন বা বারকোড স্ক্যান করুন।</span>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.id}-${item.size}`} className="bg-white border border-border p-3 rounded-xl flex items-center justify-between shadow-xs">
                  <div className="min-w-0 pr-3">
                    <h4 className="text-xs font-bold text-slate-800 truncate" title={item.name}>{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-black">
                        সাইজ: {item.size}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-semibold font-sans">
                        ৳{item.price}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-border rounded-lg overflow-hidden bg-slate-50">
                      <button 
                        onClick={() => updateQty(item.id, item.size, -1)}
                        className="p-1.5 hover:bg-slate-200 border-none bg-transparent cursor-pointer flex items-center justify-center"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="px-2.5 text-xs font-bold font-sans text-slate-800 bg-white border-x border-border">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQty(item.id, item.size, 1)}
                        className="p-1.5 hover:bg-slate-200 border-none bg-transparent cursor-pointer flex items-center justify-center"
                      >
                        <Plus size={10} />
                      </button>
                    </div>

                    <div className="text-right w-16">
                      <div className="text-xs font-black text-slate-800 font-sans">
                        ৳{item.price * item.quantity}
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id, item.size)}
                        className="text-[9px] text-rose-500 hover:text-rose-600 font-bold border-none bg-transparent cursor-pointer mt-1"
                      >
                        বাতিল
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* POS Checkout Footer Panel */}
          <div className="border-t border-border bg-white p-4 flex-shrink-0 shadow-xl">
            
            {/* Customer linked selector */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1.5">
                  <User size={12} className="text-primary" />
                  গ্রাহক লিঙ্ক (Customer Profile)
                </span>
                {!selectedCustomer && !isNewCustomerForm && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsNewCustomerForm(true)}
                      className="text-[9px] text-primary hover:text-primary/90 font-bold border-none bg-transparent cursor-pointer flex items-center gap-0.5"
                    >
                      <UserPlus size={12} />
                      <span>নতুন গ্রাহক</span>
                    </button>
                    <button 
                      onClick={() => setShowPOSCustomersModal(true)}
                      className="text-[9px] text-slate-600 hover:text-slate-800 font-bold border-none bg-transparent cursor-pointer flex items-center gap-0.5"
                    >
                      <Users size={12} />
                      <span>গ্রাহক তালিকা</span>
                    </button>
                  </div>
                )}
                {(selectedCustomer || isNewCustomerForm) && (
                  <button 
                    onClick={() => {
                      clearLinkedCustomer();
                      setIsNewCustomerForm(false);
                    }}
                    className="text-[9px] text-rose-500 hover:text-rose-650 font-bold border-none bg-transparent cursor-pointer"
                  >
                    লিঙ্ক বাতিল
                  </button>
                )}
              </div>

              {isNewCustomerForm ? (
                /* Quick Add Customer Form */
                <div className="bg-slate-50 border border-border p-3 rounded-xl flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="নাম" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-border bg-white rounded-lg text-xs font-semibold focus:outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="মোবাইল নম্বর" 
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-1.5 border border-border bg-white rounded-lg text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              ) : selectedCustomer ? (
                /* Customer Link Active View */
                <div className="bg-primary/5 border border-primary/20 p-2 rounded-xl flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800">{selectedCustomer.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 font-sans">{selectedCustomer.phone}</div>
                  </div>
                  <div className="w-5 h-5 bg-primary/10 border border-primary/20 text-primary rounded-full flex items-center justify-center">
                    <Check size={12} />
                  </div>
                </div>
              ) : (
                /* Customer Fast Lookup Field */
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="নম্বর বা নাম দিয়ে কাস্টমার খুঁজুন..."
                    value={customerSearchQuery}
                    onChange={async (e) => {
                      const val = e.target.value;
                      setCustomerSearchQuery(val);
                      if (val.trim().length >= 2) {
                        try {
                          const oRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/customers?query=${encodeURIComponent(val.trim())}`, { credentials: "include" });
                          if (oRes.ok) {
                            const oData = await oRes.json();
                            setCustomers(oData);
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      } else {
                        setCustomers([]);
                      }
                    }}
                    className="w-full pl-8 pr-3 py-1.5 border border-border bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                  {customerSearchQuery.length >= 3 && customers.length > 0 && (
                    <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border border-border shadow-lg rounded-xl z-20 max-h-40 overflow-y-auto">
                      {customers.map((c) => (
                        <button
                          key={c.phone}
                          onClick={() => handleSelectCustomer(c)}
                          className="w-full text-left p-2 hover:bg-slate-50 border-none bg-transparent cursor-pointer flex items-center justify-between text-xs border-b border-border/40 last:border-none font-semibold text-slate-800"
                        >
                          <span>{c.name} ({c.phone})</span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{c.city}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Split Payment Toggle */}
            <div className="mb-3 flex items-center justify-between bg-slate-50 border border-border p-2 rounded-xl">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1.5">
                <Tag size={12} className="text-primary" />
                বিভক্ত পেমেন্ট (Split Payment)
              </span>
              <input 
                type="checkbox" 
                checked={isSplitPayment}
                onChange={(e) => {
                  setIsSplitPayment(e.target.checked);
                  setPaymentMethod("cash");
                }}
                className="w-4 h-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
              />
            </div>

            {isSplitPayment ? (
              /* Split Payments Entry Grid */
              <div className="mb-3 bg-slate-50 border border-border p-3 rounded-xl flex flex-col gap-2.5">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block border-b pb-1 mb-1">পেমেন্ট মেথড ভাগ করুন (Split Payment Breakdown)</span>
                
                {/* Cash split row */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 w-16">ক্যাশ (Cash)</span>
                  <div className="relative flex-grow">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">৳</span>
                    <input 
                      type="number"
                      placeholder="0"
                      value={splitCash || ""}
                      onChange={(e) => setSplitCash(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-5 pr-2 py-1 border border-border bg-white rounded-lg text-xs font-black focus:outline-none"
                    />
                  </div>
                </div>

                {/* Card split row */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 w-16">কার্ড (Card)</span>
                  <div className="relative flex-grow">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">৳</span>
                    <input 
                      type="number"
                      placeholder="0"
                      value={splitCard || ""}
                      onChange={(e) => setSplitCard(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-5 pr-2 py-1 border border-border bg-white rounded-lg text-xs font-black focus:outline-none"
                    />
                  </div>
                  {splitCard > 0 && (
                    <input 
                      type="text"
                      placeholder="কার্ডের শেষ ৪ ডিজিট / TrxID"
                      value={splitCardTrx}
                      onChange={(e) => setSplitCardTrx(e.target.value)}
                      className="w-[120px] px-2 py-1 border border-border bg-white rounded-lg text-[10px] font-semibold focus:outline-none"
                    />
                  )}
                </div>

                {/* bKash split row */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 w-16">bKash</span>
                  <div className="relative flex-grow">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">৳</span>
                    <input 
                      type="number"
                      placeholder="0"
                      value={splitBkash || ""}
                      onChange={(e) => setSplitBkash(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-5 pr-2 py-1 border border-border bg-white rounded-lg text-xs font-black focus:outline-none"
                    />
                  </div>
                  {splitBkash > 0 && (
                    <input 
                      type="text"
                      placeholder="bKash TrxID"
                      value={splitBkashTrx}
                      onChange={(e) => setSplitBkashTrx(e.target.value)}
                      className="w-[120px] px-2 py-1 border border-border bg-white rounded-lg text-[10px] font-semibold focus:outline-none"
                    />
                  )}
                </div>

                {/* Nagad split row */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 w-16">Nagad</span>
                  <div className="relative flex-grow">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">৳</span>
                    <input 
                      type="number"
                      placeholder="0"
                      value={splitNagad || ""}
                      onChange={(e) => setSplitNagad(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-5 pr-2 py-1 border border-border bg-white rounded-lg text-xs font-black focus:outline-none"
                    />
                  </div>
                  {splitNagad > 0 && (
                    <input 
                      type="text"
                      placeholder="Nagad TrxID"
                      value={splitNagadTrx}
                      onChange={(e) => setSplitNagadTrx(e.target.value)}
                      className="w-[120px] px-2 py-1 border border-border bg-white rounded-lg text-[10px] font-semibold focus:outline-none"
                    />
                  )}
                </div>

                {/* Total check validation warning if mismatch */}
                {Math.abs(splitCash + splitCard + splitBkash + splitNagad - grandTotal) > 0.01 && (
                  <div className="text-[10px] font-bold text-rose-500 flex items-center gap-1.5 animate-pulse">
                    <AlertCircle size={12} />
                    <span>বিভক্ত যোগফল (৳{splitCash + splitCard + splitBkash + splitNagad}) সর্বমোট বিলের (৳{grandTotal}) সমান হতে হবে!</span>
                  </div>
                )}
              </div>
            ) : (
              /* Single Payment Selector Tabs */
              <div className="mb-3">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">পেমেন্ট মেথড (Payment Method)</span>
                <div className="grid grid-cols-4 border border-border rounded-xl overflow-hidden p-0.5 bg-slate-100">
                  {(["cash", "card", "bkash", "nagad"] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => {
                        setPaymentMethod(method);
                        if (method !== "cash") setReceivedCash(0);
                      }}
                      className={`py-1.5 text-[10px] font-black border-none rounded-lg cursor-pointer transition-all uppercase ${
                        paymentMethod === method
                          ? "bg-primary text-white shadow-xs"
                          : "bg-transparent text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {method === "bkash" ? "bKash" : method === "nagad" ? "Nagad" : method}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cash change calculator */}
            {((!isSplitPayment && paymentMethod === "cash") || (isSplitPayment && splitCash > 0)) && (
              <div className="mb-3 bg-slate-50 border border-border p-2 rounded-xl flex items-center justify-between gap-3">
                <div className="flex-grow">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">গ্রহনকৃত টাকা (Received Cash)</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">৳</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={receivedCash || ""}
                      onChange={(e) => setReceivedCash(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-6 pr-3 py-1 border border-border bg-white rounded-lg text-xs font-black focus:outline-none"
                    />
                  </div>
                </div>
                <div className="text-right flex-shrink-0 min-w-[120px]">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">ফেরতযোগ্য টাকা (Change Due)</span>
                  <div className={`text-sm font-black font-sans ${changeDue > 0 ? "text-green-600 animate-pulse" : "text-slate-700"}`}>
                    ৳{changeDue}
                  </div>
                </div>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="bg-slate-50 border border-border p-2.5 rounded-xl flex flex-col gap-1.5 mb-3">
              <div className="flex justify-between text-xs text-slate-600 font-semibold">
                <span>উপ-মোট (Subtotal):</span>
                <span className="font-sans">৳{subtotal}</span>
              </div>
              {flatDiscount > 0 && (
                <div className="flex justify-between text-xs text-rose-600 font-semibold">
                  <span>ডিসকাউন্ট (Discount):</span>
                  <span className="font-sans">-৳{flatDiscount}</span>
                </div>
              )}
              <div className="h-px bg-border/60 my-0.5"></div>
              <div className="flex justify-between text-sm font-black text-slate-900">
                <span>সর্বমোট টাকা (Grand Total):</span>
                <span className="font-sans text-primary text-md">৳{grandTotal}</span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              onClick={handlePOSCheckout}
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold py-3 px-6 rounded-xl border-none cursor-pointer text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>অর্ডার প্রসেস হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Printer size={16} />
                  <span>অর্ডার সম্পন্ন ও রশিদ প্রিন্ট করুন</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Product Size Selector Modal */}
      {selectedProdForSize && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-border bg-[#FCFAF7]/40 flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-border/80 flex-shrink-0 bg-slate-50 relative">
                  <Image 
                    src={selectedProdForSize.imgUrl || "/assets/cotton_1.png"} 
                    alt={selectedProdForSize.name} 
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.srcset = "";
                      target.src = "/assets/cotton_1.png";
                    }}
                  />
                </div>
                <div>
                  <span className="text-[9px] font-mono text-muted-foreground block">{selectedProdForSize.sku}</span>
                  <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight mt-0.5">{selectedProdForSize.name}</h3>
                  <span className="text-xs font-black text-primary block mt-1">৳{selectedProdForSize.price}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProdForSize(null)}
                className="text-slate-400 hover:text-slate-655 border-none bg-transparent cursor-pointer p-1 text-sm font-bold leading-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Size Selection */}
            <div className="p-4">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-2">সাইজ নির্বাচন করুন (Select Size):</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(
                  JSON.parse(selectedProdForSize.showroomSizesJson || selectedProdForSize.sizesJson || "{}")
                ).map(([sizeKey, stockVal]) => {
                  const stockCount = Number(stockVal || 0);
                  const isOutOfStock = stockCount <= 0;
                  const isSelected = modalSelectedSize === sizeKey;

                  return (
                    <button
                      key={sizeKey}
                      disabled={isOutOfStock}
                      onClick={() => {
                        setModalSelectedSize(sizeKey);
                        // Clamp quantity if the new size has lower stock
                        if (modalQuantity > stockCount) {
                          setModalQuantity(stockCount);
                        }
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                        isOutOfStock
                          ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                          : isSelected
                            ? "bg-primary border-primary text-white shadow-sm"
                            : "bg-white border-border text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <span>{sizeKey}</span>
                      <span className={`text-[8px] font-semibold ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                        স্টক: {stockCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quantity selector */}
              {modalSelectedSize && (
                <div className="mt-4 pt-4 border-t border-border/65">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">পরিমাণ (Quantity):</span>
                    <div className="flex items-center border border-border rounded-xl overflow-hidden bg-slate-50">
                      <button
                        onClick={() => setModalQuantity(prev => Math.max(1, prev - 1))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 border-none bg-transparent cursor-pointer font-bold"
                      >
                        -
                      </button>
                      <span className="px-4 text-xs font-bold font-sans text-slate-800 bg-white border-x border-border flex items-center justify-center min-w-8 h-8">
                        {modalQuantity}
                      </span>
                      <button
                        onClick={() => {
                          const sizes = JSON.parse(selectedProdForSize.showroomSizesJson || selectedProdForSize.sizesJson || "{}");
                          const maxStock = Number(sizes[modalSelectedSize] || 0);
                          setModalQuantity(prev => Math.min(maxStock, prev + 1));
                        }}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 border-none bg-transparent cursor-pointer font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-[#FCFAF7]/20 flex gap-2">
              <button
                onClick={() => setSelectedProdForSize(null)}
                className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2 px-4 rounded-xl border border-border cursor-pointer text-xs transition-colors"
              >
                বাতিল
              </button>
              <button
                disabled={!modalSelectedSize}
                onClick={() => {
                  if (modalSelectedSize) {
                    addToCart(selectedProdForSize, modalSelectedSize, modalQuantity);
                    setSelectedProdForSize(null);
                    toast.success(`সফলভাবে যুক্ত হয়েছে: ${selectedProdForSize.name} (${modalSelectedSize}) - ${modalQuantity}টি`);
                  }
                }}
                className="flex-1 bg-primary hover:bg-primary/95 text-white font-bold py-2 px-4 rounded-xl border-none cursor-pointer text-xs transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                কার্টে যোগ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POS Receipt Area (Hidden on screen, formatted for thermal print) */}
      {isClient && receiptOrder && createPortal(
        <div id="pos-receipt-print-area">
          <div className="receipt-center">
            <h2 className="receipt-bold" style={{ fontSize: "14px", margin: "0 0 2px 0" }}>তানহা ফ্যাশন</h2>
            {receiptOrder.branch ? (
              <>
                <div style={{ fontSize: "10px", fontWeight: "bold" }}>{receiptOrder.branch.name}</div>
                <div style={{ fontSize: "9px" }}>{receiptOrder.branch.address || receiptOrder.branch.city}</div>
                <div style={{ fontSize: "9px" }}>হটলাইন: {receiptOrder.branch.phone || "০১৬০০০৮৬৭৭৩"}</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: "9px" }}>বসুন্ধরা সিটি শোরুম, লেভেল-৩, ঢাকা</div>
                <div style={{ fontSize: "9px" }}>হটলাইন: ০১৬০০০৮৬৭৭৩</div>
              </>
            )}
            <div className="receipt-divider"></div>
            <div className="receipt-bold" style={{ fontSize: "10px" }}>বিক্রয় রশিদ (POS SALES RECEIPT)</div>
          </div>

          <div style={{ margin: "8px 0 5px 0", fontSize: "9px" }}>
            <div>অর্ডার নং: <span className="receipt-bold">{receiptOrder.orderNumber}</span></div>
            <div>তারিখ: {getFormattedDate(receiptOrder.createdAt)}</div>
            <div>বিক্রেতা: {adminUser?.name || "শোরুম ক্যাশিয়ার"}</div>
            <div className="receipt-divider"></div>
            <div>ক্রেতার নাম: {receiptOrder.name}</div>
            <div>মোবাইল নং: {receiptOrder.phone}</div>
            {receiptOrder.shippingCost > 0 && (
              <>
                <div>ডেলিভারি ঠিকানা: {receiptOrder.address}, {receiptOrder.city}</div>
              </>
            )}
          </div>

          <div className="receipt-divider"></div>

          <table className="receipt-table">
            <thead>
              <tr>
                <th style={{ width: "50%" }}>আইটেম</th>
                <th className="receipt-center" style={{ width: "15%" }}>সাইজ</th>
                <th className="receipt-center" style={{ width: "15%" }}>পরিমাণ</th>
                <th className="receipt-right" style={{ width: "20%" }}>মূল্য</th>
              </tr>
            </thead>
            <tbody>
              {receiptOrder.items && receiptOrder.items.map((item: any, idx: number) => {
                const pName = item.product?.name || item.name || "ডিজাইনার ড্রেস";
                return (
                  <tr key={idx}>
                    <td>{pName}</td>
                    <td className="receipt-center">{item.size}</td>
                    <td className="receipt-center">{toBanglaNumber(item.quantity)}</td>
                    <td className="receipt-right">৳{item.price * item.quantity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="receipt-divider"></div>

          <div style={{ fontSize: "9px", paddingLeft: "30%", width: "70%" }}>
            <div style={{ display: "flex", justifyContent: "between", padding: "1px 0" }}>
              <span style={{ width: "60%" }}>উপ-মোট:</span>
              <span className="receipt-bold receipt-right font-sans" style={{ width: "40%" }}>৳{receiptOrder.subtotal}</span>
            </div>
            {receiptOrder.discount > 0 && (
              <div style={{ display: "flex", justifyContent: "between", padding: "1px 0" }}>
                <span style={{ width: "60%" }}>ছাড়:</span>
                <span className="receipt-bold receipt-right font-sans" style={{ width: "40%" }}>-৳{receiptOrder.discount}</span>
              </div>
            )}
            {receiptOrder.shippingCost > 0 && (
              <div style={{ display: "flex", justifyContent: "between", padding: "1px 0" }}>
                <span style={{ width: "60%" }}>ডেলিভারি বিল:</span>
                <span className="receipt-bold receipt-right font-sans" style={{ width: "40%" }}>৳{receiptOrder.shippingCost}</span>
              </div>
            )}
            <div className="receipt-divider"></div>
            <div style={{ display: "flex", justifyContent: "between", padding: "2px 0", fontSize: "10px" }}>
              <span className="receipt-bold" style={{ width: "60%" }}>সর্বমোট বিল:</span>
              <span className="receipt-bold receipt-right font-sans" style={{ width: "40%", fontSize: "11px" }}>৳{receiptOrder.grandTotal}</span>
            </div>
          </div>

          <div className="receipt-double-divider"></div>

          <div style={{ fontSize: "9px", margin: "5px 0" }}>
            {receiptOrder.paymentMethod.startsWith("split:") ? (
              <div>
                <div>পেমেন্ট মেথড: <span className="receipt-bold text-slate-500">(বিভক্ত পেমেন্ট)</span></div>
                <div style={{ paddingLeft: "10px", margin: "2px 0" }}>
                  {parseSplitPayment(receiptOrder.paymentMethod)?.map((sp, idx) => (
                    <div key={idx}>- <span className="uppercase font-semibold">{sp.method === "bkash" ? "bKash" : sp.method === "nagad" ? "Nagad" : sp.method}</span>: <span className="receipt-bold font-sans">৳{sp.amount}</span></div>
                  ))}
                </div>
              </div>
            ) : (
              <div>পেমেন্ট মেথড: <span className="receipt-bold uppercase">{receiptOrder.paymentMethod}</span></div>
            )}
            <div>পেমেন্ট স্ট্যাটাস: <span className="receipt-bold">{receiptOrder.paymentStatus === "PAID" ? "পরিশোধিত" : "বকেয়া"}</span></div>
            <div>ডেলিভারি মোড: <span className="receipt-bold">{receiptOrder.shippingCost > 0 ? "হোম ডেলিভারি" : "শোরুম ক্যাশ কাউন্টার"}</span></div>
            {receiptOrder.trxId && (
              <div style={{ fontSize: "8px", color: "#555", marginTop: "2px" }}>Trx ID: {receiptOrder.trxId}</div>
            )}
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-center" style={{ fontSize: "8px", marginTop: "10px", lineHeight: "1.4" }}>
            <div className="receipt-bold">ধন্যবাদ! আবার আসবেন।</div>
            <div>ক্রয়কৃত পণ্য পরিবর্তনের জন্য ৩ দিনের মধ্যে শোরুমে রশিদসহ যোগাযোগ করুন। (অনুগ্রহ করে ধোয়া বা ব্যবহৃত কাপড় পরিবর্তনযোগ্য নয়)।</div>
            <div style={{ marginTop: "5px", fontSize: "7px", color: "#666" }}>Powered by Tanha Fashion Cloud POS v1.1</div>
          </div>
        </div>,
        document.body
      )}

      {showPOSCustomersModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans no-print">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col transition-all duration-300 scale-100">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">গ্রাহক তালিকা (Customer Directory)</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">শোরুম ও অনলাইন কাস্টমারদের ডাটাবেজ এবং পূর্ববর্তী ক্রয়ের ইতিবৃত্ত খুঁজুন।</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPOSCustomersModal(false);
                  setPOSCustomerSearchQuery("");
                }}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Search Header */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <div className="relative w-full sm:max-w-md">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="নাম বা মোবাইল নম্বর দিয়ে খুঁজুন (কমপক্ষে ২ অক্ষর)..." 
                  value={posCustomerSearchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPOSCustomerSearchQuery(val);
                    if (val.trim() === "" || val.trim().length >= 2) {
                      fetchPOSCustomersList(val.trim());
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 focus:border-primary rounded-xl text-xs font-semibold focus:outline-none transition-all shadow-3xs"
                />
              </div>
              <div className="text-xs font-bold text-slate-500">
                মোট কাস্টমার লোড হয়েছে: <span className="text-slate-800 font-black">{toBanglaNumber(posCustomersList.length)}</span> জন
              </div>
            </div>

            {/* List Table */}
            <div className="flex-1 overflow-y-auto p-6">
              {isPOSCustomersLoading ? (
                <div className="h-48 flex items-center justify-center flex-col gap-2">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <span className="text-xs font-bold text-muted-foreground">কাস্টমার ডাটা লোড হচ্ছে...</span>
                </div>
              ) : posCustomersList.length === 0 ? (
                <div className="h-48 flex items-center justify-center flex-col text-slate-400 font-bold text-xs">
                  <Users size={32} className="mb-2 text-slate-300" />
                  <span>কোনো গ্রাহক প্রোফাইল পাওয়া যায়নি</span>
                </div>
              ) : (
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-3xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                        <th className="py-2.5 px-4 text-center w-10">#</th>
                        <th className="py-2.5 px-4">গ্রাহক নাম ও ফোন</th>
                        <th className="py-2.5 px-4">ঠিকানা</th>
                        <th className="py-2.5 px-4 text-right">সর্বমোট কেনাকাটা</th>
                        <th className="py-2.5 px-4 text-center">সর্বশেষ কেনাকাটা</th>
                        <th className="py-2.5 px-4 text-center w-40">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {posCustomersList.map((c, idx) => (
                        <tr key={c.phone} className="hover:bg-slate-50/40">
                          <td className="py-3 px-4 text-center text-muted-foreground font-sans">{toBanglaNumber(idx + 1)}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{c.name}</span>
                            <span className="text-[10px] text-muted-foreground font-sans block mt-0.5">{c.phone}</span>
                          </td>
                          <td className="py-3 px-4 truncate max-w-[200px]" title={c.address}>{c.address || "শোরুম ওয়াক-ইন"}</td>
                          <td className="py-3 px-4 text-right font-extrabold text-slate-900 font-sans">৳{toBanglaNumber(c.totalSpent || 0)}</td>
                          <td className="py-3 px-4 text-center text-muted-foreground font-sans">
                            {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString("bn-BD") : "N/A"}
                          </td>
                          <td className="py-3 px-4 text-center flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                handleSelectCustomer(c);
                                setShowPOSCustomersModal(false);
                                setPOSCustomerSearchQuery("");
                              }}
                              className="py-1 px-2.5 bg-primary hover:bg-primary/95 text-white border-none rounded-lg text-[10px] font-bold cursor-pointer transition-all shadow-3xs"
                            >
                              লিঙ্ক করুন
                            </button>
                            <button
                              onClick={() => setSelectedHistoryCustomer(c)}
                              className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                            >
                              ইতিবৃত্ত
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                onClick={() => {
                  setShowPOSCustomersModal(false);
                  setPOSCustomerSearchQuery("");
                }}
                className="py-2 px-5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs cursor-pointer shadow-3xs"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {selectedHistoryCustomer && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[60] p-4 font-sans no-print">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[75vh] overflow-hidden flex flex-col transition-all duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                  <History size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">{selectedHistoryCustomer.name} - ক্রয়ের ইতিহাস</h3>
                  <p className="text-[9px] text-muted-foreground mt-0.5">মোবাইল: {selectedHistoryCustomer.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedHistoryCustomer(null)}
                className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-5">
              <POSHistoryList phone={selectedHistoryCustomer.phone} />
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                onClick={() => setSelectedHistoryCustomer(null)}
                className="py-1.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-lg text-[10px] cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
