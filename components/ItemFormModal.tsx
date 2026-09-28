"use client";

import { useState, useTransition } from "react";
import { createItem, updateItem } from "@/app/actions/item";
import { CATEGORIES } from "@/lib/utils";
import { Item } from "@/lib/types";
import Modal from "@/components/ui/Modal";
import PrimaryButton from "@/components/ui/PrimaryButton";

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: Item | null;
}

export default function ItemFormModal({
  isOpen,
  onClose,
  editItem,
}: ItemFormModalProps) {
  const [name, setName] = useState(editItem?.name || "");
  const [category, setCategory] = useState(editItem?.category || "");
  const [isPending, startTransition] = useTransition();

  const isEdit = !!editItem;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      if (isEdit && editItem) {
        await updateItem(editItem.id, {
          name,
          category: category || null,
        });
      } else {
        await createItem(name, category || undefined);
      }
      setName("");
      setCategory("");
      onClose();
    });
  };

  const handleClose = () => {
    setName(editItem?.name || "");
    setCategory(editItem?.category || "");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? "✏️ Edit Barang" : "✨ Tambah Barang Baru"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Nama Barang <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="contoh: Sabun Mandi, Kopi Sachet..."
            autoFocus
            className="
              w-full px-4 py-2.5 text-sm rounded-xl
              bg-white/80 border border-slate-200 text-slate-800 placeholder:text-slate-400
              focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500
              transition-all shadow-xs
            "
          />
        </div>

        {/* Category chips */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Kategori <span className="text-xs font-normal text-slate-400">(opsional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(category === cat ? "" : cat)}
                className={`
                  px-3 py-1.5 text-xs font-semibold rounded-xl
                  transition-all duration-200 cursor-pointer
                  ${
                    category === cat
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/30"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60"
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <PrimaryButton
            type="submit"
            fullWidth
            loading={isPending}
            disabled={!name.trim()}
            size="lg"
          >
            {isEdit ? "Simpan Perubahan" : "Tambah ke Inventaris"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
