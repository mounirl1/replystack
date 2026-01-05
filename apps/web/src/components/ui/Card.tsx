import { type ReactNode, type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  glass?: boolean;
}

export function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  glass = false,
  ...props
}: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        rounded-xl border transition-all duration-150
        ${glass
          ? 'bg-white/5 dark:bg-white/5 backdrop-blur-md border-white/10'
          : 'bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border shadow-card-light dark:shadow-card-dark'
        }
        ${hover ? 'hover:border-primary-500/50 hover:shadow-lg cursor-pointer' : ''}
        ${paddings[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function CardHeader({ title, description, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-text-dark-primary dark:text-text-primary">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-text-dark-secondary dark:text-text-secondary mt-1">
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-text-dark-secondary dark:text-text-secondary">
            {title}
          </p>
          <p className="text-2xl font-bold text-text-dark-primary dark:text-text-primary">
            {value}
          </p>
          {description && (
            <p className="text-xs text-text-tertiary">
              {description}
            </p>
          )}
          {trend && (
            <p className={`text-sm font-medium ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-primary-500/10 rounded-xl text-primary-500">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// Skeleton variants for loading states
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <Card className={className}>
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-1/3 skeleton-light rounded" />
        <div className="h-8 w-1/2 skeleton-light rounded" />
        <div className="h-3 w-1/4 skeleton-light rounded" />
      </div>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-24 skeleton-light rounded" />
          <div className="h-8 w-16 skeleton-light rounded" />
          <div className="h-3 w-20 skeleton-light rounded" />
        </div>
        <div className="w-12 h-12 skeleton-light rounded-xl" />
      </div>
    </Card>
  );
}
