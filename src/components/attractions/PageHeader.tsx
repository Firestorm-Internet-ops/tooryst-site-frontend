import { AttractionPageResponse } from '@/types/attraction-page';

interface PageHeaderProps {
  data: AttractionPageResponse;
}

export function PageHeader({ data }: PageHeaderProps) {
  return (
    <header className="mb-8">
      <p className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-2">
        Travel Intelligence
      </p>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-3 text-gray-900">
        {data.name}{' '}
        {data.city && data.country && (
          <span className="text-gray-600 text-lg md:text-2xl">
            · {data.city}, {data.country}
          </span>
        )}
      </h1>
      {data.cards.about?.short_description && (
        <p className="text-sm md:text-base text-gray-600 max-w-2xl">
          {data.cards.about.short_description}
        </p>
      )}
    </header>
  );
}

