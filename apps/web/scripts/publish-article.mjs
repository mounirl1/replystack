#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateImagesForArticle } from './generate-blog-images.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.resolve(__dirname, '../src/content/blog');

function parseFullFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error('No YAML frontmatter found');

  const yamlStr = match[1];
  const body = content.slice(match[0].length).trim();

  return { yamlStr, body };
}

function extractYamlValue(yamlStr, key) {
  const regex = new RegExp(`^${key}:\\s*"?([^"\\n]*)"?`, 'm');
  const match = yamlStr.match(regex);
  return match ? match[1].trim() : null;
}

function extractYamlList(yamlStr, key) {
  const regex = new RegExp(`^${key}:\\s*\\n((?:\\s+-\\s+.+\\n?)*)`, 'm');
  const match = yamlStr.match(regex);
  if (!match) return [];
  return match[1]
    .split('\n')
    .map(l => l.replace(/^\s+-\s+"?/, '').replace(/"?\s*$/, '').trim())
    .filter(Boolean);
}

function parseImagesFromYaml(yamlStr) {
  const images = [];
  const imagesMatch = yamlStr.match(/^images:\s*\n([\s\S]*?)(?=\n[a-z_]|\n---|\s*$)/m);
  if (!imagesMatch) return images;

  const imagesBlock = imagesMatch[1];
  const imageEntries = imagesBlock.split(/\n  - /).filter(Boolean);

  for (const entry of imageEntries) {
    const lines = entry.replace(/^- /, '').trim();
    const image = {};

    const idMatch = lines.match(/^id:\s*(.+)$/m);
    const filenameMatch = lines.match(/^filename:\s*(.+)$/m);
    const altMatch = lines.match(/^alt:\s*"?([^"]*)"?$/m);
    const placementMatch = lines.match(/^placement:\s*(.+)$/m);

    if (idMatch) image.id = idMatch[1].trim();
    if (filenameMatch) image.filename = filenameMatch[1].trim();
    if (altMatch) image.alt = altMatch[1].trim();
    if (placementMatch) image.placement = placementMatch[1].trim();

    if (image.id && image.filename) {
      images.push(image);
    }
  }

  return images;
}

function replaceImageMarkers(body, images) {
  let result = body;

  for (const img of images) {
    const markerRegex = new RegExp(
      `<!--\\s*IMAGE:\\s*${img.id}\\s*(?:-[^>]*)?>`,
      'g'
    );
    const replacement = `![${img.alt || img.id}](/blog/images/${img.filename})`;
    result = result.replace(markerRegex, replacement);
  }

  return result;
}

function buildSimplifiedFrontmatter(yamlStr, images) {
  const title = extractYamlValue(yamlStr, 'title');
  const description = extractYamlValue(yamlStr, 'meta_description') || extractYamlValue(yamlStr, 'description');
  const date = extractYamlValue(yamlStr, 'date_publication') || extractYamlValue(yamlStr, 'date');
  const category = extractYamlValue(yamlStr, 'silo_nom') || extractYamlValue(yamlStr, 'category') || 'guides';
  const tags = extractYamlList(yamlStr, 'mots_cles_secondaires').length > 0
    ? extractYamlList(yamlStr, 'mots_cles_secondaires')
    : extractYamlList(yamlStr, 'tags');
  const featured = extractYamlValue(yamlStr, 'type') === 'pilier';

  // Hero image
  const heroImage = images.find(i => i.id === 'hero');
  const imageSrc = heroImage ? `/blog/images/${heroImage.filename}` : null;
  const imageAlt = heroImage ? heroImage.alt : null;

  const lines = ['---'];
  lines.push(`title: "${title}"`);
  if (description) lines.push(`description: "${description}"`);
  if (date) lines.push(`date: "${date}"`);
  lines.push(`author:`);
  lines.push(`  name: "ReplyStack Team"`);
  lines.push(`  role: "Online Reputation Expert"`);
  lines.push(`category: "${category}"`);

  if (tags.length > 0) {
    lines.push(`tags: [${tags.map(t => `"${t}"`).join(', ')}]`);
  }

  if (imageSrc) {
    lines.push(`featuredImage:`);
    lines.push(`  src: "${imageSrc}"`);
    lines.push(`  alt: "${imageAlt || title}"`);
  }

  if (featured) {
    lines.push(`featured: true`);
  }

  lines.push('---');
  return lines.join('\n');
}

function deriveSlugFromUrl(yamlStr) {
  const url = extractYamlValue(yamlStr, 'url');
  if (url) {
    // Extract last segment: /blog/silo/slug/ -> slug
    const segments = url.split('/').filter(Boolean);
    return segments[segments.length - 1];
  }
  return null;
}

function deriveSlugFromFilename(filePath) {
  const basename = path.basename(filePath, path.extname(filePath));
  // Remove common prefixes like S1-P-, S2-C-, etc.
  return basename.replace(/^S\d+-[A-Z]-/, '').toLowerCase();
}

function deriveCategoryFromUrl(yamlStr) {
  const url = extractYamlValue(yamlStr, 'url');
  if (url) {
    const segments = url.split('/').filter(Boolean);
    // /blog/category/slug/ -> category
    if (segments.length >= 3) {
      return segments[1];
    }
  }
  return 'guides';
}

async function publishArticle(articlePath, skipImages = false) {
  console.log(`Publishing article: ${articlePath}\n`);

  const content = fs.readFileSync(articlePath, 'utf-8');
  const { yamlStr, body } = parseFullFrontmatter(content);

  // 1. Generate images (unless --skip-images)
  const images = parseImagesFromYaml(yamlStr);

  if (!skipImages && images.length > 0) {
    console.log('--- Generating images ---\n');
    await generateImagesForArticle(articlePath);
    console.log('\n--- Images done ---\n');
  } else if (skipImages) {
    console.log('Skipping image generation (--skip-images)\n');
  }

  // 2. Replace image markers in body
  const processedBody = replaceImageMarkers(body, images);

  // 3. Build simplified frontmatter
  const frontmatter = buildSimplifiedFrontmatter(yamlStr, images);

  // 4. Determine output path
  const slug = deriveSlugFromUrl(yamlStr) || deriveSlugFromFilename(articlePath);
  const category = deriveCategoryFromUrl(yamlStr);
  const outputDir = path.join(CONTENT_DIR, category, slug);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'index.fr.mdx');
  const finalContent = `${frontmatter}\n\n${processedBody}\n`;

  fs.writeFileSync(outputPath, finalContent, 'utf-8');
  console.log(`Article written to: ${outputPath}`);

  // 5. Move source to implementes/
  const sourceDir = path.dirname(articlePath);
  const implementesDir = path.join(sourceDir, 'implementes');

  if (!fs.existsSync(implementesDir)) {
    fs.mkdirSync(implementesDir, { recursive: true });
  }

  const destPath = path.join(implementesDir, path.basename(articlePath));
  fs.renameSync(articlePath, destPath);
  console.log(`Source moved to: ${destPath}`);

  console.log(`\nDone! Article "${slug}" published.`);
}

// CLI
const args = process.argv.slice(2);
const skipImages = args.includes('--skip-images');
const articlePath = args.find(a => !a.startsWith('--'));

if (!articlePath) {
  console.error('Usage: node scripts/publish-article.mjs <article-path> [--skip-images]');
  process.exit(1);
}

const resolvedPath = path.resolve(articlePath);
if (!fs.existsSync(resolvedPath)) {
  console.error(`File not found: ${resolvedPath}`);
  process.exit(1);
}

publishArticle(resolvedPath, skipImages).catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
