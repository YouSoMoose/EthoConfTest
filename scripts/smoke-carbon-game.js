// Simple smoke-test for the Carbon Game static site
// Usage: node scripts/smoke-carbon-game.js [baseUrl]
// Example: node scripts/smoke-carbon-game.js http://localhost:3000

const base = process.argv[2] || 'http://localhost:3000';
const urls = [
  '/carbon-game',
  '/carbon-game/index.html',
  '/carbon-game/css/style.css',
  '/carbon-game/js/formulas.js',
  '/carbon-game/js/app.js',
];

async function check(url) {
  const full = new URL(url, base).toString();
  try {
    const res = await fetch(full, { redirect: 'manual' });
    const ct = res.headers.get('content-type') || '';
    const status = res.status;
    let bodySnippet = '';
    try {
      const txt = await res.text();
      bodySnippet = txt.slice(0, 200).replace(/\n/g, ' ');
    } catch (e) {
      bodySnippet = '[body read error]';
    }
    console.log(`${full} => ${status}  | content-type: ${ct}`);
    if (status >= 300 && status < 400) console.warn('  - Redirected');
    if (ct.includes('text/html') && (url.endsWith('.js') || url.endsWith('.css'))) {
      console.error('  - ERROR: asset returned text/html (likely a redirect to app login)');
    }
    if (bodySnippet) console.log('  snippet:', bodySnippet);
  } catch (err) {
    console.error(`${full} => fetch error:`, err.message);
  }
}

(async () => {
  for (const u of urls) await check(u);
})();
