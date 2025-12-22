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
  console.log('getTodayDateString called with timezone:', timezone);
  
  if (timezone) {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const result = formatter.format(now);
      console.log('Formatted date with timezone:', result);
      return result;
    } catch (e) {
      console.error('Error formatting date with timezone:', e);
      // Fallback to UTC if timezone is invalid
    }
  }
  
  // Fallback to UTC
  const utcDate = now.toISOString().split('T')[0];
  console.log('Using UTC fallback date:', utcDate);
  return utcDate;
}

export function useAttractionPage(slug: string) {
  return useQuery<AttractionPageResponse>({
    queryKey: ['attraction-page', slug],
    queryFn: async () => {
      const res = await apiClient.get<AttractionPageResponse>(`/attractions/${slug}/page`);
      const data = res.data;
      
      console.log('API Response data:', data);
      console.log('Weather data:', data.cards?.weather);
      console.log('Is weather array?', Array.isArray(data.cards?.weather));
      console.log('Timezone:', data.timezone);
      
      // If weather array exists, find today's weather and set it as the main weather card
      if (data.cards?.weather && Array.isArray(data.cards.weather)) {
        const timezone = data.timezone;
        const todayDate = getTodayDateString(timezone);
        
        console.log('Today date:', todayDate);
        
        // Find weather entry matching today's date (check both 'date' and 'date_local' fields)
        const todayWeather = data.cards.weather.find((w: any) => {
          const weatherDate = w.date || w.date_local;
          console.log('Checking weather date:', weatherDate, 'against today:', todayDate);
          return weatherDate === todayDate;
        });
        
        console.log('Found today weather:', todayWeather);
        
        if (todayWeather) {
          data.cards.weather = todayWeather;
        } else if (data.cards.weather.length > 0) {
          // Fallback to first available weather if today not found
          console.log('Using fallback weather:', data.cards.weather[0]);
          data.cards.weather = data.cards.weather[0];
        }
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
