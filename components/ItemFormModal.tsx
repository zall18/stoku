"use client";

import { useState, useTransition } from "react";
import { createItem, updateItem } from "@/app/actions/item";
import { CATEGORIES, LIFESPAN_PRESETS } from "@/lib/utils";
import { Item } from "@/lib/types";
import Modal from "@/components/ui/Modal";
import PrimaryButton from "@/components/ui/PrimaryButton";
import BarcodeScannerModal from "@/components/BarcodeScannerModal";
import { Clock, Tag, ScanBarcode, Camera } from "lucide-react";

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: Item | null;
  initialBarcode?: string | null;
}

export default function ItemFormModal({
  isOpen,
  onClose,
  editItem,
  initialBarcode,
}: ItemFormModalProps) {
  const [name, setName] = useState(editItem?.name || "");
  const [category, setCategory] = useState(editItem?.category || "");
  const [durationDays, setDurationDays] = useState<number | null>(
    editItem?.durationDays ?? null
  );
  const [isCustomDuration, setIsCustomDuration] = useState(
    editItem?.durationDays != null &&
      !LIFESPAN_PRESETS.some((p) => p.days === editItem.durationDays)
  );
  const [customDays, setCustomDays] = useState<string>(
    editItem?.durationDays ? String(editItem.durationDays) : ""
  );
  const [estimatedPrice, setEstimatedPrice] = useState<string>(
    editItem?.estimatedPrice ? String(editItem.estimatedPrice) : ""
  );
  const [barcode, setBarcode] = useState<string>(
    editItem?.barcode || initialBarcode || ""
  );
  const [showScanner, setShowScanner] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isEdit = !!editItem;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalDuration = isCustomDuration
      ? customDays ? parseInt(customDays, 10) : null
      : durationDays;
    const finalPrice = estimatedPrice ? parseInt(estimatedPrice, 10) : 0;

    startTransition(async () => {
      if (isEdit && editItem) {
        await updateItem(editItem.id, {
          name,
          category: category || null,
          durationDays: finalDuration,
          estimatedPrice: finalPrice,
          barcode: barcode || null,
        });
      } else {
        await createItem(
          name,
          category || undefined,
          finalDuration,
          finalPrice,
          barcode || null
        );
      }
      handleClose();
    });
  };

  const handleClose = () => {
    setName("");
    setCategory("");
    setDurationDays(null);
    setIsCustomDuration(false);
    setCustomDays("");
    setEstimatedPrice("");
    setBarcode("");
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={isEdit ? "✏️ Edit Barang" : "✨ Tambah Barang Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Barang <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="contoh: Sabun Mandi, Kopi Sachet..."
              autoFocus
              className="
                w-full px-3.5 py-2 text-sm rounded-xl
                bg-white/80 border border-slate-200 text-slate-800 placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500
                transition-all shadow-xs
              "
            />
          </div>

          {/* Category chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Kategori <span className="text-[11px] font-normal text-slate-400">(opsional)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(category === cat ? "" : cat)}
                  className={`
                    px-2.5 py-1 text-xs font-semibold rounded-lg
                    transition-all duration-200 cursor-pointer
                    ${
                      category === cat
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60"
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Lifespan estimation (Perkiraan Habis Pakai) */}
          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Perkiraan Habis Pakai
              </label>
              {durationDays !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setDurationDays(null);
                    setIsCustomDuration(false);
                    setCustomDays("");
                  }}
                  className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  Hapus
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2">
              {LIFESPAN_PRESETS.map((preset) => {
                const isActive = !isCustomDuration && durationDays === preset.days;
                return (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => {
                      setDurationDays(preset.days);
                      setIsCustomDuration(false);
                    }}
                    className={`
                      px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer
                      ${
                        isActive
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }
                    `}
                  >
                    {preset.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setIsCustomDuration(true);
                  setDurationDays(null);
                }}
                className={`
                  px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer
                  ${
                    isCustomDuration
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }
                `}
              >
                Custom Hari
              </button>
            </div>

            {isCustomDuration && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="Jumlah hari (misal 5)"
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-xs font-medium text-slate-500 shrink-0">Hari</span>
              </div>
            )}
          </div>

          {/* Price & Barcode in 2 columns */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Price */}
            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1">
                <Tag className="w-3 h-3 text-emerald-600" />
                Estimasi Harga
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  placeholder="20.000"
                  className="
                    w-full pl-8 pr-2.5 py-2 text-xs rounded-xl
                    bg-white/80 border border-slate-200 text-slate-800 placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500
                    transition-all shadow-xs font-semibold
                  "
                />
              </div>
            </div>

            {/* Barcode with Scan button */}
            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1">
                <ScanBarcode className="w-3 h-3 text-emerald-600" />
                Barcode
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Kode barcode..."
                  className="
                    w-full pl-2.5 pr-8 py-2 text-xs rounded-xl
                    bg-white/80 border border-slate-200 text-slate-800 placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500
                    transition-all shadow-xs
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="absolute right-1.5 p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                  title="Scan dengan kamera"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <PrimaryButton
              type="submit"
              fullWidth
              loading={isPending}
              disabled={!name.trim()}
              size="md"
            >
              {isEdit ? "Simpan Perubahan" : "Tambah ke Inventaris"}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={(scanned) => setBarcode(scanned)}
      />
    </>
  );
}
