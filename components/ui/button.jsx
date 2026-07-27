'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const variantClasses = {
  primary: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] border border-[var(--accent)]',
  secondary: 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-sunken)] border border-[var(--border-default)]',
  ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] hover:text-[var(--text-primary)] border border-transparent',
  danger: 'bg-[var(--danger)] text-white hover:opacity-90 border border-[var(--danger)]',
  icon: 'p-2 bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] hover:text-[var(--text-primary)] rounded-md border border-transparent',
};

const sizeClasses = {
  sm: 'h-8 px-3 text-[var(--font-size-btn)]',
  md: 'h-10 px-4 text-[var(--font-size-btn)]',
  lg: 'h-12 px-6 text-[var(--font-size-body-lg)]',
  icon: 'h-8 w-8 flex items-center justify-center p-0',
};

export const Button = React.forwardRef(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const isIcon = variant === 'icon';
    const computedSize = isIcon ? 'icon' : size;

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-[var(--radius-button)] font-medium interactive focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
          variantClasses[variant],
          sizeClasses[computedSize],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
