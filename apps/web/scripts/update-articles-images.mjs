#!/usr/bin/env node

/**
 * Updates all existing MDX blog articles to reference generated images.
 * - Updates featuredImage.src in frontmatter to point to /blog/images/hero-{slug}.webp
 * - Inserts section images after the 2nd and 4th H2 headings
 * - Same images for all language versions (en, fr, es, pt)
 *
 * Usage:
 *   node scripts/update-articles-images.mjs
 *   node scripts/update-articles-images.mjs --slug=healthcare-reviews
 *   node scripts/update-articles-images.mjs --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GUIDES_DIR = path.resolve(__dirname, '../src/content/blog/guides');
const LANGUAGES = ['en', 'fr', 'es', 'pt'];

// Image definitions per article (must match generate-all-blog-images.mjs)
const ARTICLE_IMAGES = {
  'auto-repair-reputation': {
    hero: { filename: 'hero-auto-repair-reputation.webp', alt: 'Auto repair shop online reputation management' },
    sections: [
      { filename: 'getting-reviews-auto-repair-reputation.webp', alt: 'Strategies to get reviews for auto repair shops', afterH2Index: 2 },
      { filename: 'responding-reviews-auto-repair-reputation.webp', alt: 'Responding to customer reviews for auto repair', afterH2Index: 3 },
    ],
  },
  'beauty-salon-reputation': {
    hero: { filename: 'hero-beauty-salon-reputation.webp', alt: 'Beauty salon online reputation management' },
    sections: [
      { filename: 'getting-reviews-beauty-salon-reputation.webp', alt: 'Getting more reviews for beauty salons', afterH2Index: 2 },
      { filename: 'responding-reviews-beauty-salon-reputation.webp', alt: 'Responding to beauty salon customer reviews', afterH2Index: 3 },
    ],
  },
  'ecommerce-negative-reviews': {
    hero: { filename: 'hero-ecommerce-negative-reviews.webp', alt: 'Turning negative e-commerce reviews into opportunities' },
    sections: [
      { filename: 'care-framework-ecommerce-negative-reviews.webp', alt: 'CARE response framework for e-commerce reviews', afterH2Index: 2 },
      { filename: 'conversions-impact-ecommerce-negative-reviews.webp', alt: 'Impact of review responses on e-commerce conversions', afterH2Index: 4 },
    ],
  },
  'get-more-5-star-reviews': {
    hero: { filename: 'hero-get-more-5-star-reviews.webp', alt: 'Strategies to get more 5-star reviews' },
    sections: [
      { filename: 'strategies-get-more-5-star-reviews.webp', alt: 'Seven proven strategies for 5-star reviews', afterH2Index: 1 },
      { filename: 'tracking-get-more-5-star-reviews.webp', alt: 'Tracking and optimizing review performance', afterH2Index: 3 },
    ],
  },
  'get-more-google-reviews': {
    hero: { filename: 'hero-get-more-google-reviews.webp', alt: 'Complete guide to getting more Google reviews' },
    sections: [
      { filename: 'strategies-get-more-google-reviews.webp', alt: '15 strategies to get more Google reviews', afterH2Index: 1 },
      { filename: 'timing-get-more-google-reviews.webp', alt: 'Optimal timing for asking for reviews', afterH2Index: 2 },
    ],
  },
  'healthcare-reviews': {
    hero: { filename: 'hero-healthcare-reviews.webp', alt: 'Healthcare professional online review management' },
    sections: [
      { filename: 'ethical-constraints-healthcare-reviews.webp', alt: 'Ethical and legal constraints for healthcare reviews', afterH2Index: 1 },
      { filename: 'responding-guide-healthcare-reviews.webp', alt: 'Guide to responding to healthcare reviews', afterH2Index: 3 },
    ],
  },
  'online-reputation-strategy': {
    hero: { filename: 'hero-online-reputation-strategy.webp', alt: 'Complete online reputation management strategy' },
    sections: [
      { filename: 'audit-online-reputation-strategy.webp', alt: 'Auditing your current online reputation', afterH2Index: 1 },
      { filename: 'crisis-management-online-reputation-strategy.webp', alt: 'Crisis management for online reputation', afterH2Index: 5 },
    ],
  },
  'reputation-artisans': {
    hero: { filename: 'hero-reputation-artisans.webp', alt: 'Online reputation for contractors and tradespeople' },
    sections: [
      { filename: 'getting-reviews-reputation-artisans.webp', alt: 'Getting reviews for contractors', afterH2Index: 2 },
      { filename: 'difficult-situations-reputation-artisans.webp', alt: 'Handling difficult review situations for contractors', afterH2Index: 4 },
    ],
  },
  'respond-google-reviews': {
    hero: { filename: 'hero-respond-google-reviews.webp', alt: 'How to respond to Google reviews effectively' },
    sections: [
      { filename: 'positive-reviews-respond-google-reviews.webp', alt: 'Responding to positive Google reviews', afterH2Index: 1 },
      { filename: 'negative-reviews-respond-google-reviews.webp', alt: 'Responding to negative Google reviews', afterH2Index: 2 },
    ],
  },
  'respond-negative-reviews': {
    hero: { filename: 'hero-respond-negative-reviews.webp', alt: 'Complete guide to responding to negative reviews' },
    sections: [
      { filename: 'five-principles-respond-negative-reviews.webp', alt: 'The 5 principles of responding to negative reviews', afterH2Index: 1 },
      { filename: 'mistakes-avoid-respond-negative-reviews.webp', alt: 'Mistakes to avoid when responding to negative reviews', afterH2Index: 4 },
    ],
  },
  'respond-reviews-2-minutes-day': {
    hero: { filename: 'hero-respond-reviews-2-minutes-day.webp', alt: 'Respond to reviews in 2 minutes a day' },
    sections: [
      { filename: 'workflow-respond-reviews-2-minutes-day.webp', alt: 'The efficient 2-minute review response workflow', afterH2Index: 1 },
      { filename: 'before-after-respond-reviews-2-minutes-day.webp', alt: 'Before and after implementing the 2-minute method', afterH2Index: 5 },
    ],
  },
  'review-response-templates': {
    hero: { filename: 'hero-review-response-templates.webp', alt: '20 review response templates ready to use' },
    sections: [
      { filename: 'negative-templates-review-response-templates.webp', alt: 'Templates for responding to negative reviews', afterH2Index: 1 },
      { filename: 'special-cases-review-response-templates.webp', alt: 'Templates for special review cases', afterH2Index: 3 },
    ],
  },
  'reviews-boost-local-seo': {
    hero: { filename: 'hero-reviews-boost-local-seo.webp', alt: 'How Google reviews boost local SEO' },
    sections: [
      { filename: 'seo-factors-reviews-boost-local-seo.webp', alt: 'The 5 SEO factors of Google reviews', afterH2Index: 1 },
      { filename: 'optimize-reviews-boost-local-seo.webp', alt: 'Optimizing reviews for local SEO impact', afterH2Index: 2 },
    ],
  },
};

function updateFeaturedImagePath(content, heroFilename) {
  // Replace src: "/images/blog/..." with src: "/blog/images/hero-..."
  return content.replace(
    /(\s+src:\s*)"[^"]*"/,
    `$1"/blog/images/${heroFilename}"`
  );
}

function insertSectionImages(content, sections) {
  const lines = content.split('\n');
  const result = [];
  let h2Count = 0;
  let inFrontmatter = false;
  let frontmatterClosed = false;

  // Track which H2 indices need images
  const imagesByH2Index = {};
  for (const section of sections) {
    imagesByH2Index[section.afterH2Index] = section;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track frontmatter
    if (line.trim() === '---') {
      if (!inFrontmatter) {
        inFrontmatter = true;
      } else {
        frontmatterClosed = true;
      }
      result.push(line);
      continue;
    }

    result.push(line);

    // Only count H2s after frontmatter
    if (frontmatterClosed && /^## /.test(line)) {
      h2Count++;

      if (imagesByH2Index[h2Count]) {
        const img = imagesByH2Index[h2Count];
        // Check the line isn't already followed by an image
        const nextLine = lines[i + 1] || '';
        if (!nextLine.startsWith('![')) {
          result.push('');
          result.push(`![${img.alt}](/blog/images/${img.filename})`);
        }
      }
    }
  }

  return result.join('\n');
}

function processArticle(slug, config, dryRun) {
  const articleDir = path.join(GUIDES_DIR, slug);
  if (!fs.existsSync(articleDir)) {
    console.log(`  SKIP — directory not found: ${slug}`);
    return 0;
  }

  let updated = 0;

  for (const lang of LANGUAGES) {
    const filePath = path.join(articleDir, `index.${lang}.mdx`);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Update featuredImage path
    content = updateFeaturedImagePath(content, config.hero.filename);

    // 2. Insert section images
    content = insertSectionImages(content, config.sections);

    if (dryRun) {
      console.log(`  [DRY RUN] Would update: ${slug}/index.${lang}.mdx`);
    } else {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  Updated: ${slug}/index.${lang}.mdx`);
    }
    updated++;
  }

  return updated;
}

// ─── Main ────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const slugFilter = args.find(a => a.startsWith('--slug='))?.split('=')[1];

const articlesToProcess = slugFilter
  ? { [slugFilter]: ARTICLE_IMAGES[slugFilter] }
  : ARTICLE_IMAGES;

if (slugFilter && !ARTICLE_IMAGES[slugFilter]) {
  console.error(`Unknown slug: ${slugFilter}`);
  console.error('Available:', Object.keys(ARTICLE_IMAGES).join(', '));
  process.exit(1);
}

console.log(`${dryRun ? '[DRY RUN] ' : ''}Updating ${Object.keys(articlesToProcess).length} articles...\n`);

let totalUpdated = 0;

for (const [slug, config] of Object.entries(articlesToProcess)) {
  console.log(`${slug}:`);
  totalUpdated += processArticle(slug, config, dryRun);
}

console.log(`\nDone! ${totalUpdated} files updated.`);
