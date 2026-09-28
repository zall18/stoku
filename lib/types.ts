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
}

export interface RestockLog {
  id: string;
  userId: string;
  itemId: string;
  restockedAt: Date;
  item: {
    name: string;
    category: string | null;
  };
}

export interface UserSession {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  isDemo?: boolean;
}
