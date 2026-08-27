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

/**
 * Tagged-template query. Interpolations are sent as bound parameters, never
 * spliced into the SQL, so `sql`select … where slug = ${slug}`` is safe with
 * whatever the admin typed.
 *
 * Throws a legible error rather than a driver stack trace when the database
 * isn't configured, because that is the first thing to go wrong on a new
 * deploy and "fetch failed" says nothing useful.
 */
export const sql = url
  ? neon(url)
  : (() => {
      const missing = () => {
        throw new Error(
          "DATABASE_URL is not set. Add a Neon database from the Vercel " +
            "dashboard (Storage → Marketplace), then `vercel env pull` for " +
            "local development. See db/schema.sql to create the tables."
        );
      };
      return new Proxy(missing, { apply: missing }) as unknown as ReturnType<
        typeof neon
      >;
    })();

/** Whether the database is configured at all — lets callers degrade rather
    than crash when someone runs the site without one. */
export const hasDatabase = Boolean(url);
