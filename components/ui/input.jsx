'use client';

import React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(
  ({ className, label, hint, error, icon: Icon, required, ...props }, ref) => {
    return (
      <div className="flex flex-col w-full space-y-1">
        {label && (
          <label className="text-sm font-medium text-[var(--text-primary)]">
            {label} {required && <span className="text-[var(--danger)]">*</span>}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
              <Icon size={16} />
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'flex w-full rounded-[var(--radius-input)] border bg-[var(--bg-surface)] text-[var(--text-primary)] px-3 h-11 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-30 disabled:cursor-not-allowed disabled:opacity-50',
              Icon && 'pl-9',
              error
                ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)] focus:ring-opacity-20'
                : 'border-[var(--border-default)] focus:border-[var(--accent)]',
              className
            )}
            {...props}
          />
        </div>
        {(hint || error) && (
          <p className={cn('text-xs mt-1 min-h-[16px]', error ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]')}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
