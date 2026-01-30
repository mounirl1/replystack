#!/usr/bin/env node

/**
 * Batch generation of all blog images.
 * Generates hero + 2 section images per article (39 total).
 * Images are shared across all language versions.
 *
 * Usage:
 *   node scripts/generate-all-blog-images.mjs
 *   node scripts/generate-all-blog-images.mjs --slug=healthcare-reviews
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_DIR = path.resolve(__dirname, '../public/blog/images');

const REPLICATE_API_URL = 'https://api.replicate.com/v1/models/google/nano-banana/predictions';
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_TIME_MS = 4 * 60 * 1000;
const DELAY_BETWEEN_REQUESTS_MS = 12000;

// ─── All image definitions ───────────────────────────────────────────

const ALL_IMAGES = [
  // ── auto-repair-reputation ──
  {
    slug: 'auto-repair-reputation',
    id: 'hero',
    filename: 'hero-auto-repair-reputation.webp',
    alt: 'Auto repair shop online reputation management',
    width: 1200,
    height: 630,
    prompt: 'Photorealistic image of a clean modern auto repair garage interior with warm lighting. A mechanic in a blue uniform smiles while holding a tablet showing glowing 5-star reviews. A polished car on a hydraulic lift in the background, tools neatly organized on the wall. Shallow depth of field, golden hour light streaming through the garage door. Professional commercial photography style, 8k quality. No text, words, numbers or letters anywhere in the image.',
  },
  {
    slug: 'auto-repair-reputation',
    id: 'getting-reviews',
    filename: 'getting-reviews-auto-repair-reputation.webp',
    alt: 'Strategies to get reviews for auto repair shops',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration showing a mechanic handing a tablet to a customer next to a repaired car. The tablet shows a star rating interface. Small icons floating: envelope, QR code, thumbs up. Color scheme: blue (#2563EB), green (#10B981), white background. Professional modern illustration style. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'auto-repair-reputation',
    id: 'responding-reviews',
    filename: 'responding-reviews-auto-repair-reputation.webp',
    alt: 'Responding to customer reviews for auto repair',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration of a laptop screen showing review cards with speech bubble replies. A small wrench icon and car silhouette nearby. Green checkmarks on some replies indicating completed responses. Color scheme: blue (#2563EB), green (#10B981), orange (#F59E0B), white background. Clean minimalist style. No text, words, numbers or letters anywhere.',
  },

  // ── beauty-salon-reputation ──
  {
    slug: 'beauty-salon-reputation',
    id: 'hero',
    filename: 'hero-beauty-salon-reputation.webp',
    alt: 'Beauty salon online reputation management',
    width: 1200,
    height: 630,
    prompt: 'Photorealistic image of a luxurious modern beauty salon with soft pink and white decor. A stylist at an elegant station with a large mirror, fresh flowers, and premium hair products. A smartphone on the counter displays glowing 5-star reviews. Soft natural light from large windows, bokeh background. Professional lifestyle photography, high-end commercial aesthetic, 8k quality. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'beauty-salon-reputation',
    id: 'getting-reviews',
    filename: 'getting-reviews-beauty-salon-reputation.webp',
    alt: 'Getting more reviews for beauty salons',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration of a hairdresser station with a small card showing a QR code next to styling tools. A smartphone with star icons floating upward. Small icons: scissors, comb, heart. Color scheme: blue (#2563EB), green (#10B981), pink (#EC4899), white background. Modern professional style. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'beauty-salon-reputation',
    id: 'responding-reviews',
    filename: 'responding-reviews-beauty-salon-reputation.webp',
    alt: 'Responding to beauty salon customer reviews',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration showing a tablet with review conversation bubbles, surrounded by beauty icons: lipstick, nail polish, small flower. Green checkmarks float near positive interactions. Color scheme: blue (#2563EB), green (#10B981), pink (#EC4899), white background. Clean minimalist style. No text, words, numbers or letters anywhere.',
  },

  // ── ecommerce-negative-reviews ──
  {
    slug: 'ecommerce-negative-reviews',
    id: 'hero',
    filename: 'hero-ecommerce-negative-reviews.webp',
    alt: 'Turning negative e-commerce reviews into opportunities',
    width: 1200,
    height: 630,
    prompt: 'Professional flat design illustration showing a negative review card with one star transforming into a positive 5-star review through an arrow. A shopping cart icon on the left, a green upward trend chart on the right. Color scheme: orange (#F59E0B) for the negative side, green (#10B981) for the positive side, blue (#2563EB) accents, white background. Modern vector style with soft shadows. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'ecommerce-negative-reviews',
    id: 'care-framework',
    filename: 'care-framework-ecommerce-negative-reviews.webp',
    alt: 'CARE response framework for e-commerce reviews',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration showing four connected circular icons in a workflow: a heart icon, an ear/listening icon, a tools/wrench icon, and a handshake icon, connected by arrows in a cycle. Small e-commerce icons nearby: shopping bag, package box. Color scheme: blue (#2563EB), green (#10B981), orange (#F59E0B), white background. Clean professional style. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'ecommerce-negative-reviews',
    id: 'conversions-impact',
    filename: 'conversions-impact-ecommerce-negative-reviews.webp',
    alt: 'Impact of review responses on e-commerce conversions',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration showing a bar chart with upward trend alongside a shopping cart filling up. Review speech bubbles with stars float around the chart. A conversion funnel icon on the side. Color scheme: blue (#2563EB), green (#10B981), orange (#F59E0B), white background. Minimalist professional style. No text, words, numbers or letters anywhere.',
  },

  // ── get-more-5-star-reviews ──
  {
    slug: 'get-more-5-star-reviews',
    id: 'hero',
    filename: 'hero-get-more-5-star-reviews.webp',
    alt: 'Strategies to get more 5-star reviews',
    width: 1200,
    height: 630,
    prompt: 'Professional flat design illustration showing five large gold stars arranged prominently with upward arrows. A smartphone displaying a review interface, small happy customer silhouettes below. Sparkle effects around the stars. Color scheme: gold/amber (#F59E0B) for stars, blue (#2563EB) for phone, green (#10B981) accents, white background. Modern minimalist style. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'get-more-5-star-reviews',
    id: 'strategies',
    filename: 'strategies-get-more-5-star-reviews.webp',
    alt: 'Seven proven strategies for 5-star reviews',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration showing seven small icons arranged in a grid: an envelope, a QR code, a clock, a gift box, a handshake, a smartphone notification, and a megaphone. All connected by dotted lines leading to a central gold star. Color scheme: blue (#2563EB), green (#10B981), amber (#F59E0B), white background. Clean vector style. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'get-more-5-star-reviews',
    id: 'tracking',
    filename: 'tracking-get-more-5-star-reviews.webp',
    alt: 'Tracking and optimizing review performance',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration of a dashboard screen showing line charts trending upward, a pie chart, and star rating indicators. A magnifying glass examines the data. Small target/bullseye icon. Color scheme: blue (#2563EB), green (#10B981), amber (#F59E0B), white background. Professional minimalist style. No text, words, numbers or letters anywhere.',
  },

  // ── get-more-google-reviews ──
  {
    slug: 'get-more-google-reviews',
    id: 'hero',
    filename: 'hero-get-more-google-reviews.webp',
    alt: 'Complete guide to getting more Google reviews',
    width: 1200,
    height: 630,
    prompt: 'Professional flat design illustration of a large Google Maps pin icon surrounded by floating gold star bubbles. A storefront silhouette at the base with customers leaving reviews on their phones. Upward growth arrows. Color scheme: blue (#2563EB), green (#10B981), amber (#F59E0B), red (#EF4444) for pin, white background. Modern vector style. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'get-more-google-reviews',
    id: 'strategies',
    filename: 'strategies-get-more-google-reviews.webp',
    alt: '15 strategies to get more Google reviews',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration showing multiple small strategy icons scattered around a central phone screen: email envelope, SMS bubble, QR code square, receipt, business card, social media icons, NFC tap symbol. All with small green checkmarks. Color scheme: blue (#2563EB), green (#10B981), white background. Clean minimalist style. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'get-more-google-reviews',
    id: 'timing',
    filename: 'timing-get-more-google-reviews.webp',
    alt: 'Optimal timing for asking for reviews',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration of a large clock face with different industry icons at various hour positions: a fork and knife, a stethoscope, a shopping bag, a house key, a wrench. Green highlight on the optimal time zone. Color scheme: blue (#2563EB), green (#10B981), amber (#F59E0B), white background. Professional style. No text, words, numbers or letters anywhere.',
  },

  // ── healthcare-reviews ──
  {
    slug: 'healthcare-reviews',
    id: 'hero',
    filename: 'hero-healthcare-reviews.webp',
    alt: 'Healthcare professional online review management',
    width: 1200,
    height: 630,
    prompt: 'Photorealistic image of a modern medical office reception area with clean white and teal decor. A doctor in a white coat uses a tablet at a sleek front desk. A stethoscope rests on the counter beside a small potted plant. Warm professional lighting, shallow depth of field with a softly blurred waiting area. Healthcare commercial photography, 8k quality. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'healthcare-reviews',
    id: 'ethical-constraints',
    filename: 'ethical-constraints-healthcare-reviews.webp',
    alt: 'Ethical and legal constraints for healthcare reviews',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration showing a balance scale with a medical cross on one side and a privacy shield with lock on the other. A small gavel icon and a document with a seal nearby. Color scheme: blue (#2563EB), green (#10B981), amber (#F59E0B) for caution elements, white background. Professional minimalist style. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'healthcare-reviews',
    id: 'responding-guide',
    filename: 'responding-guide-healthcare-reviews.webp',
    alt: 'Guide to responding to healthcare reviews',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration of a doctor silhouette at a desk with a laptop, composing a reply. A shield icon protects patient data. Speech bubbles with star ratings float nearby. A green checkmark indicates proper response. Color scheme: blue (#2563EB), green (#10B981), white background. Clean professional style. No text, words, numbers or letters anywhere.',
  },

  // ── online-reputation-strategy ──
  {
    slug: 'online-reputation-strategy',
    id: 'hero',
    filename: 'hero-online-reputation-strategy.webp',
    alt: 'Complete online reputation management strategy',
    width: 1200,
    height: 630,
    prompt: 'Professional flat design illustration showing a strategic roadmap with connected nodes forming a path. A large shield with stars at the center, surrounded by icons: magnifying glass, chart, megaphone, speech bubbles, gear. Color scheme: blue (#2563EB), green (#10B981), amber (#F59E0B), white background. Modern minimalist vector style with soft shadows. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'online-reputation-strategy',
    id: 'audit',
    filename: 'audit-online-reputation-strategy.webp',
    alt: 'Auditing your current online reputation',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration of a magnifying glass examining multiple platform icons: a map pin, a fork icon, a briefcase, a shopping bag. Each has a small star rating indicator. A clipboard with checkmarks nearby. Color scheme: blue (#2563EB), green (#10B981), amber (#F59E0B), white background. Clean analytical style. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'online-reputation-strategy',
    id: 'crisis-management',
    filename: 'crisis-management-online-reputation-strategy.webp',
    alt: 'Crisis management for online reputation',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration showing a warning triangle being contained by a protective blue shield. Emergency response icons: a fire extinguisher, a first-aid cross, a lifesaver ring. Calm blue waves replacing red alert waves. Color scheme: blue (#2563EB), green (#10B981), orange (#F59E0B) for warning, white background. Professional style. No text, words, numbers or letters anywhere.',
  },

  // ── reputation-artisans ──
  {
    slug: 'reputation-artisans',
    id: 'hero',
    filename: 'hero-reputation-artisans.webp',
    alt: 'Online reputation for contractors and tradespeople',
    width: 1200,
    height: 630,
    prompt: 'Photorealistic image of a skilled tradesperson standing proudly in front of a beautifully renovated home exterior. Wearing a clean work vest, holding a tool belt, with a finished woodwork project visible. Warm golden hour sunlight, suburban neighborhood background softly blurred. Professional portrait photography of a craftsman, 8k quality. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'reputation-artisans',
    id: 'getting-reviews',
    filename: 'getting-reviews-reputation-artisans.webp',
    alt: 'Getting reviews for contractors',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration of a contractor shaking hands with a homeowner at a doorstep, with a floating QR code card and a phone showing a review form. Small construction icons: hard hat, wrench. Color scheme: blue (#2563EB), orange (#F59E0B), green (#10B981), white background. Professional friendly style. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'reputation-artisans',
    id: 'difficult-situations',
    filename: 'difficult-situations-reputation-artisans.webp',
    alt: 'Handling difficult review situations for contractors',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration showing a negative review bubble with one star being transformed with a blue wrench tool into a resolved situation with a green checkmark. A small hard hat and clipboard nearby. Color scheme: blue (#2563EB), orange (#F59E0B), green (#10B981), white background. Calm professional style. No text, words, numbers or letters anywhere.',
  },

  // ── respond-google-reviews ──
  {
    slug: 'respond-google-reviews',
    id: 'hero',
    filename: 'hero-respond-google-reviews.webp',
    alt: 'How to respond to Google reviews effectively',
    width: 1200,
    height: 630,
    prompt: 'Professional flat design illustration of a Google Maps business listing card with review speech bubbles and reply arrows. A keyboard at the bottom suggesting typing responses. Green checkmarks on well-crafted replies. Color scheme: blue (#2563EB), green (#10B981), amber (#F59E0B) for stars, white background. Modern clean vector style. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'respond-google-reviews',
    id: 'positive-reviews',
    filename: 'positive-reviews-respond-google-reviews.webp',
    alt: 'Responding to positive Google reviews',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration of five gold stars with a happy speech bubble reply arrow curving from a business icon to a customer icon. Hearts and thumbs-up float around. Green tones dominate. Color scheme: green (#10B981), amber (#F59E0B), blue (#2563EB) accents, white background. Warm professional style. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'respond-google-reviews',
    id: 'negative-reviews',
    filename: 'negative-reviews-respond-google-reviews.webp',
    alt: 'Responding to negative Google reviews',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration of a single red star with a thoughtful reply speech bubble. A hand offering an olive branch or handshake symbol. The mood transitions from orange/red on the left to calm blue/green on the right. Color scheme: orange (#F59E0B) transitioning to blue (#2563EB) and green (#10B981), white background. Empathetic professional style. No text, words, numbers or letters anywhere.',
  },

  // ── respond-negative-reviews ──
  {
    slug: 'respond-negative-reviews',
    id: 'hero',
    filename: 'hero-respond-negative-reviews.webp',
    alt: 'Complete guide to responding to negative reviews',
    width: 1200,
    height: 630,
    prompt: 'Professional flat design illustration showing a negative review card with one star on the left, connected by an arrow to a professional response bubble on the right with a green checkmark. A shield icon provides protection. Color scheme: orange (#F59E0B) on left transitioning to blue (#2563EB) and green (#10B981) on right, white background. Modern vector style with soft shadows. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'respond-negative-reviews',
    id: 'five-principles',
    filename: 'five-principles-respond-negative-reviews.webp',
    alt: 'The 5 principles of responding to negative reviews',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration showing five circular icons in a horizontal row connected by a line: a clock (speed), an ear (listen), a heart (empathy), a lightbulb (solution), a handshake (follow-up). Each has a subtle glow. Color scheme: blue (#2563EB), green (#10B981), amber (#F59E0B), white background. Clean professional style. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'respond-negative-reviews',
    id: 'mistakes-avoid',
    filename: 'mistakes-avoid-respond-negative-reviews.webp',
    alt: 'Mistakes to avoid when responding to negative reviews',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration showing warning signs and crossed-out bad practices: a crossed-out angry face, a crossed-out copy-paste icon, a crossed-out clock with delay. A green path leads to the correct approach with a checkmark. Color scheme: orange (#F59E0B) for warnings, blue (#2563EB), green (#10B981) for correct path, white background. Clear professional style. No text, words, numbers or letters anywhere.',
  },

  // ── respond-reviews-2-minutes-day ──
  {
    slug: 'respond-reviews-2-minutes-day',
    id: 'hero',
    filename: 'hero-respond-reviews-2-minutes-day.webp',
    alt: 'Respond to reviews in 2 minutes a day',
    width: 1200,
    height: 630,
    prompt: 'Photorealistic image of a business owner casually checking a smartphone while enjoying coffee at a modern cafe table. The phone screen glows with notification badges. A laptop sits open nearby with a clean dashboard visible. Morning light streams through a window, relaxed confident expression. Lifestyle business photography, shallow depth of field, 8k quality. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'respond-reviews-2-minutes-day',
    id: 'workflow',
    filename: 'workflow-respond-reviews-2-minutes-day.webp',
    alt: 'The efficient 2-minute review response workflow',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration showing a 3-step workflow pipeline: incoming review notifications on the left, an AI processing gear in the middle, and sent replies with checkmarks on the right. Arrows connect the steps. A small clock shows minimal time. Color scheme: blue (#2563EB), green (#10B981), amber (#F59E0B), white background. Clean process diagram style. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'respond-reviews-2-minutes-day',
    id: 'before-after',
    filename: 'before-after-respond-reviews-2-minutes-day.webp',
    alt: 'Before and after implementing the 2-minute method',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration split in two halves. Left side (before): a stressed person silhouette surrounded by piling review notifications, red clock. Right side (after): a calm person with organized review cards, green checkmarks, small clock. Color scheme: orange/red (#F59E0B/#EF4444) on left, blue (#2563EB) and green (#10B981) on right, white background. Contrasting professional style. No text, words, numbers or letters anywhere.',
  },

  // ── review-response-templates ──
  {
    slug: 'review-response-templates',
    id: 'hero',
    filename: 'hero-review-response-templates.webp',
    alt: '20 review response templates ready to use',
    width: 1200,
    height: 630,
    prompt: 'Professional flat design illustration showing a collection of document template cards fanned out, each with different colored stars (gold for positive, orange for mixed, red for negative). A copy/clipboard icon floats above. Color scheme: blue (#2563EB), green (#10B981), amber (#F59E0B), white background. Modern organized vector style with soft shadows. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'review-response-templates',
    id: 'negative-templates',
    filename: 'negative-templates-review-response-templates.webp',
    alt: 'Templates for responding to negative reviews',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration of a template document card with a single red star at top transforming into a professional reply with a blue speech bubble. A magic wand icon suggests transformation. Soothing blue tones. Color scheme: blue (#2563EB), green (#10B981), orange (#F59E0B), white background. Professional reassuring style. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'review-response-templates',
    id: 'special-cases',
    filename: 'special-cases-review-response-templates.webp',
    alt: 'Templates for special review cases',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration showing different special case icons: a flag for fake reviews, a medical cross for health complaints, a gavel for legal threats, a fire for viral situations. Each in its own card with a template solution arrow. Color scheme: blue (#2563EB), green (#10B981), amber (#F59E0B), white background. Clear organized style. No text, words, numbers or letters anywhere.',
  },

  // ── reviews-boost-local-seo ──
  {
    slug: 'reviews-boost-local-seo',
    id: 'hero',
    filename: 'hero-reviews-boost-local-seo.webp',
    alt: 'How Google reviews boost local SEO',
    width: 1200,
    height: 630,
    prompt: 'Photorealistic image of a charming local storefront on a main street with a prominent Google Maps pin hovering above it. The shop has a warm inviting facade with an awning, potted plants, and large windows. Blue sky with soft clouds, other shops visible down the street with bokeh effect. Commercial real estate photography style, vibrant colors, 8k quality. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'reviews-boost-local-seo',
    id: 'seo-factors',
    filename: 'seo-factors-reviews-boost-local-seo.webp',
    alt: 'The 5 SEO factors of Google reviews',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration showing five pillars or columns of different heights supporting a search results bar. Each pillar has a distinct icon: star quantity, star quality, reply bubble, clock for recency, keyword bubble. Color scheme: blue (#2563EB), green (#10B981), amber (#F59E0B), white background. Analytical professional style. No text, words, numbers or letters anywhere.',
  },
  {
    slug: 'reviews-boost-local-seo',
    id: 'optimize',
    filename: 'optimize-reviews-boost-local-seo.webp',
    alt: 'Optimizing reviews for local SEO impact',
    width: 800,
    height: 450,
    prompt: 'Flat design illustration of a gear mechanism connected to both a review star rating and a search engine results bar moving upward. A magnifying glass with a location pin inside. Small upward arrows indicate growth. Color scheme: blue (#2563EB), green (#10B981), amber (#F59E0B), white background. Technical professional style. No text, words, numbers or letters anywhere.',
  },
];

// ─── API & Image processing ─────────────────────────────────────────

function getReplicateToken() {
  const envPaths = [
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../.env.local'),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/^REPLICATE_API_TOKEN=(.+)$/m);
      if (match) return match[1].trim();
    }
  }

  if (process.env.REPLICATE_API_TOKEN) {
    return process.env.REPLICATE_API_TOKEN;
  }

  throw new Error('REPLICATE_API_TOKEN not found in .env or environment');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callReplicate(token, prompt, width, height) {
  const response = await fetch(REPLICATE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait',
    },
    body: JSON.stringify({
      input: {
        prompt,
        width: width || 800,
        height: height || 450,
        output_format: 'png',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Replicate API error ${response.status}: ${errorText}`);
  }

  let prediction = await response.json();

  if (prediction.status === 'succeeded' && prediction.output) {
    return prediction.output;
  }

  const pollUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_POLL_TIME_MS) {
    await sleep(POLL_INTERVAL_MS);

    const pollResponse = await fetch(pollUrl, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!pollResponse.ok) {
      throw new Error(`Replicate poll error ${pollResponse.status}`);
    }

    prediction = await pollResponse.json();

    if (prediction.status === 'succeeded' && prediction.output) {
      return prediction.output;
    }

    if (prediction.status === 'failed' || prediction.status === 'canceled') {
      throw new Error(`Prediction ${prediction.status}: ${prediction.error || 'unknown error'}`);
    }

    console.log(`    Polling... status: ${prediction.status}`);
  }

  throw new Error('Prediction timed out after 4 minutes');
}

async function downloadAndConvertToWebp(imageUrl, outputPath) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  await sharp(buffer)
    .webp({ quality: 80 })
    .toFile(outputPath);
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  const slugFilter = process.argv.find(a => a.startsWith('--slug='))?.split('=')[1];

  let images = ALL_IMAGES;
  if (slugFilter) {
    images = images.filter(img => img.slug === slugFilter);
    if (images.length === 0) {
      console.error(`No images found for slug: ${slugFilter}`);
      console.error('Available slugs:', [...new Set(ALL_IMAGES.map(i => i.slug))].join(', '));
      process.exit(1);
    }
  }

  console.log(`Generating ${images.length} images${slugFilter ? ` for "${slugFilter}"` : ' for all articles'}...\n`);

  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const token = getReplicateToken();
  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const outputPath = path.join(IMAGES_DIR, img.filename);

    if (fs.existsSync(outputPath)) {
      console.log(`[${i + 1}/${images.length}] SKIP "${img.slug}/${img.id}" — already exists`);
      skipped++;
      continue;
    }

    console.log(`[${i + 1}/${images.length}] ${img.slug}/${img.id} (${img.width}x${img.height})`);
    console.log(`  Prompt: ${img.prompt.substring(0, 80)}...`);

    try {
      const output = await callReplicate(token, img.prompt, img.width, img.height);
      const imageUrl = Array.isArray(output) ? output[0] : output;

      console.log(`  Converting to WebP...`);
      await downloadAndConvertToWebp(imageUrl, outputPath);
      console.log(`  Saved: ${img.filename}`);
      generated++;
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
      failed++;
    }

    if (i < images.length - 1) {
      console.log(`  Waiting ${DELAY_BETWEEN_REQUESTS_MS / 1000}s...\n`);
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }
  }

  console.log(`\n── Done ──`);
  console.log(`  Generated: ${generated}`);
  console.log(`  Skipped:   ${skipped}`);
  console.log(`  Failed:    ${failed}`);
  console.log(`  Total:     ${images.length}`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
