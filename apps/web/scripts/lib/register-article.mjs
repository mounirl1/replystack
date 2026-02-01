#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const POSTS_FILE = path.resolve(__dirname, '../../src/lib/blog/posts.ts');

const LANGUAGES = ['en', 'fr', 'es', 'pt'];
const LANG_SUFFIX = { en: 'EN', fr: 'FR', es: 'ES', pt: 'PT' };

/**
 * Convert a slug like "respond-tripadvisor-reviews" to PascalCase "RespondTripadvisorReviews"
 */
function slugToPascalCase(slug) {
  return slug
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

/**
 * Build a human-readable comment label from a slug.
 * e.g. "respond-tripadvisor-reviews" → "Respond Tripadvisor Reviews"
 */
function slugToLabel(slug) {
  return slug
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Register a new article in posts.ts by inserting imports and registry entries.
 *
 * @param {object} metadata - Parsed metadata from source file
 * @param {object} wordCounts - { en: number, fr: number, es: number, pt: number }
 * @param {object} readingTimes - { en: number, fr: number, es: number, pt: number }
 * @param {boolean} dryRun - If true, only log what would be done
 * @returns {{ importsAdded: number, entriesAdded: number }}
 */
export function registerArticle(metadata, wordCounts, readingTimes, dryRun = false) {
  const { base_slug, category, date, author, meta } = metadata;
  const baseName = slugToPascalCase(base_slug);
  const label = slugToLabel(base_slug);

  let content = fs.readFileSync(POSTS_FILE, 'utf-8');

  // Check if slug already registered
  if (content.includes(`'en:${base_slug}'`)) {
    throw new Error(`Article "${base_slug}" is already registered in posts.ts`);
  }

  // 1. Insert imports after the last import line
  const importBlock = buildImportBlock(baseName, label, category, base_slug);
  content = insertImports(content, importBlock);

  // 2. Insert registry entries before the closing `};` of blogPosts
  const registryBlock = buildRegistryBlock(baseName, base_slug, category, date, author, meta, wordCounts, readingTimes);
  content = insertRegistryEntries(content, registryBlock);

  if (dryRun) {
    console.log('\n[DRY RUN] Would add to posts.ts:');
    console.log('--- IMPORTS ---');
    console.log(importBlock);
    console.log('--- REGISTRY ENTRIES ---');
    console.log(registryBlock.substring(0, 500) + '...');
    return { importsAdded: 4, entriesAdded: 4 };
  }

  fs.writeFileSync(POSTS_FILE, content, 'utf-8');

  return { importsAdded: 4, entriesAdded: 4 };
}

function buildImportBlock(baseName, label, category, slug) {
  const lines = [`// Import blog articles - ${label}`];
  for (const lang of LANGUAGES) {
    const suffix = LANG_SUFFIX[lang];
    lines.push(
      `import ${baseName}${suffix} from '@/content/blog/${category}/${slug}/index.${lang}.mdx';`
    );
  }
  return lines.join('\n');
}

function insertImports(content, importBlock) {
  // Find the last import from '@/content/blog/' line
  const lines = content.split('\n');
  let lastImportIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("import ") && lines[i].includes("@/content/blog/")) {
      lastImportIdx = i;
    }
  }

  if (lastImportIdx === -1) {
    throw new Error('Could not find blog imports in posts.ts');
  }

  // Insert after the last import line (with a blank line separator)
  lines.splice(lastImportIdx + 1, 0, '', importBlock);
  return lines.join('\n');
}

function buildRegistryBlock(baseName, slug, category, date, author, meta, wordCounts, readingTimes) {
  const entries = [];

  for (const lang of LANGUAGES) {
    const suffix = LANG_SUFFIX[lang];
    const m = meta[lang];
    const heroImage = findHeroImage(slug);

    // Author role: use language-specific if available, fallback to string
    const authorRole = typeof author.role === 'object' ? author.role[lang] : (author.role || 'Review Management Experts');

    const entry = `  // ${slugToLabel(slug)} - ${suffix}
  '${lang}:${slug}': {
    component: ${baseName}${suffix},
    meta: {
      title: ${JSON.stringify(m.title)},
      slug: ${JSON.stringify(slug)},
      description: ${JSON.stringify(m.description)},
      date: ${JSON.stringify(date)},
      author: {
        name: ${JSON.stringify(author.name)},
        role: ${JSON.stringify(authorRole)},
      },
      category: ${JSON.stringify(category)},
      tags: ${JSON.stringify(m.tags || [])},
      language: ${JSON.stringify(lang)},
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: ${readingTimes[lang]},
      wordCount: ${wordCounts[lang]},
      seo: {
        title: ${JSON.stringify(m.seo_title || m.title)},
        description: ${JSON.stringify(m.description)},
        keywords: ${JSON.stringify(m.seo_keywords || [])},
      },${heroImage ? `
      featuredImage: {
        src: '/blog/images/${heroImage}',
        alt: ${JSON.stringify(m.title)},
      },` : ''}
    },
  },`;
    entries.push(entry);
  }

  return entries.join('\n');
}

function findHeroImage(slug) {
  // Convention: hero-{slug}.webp
  return `hero-${slug}.webp`;
}

function insertRegistryEntries(content, registryBlock) {
  // Find the closing `};` of the blogPosts object.
  // It's the `};` that follows the last registry entry, before the
  // `// Extract posts data from registry` comment.
  const marker = '// Extract posts data from registry';
  const markerIdx = content.indexOf(marker);

  if (markerIdx === -1) {
    throw new Error('Could not find "// Extract posts data from registry" marker in posts.ts');
  }

  // Find the `};` just before the marker
  const beforeMarker = content.substring(0, markerIdx);
  const closingIdx = beforeMarker.lastIndexOf('};');

  if (closingIdx === -1) {
    throw new Error('Could not find closing }; of blogPosts object');
  }

  // Insert the new entries just before `};`
  const before = content.substring(0, closingIdx);
  const after = content.substring(closingIdx);

  return before + registryBlock + '\n' + after;
}
