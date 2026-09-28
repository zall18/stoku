import { PrismaClient, StockStatus } from "@prisma/client";

const prisma = new PrismaClient();

const SAMPLE_ITEMS = [
  { name: "Sabun Mandi", category: "Mandi", status: StockStatus.AMAN },
  { name: "Shampo", category: "Mandi", status: StockStatus.MENIPIS },
  { name: "Pasta Gigi", category: "Mandi", status: StockStatus.AMAN },
  { name: "Air Galon", category: "Minuman", status: StockStatus.HABIS },
  { name: "Kopi Sachet", category: "Minuman", status: StockStatus.MENIPIS },
  { name: "Mie Instan", category: "Makanan", status: StockStatus.AMAN },
  { name: "Tisu Toilet", category: "Kebersihan", status: StockStatus.HABIS },
  { name: "Deterjen", category: "Kebersihan", status: StockStatus.AMAN },
  { name: "Gula Pasir", category: "Dapur", status: StockStatus.MENIPIS },
  { name: "Minyak Goreng", category: "Dapur", status: StockStatus.AMAN },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.restockLog.deleteMany();
  await prisma.item.deleteMany();

  // Create items
  for (const item of SAMPLE_ITEMS) {
    await prisma.item.create({ data: item });
  }

  console.log(`✅ Created ${SAMPLE_ITEMS.length} items`);

  // Create some sample restock logs
  const items = await prisma.item.findMany();
  const now = new Date();

  for (const item of items.slice(0, 4)) {
    await prisma.restockLog.create({
      data: {
        itemId: item.id,
        restockedAt: new Date(now.getTime() - Math.random() * 7 * 86400000), // Random within last 7 days
      },
    });
  }

  console.log("✅ Created sample restock logs");
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
