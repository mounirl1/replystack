import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { List } from 'lucide-react';
import type { TableOfContentsItem } from '@/lib/blog/types';

interface TableOfContentsProps {
  headings: TableOfContentsItem[];
  className?: string;
  showH3?: boolean; // Option to show H3 headings, defaults to false
}

export function TableOfContents({ headings, className = '', showH3 = false }: TableOfContentsProps) {
  const { t } = useTranslation('blog');
  const [activeId, setActiveId] = useState<string>('');

  // Filter headings - only H2 by default for cleaner navigation
  const filteredHeadings = showH3 ? headings : headings.filter(h => h.level === 2);

  // Scroll spy - track which heading is currently visible
  useEffect(() => {
    if (filteredHeadings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -66% 0px',
        threshold: 0,
      }
    );

    // Observe all headings
    filteredHeadings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [filteredHeadings]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100; // Account for sticky header
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (filteredHeadings.length === 0) {
    return null;
  }

  return (
    <nav className={`${className}`} aria-label="Table of contents">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
        <List size={16} className="text-emerald-600" />
        {t('article.tableOfContents')}
      </div>

      <ul className="space-y-0.5 border-l-2 border-gray-100">
        {filteredHeadings.map((heading) => (
          <li key={heading.id}>
            <button
              onClick={() => handleClick(heading.id)}
              className={`block w-full text-left text-[13px] leading-relaxed py-2 pl-4 -ml-[2px] border-l-2 transition-all duration-200 ${
                heading.level === 3 ? 'pl-6' : ''
              } ${
                activeId === heading.id
                  ? 'border-emerald-500 text-emerald-700 font-medium bg-emerald-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Hook to extract headings from content
export function useTableOfContents(): TableOfContentsItem[] {
  const [headings, setHeadings] = useState<TableOfContentsItem[]>([]);

  useEffect(() => {
    // Wait for content to render
    const timer = setTimeout(() => {
      const article = document.querySelector('article');
      if (!article) return;

      const elements = article.querySelectorAll('h2, h3');
      const items: TableOfContentsItem[] = [];

      elements.forEach((element) => {
        if (element.id && element.textContent) {
          items.push({
            id: element.id,
            text: element.textContent,
            level: element.tagName === 'H2' ? 2 : 3,
          });
        }
      });

      setHeadings(items);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return headings;
}

export default TableOfContents;
