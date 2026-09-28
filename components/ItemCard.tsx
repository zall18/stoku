"use client";

import { useState, useTransition } from "react";
import { Item, StockStatus } from "@/lib/types";
import { toggleItemStatus, deleteItem } from "@/app/actions/item";
import { STATUS_CONFIG } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import { Trash2, Edit2, MoreVertical, RefreshCw } from "lucide-react";

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
}

export default function ItemCard({ item, onEdit }: ItemCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useState(item.status);
  const config = STATUS_CONFIG[optimisticStatus];

  // Sync optimistic status when item prop changes
  if (item.status !== optimisticStatus && !isPending) {
    setOptimisticStatus(item.status);
  }

  const handleToggle = () => {
    // Optimistic update
    const statusCycle: StockStatus[] = [
      StockStatus.AMAN,
      StockStatus.MENIPIS,
      StockStatus.HABIS,
    ];
    const currentIndex = statusCycle.indexOf(optimisticStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    setOptimisticStatus(nextStatus);

    // Haptic feedback on mobile
    if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate(30);

    startTransition(async () => {
      await toggleItemStatus(item.id);
    });
  };

  const handleDelete = () => {
    if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate(50);
    startTransition(async () => {
      await deleteItem(item.id);
    });
    setShowMenu(false);
  };

  return (
    <div
      onClick={handleToggle}
      className={`
        relative rounded-2xl p-4 cursor-pointer select-none
        transition-all duration-300 ease-out
        backdrop-blur-xl
        hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]
        ${config.cardShadowClass}
        ${isPending ? "opacity-75 pointer-events-none" : ""}
        overflow-hidden group
      `}
    >
      {/* Top frosted glass reflection line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />

      {/* Subtle corner colored ambient gradient glow */}
      <div
        className={`
          absolute -right-10 -bottom-10 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-300
          ${
            optimisticStatus === StockStatus.HABIS
              ? "bg-rose-400"
              : optimisticStatus === StockStatus.MENIPIS
              ? "bg-amber-400"
              : "bg-emerald-400"
          }
        `}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Top row: Name & Menu */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex-1 min-w-0 pr-1">
            <h3 className="text-[15px] font-bold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
              {item.name}
            </h3>
            {item.category && (
              <span className="inline-block mt-1 text-[11px] font-medium text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/50">
                {item.category}
              </span>
            )}
          </div>

          {/* Menu button */}
          <div className="relative shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 transition-all"
              aria-label="Menu barang"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 top-8 z-50 min-w-[130px] rounded-xl border border-slate-200/80 shadow-xl py-1 bg-white/95 backdrop-blur-xl animate-fade-in-up">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="flex items-center gap-2 w-full px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom row: Status badge + 1-Tap indicator */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
          <StatusBadge status={optimisticStatus} size="sm" />
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
            <RefreshCw className="w-2.5 h-2.5 group-hover:rotate-180 transition-transform duration-500" />
            Tap ganti
          </span>
        </div>
      </div>
    </div>
  );
}
