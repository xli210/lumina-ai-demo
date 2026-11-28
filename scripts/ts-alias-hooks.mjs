// Test-only: lets `node --experimental-strip-types --import ./scripts/ts-alias-hooks.mjs --test ...` load lib/*.ts files that import
// with the site's "@/..." alias (tsconfig paths), by resolving "@/x/y" to <repo>/x/y.ts. Not used by the build.
import { register } from "node:module";
register(
  "data:text/javascript," +
    encodeURIComponent(`
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";
const root = ${JSON.stringify(new URL("..", import.meta.url).href)};
export async function resolve(spec, ctx, next) {
  if (spec.startsWith("@/")) return next(new URL(spec.slice(2) + ".ts", root).href, ctx);
  return next(spec, ctx);
}`),
  import.meta.url
);
