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
  console.log('getTodayWeather called with:', { weather, timezone });

  if (!weather) {
    console.log('No weather data provided');
    return null;
  }

  // If it's already a single card, return it
  if (!Array.isArray(weather)) {
    console.log('Weather is already a single card, returning as-is');
    return weather;
  }

  console.log('Weather is an array with length:', weather.length);

  // If it's an array, find today's weather
  const todayDate = getTodayDateString(timezone);
  console.log('Looking for weather with date:', todayDate);

  const todayWeather = weather.find((w) => {
    if (!w) return false;
    const weatherDate = w.date_local;
    console.log('Checking weather entry with date:', weatherDate);
    return weatherDate === todayDate;
  });

  console.log('Found today weather:', todayWeather);

  // Return today's weather if found, otherwise return the first available
  const result = todayWeather || weather[0] || null;
  console.log('Returning weather:', result);
  return result;
}
