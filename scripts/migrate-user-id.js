const { Client } = require('pg');

const connectionString = 'postgresql://postgres.mcduvozrhbexhdsjsuxu:Stoku123%40test@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');

  console.log('Adding userId column to Item...');
  await client.query(`
    ALTER TABLE "Item" 
    ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL DEFAULT 'demo-user';
  `);

  console.log('Adding index on Item.userId...');
  await client.query(`
    CREATE INDEX IF NOT EXISTS "Item_userId_idx" ON "Item"("userId");
  `);

  console.log('Adding userId column to RestockLog...');
  await client.query(`
    ALTER TABLE "RestockLog" 
    ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL DEFAULT 'demo-user';
  `);

  console.log('Adding index on RestockLog.userId...');
  await client.query(`
    CREATE INDEX IF NOT EXISTS "RestockLog_userId_idx" ON "RestockLog"("userId");
  `);

  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'Item';
  `);
  console.log('Item columns:', res.rows.map(r => `${r.column_name} (${r.data_type})`));

  await client.end();
  console.log('Migration completed successfully!');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
