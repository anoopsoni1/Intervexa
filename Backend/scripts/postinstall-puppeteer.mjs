/**
 * On Render/CI, install Chromium into .puppeteer-cache (included in the slug).
 * Skip locally so dev machines keep using the default user cache unless they run `npm run build`.
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

if (!process.env.RENDER && !process.env.CI) {
  process.exit(0);
}

const dir = path.dirname(fileURLToPath(import.meta.url));
execSync(`node "${path.join(dir, "install-puppeteer-chrome.mjs")}"`, {
  stdio: "inherit",
});
