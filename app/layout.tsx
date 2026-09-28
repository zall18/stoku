import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "StokKu — Manajer Inventaris Pintar & Daftar Belanja",
  description:
    "Pantau stok barang kebutuhan sehari-hari, update status dengan 1-tap, dan susun daftar belanja otomatis tanpa ribet.",
  keywords: ["inventaris", "stok", "belanja", "kos", "manajemen barang", "glassmorphism"],
  authors: [{ name: "StokKu" }],
};

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-emerald-500/20 selection:text-emerald-700">
        {/* Ambient luminous glow orbs behind the glass */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Top-left mint glow */}
          <div className="absolute -top-[15%] -left-[10%] w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[120px]" />
          {/* Top-right sky glow */}
          <div className="absolute -top-[10%] -right-[15%] w-[450px] h-[450px] bg-cyan-400/20 rounded-full blur-[110px]" />
          {/* Center warm amber glow */}
          <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-amber-300/15 rounded-full blur-[130px]" />
          {/* Bottom-right violet glow */}
          <div className="absolute -bottom-[15%] -right-[10%] w-[550px] h-[550px] bg-indigo-400/15 rounded-full blur-[140px]" />
          {/* Subtle noise/grid texture */}
          <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col min-h-full">
          {children}
        </div>
      </body>
    </html>
  );
}
