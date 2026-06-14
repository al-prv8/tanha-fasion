import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { toBanglaNumber, formatBanglaPriceWithCommas } from "@/lib/products";

interface CartDrawerProps {
  showToast: (msg: string) => void;
}

export default function CartDrawer({ showToast }: CartDrawerProps) {
  const {
    items,
    removeFromCart,
    updateQuantity,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discount,
    cartCount,
    cartDrawerOpen,
    setCartDrawerOpen,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");

  return (
    <>
      {/* Cart Drawer Backdrop */}
      <div 
        className={`fixed inset-0 bg-ink/40 backdrop-blur-sm z-[15000] transition-opacity duration-300 ${cartDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} 
        onClick={() => setCartDrawerOpen(false)} 
      />

      {/* Cart Drawer */}
      <div className={`fixed top-0 right-0 h-full w-[420px] max-w-full bg-background shadow-2xl z-[15001] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${cartDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 border-b border-ink/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            আপনার ব্যাগ ({toBanglaNumber(cartCount)})
          </h2>
          <button className="bg-transparent border-none cursor-pointer p-2 text-foreground transition-opacity hover:opacity-75" onClick={() => setCartDrawerOpen(false)} aria-label="Close cart">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-14 h-14 opacity-30">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <div className="text-base font-semibold">আপনার ব্যাগ বর্তমানে খালি আছে।</div>
              <button className="flex w-full text-center py-2 px-4 bg-primary text-bone border-none rounded font-bold justify-center cursor-pointer transition-colors hover:bg-foreground" onClick={() => setCartDrawerOpen(false)} style={{ maxWidth: "200px", marginTop: "1rem" }}>
                কেনাকাটা চালিয়ে যান
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-4 pb-5 border-b border-ink/5">
                <img src={item.img.src || item.img} alt={item.name} className="w-[70px] h-[90px] object-cover rounded bg-card" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2">{item.name}</h3>
                    <div className="text-xs text-muted-foreground mt-0.5">সাইজ: {item.size}</div>
                    <div className="text-sm font-bold text-primary mt-1">{item.priceDisplay}</div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center bg-card rounded p-0.5">
                      <button className="w-6 h-6 rounded-sm border-none bg-transparent cursor-pointer flex items-center justify-center text-xs text-foreground transition-colors hover:bg-ink/5" onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}>-</button>
                      <span className="text-xs font-semibold w-6 text-center">{toBanglaNumber(item.quantity)}</span>
                      <button className="w-6 h-6 rounded-sm border-none bg-transparent cursor-pointer flex items-center justify-center text-xs text-foreground transition-colors hover:bg-ink/5" onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}>+</button>
                    </div>
                    <button className="bg-transparent border-none text-muted-foreground cursor-pointer text-xs flex items-center gap-1 p-1 transition-colors hover:text-red-500" onClick={() => removeFromCart(item.id, item.size)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 9m-4.72 0-.34-9m9.96-3.243.5 8.625c.01.233-.03.468-.12.692a1.875 1.875 0 0 1-.502.825c-.29.297-.677.464-1.082.464H7.25c-.405 0-.792-.167-1.082-.464a1.875 1.875 0 0 1-.622-1.517l.5-8.625m15.3 0a12.07 12.07 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a12.11 12.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                      বাদ দিন
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-ink/10 bg-bone">
            <div className="flex justify-between mb-2 text-sm text-muted-foreground">
              <span>উপমোট</span>
              <span>{formatBanglaPriceWithCommas(subtotal)}</span>
            </div>
            
            {appliedCoupon ? (
              <div className="flex justify-between items-center bg-accent/15 p-2 rounded mb-3 text-xs text-primary font-medium">
                <span>কুপন কোড ({appliedCoupon}) যুক্ত হয়েছে (২০%)</span>
                <div className="flex items-center gap-2">
                  <span>-{formatBanglaPriceWithCommas(discount)}</span>
                  <button className="bg-transparent border-none text-primary cursor-pointer text-xs font-semibold underline" onClick={removeCoupon}>বাদ দিন</button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="কুপন কোড (যেমন: TANHA20)"
                  className="flex-1 py-2 px-3 border border-ink/15 bg-white rounded text-xs text-foreground focus:outline-none focus:border-primary"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
                <button 
                  className="py-2 px-4 bg-foreground text-background border-none rounded text-xs cursor-pointer font-semibold transition-colors hover:bg-primary"
                  onClick={() => {
                    const res = applyCoupon(couponInput);
                    showToast(res.message);
                    if (res.success) setCouponInput("");
                  }}
                >
                  প্রয়োগ করুন
                </button>
              </div>
            )}

            <div className="text-base font-bold text-foreground mt-3 pt-3 border-t border-dashed border-ink/15 flex justify-between">
              <span>সর্বমোট</span>
              <span>{formatBanglaPriceWithCommas(subtotal - discount)}</span>
            </div>

            <Link href="/checkout" className="flex w-full text-center py-3 bg-primary text-bone border-none rounded font-bold mt-4 transition-colors duration-300 text-base items-center justify-center cursor-pointer hover:bg-foreground" onClick={() => setCartDrawerOpen(false)}>
              চেকআউট করুন
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
