import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
/** Same path as scripts/install-puppeteer-chrome.mjs — under node_modules so the deploy slug always includes it. */
const bundledCache = path.join(backendRoot, "node_modules", ".cache", "puppeteer");

if (fs.existsSync(bundledCache) && !process.env.PUPPETEER_CACHE_DIR) {
  process.env.PUPPETEER_CACHE_DIR = bundledCache;
}
