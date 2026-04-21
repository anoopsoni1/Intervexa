/**
 * Re-applies patches to react-snap / minimalcss after npm install.
 * Avoids networkidle0 (often never settles on SPAs) and 30s timeouts during prerender.
 */
const fs = require('fs')
const path = require('path')

function patchFile(rel, from, to) {
  const p = path.join(__dirname, '..', 'node_modules', rel)
  if (!fs.existsSync(p)) return
  let s = fs.readFileSync(p, 'utf8')
  if (!s.includes(from)) {
    if (s.includes(to.trim().slice(0, 40))) return
    console.warn('[patch-prerender-deps] skip (already patched or mismatch):', rel)
    return
  }
  fs.writeFileSync(p, s.replace(from, to))
  console.log('[patch-prerender-deps] patched', rel)
}

patchFile(
  'react-snap/src/puppeteer_utils.js',
  `await page.goto(pageUrl, { waitUntil: "networkidle0" });`,
  `await page.goto(pageUrl, {
            waitUntil: "load",
            timeout: 120000
          });`
)

patchFile(
  'minimalcss/src/run.js',
  `response = await page.goto(pageUrl, { waitUntil: 'networkidle0' });`,
  `response = await page.goto(pageUrl, {
        waitUntil: 'load',
        timeout: 120000
      });`
)

patchFile(
  'react-snap/src/puppeteer_utils.js',
  `    } else {
      console.log(\`🔥  pageerror at \${route}:\`, e);
    }
    onError && onError();
  });
  page.on("response", response => {`,
  `    } else {
      console.log(\`🔥  pageerror at \${route}:\`, e);
    }
  });
  page.on("response", response => {`
)
