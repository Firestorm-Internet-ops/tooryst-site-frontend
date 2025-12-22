import Image from 'next/image';
import { WeatherCard } from '@/types/attraction-page';
import { getTodayWeather } from '@/lib/weather-utils';

interface WeatherSnapshotCardProps {
  weather: WeatherCard | WeatherCard[] | null;
  timezone?: string;
}

export function WeatherSnapshotCard({ weather, timezone }: WeatherSnapshotCardProps) {
  const todayWeather = getTodayWeather(weather, timezone);
  if (!todayWeather) return null;

  const {
    date_local,
    temperature_c,
    condition,
    humidity_percent,
    wind_speed_kph,
    icon_url,
  } = todayWeather;

  return (
    <article className="rounded-3xl bg-gradient-to-br from-sky-900/40 via-slate-900/80 to-slate-900/90 border border-sky-700/50 p-5 md:p-6 h-full flex flex-col min-h-[260px] relative overflow-hidden transition-all duration-300 hover:border-sky-600/60 hover:scale-[1.02] group">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400/30 via-transparent to-cyan-500/30 animate-pulse" />
      </div>

      <div className="relative z-10 flex items-center justify-between mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="transition-all duration-300 group-hover:scale-105">
          <p className="text-[11px] md:text-xs uppercase tracking-wide text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
            Today&apos;s weather
          </p>
          <p className="text-[11px] md:text-xs text-slate-300">{date_local}</p>
        </div>
        {icon_url && (
          <Image
            src={icon_url}
            alt={condition || 'Weather icon'}
            width={48}
            height={48}
            className="w-10 h-10 md:w-12 md:h-12 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
            loading="lazy"
          />
        )}
      </div>

      <div className="relative z-10 mb-4 animate-in fade-in zoom-in-95 duration-700 delay-150">
        <p className="text-3xl md:text-4xl font-semibold leading-none text-white transition-all duration-300 group-hover:scale-105">
          {temperature_c != null ? `${Math.round(temperature_c)}°C` : '--'}
        </p>
        {condition && (
          <p className="mt-2 text-xs md:text-sm text-slate-200 transition-colors duration-300 group-hover:text-white">{condition}</p>
        )}
      </div>

      <div className="relative z-10 mt-auto pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <div className="transition-all duration-300 hover:scale-105">
          <p className="text-[11px] text-slate-400">Humidity</p>
          <p className="text-base md:text-lg font-medium text-slate-100">
            {humidity_percent != null ? `${humidity_percent}%` : '–'}
          </p>
        </div>
        <div className="transition-all duration-300 hover:scale-105">
          <p className="text-[11px] text-slate-400">Wind</p>
          <p className="text-base md:text-lg font-medium text-slate-100">
            {wind_speed_kph != null ? `${Math.round(wind_speed_kph)} km/h` : '–'}
          </p>
        </div>
      </div>
    </article>
  );
}

