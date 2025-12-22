import * as React from 'react';
import { cn } from '@/lib/utils';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3',
        'gap-4 md:gap-5 lg:gap-6',
        'auto-rows-max',
        'print:flex print:flex-col',
        className
      )}
    >
      {children}
    </div>
  );
}
