import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const MAX_VISIBLE_PAGES = 5;

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  // Move all hooks before any conditional returns
  const lockRef = React.useRef(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handlePageChange = React.useCallback(
    (page: number) => {
      if (
        isLoading ||
        lockRef.current ||
        page === currentPage ||
        page < 1 ||
        page > totalPages
      ) {
        return;
      }
      lockRef.current = true;

      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });

      onPageChange(page);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        lockRef.current = false;
      }, 250);
    },
    [currentPage, isLoading, onPageChange, totalPages]
  );

  // Early return after all hooks are defined
  if (totalPages <= 1) {
    return null;
  }

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const createPageNumbers = () => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalPages);

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let page = start; page <= end; page++) {
      pages.add(page);
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const pagesToRender = createPageNumbers();

  return (
    <nav className="flex flex-col gap-3" data-testid="pagination">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="secondary"
          size="small"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!canGoPrevious || isLoading}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="secondary"
          size="small"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!canGoNext || isLoading}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="hidden sm:flex flex-wrap items-center justify-center gap-2">
        {pagesToRender.map((page, index) => {
          const previousPage = pagesToRender[index - 1];
          const showEllipsis =
            index > 0 && page - previousPage > 1;

          return (
            <div key={page} className="flex items-center gap-2">
              {showEllipsis && <span className="text-gray-400">...</span>}
              <button
                type="button"
                onClick={() => handlePageChange(page)}
                disabled={isLoading}
                aria-current={page === currentPage ? 'page' : undefined}
                className={cn(
                  'min-w-[40px] rounded-full px-3 py-1 text-sm font-medium transition-colors',
                  page === currentPage
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {page}
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

