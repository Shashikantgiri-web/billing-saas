'use client';

import React from 'react';
import { cn } from '../../lib/utils';

export const Select = React.forwardRef(
  ({ className, label, hint, error, required, options = [], ...props }, ref) => {
    return (
      <div className="flex flex-col w-full space-y-1">
        {label && (
          <label className="text-sm font-medium text-[var(--text-primary)]">
            {label} {required && <span className="text-[var(--danger)]">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'flex w-full rounded-[var(--radius-input)] border bg-[var(--bg-surface)] text-[var(--text-primary)] px-3 h-11 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-30 disabled:cursor-not-allowed disabled:opacity-50 appearance-none',
            error
              ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)] focus:ring-opacity-20'
              : 'border-[var(--border-default)] focus:border-[var(--accent)]',
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%235A6479%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '16px 16px',
            paddingRight: '2.5rem'
          }}
          {...props}
        >
          {options.map((opt, i) => (
            <option key={i} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {(hint || error) && (
          <p className={cn('text-xs mt-1 min-h-[16px]', error ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]')}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
