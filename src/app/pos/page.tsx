"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
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
  AlertCircle
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { toBanglaNumber } from "@/lib/products";
import "./receipt.css";

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  category: string;
  imgUrl: string;
  sizesJson: string; // JSON string e.g. '{"S":10,"M":15,"L":15,"XL":5}'
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

export default function POSPage() {
  const router = useRouter();
  
  // Auth state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // POS operations state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [flatDiscount, setFlatDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "bkash" | "nagad">("cash");
  const [isHomeDelivery, setIsHomeDelivery] = useState(false);
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

  // Printing state
  const [receiptOrder, setReceiptOrder] = useState<any>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Authenticate admin
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/me`, { credentials: "include" })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Unauthorized");
      })
      .then(data => {
        if (data.user && data.user.role === "ADMIN") {
          setIsAdmin(true);
          setAdminUser(data.user);
          loadPOSData();
        } else {
          toast.error("প্রবেশাধিকার সংরক্ষিত। শুধুমাত্র অ্যাডমিনদের জন্য।");
          router.push("/login");
        }
      })
      .catch(() => {
        toast.error("অনুগ্রহ করে লগইন করুন।");
        router.push("/login");
      })
      .finally(() => {
        setAuthChecking(false);
      });
  }, []);

  // Fetch initial product catalog, categories and customer logs
  const loadPOSData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/products`),
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

  // Barcode / SKU Scan submit handler
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = searchQuery.trim();
    if (!code) return;

    // Scan parse logic: support direct SKU match or SKU-size match (e.g. TF-123456-M)
    const parts = code.split("-");
    let targetSku = code;
    let targetSize = "M"; // default fallback size if not found

    if (parts.length > 2) {
      const possibleSize = parts[parts.length - 1].toUpperCase();
      if (["S", "M", "L", "XL", "XXL", "COMBO"].includes(possibleSize)) {
        targetSize = possibleSize;
        targetSku = parts.slice(0, parts.length - 1).join("-");
      }
    }

    const matchedProduct = products.find(
      p => p.sku.toLowerCase() === targetSku.toLowerCase() || p.sku.toLowerCase() === code.toLowerCase()
    );

    if (matchedProduct) {
      const sizes = JSON.parse(matchedProduct.sizesJson || "{}");
      // If we scanned SKU-size specifically, use that size. Else use first size with stock.
      let sizeToUse = targetSize;
      if (!sizes[sizeToUse] || sizes[sizeToUse] <= 0) {
        const availableSizes = Object.keys(sizes).filter(k => sizes[k] > 0);
        if (availableSizes.length > 0) {
          sizeToUse = availableSizes[0];
        } else {
          toast.error(`"${matchedProduct.name}" এর সব সাইজই স্টকআউট!`);
          setSearchQuery("");
          return;
        }
      }

      addToCart(matchedProduct, sizeToUse);
      setSearchQuery("");
      toast.success(`সফলভাবে যুক্ত হয়েছে: ${matchedProduct.name} (${sizeToUse})`);
    } else {
      toast.error("কোনো পণ্য মেলেনি। সঠিক SKU স্ক্যান করুন।");
    }
  };

  // Add Product to Cart
  const addToCart = (product: Product, size: string) => {
    const sizesObj = JSON.parse(product.sizesJson || "{}");
    const stock = Number(sizesObj[size] || 0);

    if (stock <= 0) {
      toast.error(`"${product.name}" এর ${size} সাইজটি স্টকআউট!`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.size === size);
      if (existing) {
        if (existing.quantity >= stock) {
          toast.warning(`স্টকের সীমায় পৌঁছে গেছেন (${stock} টি উপলব্ধ)`);
          return prev;
        }
        return prev.map(item => 
          item.id === product.id && item.size === size 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [
        ...prev, 
        { 
          id: product.id, 
          sku: product.sku, 
          name: product.name, 
          price: product.price, 
          quantity: 1, 
          size, 
          availableStock: stock 
        }
      ];
    });
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

  const deliveryCharge = useMemo(() => {
    if (!isHomeDelivery) return 0;
    return customerCity.toLowerCase().trim() === "dhaka" ? 80 : 150;
  }, [isHomeDelivery, customerCity]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - flatDiscount + deliveryCharge);
  }, [subtotal, flatDiscount, deliveryCharge]);

  const changeDue = useMemo(() => {
    if (receivedCash <= 0 || receivedCash < grandTotal) return 0;
    return receivedCash - grandTotal;
  }, [receivedCash, grandTotal]);

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
  };

  // Submit POS Order Checkout
  const handlePOSCheckout = async () => {
    if (cart.length === 0) {
      toast.error("কার্ট খালি! প্রথমে পণ্য যুক্ত করুন।");
      return;
    }

    if (isHomeDelivery && (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim())) {
      toast.error("হোম ডেলিভারির জন্য গ্রাহকের নাম, ফোন ও ঠিকানা আবশ্যক।");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: customerName.trim() || "শোরুম কাস্টমার",
        phone: customerPhone.trim() || "01700000000",
        address: customerAddress.trim() || "বসুন্ধরা সিটি শোরুম",
        city: customerCity,
        postcode: customerPostcode,
        paymentMethod,
        shippingMethod: isHomeDelivery ? (customerCity.toLowerCase() === "dhaka" ? "inside" : "outside") : "showroom",
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size
        })),
        discount: flatDiscount,
        orderStatus: isHomeDelivery ? "PENDING" : "DELIVERED",
        paymentStatus: isHomeDelivery ? "UNPAID" : "PAID"
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
        setIsHomeDelivery(false);
        setPaymentMethod("cash");
        loadPOSData(); // Reload inventory counts

        // Auto trigger print frame
        setTimeout(() => {
          window.print();
        }, 300);
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

  // Localized date formatter helper
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
      <div className="grain-bg min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-sm font-semibold text-muted-foreground">অ্যাডমিন প্রবেশাধিকার যাচাই করা হচ্ছে...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="h-screen bg-[#FCFAF7] text-foreground flex flex-col overflow-hidden relative">
      <Toaster position="top-right" richColors />

      {/* POS Top Bar Header */}
      <header className="h-16 bg-white border-b border-border/80 px-6 flex items-center justify-between flex-shrink-0 z-10 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 hover:bg-secondary rounded-xl text-muted-foreground hover:text-foreground transition-all">
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
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-slate-800">{adminUser?.name || "অ্যাডমিন"}</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">বসুন্ধরা সিটি শোরুম</div>
          </div>
          <span className="text-[9px] bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full border border-green-200 uppercase tracking-wider">
            Online Counter
          </span>
        </div>
      </header>

      {/* POS Work Area */}
      <div className="flex-1 flex overflow-hidden print:hidden">
        
        {/* Left Screen: Catalog Panel */}
        <div className="w-[60%] flex flex-col border-r border-border/60 bg-white">
          
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
                  className="w-full pl-10 pr-10 py-3 border border-border bg-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground font-semibold"
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
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex-shrink-0 ${
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
          <div className="flex-grow overflow-y-auto p-4 bg-[#FCFAF7]/20">
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
                  const sizes = JSON.parse(prod.sizesJson || "{}");
                  const hasStock = Object.values(sizes).some(qty => Number(qty) > 0);

                  return (
                    <div 
                      key={prod.id} 
                      className={`bg-white border border-border/80 p-3 rounded-xl shadow-xs flex flex-col justify-between transition-all duration-300 hover:shadow-sm ${
                        !hasStock ? "opacity-60" : ""
                      }`}
                    >
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-50 border border-slate-100 mb-2.5">
                        <img 
                          src={prod.imgUrl} 
                          alt={prod.name} 
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/assets/cotton_1.png";
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
                                onClick={() => addToCart(prod, sizeKey)}
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
        <div className="w-[40%] flex flex-col bg-white shadow-lg border-l border-border/40">
          
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
          <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-2 bg-[#FCFAF7]/10">
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
            <div className="mb-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1.5">
                  <User size={12} className="text-primary" />
                  গ্রাহক লিঙ্ক (Customer Profile)
                </span>
                {!selectedCustomer && !isNewCustomerForm && (
                  <button 
                    onClick={() => setIsNewCustomerForm(true)}
                    className="text-[9px] text-primary hover:text-primary/90 font-bold border-none bg-transparent cursor-pointer flex items-center gap-0.5"
                  >
                    <UserPlus size={12} />
                    <span>নতুন গ্রাহক</span>
                  </button>
                )}
                {(selectedCustomer || isNewCustomerForm) && (
                  <button 
                    onClick={() => {
                      clearLinkedCustomer();
                      setIsNewCustomerForm(false);
                    }}
                    className="text-[9px] text-rose-500 hover:text-rose-600 font-bold border-none bg-transparent cursor-pointer"
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
                  {isHomeDelivery && (
                    <div className="flex flex-col gap-2">
                      <input 
                        type="text" 
                        placeholder="ঠিকানা (বাড়ি, রোড, এলাকা...)" 
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full px-3 py-1.5 border border-border bg-white rounded-lg text-xs font-semibold focus:outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          value={customerCity}
                          onChange={(e) => setCustomerCity(e.target.value)}
                          className="w-full px-3 py-1.5 border border-border bg-white rounded-lg text-xs font-semibold focus:outline-none"
                        >
                          <option value="Dhaka">Dhaka (৳৮০)</option>
                          <option value="Outside">Outside Dhaka (৳১৫০)</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="পোস্টকোড" 
                          value={customerPostcode}
                          onChange={(e) => setCustomerPostcode(e.target.value)}
                          className="w-full px-3 py-1.5 border border-border bg-white rounded-lg text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedCustomer ? (
                /* Customer Link Active View */
                <div className="bg-primary/5 border border-primary/20 p-2.5 rounded-xl flex items-center justify-between">
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
                      if (val.length >= 3) {
                        try {
                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/logs`); // fallback / mock database retrieval or customer query
                          // A simplified dummy fallback or fetch customer list
                          // In the store backend users are stored. We can fetch and search user accounts:
                          const uRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/products`); // search logic or products mock fallback
                          // Fetch real orders list and get distinct client phones/names to speed up search!
                          const oRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/orders`, { credentials: "include" });
                          if (oRes.ok) {
                            const oData = await oRes.json();
                            const clients: any[] = [];
                            const seen = new Set();
                            oData.forEach((o: any) => {
                              if (o.phone && !seen.has(o.phone)) {
                                seen.add(o.phone);
                                clients.push({ name: o.name, phone: o.phone, address: o.address, city: o.city, postcode: o.postcode });
                              }
                            });
                            const matched = clients.filter(c => c.phone.includes(val) || c.name.toLowerCase().includes(val.toLowerCase()));
                            setCustomers(matched);
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      } else {
                        setCustomers([]);
                      }
                    }}
                    className="w-full pl-8 pr-3 py-2 border border-border bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                  {customerSearchQuery.length >= 3 && customers.length > 0 && (
                    <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border border-border shadow-lg rounded-xl z-20 max-h-40 overflow-y-auto">
                      {customers.map((c) => (
                        <button
                          key={c.phone}
                          onClick={() => handleSelectCustomer(c)}
                          className="w-full text-left p-2.5 hover:bg-slate-50 border-none bg-transparent cursor-pointer flex items-center justify-between text-xs border-b border-border/40 last:border-none font-semibold text-slate-800"
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

            {/* Flat Discount / Fulfillment Toggle / Payment Tabs */}
            <div className="grid grid-cols-2 gap-3 mb-3.5">
              <div>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1.5 mb-1.5">
                  <Tag size={12} className="text-primary" />
                  ছাড় (Flat Discount)
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">৳</span>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={flatDiscount || ""}
                    onChange={(e) => setFlatDiscount(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-6 pr-3 py-2 border border-border bg-slate-50 rounded-xl text-xs font-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1.5 mb-1.5">
                  <ShoppingBag size={12} className="text-primary" />
                  ডেলিভারি মোড (Fulfillment)
                </span>
                <div className="grid grid-cols-2 border border-border rounded-xl overflow-hidden bg-slate-100 p-0.5">
                  <button
                    onClick={() => {
                      setIsHomeDelivery(false);
                      setCustomerCity("Dhaka");
                    }}
                    className={`py-1.5 border-none rounded-lg text-[9px] font-black cursor-pointer transition-all ${
                      !isHomeDelivery
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    শোরুম ক্রয়
                  </button>
                  <button
                    onClick={() => {
                      setIsHomeDelivery(true);
                      setIsNewCustomerForm(true);
                    }}
                    className={`py-1.5 border-none rounded-lg text-[9px] font-black cursor-pointer transition-all ${
                      isHomeDelivery
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    হোম ডেলিভারি
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="mb-4">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1.5">পেমেন্ট মেথড (Payment Method)</span>
              <div className="grid grid-cols-4 border border-border rounded-xl overflow-hidden p-0.5 bg-slate-100">
                {(["cash", "card", "bkash", "nagad"] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => {
                      setPaymentMethod(method);
                      if (method !== "cash") setReceivedCash(0);
                    }}
                    className={`py-2 text-[10px] font-black border-none rounded-lg cursor-pointer transition-all uppercase ${
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

            {/* Cash change calculator (Only shows if Cash method is selected) */}
            {paymentMethod === "cash" && (
              <div className="mb-4 bg-slate-50 border border-border p-3 rounded-xl flex items-center justify-between gap-3">
                <div className="flex-grow">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">গ্রহনকৃত টাকা (Received Cash)</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">৳</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={receivedCash || ""}
                      onChange={(e) => setReceivedCash(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-6 pr-3 py-1.5 border border-border bg-white rounded-lg text-xs font-black focus:outline-none"
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
            <div className="bg-slate-50 border border-border p-3 rounded-xl flex flex-col gap-2 mb-4">
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
              {isHomeDelivery && (
                <div className="flex justify-between text-xs text-slate-600 font-semibold">
                  <span>ডেলিভারি চার্জ (Delivery Cost):</span>
                  <span className="font-sans">৳{deliveryCharge}</span>
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
              className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold py-3.5 px-6 rounded-xl border-none cursor-pointer text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
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

      {/* POS Receipt Area (Hidden on screen, formatted for thermal print) */}
      {receiptOrder && (
        <div id="pos-receipt-print-area" className="hidden print:block">
          <div className="receipt-center">
            <h2 className="receipt-bold" style={{ fontSize: "14px", margin: "0 0 2px 0" }}>তানহা ফ্যাশন</h2>
            <div style={{ fontSize: "9px" }}>বসুন্ধরা সিটি শোরুম, লেভেল-৩, ঢাকা</div>
            <div style={{ fontSize: "9px" }}>হটলাইন: ০১৬০০০৮৬৭৭৩</div>
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
                // Find matching product name in local state if nested is truncated, or fallback
                const pName = item.name || "ডিজাইনার ড্রেস";
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
            <div>পেমেন্ট মেথড: <span className="receipt-bold uppercase">{receiptOrder.paymentMethod}</span></div>
            <div>পেমেন্ট স্ট্যাটাস: <span className="receipt-bold">{receiptOrder.paymentStatus === "PAID" ? "পরিশোধিত" : "বকেয়া"}</span></div>
            <div>ডেলিভারি মোড: <span className="receipt-bold">{receiptOrder.shippingCost > 0 ? "হোম ডেলিভারি" : "শোরুম ক্যাশ কাউন্টার"}</span></div>
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-center" style={{ fontSize: "8px", marginTop: "10px", lineHeight: "1.4" }}>
            <div className="receipt-bold">ধন্যবাদ! আবার আসবেন।</div>
            <div>ক্রয়কৃত পণ্য পরিবর্তনের জন্য ৩ দিনের মধ্যে শোরুমে রশিদসহ যোগাযোগ করুন। (অনুগ্রহ করে ধোয়া বা ব্যবহৃত কাপড় পরিবর্তনযোগ্য নয়)।</div>
            <div style={{ marginTop: "5px", fontSize: "7px", color: "#666" }}>Powered by Tanha Fashion Cloud POS v1.1</div>
          </div>
        </div>
      )}
    </div>
  );
}
