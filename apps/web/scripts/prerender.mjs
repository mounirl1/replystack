/**
 * Post-build prerender script for SEO.
 *
 * Spins up a local static server from the Vite `dist` output,
 * visits every public route with Puppeteer, waits for React to
 * render, then writes the fully-rendered HTML back into `dist`.
 *
 * Usage:  node scripts/prerender.mjs
 * Called automatically by `pnpm build` (see package.json).
 */

import { execSync } from 'child_process';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');
const PORT = 4173;

// ── All public routes to prerender ──────────────────────────────

const ROUTES = [
  // Static pages
  '/',
  '/fr',
  '/es',
  '/pt',
  '/pricing',
  '/fr/pricing',
  '/es/pricing',
  '/pt/pricing',
  '/features',
  '/fr/fonctionnalites',
  '/es/funcionalidades',
  '/pt/funcionalidades',
  '/contact',
  '/fr/contact',
  '/es/contact',
  '/pt/contact',
  '/privacy',
  '/fr/privacy',
  '/es/privacy',
  '/pt/privacy',

  // Blog index
  '/blog',
  '/fr/blog',
  '/es/blog',
  '/pt/blog',

  // Blog articles – EN
  '/blog/respond-negative-reviews',
  '/blog/review-response-templates',
  '/blog/get-more-google-reviews',
  '/blog/respond-reviews-2-minutes-day',
  '/blog/complete-online-reputation-strategy',
  '/blog/respond-google-reviews',
  '/blog/reviews-boost-local-seo',
  '/blog/get-more-5-star-reviews',
  '/blog/reputation-artisans',
  '/blog/ecommerce-negative-reviews',
  '/blog/auto-repair-reputation',
  '/blog/healthcare-reviews',
  '/blog/beauty-salon-reputation',

  // Blog articles – FR (localized slugs)
  '/fr/blog/repondre-avis-google-negatifs',
  '/fr/blog/templates-reponses-avis',
  '/fr/blog/obtenir-plus-avis-google',
  '/fr/blog/repondre-avis-2-minutes-jour',
  '/fr/blog/strategie-e-reputation-complete',
  '/fr/blog/respond-google-reviews',
  '/fr/blog/reviews-boost-local-seo',
  '/fr/blog/get-more-5-star-reviews',
  '/fr/blog/reputation-artisans',
  '/fr/blog/ecommerce-negative-reviews',
  '/fr/blog/auto-repair-reputation',
  '/fr/blog/healthcare-reviews',
  '/fr/blog/beauty-salon-reputation',

  // Blog articles – ES
  '/es/blog/responder-resenas-negativas',
  '/es/blog/plantillas-respuestas-resenas',
  '/es/blog/conseguir-mas-resenas-google',
  '/es/blog/responder-resenas-2-minutos-dia',
  '/es/blog/estrategia-reputacion-online-completa',
  '/es/blog/respond-google-reviews',
  '/es/blog/reviews-boost-local-seo',
  '/es/blog/get-more-5-star-reviews',
  '/es/blog/reputation-artisans',
  '/es/blog/ecommerce-negative-reviews',
  '/es/blog/auto-repair-reputation',
  '/es/blog/healthcare-reviews',
  '/es/blog/beauty-salon-reputation',

  // Blog articles – PT
  '/pt/blog/responder-avaliacoes-negativas',
  '/pt/blog/templates-respostas-avaliacoes',
  '/pt/blog/conseguir-mais-avaliacoes-google',
  '/pt/blog/responder-avaliacoes-2-minutos-dia',
  '/pt/blog/estrategia-reputacao-online-completa',
  '/pt/blog/respond-google-reviews',
  '/pt/blog/reviews-boost-local-seo',
  '/pt/blog/get-more-5-star-reviews',
  '/pt/blog/reputation-artisans',
  '/pt/blog/ecommerce-negative-reviews',
  '/pt/blog/auto-repair-reputation',
  '/pt/blog/healthcare-reviews',
  '/pt/blog/beauty-salon-reputation',

  // Compare index
  '/compare',
  '/fr/compare',
  '/es/compare',
  '/pt/compare',

  // Compare articles
  '/compare/replystack-vs-birdeye',
  '/compare/replystack-vs-podium',
  '/compare/replystack-vs-talkbackai',
  '/compare/replystack-vs-nicejob',
  '/fr/compare/replystack-vs-birdeye',
  '/fr/compare/replystack-vs-guest-suite',
  '/fr/compare/replystack-vs-solike',
  '/fr/compare/replystack-vs-custplace',
  '/es/compare/replystack-vs-birdeye',
  '/es/compare/replystack-vs-podium',
  '/es/compare/replystack-vs-revi',
  '/pt/compare/replystack-vs-birdeye',
  '/pt/compare/replystack-vs-podium',

  // Alternatives
  '/alternatives/best-review-management-software',
  '/fr/alternatives/meilleur-logiciel-gestion-avis',
  '/es/alternatives/mejor-software-gestion-resenas',
  '/pt/alternatives/melhor-software-gestao-avaliacoes',

  // Sectors – EN
  '/sectors/restaurants',
  '/sectors/hotels',
  '/sectors/e-commerce',
  '/sectors/healthcare',
  '/sectors/garages',
  '/sectors/beauty',
  '/sectors/contractors',
  '/sectors/driving-schools',

  // Sectors – FR
  '/fr/secteurs/restaurants',
  '/fr/secteurs/hotels',
  '/fr/secteurs/e-commerce',
  '/fr/secteurs/sante',
  '/fr/secteurs/garages',
  '/fr/secteurs/beaute',
  '/fr/secteurs/artisans',
  '/fr/secteurs/auto-ecoles',

  // Sectors – ES
  '/es/sectores/restaurantes',
  '/es/sectores/hoteles',
  '/es/sectores/e-commerce',
  '/es/sectores/salud',
  '/es/sectores/talleres',
  '/es/sectores/belleza',
  '/es/sectores/artesanos',
  '/es/sectores/autoescuelas',

  // Sectors – PT
  '/pt/setores/restaurantes',
  '/pt/setores/hoteis',
  '/pt/setores/e-commerce',
  '/pt/setores/saude',
  '/pt/setores/oficinas',
  '/pt/setores/beleza',
  '/pt/setores/artesaos',
  '/pt/setores/autoescolas',
];

// ── Minimal static file server (serves dist with SPA fallback) ──

function createServer() {
  const MIME = {
    '.html': 'text/html',
    '.js':   'application/javascript',
    '.css':  'text/css',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.webp': 'image/webp',
    '.svg':  'image/svg+xml',
    '.woff2':'font/woff2',
  };

  return http.createServer((req, res) => {
    let filePath = path.join(DIST, req.url === '/' ? '/index.html' : req.url);

    // SPA fallback: if file doesn't exist, serve index.html
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST, 'index.html');
    }

    const ext = path.extname(filePath);
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  });
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
  // Dynamic import of puppeteer
  let puppeteer;
  try {
    puppeteer = await import('puppeteer');
  } catch {
    console.error('puppeteer is not installed. Run: pnpm add -D puppeteer');
    process.exit(1);
  }

  if (!fs.existsSync(DIST)) {
    console.error('dist/ not found. Run "vite build" first.');
    process.exit(1);
  }

  // Read the original index.html template
  const indexHtml = fs.readFileSync(path.join(DIST, 'index.html'), 'utf-8');

  // Start server
  const server = createServer();
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`\n⚡ Prerender server listening on http://localhost:${PORT}`);
  console.log(`📄 ${ROUTES.length} routes to prerender\n`);

  // Launch browser (use system Chromium on CI/Railway if available)
  const launchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  const browser = await puppeteer.default.launch(launchOptions);

  let rendered = 0;
  let failed = 0;

  // Process routes in batches of 5 for speed
  const BATCH_SIZE = 5;
  for (let i = 0; i < ROUTES.length; i += BATCH_SIZE) {
    const batch = ROUTES.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (route) => {
      const page = await browser.newPage();

      // Block images, fonts, analytics to speed up rendering
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const type = req.resourceType();
        if (['image', 'font', 'media'].includes(type)) {
          req.abort();
        } else if (req.url().includes('google-analytics') || req.url().includes('googletagmanager')) {
          req.abort();
        } else {
          req.continue();
        }
      });

      try {
        await page.goto(`http://localhost:${PORT}${route}`, {
          waitUntil: 'networkidle0',
          timeout: 15000,
        });

        // Wait for React to render content inside #root
        await page.waitForFunction(
          () => {
            const root = document.getElementById('root');
            return root && root.children.length > 0;
          },
          { timeout: 10000 }
        );

        // Small delay to let helmet inject meta tags
        await new Promise((r) => setTimeout(r, 500));

        // Get the fully rendered HTML
        const html = await page.content();

        // Determine output file path
        const filePath = route === '/'
          ? path.join(DIST, 'index.html')
          : path.join(DIST, route, 'index.html');

        // Ensure directory exists
        const dir = path.dirname(filePath);
        fs.mkdirSync(dir, { recursive: true });

        // Write the prerendered HTML
        fs.writeFileSync(filePath, html, 'utf-8');

        rendered++;
        process.stdout.write(`  ✓ ${route}\n`);
      } catch (err) {
        failed++;
        process.stdout.write(`  ✗ ${route} — ${err.message}\n`);
      } finally {
        await page.close();
      }
    }));
  }

  await browser.close();
  server.close();

  console.log(`\n✅ Prerendered ${rendered}/${ROUTES.length} pages (${failed} failed)\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
