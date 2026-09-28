import { getRestockLogs } from "@/app/actions/shopping";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import EmptyState from "@/components/ui/EmptyState";
import { formatDateGroup, formatRelativeTime, formatRupiah } from "@/lib/utils";
import { Clock, RefreshCcw, Tag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Riwayat Restok — StokKu",
  description: "Riwayat pembelian dan restok barang kebutuhanmu.",
};

export const dynamic = "force-dynamic";

export default async function RiwayatPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const logs = await getRestockLogs();

  // Group logs by date
  const grouped = new Map<string, typeof logs>();
  for (const log of logs) {
    const dateKey = formatDateGroup(new Date(log.restockedAt));
    const existing = grouped.get(dateKey) || [];
    existing.push(log);
    grouped.set(dateKey, existing);
  }

  return (
    <main className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="pt-6 pb-4 px-4 max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1">
          📊 Riwayat Restok
        </h1>
        <p className="text-xs font-semibold text-slate-500">
          {logs.length > 0
            ? `${logs.length} kali barang direstok tercatat`
            : "Belum ada riwayat restok"}
        </p>
      </header>

      {/* Content */}
      <div className="px-4 pb-nav flex-1 max-w-2xl mx-auto w-full">
        {logs.length === 0 ? (
          <EmptyState
            icon={<Clock className="w-8 h-8 text-slate-400" />}
            title="Belum Ada Riwayat"
            description="Riwayat restok akan muncul di sini secara otomatis setelah kamu menyelesaikan belanja di tab Belanja."
          />
        ) : (
          <div className="space-y-6 stagger-children">
            {Array.from(grouped.entries()).map(([dateKey, dateLogs]) => {
              const totalCost = dateLogs.reduce(
                (sum, l) => sum + (l.priceAtRestock || l.item.estimatedPrice || 0),
                0
              );

              return (
                <div key={dateKey}>
                  {/* Date header */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                      {dateKey}
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[11px] font-semibold text-slate-500">
                      {dateLogs.length} barang
                      {totalCost > 0 && (
                        <span className="ml-1 text-emerald-700 font-bold">
                          • {formatRupiah(totalCost)}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Log entries */}
                  <div className="space-y-2">
                    {dateLogs.map((log) => {
                      const price = log.priceAtRestock || log.item.estimatedPrice || 0;

                      return (
                        <div
                          key={log.id}
                          className="glass rounded-2xl p-3.5 flex items-center gap-3.5 shadow-xs hover:shadow-md transition-all"
                        >
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-xs">
                            <RefreshCcw className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-800 truncate">
                                {log.item.name}
                              </span>
                              {price > 0 && (
                                <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded-md shrink-0">
                                  {formatRupiah(price)}
                                </span>
                              )}
                            </div>
                            {log.item.category && (
                              <span className="text-[11px] font-medium text-slate-500 block truncate">
                                {log.item.category}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                            {formatRelativeTime(new Date(log.restockedAt))}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
