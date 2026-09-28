"use client";

import { useState, useTransition } from "react";
import { Item, StockStatus } from "@/lib/types";
import { checkoutItems } from "@/app/actions/shopping";
import { formatRupiah, formatDateGroup } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import PrimaryButton from "@/components/ui/PrimaryButton";
import EmptyState from "@/components/ui/EmptyState";
import {
  Check,
  CheckCircle2,
  PartyPopper,
  CheckCheck,
  Share2,
  Tag,
  Wallet,
} from "lucide-react";

interface ShoppingClientProps {
  items: Item[];
}

export default function ShoppingClient({ items }: ShoppingClientProps) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);

  const habisItems = items.filter((i) => i.status === StockStatus.HABIS);
  const menipisItems = items.filter((i) => i.status === StockStatus.MENIPIS);

  // Calculate budget statistics
  const totalCheckedPrice = Array.from(checkedIds).reduce((acc, id) => {
    const item = items.find((i) => i.id === id);
    return acc + (item?.estimatedPrice || 0);
  }, 0);

  const grandTotalPrice = items.reduce(
    (acc, i) => acc + (i.estimatedPrice || 0),
    0
  );

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate(20);
  };

  const selectAll = () => {
    if (checkedIds.size === items.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(items.map((i) => i.id)));
    }
  };

  const handleCheckout = () => {
    if (checkedIds.size === 0) return;
    if (typeof window !== "undefined" && navigator.vibrate)
      navigator.vibrate([40, 30, 40]);

    startTransition(async () => {
      await checkoutItems(Array.from(checkedIds));
      setCheckedIds(new Set());
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
    });
  };

  // Generate WhatsApp message and open link
  const handleShareWhatsApp = () => {
    const dateStr = formatDateGroup(new Date());
    let text = `🛒 *Daftar Belanja StokKu*\n📅 ${dateStr}\n\n`;

    if (habisItems.length > 0) {
      text += `🔴 *Habis (Prioritas):*\n`;
      habisItems.forEach((item) => {
        const priceStr =
          item.estimatedPrice > 0 ? ` (~${formatRupiah(item.estimatedPrice)})` : "";
        text += `• ${item.name}${priceStr}\n`;
      });
      text += `\n`;
    }

    if (menipisItems.length > 0) {
      text += `🟡 *Menipis:*\n`;
      menipisItems.forEach((item) => {
        const priceStr =
          item.estimatedPrice > 0 ? ` (~${formatRupiah(item.estimatedPrice)})` : "";
        text += `• ${item.name}${priceStr}\n`;
      });
      text += `\n`;
    }

    if (grandTotalPrice > 0) {
      text += `💰 *Estimasi Total:* ${formatRupiah(grandTotalPrice)}\n\n`;
    }

    text += `_Disusun otomatis via StokKu_`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />}
        title="Semua Aman! 🎉"
        description="Tidak ada barang yang perlu dibeli. Seluruh stok kebutuhanmu masih mencukupi."
      />
    );
  }

  const renderSection = (
    title: string,
    sectionItems: Item[],
    urgent: boolean
  ) => {
    if (sectionItems.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-bold ${
                urgent ? "text-rose-700" : "text-amber-700"
              }`}
            >
              {urgent ? "🔴 " : "🟡 "}
              {title}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
              {sectionItems.length}
            </span>
          </div>
        </div>

        <div className="space-y-2 stagger-children">
          {sectionItems.map((item) => {
            const isChecked = checkedIds.has(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`
                  rounded-2xl p-3.5 cursor-pointer
                  flex items-center gap-3.5
                  transition-all duration-200 select-none backdrop-blur-xl
                  active:scale-[0.98]
                  ${
                    isChecked
                      ? "bg-emerald-50/90 border border-emerald-300/80 shadow-xs"
                      : "glass hover:bg-white/90 shadow-sm hover:shadow-md"
                  }
                `}
              >
                {/* Custom animated checkbox */}
                <div
                  className={`
                    w-6 h-6 rounded-lg border-2 shrink-0
                    flex items-center justify-center
                    transition-all duration-200
                    ${
                      isChecked
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30 scale-105"
                        : "border-slate-300 bg-white/90 hover:border-slate-400"
                    }
                  `}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                {/* Item info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold block truncate transition-colors ${
                        isChecked
                          ? "line-through text-slate-400"
                          : "text-slate-800"
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.estimatedPrice > 0 && (
                      <span className="text-xs font-semibold text-emerald-700 shrink-0">
                        {formatRupiah(item.estimatedPrice)}
                      </span>
                    )}
                  </div>
                  {item.category && (
                    <span className="text-[11px] font-medium text-slate-500 block">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Status badge */}
                <div className="shrink-0">
                  <StatusBadge status={item.status} size="sm" showDot={false} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Success banner alert */}
      {showSuccess && (
        <div className="mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-3 shadow-md animate-fade-in-up">
          <PartyPopper className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs font-semibold">
            Belanja berhasil dicatat! Status barang yang dicentang kini kembali{" "}
            <b>Aman 🟢</b> dan riwayat restok telah diperbarui.
          </div>
        </div>
      )}

      {/* Budget Summary Card & Share Bar */}
      <div className="glass rounded-2xl p-4 mb-5 border border-white/80 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                Estimasi Total Belanja
              </span>
              <span className="text-base font-black text-slate-900">
                {grandTotalPrice > 0 ? formatRupiah(grandTotalPrice) : "Belum diatur harga"}
              </span>
            </div>
          </div>

          {/* Share to WhatsApp Button */}
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
            title="Bagikan daftar belanja ke WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            WhatsApp
          </button>
        </div>

        {totalCheckedPrice > 0 && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Terpilih ({checkedIds.size} barang):
            </span>
            <span className="font-bold text-emerald-700">
              {formatRupiah(totalCheckedPrice)}
            </span>
          </div>
        )}
      </div>

      {/* Select all toggle bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={selectAll}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200/60"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          {checkedIds.size === items.length
            ? "Batal Pilih Semua"
            : "Pilih Semua"}
        </button>

        <span className="text-xs font-semibold text-slate-500">
          {checkedIds.size} dari {items.length} terpilih
        </span>
      </div>

      {/* Sections */}
      {renderSection("Habis — Prioritas Utama", habisItems, true)}
      {renderSection("Menipis — Perlu Dibeli Segera", menipisItems, false)}

      {/* Floating Checkout Button Bar above BottomNav */}
      {checkedIds.size > 0 && (
        <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-30 animate-fade-in-up">
          <div className="glass-modal rounded-2xl p-2.5 shadow-2xl">
            <PrimaryButton
              onClick={handleCheckout}
              loading={isPending}
              fullWidth
              size="lg"
              className="gap-2 text-sm font-bold justify-between px-4"
            >
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3]" />
                Selesai Belanja ({checkedIds.size})
              </span>
              {totalCheckedPrice > 0 && (
                <span className="bg-emerald-800/40 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                  {formatRupiah(totalCheckedPrice)}
                </span>
              )}
            </PrimaryButton>
          </div>
        </div>
      )}
    </>
  );
}
