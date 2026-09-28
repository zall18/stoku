import { prisma } from "../lib/prisma";
import { calculateLifespan, formatRupiah } from "../lib/utils";

async function runTests() {
  console.log("=== MEMULAI TEST FITUR V2.0 SMART INVENTORY ===");

  // 1. Test Lifespan Calculator
  console.log("\n[Test 1] Lifespan Calculation Logic");
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

  const item1 = {
    id: "test-1",
    name: "Kopi",
    status: "AMAN" as const,
    durationDays: 7,
    lastRestockedAt: threeDaysAgo,
    category: null,
    userId: "test",
    createdAt: now,
    updatedAt: now,
    estimatedPrice: 0,
    barcode: null,
  };
  const lifespan1 = calculateLifespan(item1);
  console.log("Item 7 hari, restok 3 hari lalu:", lifespan1);
  if (lifespan1?.remainingDays !== 4) throw new Error("Expected 4 remainingDays");

  const item2 = {
    id: "test-2",
    name: "Roti",
    status: "AMAN" as const,
    durationDays: 7,
    lastRestockedAt: eightDaysAgo,
    category: null,
    userId: "test",
    createdAt: now,
    updatedAt: now,
    estimatedPrice: 0,
    barcode: null,
  };
  const lifespan2 = calculateLifespan(item2);
  console.log("Item 7 hari, restok 8 hari lalu:", lifespan2);
  if (lifespan2?.isExpired !== true) throw new Error("Expected isExpired true");
  console.log("✓ Lifespan calculation logic valid!");

  // 2. Test formatRupiah
  console.log("\n[Test 2] Currency Formatter (Rupiah)");
  const formatted1 = formatRupiah(45000);
  const formatted2 = formatRupiah(0);
  console.log("45000 =>", formatted1);
  console.log("0 =>", formatted2);
  if (formatted1 !== "Rp 45.000") throw new Error("Unexpected format");
  console.log("✓ Currency formatting valid!");

  const testUserId = "test-user-v2-" + Date.now();

  // 3. Test Reminder Settings CRUD in Supabase
  console.log("\n[Test 3] Reminder Settings in Supabase Database");
  const initialReminder = await prisma.reminderSetting.findUnique({
    where: { userId: testUserId },
  });
  console.log("Initial reminder (should be null):", initialReminder);

  const upsertedReminder = await prisma.reminderSetting.upsert({
    where: { userId: testUserId },
    create: {
      userId: testUserId,
      enabled: true,
      frequency: "DAILY_EVENING",
      reminderTime: "20:00",
      weekendReminderTime: "09:00",
    },
    update: {
      enabled: true,
      frequency: "DAILY_EVENING",
    },
  });
  console.log("Upserted reminder:", upsertedReminder);
  if (!upsertedReminder.enabled || upsertedReminder.reminderTime !== "20:00") {
    throw new Error("Reminder setting upsert failed");
  }

  // Update reminder
  const updatedReminder = await prisma.reminderSetting.upsert({
    where: { userId: testUserId },
    create: {
      userId: testUserId,
      enabled: false,
      frequency: "WEEKEND_MORNING",
    },
    update: {
      frequency: "WEEKEND_MORNING",
    },
  });
  console.log("Updated reminder frequency:", updatedReminder.frequency);
  if (updatedReminder.frequency !== "WEEKEND_MORNING") {
    throw new Error("Reminder update failed");
  }
  console.log("✓ ReminderSetting table & client CRUD valid!");

  // 4. Test Item V2 Fields (durationDays, estimatedPrice, barcode)
  console.log("\n[Test 4] Item Creation with V2 Fields");
  const testBarcode = "899" + Math.floor(100000000 + Math.random() * 900000000);
  const createdItem = await prisma.item.create({
    data: {
      name: "Susu UHT Full Cream",
      category: "Makanan & Minuman",
      status: "MENIPIS",
      userId: testUserId,
      durationDays: 7,
      estimatedPrice: 18500,
      barcode: testBarcode,
      lastRestockedAt: new Date(),
    },
  });
  console.log("Created Item with V2 fields:", {
    id: createdItem.id,
    name: createdItem.name,
    durationDays: createdItem.durationDays,
    estimatedPrice: createdItem.estimatedPrice,
    barcode: createdItem.barcode,
    lastRestockedAt: createdItem.lastRestockedAt,
  });

  if (createdItem.durationDays !== 7 || createdItem.estimatedPrice !== 18500 || createdItem.barcode !== testBarcode) {
    throw new Error("Item V2 fields mismatch");
  }

  // 5. Test Shopping Checkout & RestockLog with priceAtRestock
  console.log("\n[Test 5] Checkout with priceAtRestock & RestockLog");
  await prisma.$transaction(async (tx) => {
    await tx.restockLog.createMany({
      data: [
        {
          itemId: createdItem.id,
          userId: testUserId,
          priceAtRestock: createdItem.estimatedPrice || 0,
        },
      ],
    });

    await tx.item.updateMany({
      where: { id: { in: [createdItem.id] }, userId: testUserId },
      data: {
        status: "AMAN",
        lastRestockedAt: new Date(),
      },
    });
  });

  // Verify item status is now AMAN
  const checkedItem = await prisma.item.findUnique({
    where: { id: createdItem.id, userId: testUserId },
  });
  console.log("Item status after checkout:", checkedItem?.status);
  if (checkedItem?.status !== "AMAN") throw new Error("Expected item status AMAN after checkout");

  // Verify RestockLog entry contains priceAtRestock
  const logs = await prisma.restockLog.findMany({
    where: { userId: testUserId },
  });
  console.log("Restock log entry:", logs[0]);
  if (logs.length === 0 || logs[0].priceAtRestock !== 18500) {
    throw new Error("RestockLog priceAtRestock failed");
  }
  console.log("✓ Checkout and RestockLog pricing flow verified!");

  // Cleanup
  console.log("\n[Cleanup] Cleaning up test data...");
  await prisma.item.delete({ where: { id: createdItem.id, userId: testUserId } });
  console.log("✓ Test data cleaned up successfully!");

  console.log("\n🎉 SEMUA FITUR SMART INVENTORY V2.0 BERJALAN 100% SUKSES!");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
