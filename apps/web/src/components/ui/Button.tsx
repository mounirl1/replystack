import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className = '',
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center font-medium
      rounded-xl transition-all duration-150
      focus:outline-none focus:ring-2 focus:ring-offset-2
      dark:focus:ring-offset-dark-bg
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variants = {
      primary: `
        bg-primary-500 text-white
        hover:bg-primary-600 active:bg-primary-700
        focus:ring-primary-500
        shadow-sm hover:shadow
      `,
      secondary: `
        bg-light-hover dark:bg-dark-hover
        text-text-dark-primary dark:text-text-primary
        hover:bg-gray-200 dark:hover:bg-dark-border
        focus:ring-primary-500
      `,
      outline: `
        border border-light-border dark:border-dark-border
        text-text-dark-primary dark:text-text-primary
        hover:bg-light-hover dark:hover:bg-dark-hover
        focus:ring-primary-500
      `,
      ghost: `
        text-text-dark-secondary dark:text-text-secondary
        hover:bg-light-hover dark:hover:bg-dark-hover
        hover:text-text-dark-primary dark:hover:text-text-primary
        focus:ring-primary-500
      `,
      danger: `
        bg-red-500 text-white
        hover:bg-red-600 active:bg-red-700
        focus:ring-red-500
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
      icon: 'p-2',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 size={size === 'lg' ? 20 : 16} className="animate-spin" />
            {size !== 'icon' && children && <span>Loading...</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
