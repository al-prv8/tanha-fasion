import React from "react";

interface ToastNotificationProps {
  isActive: boolean;
  message: string;
}

export default function ToastNotification({
  isActive,
  message,
}: ToastNotificationProps) {
  return (
    <div 
      className={`fixed bottom-8 left-1/2 bg-foreground text-background py-3 px-6 rounded-full font-semibold text-sm shadow-xl z-[20000] transition-all duration-300 -translate-x-1/2 ${isActive ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95"}`} 
      id="toast"
    >
      {message}
    </div>
  );
}
