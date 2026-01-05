import { useEffect, useState, type ReactNode } from 'react';
import type { OnboardingStep } from '@/contexts/OnboardingContext';

interface TooltipBubbleProps {
  step: OnboardingStep;
  title: string;
  description: string;
  children?: ReactNode;
  padding?: number;
}

interface Position {
  top: number;
  left: number;
  arrowPosition: 'top' | 'bottom' | 'left' | 'right';
  arrowOffset?: number; // Offset from center for the arrow (in pixels)
}

const TOOLTIP_WIDTH = 320;
const TOOLTIP_HEIGHT_ESTIMATE = 250; // Estimated max height for vertical bounds
const TOOLTIP_GAP = 16;
const ARROW_SIZE = 8;

export function TooltipBubble({
  step,
  title,
  description,
  children,
  padding = 8,
}: TooltipBubbleProps) {
  const [position, setPosition] = useState<Position | null>(null);

  useEffect(() => {
    const calculatePosition = () => {
      const element = document.querySelector(step.targetSelector);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const targetRect = {
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
        bottom: rect.bottom + padding,
        right: rect.right + padding,
      };

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let pos: Position;
      const preferredPosition = step.position || 'bottom';

      // Calculate position based on preferred direction
      switch (preferredPosition) {
        case 'right':
          pos = {
            top: targetRect.top + targetRect.height / 2,
            left: targetRect.right + TOOLTIP_GAP,
            arrowPosition: 'left',
          };
          // Check if tooltip would overflow right edge
          if (pos.left + TOOLTIP_WIDTH > viewportWidth - 20) {
            pos = {
              top: targetRect.top + targetRect.height / 2,
              left: targetRect.left - TOOLTIP_WIDTH - TOOLTIP_GAP,
              arrowPosition: 'right',
            };
          }
          break;

        case 'left':
          pos = {
            top: targetRect.top + targetRect.height / 2,
            left: targetRect.left - TOOLTIP_WIDTH - TOOLTIP_GAP,
            arrowPosition: 'right',
          };
          // Check if tooltip would overflow left edge
          if (pos.left < 20) {
            pos = {
              top: targetRect.top + targetRect.height / 2,
              left: targetRect.right + TOOLTIP_GAP,
              arrowPosition: 'left',
            };
          }
          break;

        case 'top':
          pos = {
            top: targetRect.top - TOOLTIP_GAP,
            left: targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2,
            arrowPosition: 'bottom',
          };
          break;

        case 'bottom':
        default:
          pos = {
            top: targetRect.bottom + TOOLTIP_GAP,
            left: targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2,
            arrowPosition: 'top',
          };
          // Check if tooltip would overflow bottom
          if (pos.top + 200 > viewportHeight) {
            pos = {
              top: targetRect.top - TOOLTIP_GAP,
              left: targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2,
              arrowPosition: 'bottom',
            };
          }
          break;
      }

      // Ensure tooltip doesn't overflow horizontally
      if (pos.left < 20) {
        pos.left = 20;
      } else if (pos.left + TOOLTIP_WIDTH > viewportWidth - 20) {
        pos.left = viewportWidth - TOOLTIP_WIDTH - 20;
      }

      // Ensure tooltip doesn't overflow vertically for left/right positions
      if (pos.arrowPosition === 'left' || pos.arrowPosition === 'right') {
        const tooltipHalfHeight = TOOLTIP_HEIGHT_ESTIMATE / 2;
        const originalTop = pos.top; // Save the original target center position

        // Check if tooltip would overflow at the bottom
        if (pos.top + tooltipHalfHeight > viewportHeight - 20) {
          pos.top = viewportHeight - tooltipHalfHeight - 20;
        }
        // Check if tooltip would overflow at the top
        if (pos.top - tooltipHalfHeight < 20) {
          pos.top = tooltipHalfHeight + 20;
        }

        // Calculate arrow offset to still point to the target
        // The arrow should point to where the target center is relative to the new tooltip center
        if (pos.top !== originalTop) {
          pos.arrowOffset = originalTop - pos.top;
        }
      }

      setPosition(pos);
    };

    // Initial calculation with delay
    const timeoutId = setTimeout(calculatePosition, 150);

    window.addEventListener('scroll', calculatePosition, true);
    window.addEventListener('resize', calculatePosition);

    const observer = new MutationObserver(calculatePosition);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', calculatePosition, true);
      window.removeEventListener('resize', calculatePosition);
      observer.disconnect();
    };
  }, [step.targetSelector, step.position, padding]);

  if (!position) return null;

  // Calculate arrow vertical position for left/right arrows
  const arrowVerticalPosition = position.arrowOffset !== undefined
    ? `calc(50% + ${position.arrowOffset}px)`
    : '50%';

  const arrowStyles: Record<string, React.CSSProperties> = {
    top: {
      top: -ARROW_SIZE,
      left: '50%',
      transform: 'translateX(-50%)',
      borderLeft: `${ARROW_SIZE}px solid transparent`,
      borderRight: `${ARROW_SIZE}px solid transparent`,
      borderBottom: `${ARROW_SIZE}px solid white`,
    },
    bottom: {
      bottom: -ARROW_SIZE,
      left: '50%',
      transform: 'translateX(-50%)',
      borderLeft: `${ARROW_SIZE}px solid transparent`,
      borderRight: `${ARROW_SIZE}px solid transparent`,
      borderTop: `${ARROW_SIZE}px solid white`,
    },
    left: {
      top: arrowVerticalPosition,
      left: -ARROW_SIZE,
      transform: 'translateY(-50%)',
      borderTop: `${ARROW_SIZE}px solid transparent`,
      borderBottom: `${ARROW_SIZE}px solid transparent`,
      borderRight: `${ARROW_SIZE}px solid white`,
    },
    right: {
      top: arrowVerticalPosition,
      right: -ARROW_SIZE,
      transform: 'translateY(-50%)',
      borderTop: `${ARROW_SIZE}px solid transparent`,
      borderBottom: `${ARROW_SIZE}px solid transparent`,
      borderLeft: `${ARROW_SIZE}px solid white`,
    },
  };

  const transformOrigin: Record<string, string> = {
    top: 'bottom center',
    bottom: 'top center',
    left: 'center right',
    right: 'center left',
  };

  return (
    <div
      className="fixed z-[60] animate-in fade-in zoom-in-95 duration-200"
      style={{
        top: position.arrowPosition === 'left' || position.arrowPosition === 'right'
          ? position.top
          : position.arrowPosition === 'bottom'
          ? 'auto'
          : position.top,
        bottom: position.arrowPosition === 'bottom'
          ? `calc(100vh - ${position.top}px)`
          : 'auto',
        left: position.left,
        width: TOOLTIP_WIDTH,
        transform: position.arrowPosition === 'left' || position.arrowPosition === 'right'
          ? 'translateY(-50%)'
          : 'none',
        transformOrigin: transformOrigin[position.arrowPosition],
      }}
    >
      <div className="relative bg-white dark:bg-dark-surface rounded-xl shadow-2xl border border-light-border dark:border-dark-border p-5">
        {/* Arrow */}
        <div
          className="absolute w-0 h-0"
          style={arrowStyles[position.arrowPosition]}
        />

        {/* Content */}
        <h3 className="text-lg font-semibold text-text-dark-primary dark:text-text-primary mb-2">
          {title}
        </h3>
        <p className="text-sm text-text-dark-secondary dark:text-text-secondary mb-4">
          {description}
        </p>

        {children}
      </div>
    </div>
  );
}
