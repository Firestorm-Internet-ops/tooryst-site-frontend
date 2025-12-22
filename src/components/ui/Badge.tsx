import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-medium transition-colors whitespace-nowrap',
  {
    variants: {
      variant: {
        solid: 'bg-primary-100 text-primary-800',
        light: 'bg-primary-50 text-primary-700',
        outline: 'border border-primary-200 text-primary-700',
      },
      size: {
        small: 'px-2 py-0.5 text-xs',
        large: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'small',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, icon, children, ...props }, ref) => (
    <span ref={ref} className={badgeVariants({ variant, size, className })} {...props}>
      {icon && <span className="inline-flex items-center" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  )
);

Badge.displayName = 'Badge';
