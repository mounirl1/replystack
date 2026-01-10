import { useTranslation } from 'react-i18next';
import { Twitter, Linkedin, Facebook, Link2, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
  url: string;
  title: string;
  className?: string;
}

export function ShareButtons({
  url,
  title,
  className = '',
}: ShareButtonsProps) {
  const { t } = useTranslation('blog');
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-500 mr-2">{t('article.shareOn')}</span>

      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter size={18} />
      </a>

      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
        aria-label="Share on LinkedIn"
      >
        <Linkedin size={18} />
      </a>

      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook size={18} />
      </a>

      <button
        onClick={handleCopyLink}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
        aria-label="Copy link"
      >
        {copied ? (
          <Check size={18} className="text-emerald-500" />
        ) : (
          <Link2 size={18} />
        )}
      </button>
    </div>
  );
}

export default ShareButtons;
