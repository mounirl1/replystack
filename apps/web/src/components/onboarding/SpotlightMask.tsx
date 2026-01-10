import { useEffect, useState } from 'react';
import { POSITION_CALC_DELAY } from '@/constants';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface SpotlightMaskProps {
  targetSelector: string;
  padding?: number;
  borderRadius?: number;
}

export function SpotlightMask({
  targetSelector,
  padding = 8,
  borderRadius = 12,
}: SpotlightMaskProps) {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  useEffect(() => {
    const updateRect = () => {
      const element = document.querySelector(targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect({
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        });
      }
    };

    // Initial update
    updateRect();

    // Update on scroll/resize
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);

    // Observe DOM changes
    const observer = new MutationObserver(updateRect);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
      observer.disconnect();
    };
  }, [targetSelector, padding]);

  if (!targetRect) return null;

  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none z-50"
      style={{ isolation: 'isolate' }}
    >
      <defs>
        <mask id="spotlight-mask">
          {/* White background = visible overlay */}
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          {/* Black rectangle = transparent hole */}
          <rect
            x={targetRect.left}
            y={targetRect.top}
            width={targetRect.width}
            height={targetRect.height}
            rx={borderRadius}
            ry={borderRadius}
            fill="black"
          />
        </mask>
      </defs>
      {/* Dark overlay with hole */}
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="rgba(0, 0, 0, 0.75)"
        mask="url(#spotlight-mask)"
        className="pointer-events-auto"
      />
      {/* Highlight border around target */}
      <rect
        x={targetRect.left}
        y={targetRect.top}
        width={targetRect.width}
        height={targetRect.height}
        rx={borderRadius}
        ry={borderRadius}
        fill="none"
        stroke="rgba(99, 102, 241, 0.5)"
        strokeWidth="2"
        className="animate-pulse"
      />
    </svg>
  );
}

/**
 * Custom hook to track the bounding rectangle of a DOM element
 * Automatically updates on scroll, resize, and DOM mutations
 *
 * @param targetSelector - CSS selector for the target element
 * @param padding - Extra padding to add around the element bounds
 * @returns The target's bounding rectangle or null if element not found
 */
export function useTargetRect(targetSelector: string, padding = 8) {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  useEffect(() => {
    const updateRect = () => {
      const element = document.querySelector(targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect({
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        });
      } else {
        setTargetRect(null);
      }
    };

    // Initial update with small delay for render
    const timeoutId = setTimeout(updateRect, POSITION_CALC_DELAY);

    // Update on scroll/resize
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);

    // Observe DOM changes
    const observer = new MutationObserver(updateRect);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
      observer.disconnect();
    };
  }, [targetSelector, padding]);

  return targetRect;
}
