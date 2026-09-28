export enum StockStatus {
  AMAN = "AMAN",
  MENIPIS = "MENIPIS",
  HABIS = "HABIS",
}

export interface Item {
  id: string;
  userId: string;
  name: string;
  status: StockStatus;
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
  durationDays: number | null;
  lastRestockedAt: Date | null;
  estimatedPrice: number;
  barcode: string | null;
}

export interface RestockLog {
  id: string;
  userId: string;
  itemId: string;
  restockedAt: Date;
  priceAtRestock: number;
  item: {
    name: string;
    category: string | null;
    estimatedPrice?: number;
  };
}

export type ReminderFrequency =
  | "OFF"
  | "DAILY_EVENING"
  | "WEEKEND_MORNING"
  | "CUSTOM";

export interface ReminderSetting {
  userId: string;
  enabled: boolean;
  frequency: ReminderFrequency;
  reminderTime: string;
  weekendReminderTime: string;
  updatedAt: Date;
}

export interface LifespanInfo {
  hasLifespan: boolean;
  durationDays: number | null;
  elapsedDays: number;
  remainingDays: number;
  percentUsed: number;
  isExpired: boolean;
  isNearingEnd: boolean;
  label: string;
  badgeColor: string;
  barColor: string;
}

export interface UserSession {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  isDemo?: boolean;
}
