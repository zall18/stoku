const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.mcduvozrhbexhdsjsuxu:Stoku123%40test@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT "userId", COUNT(*) FROM "Item" GROUP BY "userId";');
  console.log('Items per userId:', res.rows);
  await client.end();
}

main().catch(console.error);
