import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface AttractionPageResponse {
  attraction_id: number;
  slug: string;
  name: string;
  city: string;
  country?: string;
  timezone?: string;
  cards: Record<string, any>;
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
      const result = formatter.format(now);
      return result;
    } catch (e) {
      console.error('Error formatting date with timezone:', e);
      // Fallback to UTC if timezone is invalid
    }
  }

  // Fallback to UTC
  const utcDate = now.toISOString().split('T')[0];
  return utcDate;
}

export function useAttractionPage(slug: string) {
  return useQuery<AttractionPageResponse>({
    queryKey: ['attraction-page', slug],
    queryFn: async () => {
      const res = await apiClient.get<AttractionPageResponse>(`/attractions/${slug}/page`);
      const data = res.data;

      // If weather array exists, find today's weather and set it as the main weather card
      if (data.cards?.weather && Array.isArray(data.cards.weather)) {
        const timezone = data.timezone;
        const todayDate = getTodayDateString(timezone);

        // Find weather entry matching today's date (check both 'date' and 'date_local' fields)
        const todayWeather = data.cards.weather.find((w: any) => {
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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
