const { Client } = require('pg');

const connectionString = 'postgresql://postgres.mcduvozrhbexhdsjsuxu:Stoku123%40test@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');

  // Create enum
  await client.query(`
    DO $$ BEGIN
      CREATE TYPE "StockStatus" AS ENUM ('AMAN', 'MENIPIS', 'HABIS');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);
  console.log('StockStatus enum ready.');

  // Create Item table
  await client.query(`
    CREATE TABLE IF NOT EXISTS "Item" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "name" TEXT NOT NULL,
      "status" "StockStatus" NOT NULL DEFAULT 'AMAN',
      "category" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Item table ready.');

  // Create RestockLog table
  await client.query(`
    CREATE TABLE IF NOT EXISTS "RestockLog" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "itemId" TEXT NOT NULL REFERENCES "Item"("id") ON DELETE CASCADE,
      "restockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('RestockLog table ready.');

  // Create indexes
  await client.query(`
    CREATE INDEX IF NOT EXISTS "Item_status_idx" ON "Item"("status");
    CREATE INDEX IF NOT EXISTS "Item_category_idx" ON "Item"("category");
    CREATE INDEX IF NOT EXISTS "RestockLog_itemId_idx" ON "RestockLog"("itemId");
    CREATE INDEX IF NOT EXISTS "RestockLog_restockedAt_idx" ON "RestockLog"("restockedAt" DESC);
  `);
  console.log('Indexes ready.');

  // Seed sample data if empty
  const countRes = await client.query('SELECT COUNT(*) FROM "Item";');
  const count = parseInt(countRes.rows[0].count, 10);
  console.log(`Current items in DB: ${count}`);

  if (count === 0) {
    console.log('Seeding initial items...');
    const sampleItems = [
      { name: 'Sabun Mandi', status: 'AMAN', category: 'Kamar Mandi' },
      { name: 'Shampo Herbal', status: 'MENIPIS', category: 'Kamar Mandi' },
      { name: 'Pasta Gigi', status: 'AMAN', category: 'Kamar Mandi' },
      { name: 'Air Galon', status: 'HABIS', category: 'Pantry' },
      { name: 'Kopi Bubuk', status: 'MENIPIS', category: 'Pantry' },
      { name: 'Minyak Goreng 1L', status: 'AMAN', category: 'Pantry' },
      { name: 'Token Listrik', status: 'MENIPIS', category: 'Kebutuhan Kamar' },
      { name: 'Deterjen Cuci', status: 'AMAN', category: 'Laundry' },
    ];

    for (const item of sampleItems) {
      await client.query(
        'INSERT INTO "Item" ("name", "status", "category") VALUES ($1, $2, $3);',
        [item.name, item.status, item.category]
      );
    }
    console.log(`Successfully seeded ${sampleItems.length} items!`);
  }

  const res = await client.query('SELECT id, name, status, category FROM "Item" LIMIT 5;');
  console.log('Sample rows in DB:', res.rows);

  await client.end();
  console.log('Database setup complete!');
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
