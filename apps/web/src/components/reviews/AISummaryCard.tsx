import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useReviewSummary, useGenerateReviewSummary } from '../../hooks/useReviewSummary';
import type { ReviewFilters } from '../../types/review';

interface AISummaryCardProps {
  filters: ReviewFilters;
  reviewCount: number;
  userQuota: number | 'unlimited';
}

function AISummaryCardSkeleton() {
  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-5 border border-light-border dark:border-dark-border">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 rounded skeleton" />
        <div className="h-5 w-32 rounded skeleton" />
        <div className="ml-auto h-5 w-12 rounded-full skeleton" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full rounded skeleton" />
        <div className="h-4 w-3/4 rounded skeleton" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-24 rounded skeleton" />
        <div className="space-y-1">
          <div className="h-4 w-40 rounded skeleton" />
          <div className="h-4 w-36 rounded skeleton" />
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  const { t } = useTranslation('dashboard');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-light-border dark:border-dark-border p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-tertiary hover:text-primary dark:text-dark-tertiary dark:hover:text-dark-primary rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="font-semibold text-dark-primary dark:text-primary">
            {t('reviews.sidebar.confirmTitle')}
          </h3>
        </div>

        <p className="text-sm text-secondary dark:text-dark-secondary mb-6">
          {t('reviews.sidebar.confirmMessage')}
        </p>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t('reviews.sidebar.confirmCancel')}
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1"
          >
            {t('reviews.sidebar.confirmGenerate')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function UpgradeDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('dashboard');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-light-border dark:border-dark-border p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-tertiary hover:text-primary dark:text-dark-tertiary dark:hover:text-dark-primary rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="font-semibold text-dark-primary dark:text-primary">
            {t('reviews.sidebar.upgradeTitle')}
          </h3>
        </div>

        <p className="text-sm text-secondary dark:text-dark-secondary mb-6">
          {t('reviews.sidebar.upgradeMessage')}
        </p>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t('reviews.sidebar.upgradeLater')}
          </Button>
          <Link to="/pricing" className="flex-1">
            <Button className="w-full">
              {t('reviews.sidebar.upgradeNow')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AISummaryCard({ filters, reviewCount, userQuota }: AISummaryCardProps) {
  const { t } = useTranslation('dashboard');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const { data: summary, isLoading, error } = useReviewSummary(filters);
  const generateMutation = useGenerateReviewSummary();

  const canGenerate = reviewCount >= 5;
  const hasQuota = userQuota === 'unlimited' || userQuota > 0;

  const handleGenerateClick = () => {
    if (!hasQuota) {
      setShowUpgradeDialog(true);
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmGenerate = async () => {
    setShowConfirmDialog(false);
    try {
      await generateMutation.mutateAsync({ filters });
    } catch {
      // Error is handled by mutation state
    }
  };

  if (isLoading) {
    return <AISummaryCardSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-5 border border-light-border dark:border-dark-border">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-dark-primary dark:text-primary">
            {t('reviews.sidebar.aiSummary')}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{t('reviews.sidebar.errorLoading')}</span>
        </div>
      </div>
    );
  }

  // No summary yet - show generate button
  if (!summary) {
    return (
      <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-5 border border-light-border dark:border-dark-border">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-dark-primary dark:text-primary">
            {t('reviews.sidebar.aiSummary')}
          </h3>
        </div>

        <div className="text-center py-4">
          <p className="text-sm text-secondary dark:text-dark-secondary mb-4">
            {canGenerate
              ? t('reviews.sidebar.generateDescription')
              : t('reviews.sidebar.minReviewsRequired', { count: 5 })}
          </p>

          {generateMutation.error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {(generateMutation.error as Error).message || t('reviews.sidebar.errorGenerating')}
              </p>
            </div>
          )}

          <Button
            onClick={handleGenerateClick}
            disabled={!canGenerate || generateMutation.isPending}
            isLoading={generateMutation.isPending}
            leftIcon={!generateMutation.isPending && <Sparkles size={16} />}
            className="w-full"
          >
            {generateMutation.isPending
              ? t('reviews.sidebar.generating')
              : t('reviews.sidebar.generateButton')}
          </Button>

          {!hasQuota && canGenerate && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              {t('reviews.sidebar.noQuotaWarning')}
            </p>
          )}
        </div>

        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmGenerate}
          isLoading={generateMutation.isPending}
        />

        <UpgradeDialog
          isOpen={showUpgradeDialog}
          onClose={() => setShowUpgradeDialog(false)}
        />
      </div>
    );
  }

  // Display existing summary
  const formattedDate = new Date(summary.updated_at).toLocaleDateString();

  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-5 border border-light-border dark:border-dark-border">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary-500" />
        <h3 className="font-semibold text-dark-primary dark:text-primary">
          {t('reviews.sidebar.aiSummary')}
        </h3>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-2 text-xs text-tertiary dark:text-dark-tertiary mb-3">
        <span>{t('reviews.sidebar.generatedAt', { date: formattedDate })}</span>
        <span>-</span>
        <span>{t('reviews.sidebar.analyzedReviews', { count: summary.review_count })}</span>
      </div>

      {/* Summary text */}
      <p className="text-sm text-secondary dark:text-dark-secondary mb-4 leading-relaxed">
        {summary.summary}
      </p>

      {/* Strengths */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-green-600 dark:text-green-400 mb-2 uppercase tracking-wide">
          {t('reviews.sidebar.strengths')}
        </h4>
        <ul className="space-y-1.5">
          {summary.strengths.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-secondary dark:text-dark-secondary"
            >
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Improvements */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-wide">
          {t('reviews.sidebar.improvements')}
        </h4>
        <ul className="space-y-1.5">
          {summary.improvements.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-secondary dark:text-dark-secondary"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Keywords */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-tertiary dark:text-dark-tertiary mb-2 uppercase tracking-wide">
          {t('reviews.sidebar.keywords')}
        </h4>
        <div className="flex flex-wrap gap-2">
          {summary.keywords.map((keyword, i) => (
            <span
              key={i}
              className="text-xs bg-light-bg dark:bg-dark-bg text-secondary dark:text-dark-secondary px-2.5 py-1 rounded-full"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* Regenerate button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleGenerateClick}
        disabled={generateMutation.isPending}
        isLoading={generateMutation.isPending}
        leftIcon={!generateMutation.isPending && <RefreshCw size={14} />}
        className="w-full"
      >
        {t('reviews.sidebar.regenerateButton')}
      </Button>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmGenerate}
        isLoading={generateMutation.isPending}
      />

      <UpgradeDialog
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
      />
    </div>
  );
}
