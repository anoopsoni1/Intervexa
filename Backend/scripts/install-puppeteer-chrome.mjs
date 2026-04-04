/**
 * Install Chromium into Backend/.puppeteer-cache so the browser ships with the
 * deploy slug (Render does not bundle /opt/render/.cache/puppeteer).
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = path.join(backendRoot, ".puppeteer-cache");

execSync("npx puppeteer browsers install chrome", {
  stdio: "inherit",
  cwd: backendRoot,
  env: { ...process.env, PUPPETEER_CACHE_DIR: cacheDir },
});
