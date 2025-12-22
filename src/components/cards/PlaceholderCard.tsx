import { AlertCircle } from 'lucide-react';

interface PlaceholderCardProps {
  variant?: 'grid' | 'popup';
  title?: string;
  message?: string;
}

export function PlaceholderCard({
  variant = 'grid',
  title = 'Coming Soon',
  message = 'Data not yet available',
}: PlaceholderCardProps) {
  if (variant === 'popup') {
    return (
      <div className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="relative h-28 w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500 font-medium">No image</p>
          </div>
        </div>
        <div className="p-3 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{message}</p>
        </div>
      </div>
    );
  }

  // Grid variant
  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-lg transition-shadow overflow-hidden w-full h-full flex flex-col">
      <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 font-medium">No image available</p>
        </div>
      </div>

      <div className="p-4 space-y-2 flex-1 flex flex-col">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 flex-1">{message}</p>
        <div className="mt-auto pt-2">
          <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
}
