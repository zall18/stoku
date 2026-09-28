import { StockStatus } from "@/lib/types";

/** Maps StockStatus enum to Tailwind color classes and bright glassmorphism tokens */
export const STATUS_CONFIG = {
  [StockStatus.AMAN]: {
    label: "Aman",
    emoji: "🟢",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-50/90",
    borderColor: "border-emerald-300/80",
    hoverBg: "hover:bg-emerald-100",
    dotColor: "bg-emerald-500",
    glowColor: "shadow-emerald-500/25",
    cardShadowClass: "card-shadow-aman",
    accentBg: "bg-emerald-500/10",
  },
  [StockStatus.MENIPIS]: {
    label: "Menipis",
    emoji: "🟡",
    textColor: "text-amber-800",
    bgColor: "bg-amber-50/90",
    borderColor: "border-amber-300/80",
    hoverBg: "hover:bg-amber-100",
    dotColor: "bg-amber-500",
    glowColor: "shadow-amber-500/25",
    cardShadowClass: "card-shadow-menipis",
    accentBg: "bg-amber-500/10",
  },
  [StockStatus.HABIS]: {
    label: "Habis",
    emoji: "🔴",
    textColor: "text-rose-700",
    bgColor: "bg-rose-50/90",
    borderColor: "border-rose-300/80",
    hoverBg: "hover:bg-rose-100",
    dotColor: "bg-rose-500",
    glowColor: "shadow-rose-500/25",
    cardShadowClass: "card-shadow-habis",
    accentBg: "bg-rose-500/10",
  },
} as const;

/** Rotate status: AMAN → MENIPIS → HABIS → AMAN */
export function getNextStatus(current: StockStatus): StockStatus {
  const cycle: StockStatus[] = [
    StockStatus.AMAN,
    StockStatus.MENIPIS,
    StockStatus.HABIS,
  ];
  const currentIndex = cycle.indexOf(current);
  return cycle[(currentIndex + 1) % cycle.length];
}

/** Predefined categories */
export const CATEGORIES = [
  "Kamar Mandi",
  "Pantry",
  "Makanan & Minuman",
  "Laundry",
  "Kebutuhan Kamar",
  "Lainnya",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Format relative time in Indonesian */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit yang lalu`;
  if (diffHour < 24) return `${diffHour} jam yang lalu`;
  if (diffDay === 1) return "Kemarin";
  if (diffDay < 7) return `${diffDay} hari yang lalu`;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Group date formatting for activity logs */
export function formatDateGroup(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Hari Ini";
  if (isYesterday) return "Kemarin";

  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
