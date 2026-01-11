import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { generateSlug } from '@/lib/blog/utils';
import { Info, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

// Heading components with anchor links
function H1({ children, ...props }: ComponentPropsWithoutRef<'h1'>) {
  return (
    <h1
      className="text-4xl font-bold text-gray-900 mt-8 mb-4 first:mt-0"
      {...props}
    >
      {children}
    </h1>
  );
}

function H2({ children, ...props }: ComponentPropsWithoutRef<'h2'>) {
  const id =
    typeof children === 'string' ? generateSlug(children) : undefined;
  return (
    <h2
      id={id}
      className="text-3xl font-bold text-gray-900 mt-10 mb-4 scroll-mt-24"
      {...props}
    >
      {children}
    </h2>
  );
}

function H3({ children, ...props }: ComponentPropsWithoutRef<'h3'>) {
  const id =
    typeof children === 'string' ? generateSlug(children) : undefined;
  return (
    <h3
      id={id}
      className="text-2xl font-semibold text-gray-900 mt-8 mb-3 scroll-mt-24"
      {...props}
    >
      {children}
    </h3>
  );
}

function H4({ children, ...props }: ComponentPropsWithoutRef<'h4'>) {
  return (
    <h4
      className="text-xl font-semibold text-gray-900 mt-6 mb-2"
      {...props}
    >
      {children}
    </h4>
  );
}

// Paragraph
function P({ children, ...props }: ComponentPropsWithoutRef<'p'>) {
  return (
    <p className="text-gray-600 leading-relaxed mb-4" {...props}>
      {children}
    </p>
  );
}

// Links
function A({ children, href, ...props }: ComponentPropsWithoutRef<'a'>) {
  const isExternal = href?.startsWith('http');
  return (
    <a
      href={href}
      className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition-colors"
      {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
      {...props}
    >
      {children}
    </a>
  );
}

// Lists
function Ul({ children, ...props }: ComponentPropsWithoutRef<'ul'>) {
  return (
    <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2" {...props}>
      {children}
    </ul>
  );
}

function Ol({ children, ...props }: ComponentPropsWithoutRef<'ol'>) {
  return (
    <ol
      className="list-decimal list-inside text-gray-600 mb-4 space-y-2"
      {...props}
    >
      {children}
    </ol>
  );
}

function Li({ children, ...props }: ComponentPropsWithoutRef<'li'>) {
  return (
    <li className="text-gray-600" {...props}>
      {children}
    </li>
  );
}

// Blockquote
function Blockquote({ children, ...props }: ComponentPropsWithoutRef<'blockquote'>) {
  return (
    <blockquote
      className="border-l-4 border-emerald-500 pl-4 py-2 my-6 bg-emerald-50/50 rounded-r-lg italic text-gray-700"
      {...props}
    >
      {children}
    </blockquote>
  );
}

// Code blocks / Templates - styled as elegant cards rather than dark code blocks
function Pre({ children, ...props }: ComponentPropsWithoutRef<'pre'>) {
  return (
    <pre
      className="bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200 text-gray-700 p-5 rounded-xl overflow-x-auto my-6 text-sm shadow-sm"
      {...props}
    >
      {children}
    </pre>
  );
}

function Code({ children, className, ...props }: ComponentPropsWithoutRef<'code'>) {
  // Inline code vs code block
  const isInline = !className;
  if (isInline) {
    return (
      <code
        className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  }
  // Code block - just pass through for pre to handle
  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
}

// Tables
function Table({ children, ...props }: ComponentPropsWithoutRef<'table'>) {
  return (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full divide-y divide-gray-200" {...props}>
        {children}
      </table>
    </div>
  );
}

function Th({ children, ...props }: ComponentPropsWithoutRef<'th'>) {
  return (
    <th
      className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50"
      {...props}
    >
      {children}
    </th>
  );
}

function Td({ children, ...props }: ComponentPropsWithoutRef<'td'>) {
  return (
    <td className="px-4 py-3 text-sm text-gray-600 border-t border-gray-100" {...props}>
      {children}
    </td>
  );
}

// Horizontal rule
function Hr(props: ComponentPropsWithoutRef<'hr'>) {
  return <hr className="my-8 border-gray-200" {...props} />;
}

// Image
function Img({ src, alt, ...props }: ComponentPropsWithoutRef<'img'>) {
  return (
    <figure className="my-8">
      <img
        src={src}
        alt={alt || ''}
        loading="lazy"
        decoding="async"
        className="rounded-xl w-full shadow-sm"
        {...props}
      />
      {alt && (
        <figcaption className="text-center text-sm text-gray-500 mt-2">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

// Custom components for MDX

type CalloutType = 'info' | 'warning' | 'success' | 'tip';

interface CalloutProps {
  type?: CalloutType;
  children: ReactNode;
}

export function Callout({ type = 'info', children }: CalloutProps) {
  const styles: Record<CalloutType, { bg: string; border: string; icon: ReactNode }> = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      icon: <Info size={20} className="text-blue-500 flex-shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-500',
      icon: <AlertTriangle size={20} className="text-amber-500 flex-shrink-0" />,
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      icon: <CheckCircle size={20} className="text-green-500 flex-shrink-0" />,
    },
    tip: {
      bg: 'bg-purple-50',
      border: 'border-purple-500',
      icon: <Lightbulb size={20} className="text-purple-500 flex-shrink-0" />,
    },
  };

  const style = styles[type];

  return (
    <div
      className={`${style.bg} border-l-4 ${style.border} p-4 rounded-r-lg my-6 flex gap-3`}
    >
      {style.icon}
      <div className="text-gray-700">{children}</div>
    </div>
  );
}

interface ImageGalleryProps {
  images: Array<{ src: string; alt: string }>;
}

export function ImageGallery({ images }: ImageGalleryProps) {
  return (
    <div className="grid grid-cols-2 gap-4 my-6">
      {images.map((img, i) => (
        <figure key={i}>
          <img
            src={img.src}
            alt={img.alt}
            loading="lazy"
            decoding="async"
            className="rounded-lg w-full h-48 object-cover"
          />
          <figcaption className="text-center text-sm text-gray-500 mt-1">
            {img.alt}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

// Export all components for MDX
export const mdxComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  p: P,
  a: A,
  ul: Ul,
  ol: Ol,
  li: Li,
  blockquote: Blockquote,
  pre: Pre,
  code: Code,
  table: Table,
  th: Th,
  td: Td,
  hr: Hr,
  img: Img,
  // Custom components
  Callout,
  ImageGallery,
};

export default mdxComponents;
