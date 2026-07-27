'use client';

import React from 'react';
import { cn } from '../../lib/utils';

export const Textarea = React.forwardRef(
  ({ className, label, hint, error, required, ...props }, ref) => {
    return (
      <div className="flex flex-col w-full space-y-1">
        {label && (
          <label className="text-sm font-medium text-[var(--text-primary)]">
            {label} {required && <span className="text-[var(--danger)]">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'flex w-full rounded-[var(--radius-input)] border bg-[var(--bg-surface)] text-[var(--text-primary)] px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-30 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-y',
            error
              ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)] focus:ring-opacity-20'
              : 'border-[var(--border-default)] focus:border-[var(--accent)]',
            className
          )}
          {...props}
        />
        {(hint || error) && (
          <p className={cn('text-xs mt-1 min-h-[16px]', error ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]')}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
