const { Client } = require('pg');

const connectionString = 'postgresql://postgres.mcduvozrhbexhdsjsuxu:Stoku123%40test@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');

  console.log('Upgrading Item table with lifespan, price, and barcode columns...');
  await client.query(`
    ALTER TABLE "Item"
      ADD COLUMN IF NOT EXISTS "durationDays" INT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS "lastRestockedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "estimatedPrice" INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "barcode" TEXT DEFAULT NULL;
  `);

  console.log('Creating barcode index on Item...');
  await client.query(`
    CREATE INDEX IF NOT EXISTS "Item_barcode_idx" ON "Item"("barcode");
  `);

  console.log('Upgrading RestockLog table with priceAtRestock...');
  await client.query(`
    ALTER TABLE "RestockLog"
      ADD COLUMN IF NOT EXISTS "priceAtRestock" INT DEFAULT 0;
  `);

  console.log('Creating ReminderSetting table...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS "ReminderSetting" (
      "userId" TEXT PRIMARY KEY,
      "enabled" BOOLEAN NOT NULL DEFAULT true,
      "frequency" TEXT NOT NULL DEFAULT 'DAILY_EVENING',
      "reminderTime" TEXT NOT NULL DEFAULT '20:00',
      "weekendReminderTime" TEXT NOT NULL DEFAULT '09:00',
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const itemCols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'Item';
  `);
  console.log('Item columns now:', itemCols.rows.map(r => `${r.column_name} (${r.data_type})`));

  const logCols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'RestockLog';
  `);
  console.log('RestockLog columns now:', logCols.rows.map(r => `${r.column_name} (${r.data_type})`));

  const reminderTable = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'ReminderSetting';
  `);
  console.log('ReminderSetting columns now:', reminderTable.rows.map(r => `${r.column_name} (${r.data_type})`));

  await client.end();
  console.log('v2 Database migration completed successfully!');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
