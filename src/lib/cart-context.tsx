import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Product } from "./products";

export interface CartItem {
  id: string; // Display ID e.g., "০১"
  numericId: number;
  name: string;
  img: string;
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
  applyCoupon: (code: string) => { success: boolean; message: string };
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
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart and coupon from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("tanha_cart");
      if (storedCart) {
        setItems(JSON.parse(storedCart));
      }
      const storedCoupon = localStorage.getItem("tanha_coupon");
      if (storedCoupon) {
        setAppliedCoupon(storedCoupon);
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
      if (appliedCoupon) {
        localStorage.setItem("tanha_coupon", appliedCoupon);
      } else {
        localStorage.removeItem("tanha_coupon");
      }
    } catch (error) {
      console.error("Error saving coupon to localStorage:", error);
    }
  }, [appliedCoupon, isInitialized]);

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
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === "TANHA20") {
      setAppliedCoupon("TANHA20");
      return { success: true, message: "২০% ছাড় কুপন সফলভাবে যুক্ত হয়েছে!" };
    }
    return { success: false, message: "ভুল কুপন কোড! অনুগ্রহ করে আবার চেষ্টা করুন।" };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Computed values
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const discount = useMemo(() => {
    if (appliedCoupon === "TANHA20") {
      return Math.round(subtotal * 0.20);
    }
    return 0;
  }, [subtotal, appliedCoupon]);

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
