"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingCart, Clock } from "lucide-react";

const NAV_ITEMS = [
  { href: "/inventaris", icon: Package, label: "Inventaris" },
  { href: "/belanja", icon: ShoppingCart, label: "Belanja" },
  { href: "/riwayat", icon: Clock, label: "Riwayat" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  // If user is on landing page root `/`, don't show the bottom app nav
  if (pathname === "/") return null;

  return (
    <nav className="fixed bottom-3 left-4 right-4 max-w-md mx-auto z-40">
      <div className="glass-nav rounded-2xl px-3 py-1.5 shadow-xl">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive =
              pathname === href || (href === "/inventaris" && pathname === "/");
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl
                  transition-all duration-200 relative
                  ${
                    isActive
                      ? "text-emerald-700 bg-emerald-50/90 font-bold shadow-xs"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 font-medium"
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5] text-emerald-600" : ""}`} />
                <span className="text-[11px]">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
