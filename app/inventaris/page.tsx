import { getItems, getStatusCounts, getItemsNearingDepletion } from "@/app/actions/item";
import { getReminderSetting } from "@/app/actions/reminder";
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

  const [items, statusCounts, nearingDepletion, reminderSetting] = await Promise.all([
    getItems(),
    getStatusCounts(),
    getItemsNearingDepletion(),
    getReminderSetting(),
  ]);

  return (
    <main className="flex flex-col min-h-screen">
      <DashboardClient
        items={items}
        statusCounts={statusCounts}
        user={user}
        nearingDepletionItems={nearingDepletion}
        reminderSetting={reminderSetting}
      />
      <BottomNav />
    </main>
  );
}
