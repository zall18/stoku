"use server";

import { prisma } from "@/lib/prisma";
import { StockStatus, Item } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { getNextStatus, calculateLifespan } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";

/** Get all items for current user, optionally filtered by search and category */
export async function getItems(search?: string, category?: string) {
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user";

  const where: Record<string, unknown> = { userId };

  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  if (category) {
    where.category = category;
  }

  return prisma.item.findMany({
    where,
    orderBy: [
      { status: "desc" }, // HABIS first, then MENIPIS, then AMAN
      { updatedAt: "desc" },
    ],
  });
}

/** Get count of items by status for current user */
export async function getStatusCounts() {
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user";

  const [aman, menipis, habis] = await Promise.all([
    prisma.item.count({ where: { status: StockStatus.AMAN, userId } }),
    prisma.item.count({ where: { status: StockStatus.MENIPIS, userId } }),
    prisma.item.count({ where: { status: StockStatus.HABIS, userId } }),
  ]);
  return { aman, menipis, habis, total: aman + menipis + habis };
}

/** Create a new item with optional lifespan, price, and barcode */
export async function createItem(
  name: string,
  category?: string,
  durationDays?: number | null,
  estimatedPrice?: number,
  barcode?: string | null
) {
  if (!name.trim()) throw new Error("Nama barang tidak boleh kosong");

  const user = await getCurrentUser();
  const userId = user?.id || "demo-user";

  await prisma.item.create({
    data: {
      name: name.trim(),
      category: category || null,
      userId,
      durationDays: durationDays != null && durationDays > 0 ? durationDays : null,
      estimatedPrice: estimatedPrice || 0,
      barcode: barcode?.trim() || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/inventaris");
  revalidatePath("/belanja");
}

/** Update item details */
export async function updateItem(
  id: string,
  data: {
    name?: string;
    category?: string | null;
    status?: StockStatus;
    durationDays?: number | null;
    estimatedPrice?: number;
    barcode?: string | null;
    lastRestockedAt?: Date;
  }
) {
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user";

  await prisma.item.update({
    where: { id, userId },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.durationDays !== undefined && {
        durationDays: data.durationDays != null && data.durationDays > 0 ? data.durationDays : null,
      }),
      ...(data.estimatedPrice !== undefined && {
        estimatedPrice: data.estimatedPrice || 0,
      }),
      ...(data.barcode !== undefined && {
        barcode: data.barcode?.trim() || null,
      }),
      ...(data.lastRestockedAt !== undefined && {
        lastRestockedAt: data.lastRestockedAt,
      }),
    },
  });

  revalidatePath("/");
  revalidatePath("/inventaris");
  revalidatePath("/belanja");
}

/** Toggle item status (rotate: AMAN → MENIPIS → HABIS → AMAN) */
export async function toggleItemStatus(id: string) {
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user";

  const item = await prisma.item.findUnique({ where: { id, userId } });
  if (!item) throw new Error("Barang tidak ditemukan");

  const newStatus = getNextStatus(item.status);
  const updateData: { status: StockStatus; lastRestockedAt?: Date } = {
    status: newStatus,
  };

  // If status is rotated back to AMAN, reset the countdown clock!
  if (newStatus === StockStatus.AMAN) {
    updateData.lastRestockedAt = new Date();
  }

  await prisma.item.update({
    where: { id, userId },
    data: updateData,
  });

  revalidatePath("/");
  revalidatePath("/inventaris");
  revalidatePath("/belanja");

  return newStatus;
}

/** Delete an item */
export async function deleteItem(id: string) {
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user";

  await prisma.item.delete({ where: { id, userId } });
  revalidatePath("/");
  revalidatePath("/inventaris");
  revalidatePath("/belanja");
}

/** Get all unique categories currently in use by current user */
export async function getCategories() {
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user";

  const items = await prisma.item.findMany({
    where: { category: { not: null }, userId },
    select: { category: true },
    distinct: ["category"],
  });

  return items
    .map((i) => i.category)
    .filter((c): c is string => c !== null);
}

/** Search item by barcode */
export async function searchByBarcode(barcode: string): Promise<Item | null> {
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user";

  const items = await prisma.item.findMany({
    where: { barcode: barcode.trim(), userId },
  });

  return items[0] || null;
}

/** Get items that are nearing depletion or already expired based on lifespan or status */
export async function getItemsNearingDepletion(): Promise<Item[]> {
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user";

  const items = await prisma.item.findMany({
    where: { userId },
  });

  return items.filter((item) => {
    if (item.status === StockStatus.HABIS || item.status === StockStatus.MENIPIS) {
      return true;
    }
    const lifespan = calculateLifespan(item);
    return lifespan.hasLifespan && (lifespan.isExpired || lifespan.isNearingEnd);
  });
}
