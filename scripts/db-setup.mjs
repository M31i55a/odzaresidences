/* Creates the tables and loads the ten residences, over the network, with no
   psql needed:

     npm run db:setup            -- schema + seed
     npm run db:setup -- schema  -- tables only, leaves existing data alone

   Reads DATABASE_URL from the environment or from .env.local / .env — the
   same file `vercel env pull` writes. */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

const root = process.cwd();

/** Minimal .env reader: enough for KEY=value, quoted or not. */
function fromEnvFile() {
  for (const name of [".env.production.local", ".env.local", ".env"]) {
    const path = join(root, name);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const match = /^\s*(DATABASE_URL|POSTGRES_URL)\s*=\s*(.*)\s*$/.exec(line);
      if (!match) continue;
      const value = match[2].replace(/^["']|["']$/g, "").trim();
      if (value) return { value, name };
    }
  }
  return null;
}

const found =
  (process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim())
    ? { value: process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL.trim(), name: "the environment" }
    : fromEnvFile();

if (!found) {
  console.error(
    "DATABASE_URL is not set.\n\n" +
      "  Connect Neon in the Vercel dashboard (Storage -> Marketplace), then:\n" +
      "    vercel env pull .env.local\n"
  );
  process.exit(1);
}

/**
 * Split a script into statements on semicolons that are not inside a string
 * literal, a dollar-quoted block or a comment. Postgres over HTTP takes one
 * statement per call, and a naive split on ";" would cut straight through
 * any semicolon inside quoted text.
 */
function statements(sql) {
  const out = [];
  let current = "";
  let quote = null; // "'" | '"' | a $tag$ | "--" | "/*"

  for (let i = 0; i < sql.length; i++) {
    const rest = sql.slice(i);

    if (quote === "--") {
      if (sql[i] === "\n") quote = null;
      current += sql[i];
      continue;
    }
    if (quote === "/*") {
      current += sql[i];
      if (rest.startsWith("*/")) { current += "/"; i++; quote = null; }
      continue;
    }
    if (quote === "'" || quote === '"') {
      current += sql[i];
      if (sql[i] === quote) {
        // Doubled quote is an escaped one, not the end.
        if (sql[i + 1] === quote) { current += sql[++i]; } else quote = null;
      }
      continue;
    }
    if (typeof quote === "string" && quote.startsWith("$")) {
      current += sql[i];
      if (rest.startsWith(quote)) {
        current += quote.slice(1);
        i += quote.length - 1;
        quote = null;
      }
      continue;
    }

    if (rest.startsWith("--")) { quote = "--"; current += sql[i]; continue; }
    if (rest.startsWith("/*")) { quote = "/*"; current += sql[i]; continue; }
    if (sql[i] === "'" || sql[i] === '"') { quote = sql[i]; current += sql[i]; continue; }

    const dollar = /^\$[A-Za-z_]*\$/.exec(rest);
    if (dollar) {
      quote = dollar[0];
      current += dollar[0];
      i += dollar[0].length - 1;
      continue;
    }

    if (sql[i] === ";") {
      if (current.trim()) out.push(current.trim());
      current = "";
      continue;
    }
    current += sql[i];
  }

  if (current.trim()) out.push(current.trim());
  return out;
}

const files =
  process.argv[2] === "schema" ? ["schema.sql"] : ["schema.sql", "seed.sql"];

const sql = neon(found.value);
const host = found.value.replace(/^.*@/, "").replace(/\/.*$/, "");
console.log(`Using DATABASE_URL from ${found.name} -> ${host}\n`);

for (const file of files) {
  const path = join(root, "db", file);
  const list = statements(readFileSync(path, "utf8"));
  process.stdout.write(`db/${file}: ${list.length} statements … `);

  for (const [index, statement] of list.entries()) {
    try {
      await sql.query(statement);
    } catch (error) {
      console.log("FAILED");
      console.error(`\nStatement ${index + 1} of db/${file}:\n`);
      console.error(statement.slice(0, 400));
      console.error(`\n${error.message}\n`);
      process.exit(1);
    }
  }
  console.log("done");
}

const [{ listings }] = await sql.query("select count(*)::int as listings from listings");
const [{ rooms }] = await sql.query("select count(*)::int as rooms from rooms");
console.log(`\nReady: ${listings} listings, ${rooms} rooms.`);
