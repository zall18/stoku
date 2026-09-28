"use server";

import { prisma } from "@/lib/prisma";
import { StockStatus } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

/** Get all items that need to be purchased (MENIPIS or HABIS) for current user */
export async function getShoppingItems() {
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user";

  return prisma.item.findMany({
    where: {
      userId,
      status: { in: [StockStatus.MENIPIS, StockStatus.HABIS] },
    },
    orderBy: [
      { status: "desc" }, // HABIS first (more urgent)
      { name: "asc" },
    ],
  });
}

/** Checkout selected items: reset to AMAN and create RestockLog entries */
export async function checkoutItems(itemIds: string[]) {
  if (itemIds.length === 0) return;

  const user = await getCurrentUser();
  const userId = user?.id || "demo-user";

  // Use a transaction for atomicity
  await prisma.$transaction(async (tx) => {
    // Create restock log entries for each item
    await tx.restockLog.createMany({
      data: itemIds.map((itemId) => ({
        itemId,
        userId,
      })),
    });

    // Reset all checked items to AMAN
    await tx.item.updateMany({
      where: { id: { in: itemIds }, userId },
      data: { status: StockStatus.AMAN },
    });
  });

  revalidatePath("/");
  revalidatePath("/inventaris");
  revalidatePath("/belanja");
  revalidatePath("/riwayat");
}

/** Get restock logs for current user */
export async function getRestockLogs(limit = 50) {
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user";

  return prisma.restockLog.findMany({
    where: { userId },
    include: {
      item: { select: { name: true, category: true } },
    },
    orderBy: { restockedAt: "desc" },
    take: limit,
  });
}
