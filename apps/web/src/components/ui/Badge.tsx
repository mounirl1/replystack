import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}: BadgeProps) {
  const variants = {
    default: 'bg-light-hover dark:bg-dark-hover text-text-dark-secondary dark:text-text-secondary',
    primary: 'bg-primary-500/10 text-primary-500 dark:text-primary-400',
    success: 'bg-green-500/10 text-green-600 dark:text-green-400',
    warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

// Plan-specific badge
interface PlanBadgeProps {
  plan: 'free' | 'starter' | 'pro' | 'business' | 'enterprise';
  className?: string;
}

export function PlanBadge({ plan, className = '' }: PlanBadgeProps) {
  const planConfig = {
    free: { label: 'Free', variant: 'default' as const },
    starter: { label: 'Starter', variant: 'info' as const },
    pro: { label: 'Pro', variant: 'primary' as const },
    business: { label: 'Business', variant: 'success' as const },
    enterprise: { label: 'Enterprise', variant: 'warning' as const },
  };

  const config = planConfig[plan] || planConfig.free;

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

// Status badge for reviews
interface StatusBadgeProps {
  status: 'pending' | 'replied' | 'ignored';
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusConfig = {
    pending: { label: 'Pending', variant: 'warning' as const },
    replied: { label: 'Replied', variant: 'success' as const },
    ignored: { label: 'Ignored', variant: 'default' as const },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

// Platform badge
interface PlatformBadgeProps {
  platform: string;
  className?: string;
}

export function PlatformBadge({ platform, className = '' }: PlatformBadgeProps) {
  const platformIcons: Record<string, string> = {
    google: 'G',
    tripadvisor: '🦉',
    booking: 'B',
    yelp: 'Y',
    facebook: 'f',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium
        bg-light-hover dark:bg-dark-hover
        text-text-dark-secondary dark:text-text-secondary
        ${className}
      `}
    >
      <span>{platformIcons[platform.toLowerCase()] || platform[0].toUpperCase()}</span>
      <span className="capitalize">{platform}</span>
    </span>
  );
}
