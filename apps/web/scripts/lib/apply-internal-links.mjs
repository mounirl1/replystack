/**
 * Apply internal links to article content based on silo structure.
 *
 * Algorithm:
 * 1. Identify the silo of the current article
 * 2. Select up to 3 target articles (pillar first, then cluster, then related silos)
 * 3. For each target, search for anchor text in the content (case-insensitive)
 * 4. If found naturally, wrap in markdown link
 * 5. Skip if not found (no forced injection)
 *
 * Distribution: 40% exact, 30% partial, 20% generic, 10% branded
 */

import { silos, relatedSilos, anchorTexts, findSilo } from './internal-links-data.mjs';

const MAX_LINKS = 3;

/**
 * Apply internal links to content for a given article and language.
 *
 * @param {string} content - Markdown content
 * @param {string} slug - Current article slug
 * @param {string} lang - Language code (en/fr/es/pt)
 * @param {string|null} siloOverride - Optional silo override from source metadata
 * @returns {{ content: string, linksApplied: number }}
 */
export function applyInternalLinks(content, slug, lang, siloOverride = null) {
  const silo = siloOverride || findSilo(slug);
  if (!silo) {
    return { content, linksApplied: 0 };
  }

  // Get target slugs (excluding self)
  const targets = selectTargets(slug, silo);

  let result = content;
  let linksApplied = 0;

  for (const targetSlug of targets) {
    if (linksApplied >= MAX_LINKS) break;

    const anchors = anchorTexts[targetSlug]?.[lang];
    if (!anchors) continue;

    // Select anchor type based on distribution
    const anchorText = selectAnchor(anchors, linksApplied);
    if (!anchorText) continue;

    // Try to find and replace the anchor text in content
    const linked = tryInsertLink(result, anchorText, targetSlug);
    if (linked) {
      result = linked;
      linksApplied++;
    }
  }

  return { content: result, linksApplied };
}

/**
 * Select target articles to link to, ordered by priority:
 * 1. Pillar of the same silo (if current is cluster)
 * 2. Cluster articles of the same silo
 * 3. Pillars of related silos
 * 4. Cluster articles of related silos
 */
function selectTargets(slug, siloKey) {
  const targets = [];
  const currentSilo = silos[siloKey];

  if (!currentSilo) return targets;

  // If current article is a cluster article, prioritize the pillar
  if (currentSilo.pillar && currentSilo.pillar !== slug) {
    targets.push(currentSilo.pillar);
  }

  // Add cluster articles from same silo
  for (const clusterSlug of currentSilo.cluster) {
    if (clusterSlug !== slug && !targets.includes(clusterSlug)) {
      targets.push(clusterSlug);
    }
  }

  // Add articles from related silos
  const related = relatedSilos[siloKey] || [];
  for (const relatedSiloKey of related) {
    const relatedSilo = silos[relatedSiloKey];
    if (!relatedSilo) continue;

    if (relatedSilo.pillar && relatedSilo.pillar !== slug && !targets.includes(relatedSilo.pillar)) {
      targets.push(relatedSilo.pillar);
    }

    for (const clusterSlug of relatedSilo.cluster) {
      if (clusterSlug !== slug && !targets.includes(clusterSlug)) {
        targets.push(clusterSlug);
      }
    }
  }

  return targets;
}

/**
 * Select an anchor text based on the distribution:
 * 40% exact, 30% partial, 20% generic, 10% branded
 */
function selectAnchor(anchors, linkIndex) {
  // Rotate through types based on link index for deterministic distribution
  const typeOrder = ['exact', 'partial', 'exact', 'generic', 'exact', 'partial', 'branded', 'exact', 'partial', 'generic'];
  const type = typeOrder[linkIndex % typeOrder.length];

  const candidates = anchors[type];
  if (!candidates || candidates.length === 0) {
    // Fallback: try any type
    for (const t of ['exact', 'partial', 'generic', 'branded']) {
      if (anchors[t]?.length > 0) return anchors[t][0];
    }
    return null;
  }

  // Pick first candidate (deterministic)
  return candidates[0];
}

/**
 * Try to insert a markdown link for the given anchor text in the content.
 * Only matches text that is NOT already inside a markdown link or heading.
 * Case-insensitive match.
 *
 * @returns {string|null} Modified content, or null if not found.
 */
function tryInsertLink(content, anchorText, targetSlug) {
  // Escape regex special characters in anchor text
  const escaped = anchorText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Match the anchor text case-insensitively, but NOT if:
  // - Already inside a markdown link [...](...)
  // - Inside a heading (# ...)
  // - Inside an image ![...]
  const regex = new RegExp(
    `(?<![\\[!])\\b(${escaped})\\b(?![\\]\\(])`,
    'i'
  );

  const match = content.match(regex);
  if (!match) return null;

  // Check if the match is inside a markdown link or heading by examining the line
  const matchIdx = match.index;
  const lineStart = content.lastIndexOf('\n', matchIdx) + 1;
  const lineEnd = content.indexOf('\n', matchIdx);
  const line = content.substring(lineStart, lineEnd === -1 ? content.length : lineEnd);

  // Skip if line is a heading
  if (line.trimStart().startsWith('#')) return null;

  // Skip if match is inside a markdown link [text](url) or ![alt](url)
  if (isInsideMarkdownLink(line, matchIdx - lineStart)) return null;

  // Replace only the first occurrence
  const before = content.substring(0, match.index);
  const after = content.substring(match.index + match[0].length);
  const link = `[${match[0]}](/blog/${targetSlug})`;

  return before + link + after;
}

/**
 * Check if a position in a line is inside a markdown link.
 */
function isInsideMarkdownLink(line, pos) {
  // Simple check: look for unmatched [ before pos and ] after pos
  let bracketDepth = 0;
  for (let i = 0; i < pos; i++) {
    if (line[i] === '[') bracketDepth++;
    if (line[i] === ']') bracketDepth--;
  }
  return bracketDepth > 0;
}
