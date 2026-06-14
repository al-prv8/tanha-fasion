import React from "react";
import { X } from "lucide-react";

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: number;
  scrollToSection: (index: number) => void;
}

export default function MobileMenuDrawer({
  isOpen,
  onClose,
  activeSection,
  scrollToSection,
}: MobileMenuDrawerProps) {
  const handleLinkClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    scrollToSection(index);
    onClose();
  };

  const menuItems = [
    { label: "হোম", index: 0 },
    { label: "টপ ক্যাটাগরি", index: 1 },
    { label: "সুতি থ্রি-পিস", index: 2 },
    { label: "জর্জেট থ্রি-পিস", index: 3 },
    { label: "লিলেন থ্রি-পিস", index: 4 },
    { label: "ক্যাজুয়াল আবায়া", index: 5 },
    { label: "উৎসবের বোরকা", index: 6 },
    { label: "বিশেষ কম্বো", index: 7 },
    { label: "জিজ্ঞাসা", index: 8 },
  ];

  return (
    <>
      {/* Mobile Menu Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[15000] transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} 
        onClick={onClose} 
      />
      
      {/* Mobile Menu Drawer */}
      <div className={`fixed top-0 left-0 h-full w-[300px] max-w-[80%] bg-background shadow-2xl z-[15001] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">নেভিগেশন</h2>
          <button className="bg-transparent border-none cursor-pointer p-2 text-foreground transition-opacity hover:opacity-75" onClick={onClose} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>
        <ul className="flex flex-col p-6 gap-4 list-none m-0 overflow-y-auto">
          {menuItems.map((item) => (
            <li key={item.index}>
              <a 
                href="#" 
                className={`no-underline text-foreground text-base font-semibold transition-colors duration-200 hover:text-primary block py-2 ${activeSection === item.index ? "text-primary" : ""}`} 
                onClick={(e) => handleLinkClick(e, item.index)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
