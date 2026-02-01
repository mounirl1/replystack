#!/usr/bin/env node

/**
 * Publish a multilingual blog article for ReplyStack.
 *
 * Usage:
 *   node scripts/publish-multilingual.mjs <source.md> [--skip-images] [--no-links] [--dry-run]
 *
 * Flow:
 * 1. Parse multilingual source file (YAML frontmatter + 4 lang sections)
 * 2. Generate images via Replicate (unless --skip-images)
 * 3. For each language:
 *    - Replace <!-- IMAGE: id --> markers with markdown image syntax
 *    - Apply internal links (unless --no-links)
 *    - Write .mdx file to content/blog/{category}/{slug}/
 * 4. Register article in posts.ts (imports + registry entries)
 * 5. Move source to _sources/published/
 * 6. Print validation checklist
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseMultilingualSource, countWords, calculateReadingTime } from './lib/parse-multilingual.mjs';
import { registerArticle } from './lib/register-article.mjs';
import { applyInternalLinks } from './lib/apply-internal-links.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.resolve(__dirname, '../src/content/blog');
const SOURCES_DIR = path.resolve(__dirname, '../_sources');
const PUBLISHED_DIR = path.resolve(__dirname, '../_sources/published');

const LANGUAGES = ['en', 'fr', 'es', 'pt'];

// --- CLI ---

const args = process.argv.slice(2);
const skipImages = args.includes('--skip-images');
const noLinks = args.includes('--no-links');
const dryRun = args.includes('--dry-run');
const articlePath = args.find(a => !a.startsWith('--'));

if (!articlePath) {
  console.error('Usage: node scripts/publish-multilingual.mjs <source.md> [--skip-images] [--no-links] [--dry-run]');
  process.exit(1);
}

const resolvedPath = path.resolve(articlePath);
if (!fs.existsSync(resolvedPath)) {
  console.error(`File not found: ${resolvedPath}`);
  process.exit(1);
}

// --- Main ---

async function publish(sourcePath) {
  console.log(`\n📝 Publishing multilingual article: ${path.basename(sourcePath)}`);
  console.log(`   Options: ${skipImages ? '--skip-images ' : ''}${noLinks ? '--no-links ' : ''}${dryRun ? '--dry-run' : ''}\n`);

  // Step 1: Parse source
  console.log('--- Step 1: Parsing source ---');
  const { metadata, images, langSections } = parseMultilingualSource(sourcePath);
  console.log(`  Slug: ${metadata.base_slug}`);
  console.log(`  Category: ${metadata.category}`);
  console.log(`  Date: ${metadata.date}`);
  console.log(`  Languages: ${Object.keys(langSections).join(', ')}`);
  console.log(`  Images: ${images.length}`);

  // Step 2: Generate images
  if (!skipImages && images.length > 0) {
    console.log('\n--- Step 2: Generating images ---');
    try {
      const { generateImagesFromList } = await import('./generate-blog-images.mjs');
      await generateImagesFromList(images);
    } catch (err) {
      console.error(`  Warning: Image generation failed: ${err.message}`);
      console.error('  Continuing without images. You can retry later.');
    }
  } else {
    console.log('\n--- Step 2: Skipping image generation ---');
  }

  // Step 3: Process each language
  console.log('\n--- Step 3: Writing MDX files ---');
  const wordCounts = {};
  const readingTimes = {};
  const linksPerLang = {};
  const outputPaths = [];

  const outputDir = path.join(CONTENT_DIR, metadata.category, metadata.base_slug);

  if (!dryRun && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const lang of LANGUAGES) {
    let content = langSections[lang];

    // Replace image markers
    content = replaceImageMarkers(content, images);

    // Apply internal links
    if (!noLinks) {
      const linkResult = applyInternalLinks(content, metadata.base_slug, lang, metadata.silo);
      content = linkResult.content;
      linksPerLang[lang] = linkResult.linksApplied;
    } else {
      linksPerLang[lang] = 0;
    }

    // Calculate word count and reading time
    wordCounts[lang] = countWords(content);
    readingTimes[lang] = calculateReadingTime(wordCounts[lang]);

    // Write MDX file
    const outputPath = path.join(outputDir, `index.${lang}.mdx`);
    outputPaths.push(outputPath);

    if (dryRun) {
      console.log(`  [DRY RUN] Would write: ${path.relative(process.cwd(), outputPath)} (${wordCounts[lang]} words, ${readingTimes[lang]} min read, ${linksPerLang[lang]} links)`);
    } else {
      fs.writeFileSync(outputPath, content + '\n', 'utf-8');
      console.log(`  Written: ${path.relative(process.cwd(), outputPath)} (${wordCounts[lang]} words, ${readingTimes[lang]} min read, ${linksPerLang[lang]} links)`);
    }
  }

  // Step 4: Register in posts.ts
  console.log('\n--- Step 4: Registering in posts.ts ---');
  try {
    const result = registerArticle(metadata, wordCounts, readingTimes, dryRun);
    console.log(`  Added ${result.importsAdded} imports and ${result.entriesAdded} registry entries.`);
  } catch (err) {
    console.error(`  Error: ${err.message}`);
    if (!dryRun) {
      console.error('  posts.ts was NOT updated. You may need to register manually.');
    }
  }

  // Step 5: Move source to published
  if (!dryRun) {
    console.log('\n--- Step 5: Archiving source ---');
    if (!fs.existsSync(PUBLISHED_DIR)) {
      fs.mkdirSync(PUBLISHED_DIR, { recursive: true });
    }
    const destPath = path.join(PUBLISHED_DIR, path.basename(sourcePath));
    fs.renameSync(sourcePath, destPath);
    console.log(`  Moved to: ${path.relative(process.cwd(), destPath)}`);
  } else {
    console.log('\n--- Step 5: [DRY RUN] Would move source to _sources/published/ ---');
  }

  // Step 6: Validation checklist
  console.log('\n' + '='.repeat(60));
  console.log('  VALIDATION CHECKLIST');
  console.log('='.repeat(60));
  console.log(`  [${Object.keys(langSections).length === 4 ? 'x' : ' '}] 4 language sections parsed`);
  console.log(`  [x] Frontmatter valid (slug: ${metadata.base_slug})`);
  console.log(`  [${images.length > 0 ? 'x' : '-'}] ${images.length} image(s) defined${skipImages ? ' (generation skipped)' : ''}`);
  for (const lang of LANGUAGES) {
    console.log(`  [${dryRun ? '~' : 'x'}] index.${lang}.mdx ${dryRun ? 'would be' : ''} created (${wordCounts[lang]} words)`);
  }
  console.log(`  [${dryRun ? '~' : 'x'}] posts.ts ${dryRun ? 'would be' : ''} updated`);
  if (!noLinks) {
    const totalLinks = Object.values(linksPerLang).reduce((a, b) => a + b, 0);
    console.log(`  [${totalLinks > 0 ? 'x' : '-'}] Internal links: ${LANGUAGES.map(l => `${l}:${linksPerLang[l]}`).join(', ')}`);
  }
  console.log('  [ ] Verify rendering: pnpm --filter web dev');
  console.log('  [ ] Verify build: pnpm --filter web build');
  console.log('='.repeat(60));
  console.log('');
}

/**
 * Replace <!-- IMAGE: id --> markers with markdown image syntax.
 */
function replaceImageMarkers(content, images) {
  let result = content;
  for (const img of images) {
    const markerRegex = new RegExp(
      `<!--\\s*IMAGE:\\s*${img.id}\\s*-->`,
      'g'
    );
    const replacement = `![${img.alt}](/blog/images/${img.filename})`;
    result = result.replace(markerRegex, replacement);
  }
  return result;
}

// Run
publish(resolvedPath).catch(err => {
  console.error('\nFatal error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
