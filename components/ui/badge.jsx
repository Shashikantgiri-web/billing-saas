import React from 'react';
import { cn } from '../../lib/utils';

const variantClasses = {
  success: 'bg-[var(--success-light)] text-[var(--success)] border-[var(--success-border)]',
  danger: 'bg-[var(--danger-light)] text-[var(--danger)] border-[var(--danger-border)]',
  warning: 'bg-[var(--warning-light)] text-[var(--warning)] border-[var(--warning-border)]',
  info: 'bg-[var(--info-light)] text-[var(--info)] border-[var(--info-border)]',
  neutral: 'bg-[var(--bg-sunken)] text-[var(--text-secondary)] border-[var(--border-default)]',
};

export const Badge = ({ className, variant = 'neutral', children, ...props }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
