import { neon } from "@neondatabase/serverless";

/* Neon over HTTP rather than a pooled TCP connection: every request here runs
   in a short-lived serverless function, where holding a connection open
   between invocations buys nothing and exhausts the pool instead.

   Vercel Postgres was retired — it was Neon underneath all along, and Neon is
   what the Vercel Marketplace provisions now. The integration sets
   DATABASE_URL; POSTGRES_URL is accepted too so an older project's variable
   keeps working. */

const url =
  process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim() || "";

/** The one shape the rest of the code uses. Both backends satisfy it. */
export type Db = {
  query<T = Record<string, unknown>>(
    text: string,
    params?: unknown[]
  ): Promise<T[]>;
};

/* ---------------- local development database ----------------
   With no DATABASE_URL configured, development falls back to PGlite: real
   PostgreSQL compiled to WebAssembly, running inside this process. No server
   to install and no cloud account, so the admin can be used and listings
   added straight away.

   It stores itself in .pglite/ (gitignored) so what you add survives a
   restart, and it creates and seeds itself on first use from the very same
   db/schema.sql and db/seed.sql that Neon gets — no second definition of the
   tables to drift out of step.

   Never in production: a serverless filesystem is ephemeral and per-instance,
   so this would silently lose everything. There, a missing DATABASE_URL stays
   an error. */
const useLocal = !url && process.env.NODE_ENV !== "production";

/* One instance per process, parked on globalThis so the dev server's hot
   reloads reuse it — PGlite holds an exclusive lock on its directory, and a
   second instance would fail to open it. */
const globalForDb = globalThis as unknown as { odzaLocalDb?: Promise<Db> };

async function openLocal(): Promise<Db> {
  const [{ PGlite }, { readFileSync, existsSync }, { join }] = await Promise.all([
    import("@electric-sql/pglite"),
    import("node:fs"),
    import("node:path"),
  ]);

  const root = process.cwd();
  const pg = await PGlite.create(join(root, ".pglite"));

  // `to_regclass` answers null rather than throwing when the table is absent.
  const [{ ready }] = (
    await pg.query<{ ready: boolean }>(
      "select to_regclass('public.listings') is not null as ready"
    )
  ).rows;

  if (!ready) {
    for (const file of ["schema.sql", "seed.sql"]) {
      const path = join(root, "db", file);
      if (!existsSync(path)) continue;
      await pg.exec(readFileSync(path, "utf8"));
    }
    console.info(
      "[db] local PGlite database created in .pglite/ and seeded from db/. " +
        "Set DATABASE_URL to use Neon instead."
    );
  }

  return {
    async query<T>(text: string, params: unknown[] = []) {
      const result = await pg.query<T>(text, params);
      return result.rows;
    },
  };
}

const local: Db = {
  async query<T>(text: string, params?: unknown[]) {
    globalForDb.odzaLocalDb ??= openLocal();
    const db = await globalForDb.odzaLocalDb;
    return db.query<T>(text, params);
  },
};

/* ---------------- the export ---------------- */

const remote: Db = {
  async query<T>(text: string, params: unknown[] = []) {
    // Neon's own .query already returns the rows array.
    return (await neon(url).query(text, params)) as T[];
  },
};

const unconfigured: Db = {
  async query() {
    throw new Error(
      "DATABASE_URL is not set. Add a Neon database from the Vercel " +
        "dashboard (Storage → Marketplace), then `vercel env pull` for " +
        "local development. See db/schema.sql to create the tables."
    );
  },
};

export const sql: Db = url ? remote : useLocal ? local : unconfigured;

/** Whether there is a database to talk to at all — lets callers degrade
    rather than crash when someone runs the site without one. */
export const hasDatabase = Boolean(url) || useLocal;

/** True while running on the throwaway local database rather than Neon, so
    the admin can say so instead of implying the data is safe somewhere. */
export const usingLocalDatabase = useLocal;
