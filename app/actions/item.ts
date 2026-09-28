"use server";

import { prisma } from "@/lib/prisma";
import { StockStatus } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { getNextStatus } from "@/lib/utils";
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

/** Create a new item for current user */
export async function createItem(name: string, category?: string) {
  if (!name.trim()) throw new Error("Nama barang tidak boleh kosong");

  const user = await getCurrentUser();
  const userId = user?.id || "demo-user";

  await prisma.item.create({
    data: {
      name: name.trim(),
      category: category || null,
      userId,
    },
  });

  revalidatePath("/");
  revalidatePath("/inventaris");
}

/** Update item name and/or category */
export async function updateItem(
  id: string,
  data: { name?: string; category?: string | null }
) {
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user";

  await prisma.item.update({
    where: { id, userId },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.category !== undefined && { category: data.category }),
    },
  });

  revalidatePath("/");
  revalidatePath("/inventaris");
}

/** Toggle item status (rotate: AMAN → MENIPIS → HABIS → AMAN) */
export async function toggleItemStatus(id: string) {
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user";

  const item = await prisma.item.findUnique({ where: { id, userId } });
  if (!item) throw new Error("Barang tidak ditemukan");

  const newStatus = getNextStatus(item.status);

  await prisma.item.update({
    where: { id, userId },
    data: { status: newStatus },
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
