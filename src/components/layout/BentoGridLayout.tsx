import * as React from 'react';
import { cn } from '@/lib/utils';

interface BentoGridLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGridLayout({ children, className }: BentoGridLayoutProps) {
  return (
    <div
      className={cn(
        'mx-auto max-w-7xl',
        'px-4 md:px-6 lg:px-8',
        'py-8 md:py-12 lg:py-16',
        className
      )}
    >
      {children}
    </div>
  );
}
