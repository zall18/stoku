import { getItems, getStatusCounts } from "@/app/actions/item";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";
import BottomNav from "@/components/BottomNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog Inventaris — StokKu",
  description: "Pantau stok barang kebutuhan sehari-hari dengan indikator visual 1-tap.",
};

export const dynamic = "force-dynamic";

export default async function InventarisPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const [items, statusCounts] = await Promise.all([
    getItems(),
    getStatusCounts(),
  ]);

  return (
    <main className="flex flex-col min-h-screen">
      <DashboardClient items={items} statusCounts={statusCounts} user={user} />
      <BottomNav />
    </main>
  );
}
