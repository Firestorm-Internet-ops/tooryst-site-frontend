import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Attraction } from '@/types/api';

interface WeatherEntry {
  date?: string;
  date_local?: string;
  [key: string]: unknown;
}

interface AttractionResponse extends Attraction {
  timezone?: string;
  cards?: {
    weather?: WeatherEntry[] | WeatherEntry;
    [key: string]: unknown;
  };
}

function getTodayDateString(timezone?: string): string {
  const now = new Date();
  
  if (timezone) {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return formatter.format(now);
    } catch {
      // Fallback to UTC if timezone is invalid
    }
  }
  
  // Fallback to UTC
  return now.toISOString().split('T')[0];
}

export function useAttraction(slug: string) {
  return useQuery<Attraction>({
    queryKey: ['attraction', slug],
    queryFn: async () => {
      const response = await apiClient.get<AttractionResponse>(`/attractions/${slug}`);
      const data = response.data;
      
      // If weather array exists, find today's weather and set it as the main weather card
      if (data.cards?.weather && Array.isArray(data.cards.weather)) {
        const timezone = data.timezone;
        const todayDate = getTodayDateString(timezone);
        
        // Find weather entry matching today's date (check both 'date' and 'date_local' fields)
        const todayWeather = data.cards.weather.find((w: WeatherEntry) => {
          const weatherDate = w.date || w.date_local;
          return weatherDate === todayDate;
        });
        
        if (todayWeather) {
          data.cards.weather = todayWeather;
        } else if (data.cards.weather.length > 0) {
          // Fallback to first available weather if today not found
          data.cards.weather = data.cards.weather[0];
        }
      }
      
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error: unknown) => {
      // Don't retry on 404 errors
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response?.status === 404) {
          return false;
        }
      }
      return failureCount < 2; // Retry up to 2 times for other errors
    },
  });
}
