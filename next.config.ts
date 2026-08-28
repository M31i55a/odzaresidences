import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* PGlite ships a WebAssembly build of PostgreSQL and loads it from its own
     package directory at runtime. Bundling it rewrites those paths and the
     WASM stops being found, so it is required from node_modules as-is.

     It is a devDependency used only when DATABASE_URL is unset, which never
     happens in production — see lib/db.ts. */
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
