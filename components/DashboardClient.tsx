"use client";

import { useState } from "react";
import { Item, StockStatus, UserSession } from "@/lib/types";
import ItemCard from "@/components/ItemCard";
import ItemFormModal from "@/components/ItemFormModal";
import SearchBar from "@/components/ui/SearchBar";
import PrimaryButton from "@/components/ui/PrimaryButton";
import EmptyState from "@/components/ui/EmptyState";
import { Plus, Package, LogOut, Sparkles, User as UserIcon } from "lucide-react";
import { signOutAction } from "@/lib/auth";

interface DashboardClientProps {
  items: Item[];
  statusCounts: { aman: number; menipis: number; habis: number; total: number };
  user?: UserSession | null;
}

const FILTER_OPTIONS = [
  { value: null, label: "Semua", emoji: "" },
  { value: StockStatus.HABIS, label: "Habis", emoji: "🔴" },
  { value: StockStatus.MENIPIS, label: "Menipis", emoji: "🟡" },
  { value: StockStatus.AMAN, label: "Aman", emoji: "🟢" },
] as const;

export default function DashboardClient({
  items,
  statusCounts,
  user,
}: DashboardClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StockStatus | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);

  // Extract unique categories from items
  const uniqueCategories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean) as string[])
  );

  // Client-side filtering
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <>
      {/* Top Header */}
      <header className="pt-6 pb-4 px-4 max-w-2xl mx-auto w-full">
        {/* User bar */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-slate-900 tracking-tight">
                  StokKu
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Halo, {user?.name || "Pengguna"} 👋
              </p>
            </div>
          </div>

          {/* Account profile pill & signout */}
          <div className="flex items-center gap-2">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || "User"}
                className="w-8 h-8 rounded-full border border-white shadow-sm object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                {user?.name ? user.name[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>
            )}

            <form action={signOutAction}>
              <button
                type="submit"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Keluar"
                aria-label="Keluar akun"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Action Title row */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              📦 Katalog Inventaris
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              {statusCounts.total} barang dalam pantauan
            </p>
          </div>
          <PrimaryButton
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Tambah
          </PrimaryButton>
        </div>
      </header>

      {/* Status summary cards (with colored glow shadows) */}
      <div className="px-4 mb-5 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            {
              status: StockStatus.HABIS,
              count: statusCounts.habis,
              label: "Habis",
              color: "text-rose-600",
              bg: "bg-rose-50/80",
              border: "border-rose-200/80",
              shadow: "card-shadow-habis",
            },
            {
              status: StockStatus.MENIPIS,
              count: statusCounts.menipis,
              label: "Menipis",
              color: "text-amber-600",
              bg: "bg-amber-50/80",
              border: "border-amber-200/80",
              shadow: "card-shadow-menipis",
            },
            {
              status: StockStatus.AMAN,
              count: statusCounts.aman,
              label: "Aman",
              color: "text-emerald-600",
              bg: "bg-emerald-50/80",
              border: "border-emerald-200/80",
              shadow: "card-shadow-aman",
            },
          ].map((stat) => {
            const isSelected = statusFilter === stat.status;
            return (
              <button
                key={stat.label}
                onClick={() =>
                  setStatusFilter(isSelected ? null : stat.status)
                }
                className={`
                  rounded-2xl p-3 text-center transition-all duration-200 cursor-pointer
                  backdrop-blur-xl ${stat.shadow}
                  ${isSelected ? "ring-2 ring-emerald-500 scale-[1.02]" : "hover:-translate-y-0.5"}
                `}
              >
                <div className={`text-2xl font-black ${stat.color}`}>
                  {stat.count}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  {stat.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter section */}
      <div className="px-4 mb-5 max-w-2xl mx-auto w-full space-y-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Cari sabun, kopi, air galon..."
        />

        {/* Status filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setStatusFilter(opt.value)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer
                ${
                  statusFilter === opt.value
                    ? "bg-slate-900 text-white shadow-sm"
                    : "glass text-slate-600 hover:text-slate-900 hover:bg-white"
                }
              `}
            >
              {opt.emoji && <span>{opt.emoji}</span>}
              {opt.label}
            </button>
          ))}
        </div>

        {/* Category filter pills if available */}
        {uniqueCategories.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === null
                  ? "bg-emerald-100 text-emerald-800 font-bold"
                  : "bg-slate-100 text-slate-500 hover:text-slate-800"
              }`}
            >
              Semua Kategori
            </button>
            {uniqueCategories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat ? null : cat)
                }
                className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-emerald-100 text-emerald-800 font-bold"
                    : "bg-slate-100 text-slate-500 hover:text-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Item Grid */}
      <div className="px-4 pb-nav flex-1 max-w-2xl mx-auto w-full">
        {filteredItems.length === 0 ? (
          items.length === 0 ? (
            <EmptyState
              icon={<Package className="w-8 h-8 text-emerald-500" />}
              title="Inventaris Masih Kosong"
              description="Mulai tambahkan kebutuhan harianmu (sabun, kopi, air galon) untuk memantau stoknya secara otomatis."
              action={
                <PrimaryButton
                  onClick={() => setShowAddModal(true)}
                  size="md"
                  className="gap-2 mt-2"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  Tambah Barang Pertama
                </PrimaryButton>
              }
            />
          ) : (
            <EmptyState
              icon={<Package className="w-8 h-8 text-slate-400" />}
              title="Tidak ada barang yang cocok"
              description="Coba ubah kata kunci pencarian atau reset filter status."
              action={
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter(null);
                    setSelectedCategory(null);
                  }}
                  className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
                >
                  Reset Filter
                </button>
              }
            />
          )
        ) : (
          <div className="grid grid-cols-2 gap-3 stagger-children">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={(i) => setEditItem(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <ItemFormModal
        isOpen={showAddModal || !!editItem}
        onClose={() => {
          setShowAddModal(false);
          setEditItem(null);
        }}
        editItem={editItem}
      />
    </>
  );
}
