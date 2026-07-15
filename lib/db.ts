import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _gasVaultDbPool: Pool | undefined;
}

const pool =
  global._gasVaultDbPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  global._gasVaultDbPool = pool;
}

export function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}