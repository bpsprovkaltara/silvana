"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";

export default function MobileSidebarToggle({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [openState, setOpenState] = useState({ open: false, pathname });

  // Close sidebar on route change (derived state pattern)
  if (openState.pathname !== pathname) {
    setOpenState({ open: false, pathname });
  }

  const open = openState.open;
  const close = useCallback(() => setOpenState((s) => ({ ...s, open: false })), []);
  const show = useCallback(() => setOpenState((s) => ({ ...s, open: true })), []);

  return (
    <>
      {/* Hamburger button - mobile only */}
      <button
        onClick={show}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass rounded-lg shadow-card"
        aria-label="Open menu"
      >
        <svg
          className="w-6 h-6 text-[#0a1628]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Overlay - mobile only */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* Sidebar drawer - mobile only */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full relative">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={close}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}
