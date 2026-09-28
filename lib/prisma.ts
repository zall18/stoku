import { Pool, PoolClient } from "pg";

export * from "./types";
import { StockStatus, Item, RestockLog, ReminderSetting, ReminderFrequency } from "./types";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.mcduvozrhbexhdsjsuxu:Stoku123%40test@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

// Singleton pool for Next.js hot reloading
const globalForPg = globalThis as unknown as {
  pgPool?: Pool;
};

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

function mapItemRow(row: Record<string, unknown>): Item {
  return {
    id: String(row.id),
    userId: String(row.userId || "demo-user"),
    name: String(row.name),
    status: row.status as StockStatus,
    category: row.category ? String(row.category) : null,
    createdAt: new Date(row.createdAt as string | Date),
    updatedAt: new Date(row.updatedAt as string | Date),
    durationDays: row.durationDays != null ? Number(row.durationDays) : null,
    lastRestockedAt: row.lastRestockedAt ? new Date(row.lastRestockedAt as string | Date) : null,
    estimatedPrice: Number(row.estimatedPrice || 0),
    barcode: row.barcode ? String(row.barcode) : null,
  };
}

interface QueryRunner {
  query: (text: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
}

function createItemClient(client: QueryRunner) {
  return {
    async findMany(args?: {
      where?: {
        userId?: string;
        name?: { contains?: string; mode?: string };
        category?: string | { not: null };
        status?: { in?: StockStatus[] } | StockStatus;
        barcode?: string;
      };
      orderBy?: Array<Record<string, "asc" | "desc">>;
      select?: { category?: boolean };
      distinct?: string[];
    }): Promise<Item[]> {
      const conditions: string[] = [];
      const values: unknown[] = [];

      if (args?.where) {
        if (args.where.userId) {
          values.push(args.where.userId);
          conditions.push(`"userId" = $${values.length}`);
        }
        if (args.where.barcode) {
          values.push(args.where.barcode);
          conditions.push(`"barcode" = $${values.length}`);
        }
        if (args.where.name?.contains) {
          values.push(`%${args.where.name.contains}%`);
          conditions.push(`"name" ILIKE $${values.length}`);
        }
        if (args.where.category !== undefined) {
          if (typeof args.where.category === "string") {
            values.push(args.where.category);
            conditions.push(`"category" = $${values.length}`);
          } else if (
            typeof args.where.category === "object" &&
            args.where.category !== null &&
            "not" in args.where.category
          ) {
            conditions.push(`"category" IS NOT NULL`);
          }
        }
        if (args.where.status) {
          if (typeof args.where.status === "string") {
            values.push(args.where.status);
            conditions.push(`"status" = $${values.length}`);
          } else if (args.where.status.in && args.where.status.in.length > 0) {
            values.push(args.where.status.in);
            conditions.push(`"status" = ANY($${values.length})`);
          }
        }
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      let orderClause = `ORDER BY CASE "status" WHEN 'HABIS' THEN 1 WHEN 'MENIPIS' THEN 2 ELSE 3 END, "updatedAt" DESC`;
      if (args?.orderBy && args.orderBy.length > 0) {
        const orderParts: string[] = [];
        for (const order of args.orderBy) {
          for (const [key, dir] of Object.entries(order)) {
            const direction = dir.toUpperCase() === "ASC" ? "ASC" : "DESC";
            if (key === "status") {
              if (direction === "DESC") {
                orderParts.push(
                  `CASE "status" WHEN 'HABIS' THEN 1 WHEN 'MENIPIS' THEN 2 ELSE 3 END ASC`
                );
              } else {
                orderParts.push(
                  `CASE "status" WHEN 'AMAN' THEN 1 WHEN 'MENIPIS' THEN 2 ELSE 3 END ASC`
                );
              }
            } else if (key === "name") {
              orderParts.push(`"name" ${direction}`);
            } else if (key === "updatedAt") {
              orderParts.push(`"updatedAt" ${direction}`);
            }
          }
        }
        if (orderParts.length > 0) {
          orderClause = `ORDER BY ${orderParts.join(", ")}`;
        }
      }

      const queryText = `SELECT * FROM "Item" ${whereClause} ${orderClause};`;
      const res = await client.query(queryText, values);
      return res.rows.map(mapItemRow);
    },

    async count(args?: {
      where?: {
        userId?: string;
        status?: StockStatus;
        category?: string;
      };
    }): Promise<number> {
      const conditions: string[] = [];
      const values: unknown[] = [];

      if (args?.where) {
        if (args.where.userId) {
          values.push(args.where.userId);
          conditions.push(`"userId" = $${values.length}`);
        }
        if (args.where.status) {
          values.push(args.where.status);
          conditions.push(`"status" = $${values.length}`);
        }
        if (args.where.category) {
          values.push(args.where.category);
          conditions.push(`"category" = $${values.length}`);
        }
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      const res = await client.query(
        `SELECT COUNT(*)::int as count FROM "Item" ${whereClause};`,
        values
      );
      return Number(res.rows[0]?.count ?? 0);
    },

    async findUnique(args: { where: { id: string; userId?: string } }): Promise<Item | null> {
      const conditions = [`"id" = $1`];
      const values: unknown[] = [args.where.id];
      if (args.where.userId) {
        values.push(args.where.userId);
        conditions.push(`"userId" = $${values.length}`);
      }
      const res = await client.query(
        `SELECT * FROM "Item" WHERE ${conditions.join(" AND ")} LIMIT 1;`,
        values
      );
      if (res.rows.length === 0) return null;
      return mapItemRow(res.rows[0]);
    },

    async create(args: {
      data: {
        name: string;
        category?: string | null;
        status?: StockStatus;
        userId?: string;
        durationDays?: number | null;
        estimatedPrice?: number;
        barcode?: string | null;
      };
    }): Promise<Item> {
      const userId = args.data.userId || "demo-user";
      const durationDays = args.data.durationDays != null ? args.data.durationDays : null;
      const estimatedPrice = args.data.estimatedPrice || 0;
      const barcode = args.data.barcode || null;

      const res = await client.query(
        `INSERT INTO "Item" ("name", "category", "status", "userId", "durationDays", "estimatedPrice", "barcode", "lastRestockedAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *;`,
        [args.data.name, args.data.category || null, args.data.status || StockStatus.AMAN, userId, durationDays, estimatedPrice, barcode]
      );
      return mapItemRow(res.rows[0]);
    },

    async update(args: {
      where: { id: string; userId?: string };
      data: {
        name?: string;
        category?: string | null;
        status?: StockStatus;
        durationDays?: number | null;
        estimatedPrice?: number;
        barcode?: string | null;
        lastRestockedAt?: Date;
      };
    }): Promise<Item> {
      const setParts: string[] = ['"updatedAt" = NOW()'];
      const values: unknown[] = [];

      if (args.data.name !== undefined) {
        values.push(args.data.name);
        setParts.push(`"name" = $${values.length}`);
      }
      if (args.data.category !== undefined) {
        values.push(args.data.category);
        setParts.push(`"category" = $${values.length}`);
      }
      if (args.data.status !== undefined) {
        values.push(args.data.status);
        setParts.push(`"status" = $${values.length}`);
      }
      if (args.data.durationDays !== undefined) {
        values.push(args.data.durationDays);
        setParts.push(`"durationDays" = $${values.length}`);
      }
      if (args.data.estimatedPrice !== undefined) {
        values.push(args.data.estimatedPrice);
        setParts.push(`"estimatedPrice" = $${values.length}`);
      }
      if (args.data.barcode !== undefined) {
        values.push(args.data.barcode);
        setParts.push(`"barcode" = $${values.length}`);
      }
      if (args.data.lastRestockedAt !== undefined) {
        values.push(args.data.lastRestockedAt);
        setParts.push(`"lastRestockedAt" = $${values.length}`);
      }

      values.push(args.where.id);
      const idParam = `$${values.length}`;
      let whereClause = `"id" = ${idParam}`;

      if (args.where.userId) {
        values.push(args.where.userId);
        whereClause += ` AND "userId" = $${values.length}`;
      }

      const res = await client.query(
        `UPDATE "Item" SET ${setParts.join(", ")} WHERE ${whereClause} RETURNING *;`,
        values
      );
      if (res.rows.length === 0) throw new Error("Item not found");
      return mapItemRow(res.rows[0]);
    },

    async updateMany(args: {
      where: { id: { in: string[] }; userId?: string };
      data: { status?: StockStatus; lastRestockedAt?: Date };
    }): Promise<{ count: number }> {
      if (!args.where.id.in || args.where.id.in.length === 0) {
        return { count: 0 };
      }
      const status = args.data.status || StockStatus.AMAN;
      const values: unknown[] = [status, args.where.id.in];
      let setClause = `"status" = $1, "updatedAt" = NOW()`;

      if (args.data.lastRestockedAt !== undefined) {
        values.push(args.data.lastRestockedAt);
        setClause += `, "lastRestockedAt" = $${values.length}`;
      } else if (status === StockStatus.AMAN) {
        setClause += `, "lastRestockedAt" = NOW()`;
      }

      let whereClause = `"id" = ANY($2::text[])`;

      if (args.where.userId) {
        values.push(args.where.userId);
        whereClause += ` AND "userId" = $${values.length}`;
      }

      const res = await client.query(
        `UPDATE "Item" SET ${setClause} WHERE ${whereClause} RETURNING "id";`,
        values
      );
      return { count: res.rows.length };
    },

    async delete(args: { where: { id: string; userId?: string } }): Promise<Item> {
      const values: unknown[] = [args.where.id];
      let whereClause = `"id" = $1`;
      if (args.where.userId) {
        values.push(args.where.userId);
        whereClause += ` AND "userId" = $${values.length}`;
      }
      const res = await client.query(
        `DELETE FROM "Item" WHERE ${whereClause} RETURNING *;`,
        values
      );
      if (res.rows.length === 0) throw new Error("Item not found");
      return mapItemRow(res.rows[0]);
    },
  };
}

function createRestockLogClient(client: QueryRunner) {
  return {
    async createMany(args: {
      data: Array<{ itemId: string; userId?: string; priceAtRestock?: number }>;
    }): Promise<{ count: number }> {
      if (!args.data || args.data.length === 0) return { count: 0 };
      let inserted = 0;
      for (const d of args.data) {
        await client.query(
          `INSERT INTO "RestockLog" ("itemId", "userId", "priceAtRestock", "restockedAt")
           VALUES ($1, $2, $3, NOW());`,
          [d.itemId, d.userId || "demo-user", d.priceAtRestock || 0]
        );
        inserted++;
      }
      return { count: inserted };
    },

    async findMany(args?: {
      where?: { userId?: string };
      include?: { item?: { select?: { name?: boolean; category?: boolean; estimatedPrice?: boolean } } };
      orderBy?: { restockedAt?: "asc" | "desc" };
      take?: number;
    }): Promise<RestockLog[]> {
      const limit = args?.take ?? 50;
      const orderDir = args?.orderBy?.restockedAt?.toUpperCase() === "ASC" ? "ASC" : "DESC";
      const conditions: string[] = [];
      const values: unknown[] = [];

      if (args?.where?.userId) {
        values.push(args?.where?.userId);
        conditions.push(`r."userId" = $${values.length}`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      values.push(limit);
      const limitParam = `$${values.length}`;

      const queryText = `
        SELECT 
          r.id, 
          r."userId",
          r."itemId", 
          r."priceAtRestock",
          r."restockedAt",
          i.name as item_name,
          i.category as item_category,
          i."estimatedPrice" as item_price
        FROM "RestockLog" r
        JOIN "Item" i ON r."itemId" = i.id
        ${whereClause}
        ORDER BY r."restockedAt" ${orderDir}
        LIMIT ${limitParam};
      `;

      const res = await client.query(queryText, values);
      return res.rows.map((row) => ({
        id: String(row.id),
        userId: String(row.userId || "demo-user"),
        itemId: String(row.itemId),
        priceAtRestock: Number(row.priceAtRestock || 0),
        restockedAt: new Date(row.restockedAt as string | Date),
        item: {
          name: String(row.item_name),
          category: row.item_category ? String(row.item_category) : null,
          estimatedPrice: Number(row.item_price || 0),
        },
      }));
    },
  };
}

function createReminderSettingClient(client: QueryRunner) {
  return {
    async findUnique(args: { where: { userId: string } }): Promise<ReminderSetting | null> {
      const res = await client.query(
        `SELECT * FROM "ReminderSetting" WHERE "userId" = $1 LIMIT 1;`,
        [args.where.userId]
      );
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        userId: String(r.userId),
        enabled: Boolean(r.enabled),
        frequency: r.frequency as ReminderFrequency,
        reminderTime: String(r.reminderTime || "20:00"),
        weekendReminderTime: String(r.weekendReminderTime || "09:00"),
        updatedAt: new Date(r.updatedAt as string | Date),
      };
    },

    async upsert(args: {
      where: { userId: string };
      create: {
        userId: string;
        enabled?: boolean;
        frequency?: ReminderFrequency;
        reminderTime?: string;
        weekendReminderTime?: string;
      };
      update: {
        enabled?: boolean;
        frequency?: ReminderFrequency;
        reminderTime?: string;
        weekendReminderTime?: string;
      };
    }): Promise<ReminderSetting> {
      const userId = args.where.userId;
      const enabled = args.update.enabled ?? args.create.enabled ?? true;
      const frequency = args.update.frequency ?? args.create.frequency ?? "DAILY_EVENING";
      const reminderTime = args.update.reminderTime ?? args.create.reminderTime ?? "20:00";
      const weekendReminderTime = args.update.weekendReminderTime ?? args.create.weekendReminderTime ?? "09:00";

      const res = await client.query(
        `INSERT INTO "ReminderSetting" ("userId", "enabled", "frequency", "reminderTime", "weekendReminderTime", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT ("userId") DO UPDATE SET
           "enabled" = EXCLUDED."enabled",
           "frequency" = EXCLUDED."frequency",
           "reminderTime" = EXCLUDED."reminderTime",
           "weekendReminderTime" = EXCLUDED."weekendReminderTime",
           "updatedAt" = NOW()
         RETURNING *;`,
        [userId, enabled, frequency, reminderTime, weekendReminderTime]
      );
      const r = res.rows[0];
      return {
        userId: String(r.userId),
        enabled: Boolean(r.enabled),
        frequency: r.frequency as ReminderFrequency,
        reminderTime: String(r.reminderTime || "20:00"),
        weekendReminderTime: String(r.weekendReminderTime || "09:00"),
        updatedAt: new Date(r.updatedAt as string | Date),
      };
    },
  };
}

export const prisma = {
  item: createItemClient(pool),
  restockLog: createRestockLogClient(pool),
  reminderSetting: createReminderSettingClient(pool),

  async $transaction<T>(callback: (tx: {
    item: ReturnType<typeof createItemClient>;
    restockLog: ReturnType<typeof createRestockLogClient>;
    reminderSetting: ReturnType<typeof createReminderSettingClient>;
  }) => Promise<T>): Promise<T> {
    const client: PoolClient = await pool.connect();
    try {
      await client.query("BEGIN");
      const tx = {
        item: createItemClient(client),
        restockLog: createRestockLogClient(client),
        reminderSetting: createReminderSettingClient(client),
      };
      const result = await callback(tx);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};
