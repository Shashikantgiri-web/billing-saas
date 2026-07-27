import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ className, interactive, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-[var(--bg-surface)] rounded-[var(--radius-card)] border border-[var(--border-subtle)] card',
        interactive && 'interactive hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, title, subtitle, action, children, ...props }) => {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          {title && <h3 className="text-[var(--font-size-card)] font-semibold leading-none tracking-tight text-[var(--text-primary)]">{title}</h3>}
          {subtitle && <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
};

export const CardBody = ({ className, children, ...props }) => {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
};
