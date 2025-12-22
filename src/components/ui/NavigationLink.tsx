'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useNavigationLoading } from '@/hooks/useNavigationLoading';
import { LoadingSpinner } from './LoadingSpinner';

interface NavigationLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  showLoadingSpinner?: boolean;
  loadingText?: string;
  replace?: boolean;
}

export function NavigationLink({
  href,
  children,
  showLoadingSpinner = false,
  loadingText,
  replace = false,
  className,
  onClick,
  ...props
}: NavigationLinkProps) {
  const { isLoading, navigateWithLoading } = useNavigationLoading();

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Call original onClick if provided
      onClick?.(e);

      // If default prevented, don't navigate
      if (e.defaultPrevented) return;

      // For external links or special cases, use default behavior
      if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      // For internal navigation with loading state
      if (showLoadingSpinner) {
        e.preventDefault();
        navigateWithLoading(href, { replace });
      }
    },
    [href, onClick, showLoadingSpinner, navigateWithLoading, replace]
  );

  // Only show loading spinner for simple text links, not complex card layouts
  const shouldShowSpinner = isLoading && showLoadingSpinner && typeof children === 'string';

  return (
    <Link
      href={href}
      className={cn(
        'transition-all duration-200',
        shouldShowSpinner && 'inline-flex items-center gap-2',
        isLoading && showLoadingSpinner && 'opacity-75 cursor-wait',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {shouldShowSpinner && <LoadingSpinner size="small" />}
      {isLoading && loadingText ? loadingText : children}
    </Link>
  );
}