import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export function SkipLink({ href, children, className, ...props }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Base styles - hidden by default, shown on focus
        'sr-only focus:not-sr-only',
        // Positioning and styling
        'fixed top-4 left-4 z-50',
        'bg-primary-600 text-white px-4 py-2 rounded-md',
        'font-semibold text-sm',
        'shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'transition-all duration-200',
        'hover:bg-primary-700',
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}

// Predefined skip links for common sections
export function SkipToMain() {
  return <SkipLink href="#main-content">Skip to main content</SkipLink>;
}

export function SkipToNavigation() {
  return <SkipLink href="#main-navigation">Skip to navigation</SkipLink>;
}

export function SkipToSearch() {
  return <SkipLink href="#search">Skip to search</SkipLink>;
}