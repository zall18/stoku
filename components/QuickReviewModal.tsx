"use client";

import { useState } from "react";
import { Item, StockStatus } from "@/lib/types";
import { toggleItemStatus, updateItem } from "@/app/actions/item";
import { calculateLifespan, STATUS_CONFIG } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { Sparkles, Check, AlertTriangle, XCircle, Clock } from "lucide-react";

interface QuickReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
}

export default function QuickReviewModal({
  isOpen,
  onClose,
  items,
}: QuickReviewModalProps) {
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  const handleSetStatus = async (id: string, status: StockStatus) => {
    setReviewedIds((prev) => new Set(prev).add(id));
    await updateItem(id, {
      status,
      ...(status === StockStatus.AMAN && { lastRestockedAt: new Date() }),
    });
  };

  const pendingReviewItems = items.filter((i) => !reviewedIds.has(i.id));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚡ Review Cepat Stok">
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {pendingReviewItems.length > 0
              ? `${pendingReviewItems.length} barang diprediksi perlu kamu cek hari ini:`
              : "Semua barang sudah selesai di-review!"}
          </span>
        </div>

        {pendingReviewItems.length === 0 ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl">
              🎉
            </div>
            <p className="text-sm font-bold text-slate-800">
              Selesai! Stok kamu terpantau aman.
            </p>
            <PrimaryButton onClick={onClose} fullWidth size="md">
              Kembali ke Inventaris
            </PrimaryButton>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {pendingReviewItems.map((item) => {
              const lifespan = calculateLifespan(item);
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.category && (
                          <span className="text-[10px] text-slate-400">
                            {item.category}
                          </span>
                        )}
                        {lifespan.hasLifespan && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${lifespan.badgeColor}`}
                          >
                            {lifespan.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 1-Tap Quick Action Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => handleSetStatus(item.id, StockStatus.AMAN)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Aman
                    </button>

                    <button
                      onClick={() =>
                        handleSetStatus(item.id, StockStatus.MENIPIS)
                      }
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Menipis
                    </button>

                    <button
                      onClick={() => handleSetStatus(item.id, StockStatus.HABIS)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Habis
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
