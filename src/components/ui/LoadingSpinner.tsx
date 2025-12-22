import * as React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'small' | 'medium' | 'large';
  label?: string;
}

const sizeMap = {
  small: 'h-4 w-4 border-2',
  medium: 'h-8 w-8 border-2',
  large: 'h-12 w-12 border-4',
};

export function LoadingSpinner({
  size = 'medium',
  label,
  className,
  ...props
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 text-primary-500', className)} {...props}>
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'animate-spin rounded-full border-solid border-primary-500 border-t-transparent',
          sizeMap[size]
        )}
      />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );
}
