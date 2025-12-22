import { WeatherCard } from '@/types/attraction-page';

/**
 * Get today's date in YYYY-MM-DD format for a given timezone
 */
export function getTodayDateString(timezone?: string): string {
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

/**
 * Extract today's weather from a weather array based on timezone
 */
export function getTodayWeather(
  weather: WeatherCard | WeatherCard[] | null | undefined,
  timezone?: string
): WeatherCard {
  if (!weather) return null;
  
  // If it's already a single card, return it
  if (!Array.isArray(weather)) {
    return weather;
  }
  
  // If it's an array, find today's weather
  const todayDate = getTodayDateString(timezone);
  const todayWeather = weather.find((w) => {
    if (!w) return false;
    const weatherDate = w.date_local;
    return weatherDate === todayDate;
  });
  
  // Return today's weather if found, otherwise return the first available
  return todayWeather || weather[0] || null;
}
