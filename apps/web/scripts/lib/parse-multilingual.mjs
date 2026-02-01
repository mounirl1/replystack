#!/usr/bin/env node

import fs from 'fs';
import yaml from 'js-yaml';

const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'pt'];
const REQUIRED_META_FIELDS = ['title', 'description'];

/**
 * Parse a multilingual source file into structured data.
 *
 * Expected format:
 * ---
 * base_slug: my-article
 * category: guides
 * date: "2026-02-05"
 * author: { name, role: { en, fr, es, pt } }
 * meta: { en: { title, description, seo_title, seo_keywords, tags }, fr: {...}, ... }
 * images: [{ id, filename, alt, prompt }]
 * silo: review-response  # optional
 * ---
 * --- lang:en ---
 * # English content...
 * --- lang:fr ---
 * # French content...
 * --- lang:es ---
 * ...
 * --- lang:pt ---
 * ...
 */
export function parseMultilingualSource(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Split frontmatter from body
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fmMatch) {
    throw new Error('No YAML frontmatter found (expected --- delimiters)');
  }

  const yamlStr = fmMatch[1];
  const body = content.slice(fmMatch[0].length);

  // Parse YAML
  let metadata;
  try {
    metadata = yaml.load(yamlStr);
  } catch (err) {
    throw new Error(`YAML parse error: ${err.message}`);
  }

  // Validate required top-level fields
  if (!metadata.base_slug) throw new Error('Missing required field: base_slug');
  if (!metadata.category) throw new Error('Missing required field: category');
  if (!metadata.date) throw new Error('Missing required field: date');
  if (!metadata.author) throw new Error('Missing required field: author');
  if (!metadata.meta) throw new Error('Missing required field: meta');

  // Validate meta for each language
  for (const lang of SUPPORTED_LANGUAGES) {
    if (!metadata.meta[lang]) {
      throw new Error(`Missing meta for language: ${lang}`);
    }
    for (const field of REQUIRED_META_FIELDS) {
      if (!metadata.meta[lang][field]) {
        throw new Error(`Missing meta.${lang}.${field}`);
      }
    }
  }

  // Parse language sections from body
  const langSections = parseLangSections(body);

  // Validate all 4 languages present
  for (const lang of SUPPORTED_LANGUAGES) {
    if (!langSections[lang]) {
      throw new Error(`Missing language section: --- lang:${lang} ---`);
    }
    if (langSections[lang].trim().length === 0) {
      throw new Error(`Empty content for language: ${lang}`);
    }
  }

  // Normalize images array
  const images = (metadata.images || []).map(img => ({
    id: img.id,
    filename: img.filename,
    alt: img.alt || img.id,
    prompt: img.prompt || null,
    width: img.width || 1200,
    height: img.height || 675,
  }));

  return {
    metadata: {
      base_slug: metadata.base_slug,
      category: metadata.category,
      date: metadata.date,
      author: metadata.author,
      meta: metadata.meta,
      silo: metadata.silo || null,
    },
    images,
    langSections,
  };
}

/**
 * Split body content by --- lang:xx --- markers.
 * Returns { en: '...', fr: '...', es: '...', pt: '...' }
 */
function parseLangSections(body) {
  const sections = {};
  // Match --- lang:xx --- with optional whitespace
  const langRegex = /^---\s*lang:(\w{2})\s*---\s*$/gm;
  const matches = [...body.matchAll(langRegex)];

  if (matches.length === 0) {
    throw new Error('No language sections found (expected --- lang:xx --- markers)');
  }

  for (let i = 0; i < matches.length; i++) {
    const lang = matches[i][1];
    const startIdx = matches[i].index + matches[i][0].length;
    const endIdx = i + 1 < matches.length ? matches[i + 1].index : body.length;
    sections[lang] = body.slice(startIdx, endIdx).trim();
  }

  return sections;
}

/**
 * Count words in a text string (strips markdown syntax).
 */
export function countWords(text) {
  // Remove markdown images, links syntax, headers markers, etc.
  const cleaned = text
    .replace(/!\[.*?\]\(.*?\)/g, '')       // images
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1') // links (keep text)
    .replace(/#{1,6}\s/g, '')              // headers
    .replace(/[*_~`>]/g, '')              // formatting
    .replace(/<!--.*?-->/g, '')           // comments
    .replace(/---/g, '')                  // hr
    .replace(/\n/g, ' ');
  return cleaned.split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Calculate reading time from word count (200 wpm).
 */
export function calculateReadingTime(wordCount) {
  return Math.max(1, Math.ceil(wordCount / 200));
}
