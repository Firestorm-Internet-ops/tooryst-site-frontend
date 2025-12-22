import * as React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md';
  shadow?: 'none' | 'sm' | 'md';
}

const paddingMap = {
  none: 'p-0',
  sm: 'p-4 md:p-5',
  md: 'p-6 md:p-8',
};

const shadowMap = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
};

export function Card({
  padding = 'sm',
  shadow = 'sm',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white transition-colors',
        paddingMap[padding],
        shadowMap[shadow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
