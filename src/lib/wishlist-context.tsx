"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => boolean;
  isFavorite: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tanha_wishlist");
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading wishlist from localStorage:", e);
    }
    setIsInitialized(true);
  }, []);

  // Save wishlist to localStorage when it changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("tanha_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error("Error saving wishlist to localStorage:", e);
    }
  }, [wishlist, isInitialized]);

  const toggleWishlist = (productId: string): boolean => {
    let added = false;
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        added = true;
        return [...prev, productId];
      }
    });
    return added;
  };

  const isFavorite = (productId: string): boolean => {
    return wishlist.includes(productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isFavorite }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
