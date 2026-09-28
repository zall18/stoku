import { getShoppingItems } from "@/app/actions/shopping";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ShoppingClient from "@/components/ShoppingClient";
import BottomNav from "@/components/BottomNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Belanja — StokKu",
  description: "Daftar belanja otomatis dari barang yang menipis dan habis.",
};

export const dynamic = "force-dynamic";

export default async function BelanjaPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const items = await getShoppingItems();

  return (
    <main className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="pt-6 pb-4 px-4 max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1">
          🛒 Daftar Belanja
        </h1>
        <p className="text-xs font-semibold text-slate-500">
          {items.length > 0
            ? `${items.length} barang perlu segera dibeli`
            : "Semua barang kebutuhanmu aman"}
        </p>
      </header>

      {/* Content */}
      <div className="px-4 pb-nav flex-1 max-w-2xl mx-auto w-full">
        <ShoppingClient items={items} />
      </div>

      <BottomNav />
    </main>
  );
}
