#!/usr/bin/env node

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

function getReplicateToken() {
  // Try loading from apps/web/.env then .env.local
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

function parseYamlFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { frontmatter: null, body: content };

  const yamlStr = match[1];
  const body = content.slice(match[0].length).trim();

  return { yamlStr, body };
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
    const widthMatch = lines.match(/^width:\s*(\d+)$/m);
    const heightMatch = lines.match(/^height:\s*(\d+)$/m);

    // Extract multi-line prompt (indented block after `prompt: |`)
    const promptMatch = lines.match(/prompt:\s*\|\s*\n([\s\S]*?)$/m);

    if (idMatch) image.id = idMatch[1].trim();
    if (filenameMatch) image.filename = filenameMatch[1].trim();
    if (altMatch) image.alt = altMatch[1].trim();
    if (placementMatch) image.placement = placementMatch[1].trim();
    if (widthMatch) image.width = parseInt(widthMatch[1]);
    if (heightMatch) image.height = parseInt(heightMatch[1]);
    if (promptMatch) {
      image.prompt = promptMatch[1]
        .split('\n')
        .map(l => l.replace(/^\s{4,6}/, '').trim())
        .filter(Boolean)
        .join(' ');
    }

    if (image.id && image.filename && image.prompt) {
      images.push(image);
    }
  }

  return images;
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

  // If completed immediately
  if (prediction.status === 'succeeded' && prediction.output) {
    return prediction.output;
  }

  // Poll for result
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

    console.log(`  Polling... status: ${prediction.status}`);
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate images from a pre-parsed list (used by publish-multilingual.mjs).
 * Each image must have: id, filename, prompt, width, height.
 */
export async function generateImagesFromList(images) {
  if (images.length === 0) {
    console.log('No images to generate.');
    return [];
  }

  // Filter to only images that have prompts
  const toGenerate = images.filter(img => img.prompt);
  if (toGenerate.length === 0) {
    console.log('No images with prompts found.');
    return [];
  }

  console.log(`Found ${toGenerate.length} image(s) to generate.\n`);

  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const token = getReplicateToken();
  const generated = [];

  for (let i = 0; i < toGenerate.length; i++) {
    const img = toGenerate[i];
    const outputPath = path.join(IMAGES_DIR, img.filename);

    if (fs.existsSync(outputPath)) {
      console.log(`[${i + 1}/${toGenerate.length}] SKIP "${img.id}" - ${img.filename} already exists`);
      generated.push(img);
      continue;
    }

    console.log(`[${i + 1}/${toGenerate.length}] Generating "${img.id}" (${img.width || 800}x${img.height || 450})...`);
    console.log(`  Prompt: ${img.prompt.substring(0, 80)}...`);

    try {
      const output = await callReplicate(token, img.prompt, img.width, img.height);
      const imageUrl = Array.isArray(output) ? output[0] : output;

      console.log(`  Downloading and converting to WebP...`);
      await downloadAndConvertToWebp(imageUrl, outputPath);

      console.log(`  Saved: ${img.filename}`);
      generated.push(img);
    } catch (err) {
      console.error(`  ERROR generating "${img.id}": ${err.message}`);
    }

    if (i < toGenerate.length - 1) {
      console.log(`  Waiting ${DELAY_BETWEEN_REQUESTS_MS / 1000}s (rate limit)...\n`);
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }
  }

  console.log(`\nDone! ${generated.length}/${toGenerate.length} images generated.`);
  return generated;
}

export async function generateImagesForArticle(articlePath) {
  const content = fs.readFileSync(articlePath, 'utf-8');
  const { yamlStr } = parseYamlFrontmatter(content);

  if (!yamlStr) {
    console.log('No YAML frontmatter found.');
    return [];
  }

  const images = parseImagesFromYaml(yamlStr);
  if (images.length === 0) {
    console.log('No images block found in frontmatter.');
    return [];
  }

  console.log(`Found ${images.length} image(s) to generate.\n`);

  // Ensure output directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const token = getReplicateToken();
  const generated = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const outputPath = path.join(IMAGES_DIR, img.filename);

    // Skip existing images
    if (fs.existsSync(outputPath)) {
      console.log(`[${i + 1}/${images.length}] SKIP "${img.id}" - ${img.filename} already exists`);
      generated.push(img);
      continue;
    }

    console.log(`[${i + 1}/${images.length}] Generating "${img.id}" (${img.width}x${img.height})...`);
    console.log(`  Prompt: ${img.prompt.substring(0, 80)}...`);

    try {
      const output = await callReplicate(token, img.prompt, img.width, img.height);

      // output can be a string URL or an array of URLs
      const imageUrl = Array.isArray(output) ? output[0] : output;

      console.log(`  Downloading and converting to WebP...`);
      await downloadAndConvertToWebp(imageUrl, outputPath);

      console.log(`  Saved: ${img.filename}`);
      generated.push(img);
    } catch (err) {
      console.error(`  ERROR generating "${img.id}": ${err.message}`);
    }

    // Rate limit delay (skip after last image)
    if (i < images.length - 1) {
      console.log(`  Waiting ${DELAY_BETWEEN_REQUESTS_MS / 1000}s (rate limit)...\n`);
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }
  }

  console.log(`\nDone! ${generated.length}/${images.length} images generated.`);
  return generated;
}

// CLI entry point
const articlePath = process.argv[2];
if (!articlePath) {
  console.error('Usage: node scripts/generate-blog-images.mjs <article-path>');
  process.exit(1);
}

const resolvedPath = path.resolve(articlePath);
if (!fs.existsSync(resolvedPath)) {
  console.error(`File not found: ${resolvedPath}`);
  process.exit(1);
}

console.log(`Generating images for: ${resolvedPath}\n`);
generateImagesForArticle(resolvedPath).catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
