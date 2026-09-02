import dotenv from "dotenv";
import pg from "pg";

// Load defaults first, then allow .env.local to override with real local values.
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

const { Client } = pg;

const POSTGRESQL_DATABASE = process.env.POSTGRESQL_DATABASE || "CorsairDb";

const baseConfig = {
  host: process.env.POSTGRESQL_HOST,
  port: Number(process.env.POSTGRESQL_PORT || "5432"),
  user: process.env.POSTGRESQL_USERNAME,
  password: process.env.POSTGRESQL_PASSWORD,
};

async function ensureDatabase() {
  const client = new Client({ ...baseConfig, database: "postgres" });
  await client.connect();
  try {
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [POSTGRESQL_DATABASE]);
    if (res.rowCount === 0) {
      console.log(`[corsair:migrate] Creating database "${POSTGRESQL_DATABASE}"...`);
      await client.query(`CREATE DATABASE "${POSTGRESQL_DATABASE}"`);
    } else {
      console.log(`[corsair:migrate] Database "${POSTGRESQL_DATABASE}" already exists.`);
    }
  } finally {
    await client.end();
  }
}

async function runMigration() {
  const client = new Client({ ...baseConfig, database: POSTGRESQL_DATABASE });
  await client.connect();
  try {
    const sql = await import("node:fs/promises").then((fs) => fs.readFile(new URL("../migration.sql", import.meta.url), "utf8"));
    console.log("[corsair:migrate] Applying migration.sql...");
    await client.query(sql);
    console.log("[corsair:migrate] Migration applied successfully.");
  } finally {
    await client.end();
  }
}

async function main() {
  await ensureDatabase();
  await runMigration();
}

main().catch((err) => {
  console.error("[corsair:migrate] Migration failed:", err);
  process.exit(1);
});
