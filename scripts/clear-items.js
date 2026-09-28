const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.mcduvozrhbexhdsjsuxu:Stoku123%40test@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Clearing all items and logs from database...');
  await client.query('DELETE FROM "RestockLog";');
  await client.query('DELETE FROM "Item";');
  console.log('Database cleared! All users will start with 0 items.');
  await client.end();
}

main().catch(console.error);
