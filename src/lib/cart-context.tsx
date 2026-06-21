"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Product } from "./products";

export interface CartItem {
  id: string; // Display ID e.g., "০১"
  numericId: number;
  name: string;
  img: any;
  price: number;
  priceDisplay: string;
  quantity: number;
  size: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  subtotal: number;
  discount: number;
  cartCount: number;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCouponDetails, setAppliedCouponDetails] = useState<any | null>(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const appliedCoupon = appliedCouponDetails?.code || null;

  // Load cart and coupon from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("tanha_cart");
      if (storedCart) {
        setItems(JSON.parse(storedCart));
      }
      const storedCouponDetails = localStorage.getItem("tanha_coupon_details");
      if (storedCouponDetails) {
        setAppliedCouponDetails(JSON.parse(storedCouponDetails));
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
    setIsInitialized(true);
  }, []);

  // Save cart and coupon to localStorage when state changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("tanha_cart", JSON.stringify(items));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [items, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (appliedCouponDetails) {
        localStorage.setItem("tanha_coupon_details", JSON.stringify(appliedCouponDetails));
      } else {
        localStorage.removeItem("tanha_coupon_details");
      }
    } catch (error) {
      console.error("Error saving coupon details to localStorage:", error);
    }
  }, [appliedCouponDetails, isInitialized]);

  const addToCart = (product: Product, quantity = 1, size = "M") => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === product.id && item.size === size
      );

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      } else {
        // Item doesn't exist, add new
        return [
          ...prevItems,
          {
            id: product.id,
            numericId: product.numericId,
            name: product.name,
            img: product.img,
            price: product.price,
            priceDisplay: product.priceDisplay,
            quantity,
            size,
          },
        ];
      }
    });
  };

  const removeFromCart = (id: string, size: string) => {
    setItems((prevItems) => prevItems.filter((item) => !(item.id === id && item.size === size)));
  };

  const updateQuantity = (id: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, size);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.size === size ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCouponDetails(null);
  };

  const applyCoupon = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return { success: false, message: "দয়া করে কুপন কোড লিখুন।" };

    try {
      const res = await fetch("http://localhost:5000/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode, subtotal })
      });

      if (!res.ok) {
        const errData = await res.json();
        return { success: false, message: errData.error || "কুপন কোড প্রয়োগ করা যায়নি।" };
      }

      const data = await res.json();
      if (data.success && data.coupon) {
        setAppliedCouponDetails({
          code: data.coupon.code,
          type: data.coupon.type,
          value: data.coupon.value
        });
        const discText = data.coupon.type === "PERCENTAGE" ? `${data.coupon.value}% ছাড়` : `৳${data.coupon.value} ছাড়`;
        return { success: true, message: `কুপন (${data.coupon.code} - ${discText}) সফলভাবে যুক্ত হয়েছে!` };
      }
      return { success: false, message: "কুপন কোডটি সঠিক নয়।" };
    } catch (error) {
      console.error("Apply coupon error:", error);
      // fallback to offline coupon
      if (cleanCode === "TANHA20") {
        setAppliedCouponDetails({
          code: "TANHA20",
          type: "PERCENTAGE",
          value: 20
        });
        return { success: true, message: "২০% ছাড় কুপন সফলভাবে যুক্ত হয়েছে! (অফলাইন মোড)" };
      }
      return { success: false, message: "সার্ভারের সাথে সংযোগ স্থাপন করা যাচ্ছে না।" };
    }
  };

  const removeCoupon = () => {
    setAppliedCouponDetails(null);
  };

  // Computed values
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const discount = useMemo(() => {
    if (!appliedCouponDetails) return 0;
    let amt = 0;
    if (appliedCouponDetails.type === "PERCENTAGE") {
      amt = Math.round((subtotal * appliedCouponDetails.value) / 100);
    } else {
      amt = appliedCouponDetails.value;
    }
    return Math.min(amt, subtotal);
  }, [subtotal, appliedCouponDetails]);

  const cartCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discount,
        cartCount,
        cartDrawerOpen,
        setCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
