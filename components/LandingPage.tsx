"use client";

import { useState } from "react";
import { signInWithGoogleAction, signInDemoAction } from "@/lib/auth";
import {
  Sparkles,
  Zap,
  ShoppingCart,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { StockStatus } from "@/lib/types";

export default function LandingPage() {
  // Interactive hero demo card states
  const [demoStatus1, setDemoStatus1] = useState(StockStatus.HABIS);
  const [demoStatus2, setDemoStatus2] = useState(StockStatus.MENIPIS);
  const [demoStatus3, setDemoStatus3] = useState(StockStatus.AMAN);

  const cycleStatus = (current: StockStatus) => {
    if (current === StockStatus.AMAN) return StockStatus.MENIPIS;
    if (current === StockStatus.MENIPIS) return StockStatus.HABIS;
    return StockStatus.AMAN;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 px-4 py-3.5 glass-nav border-b border-white/60">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              StokKu
            </span>
          </div>

          <div className="flex items-center gap-2">
            <form action={() => signInDemoAction()}>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Coba Demo
              </button>
            </form>

            <form action={() => signInWithGoogleAction()}>
              <button
                type="submit"
                className="btn-google flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Masuk
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 pt-12 pb-16 max-w-4xl mx-auto w-full text-center">
        {/* Pill Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300/60 shadow-xs mb-6 animate-fade-in-up">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Manajer Inventaris Kos & Rumah Minimalis</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] mb-5">
          Pantau Kebutuhan Harian <br />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Tanpa Ribet Ketik Angka
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 font-medium">
          Cukup 1-tap untuk rotasi status 🟢 <b>Aman</b>, 🟡 <b>Menipis</b>, atau 🔴 <b>Habis</b>.
          Otomatis generate daftar belanja pintar saat tiba di minimarket.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
          <form action={() => signInWithGoogleAction()}>
            <button
              type="submit"
              className="btn-google flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-800 w-full sm:w-auto shadow-md cursor-pointer hover:border-emerald-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Masuk dengan Google
            </button>
          </form>

          <form action={() => signInDemoAction()}>
            <button
              type="submit"
              className="btn-emerald-glow flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white w-full sm:w-auto cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              Coba Mode Demo Instan
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Interactive Live Glass Preview Banner */}
        <div className="relative max-w-xl mx-auto text-left">
          <div className="text-center mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-white/70 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200/80">
              <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin" style={{ animationDuration: "6s" }} />
              Coba tap kartu di bawah untuk mengubah status langsung:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Card 1 */}
            <div
              onClick={() => setDemoStatus1(cycleStatus(demoStatus1))}
              className={`rounded-2xl p-4 cursor-pointer transition-all duration-300 backdrop-blur-xl ${
                demoStatus1 === StockStatus.HABIS
                  ? "card-shadow-habis"
                  : demoStatus1 === StockStatus.MENIPIS
                  ? "card-shadow-menipis"
                  : "card-shadow-aman"
              }`}
            >
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Pantry</span>
              <h4 className="font-bold text-slate-800 text-sm mb-3">Air Galon</h4>
              <StatusBadge status={demoStatus1} size="sm" />
            </div>

            {/* Card 2 */}
            <div
              onClick={() => setDemoStatus2(cycleStatus(demoStatus2))}
              className={`rounded-2xl p-4 cursor-pointer transition-all duration-300 backdrop-blur-xl ${
                demoStatus2 === StockStatus.HABIS
                  ? "card-shadow-habis"
                  : demoStatus2 === StockStatus.MENIPIS
                  ? "card-shadow-menipis"
                  : "card-shadow-aman"
              }`}
            >
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Kamar Mandi</span>
              <h4 className="font-bold text-slate-800 text-sm mb-3">Shampo Herbal</h4>
              <StatusBadge status={demoStatus2} size="sm" />
            </div>

            {/* Card 3 */}
            <div
              onClick={() => setDemoStatus3(cycleStatus(demoStatus3))}
              className={`rounded-2xl p-4 cursor-pointer transition-all duration-300 backdrop-blur-xl ${
                demoStatus3 === StockStatus.HABIS
                  ? "card-shadow-habis"
                  : demoStatus3 === StockStatus.MENIPIS
                  ? "card-shadow-menipis"
                  : "card-shadow-aman"
              }`}
            >
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Kamar Mandi</span>
              <h4 className="font-bold text-slate-800 text-sm mb-3">Sabun Mandi</h4>
              <StatusBadge status={demoStatus3} size="sm" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 bg-white/40 backdrop-blur-md border-y border-white/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              Dibuat Khusus Agar Kamu Tidak Pernah Kehabisan Stok
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium">
              3 fitur utama yang dirancang untuk kecepatan dan kemudahan maksimal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass rounded-3xl p-6 relative overflow-hidden card-shadow-aman">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                <Zap className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                1-Tap Status Toggles
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Cukup satu sentuhan di layar untuk rotasi status barang. Tidak perlu mengetik angka atau menghitung mililiter.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass rounded-3xl p-6 relative overflow-hidden card-shadow-menipis">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4 shadow-sm">
                <ShoppingCart className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Auto-Shopping List
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Barang yang berstatus Menipis & Habis otomatis terkumpul dalam satu tab belanja pintar dengan checklist fisik.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass rounded-3xl p-6 relative overflow-hidden card-shadow-habis">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
                <Clock className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Riwayat & Aktivitas Restok
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Setiap kali checkout belanjaan selesai, sistem otomatis mencatat tanggal restok agar kamu tahu pola pemakaianmu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cloud & Multi-user isolation callout */}
      <section className="px-4 py-16 max-w-4xl mx-auto w-full text-center">
        <div className="glass rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-white/90">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
            Akun Pribadi, Data Terisolasi & Aman
          </h3>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mb-8 font-medium">
            Dengan login Google, setiap pengguna memiliki database barang masing-masing yang tersimpan di cloud Supabase. Sinkron saat dibuka di HP maupun laptop.
          </p>

          <form action={() => signInWithGoogleAction()}>
            <button
              type="submit"
              className="btn-emerald-glow inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold text-white shadow-lg cursor-pointer"
            >
              Mulai Sekarang Gratis
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-4 py-8 border-t border-slate-200/80 bg-white/60 backdrop-blur-md text-center text-xs font-medium text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-[10px] font-black">
              SK
            </div>
            <span className="font-bold text-slate-700">StokKu v1.0</span>
            <span>— Manajer Inventaris Modern</span>
          </div>

          <p>© {new Date().getFullYear()} StokKu. Dibangun dengan Next.js & Supabase.</p>
        </div>
      </footer>
    </div>
  );
}
