import { AboutCard } from '@/types/attraction-page';

interface AboutSnippetCardProps {
  about?: AboutCard | null;
}

export function AboutSnippetCard({ about }: AboutSnippetCardProps) {
  const description = about?.long_description || about?.short_description;
  
  if (!description) {
    return null;
  }

  // Format duration for display
  const formatDuration = (minutes?: number | null) => {
    if (!minutes) return null;
    
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
  };

  const duration = formatDuration(about?.recommended_duration_minutes);

  return (
    <article className="relative rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-slate-950/95 border border-slate-800/50 p-4 md:p-5 text-slate-50 overflow-visible transition-all duration-300 hover:border-slate-700/60 hover:scale-[1.02] group h-full min-h-[240px] flex flex-col">
      {/* Decorative backdrop */}
      <div className="pointer-events-none absolute inset-0">
        {/* Soft gradient glow from top-left */}
        <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-slate-400/10 blur-3xl transition-all duration-500 group-hover:bg-slate-400/20 group-hover:blur-2xl" />
      </div>

      {/* Sticky note label, taped to the top border */}
      <div className="absolute -top-3 left-4 rotate-[-5deg] z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-3deg]">
        <div className="bg-amber-300 text-slate-900 text-[11px] font-semibold px-3 py-1 rounded shadow-sm shadow-amber-700/40 group-hover:bg-amber-200 transition-colors duration-300">
          About
        </div>
      </div>

      <div className="relative z-10 mt-4 animate-in fade-in duration-700 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <p className="text-lg text-slate-200 leading-relaxed transition-colors duration-300 group-hover:text-slate-100">
            {description}
          </p>
        </div>

        {/* Recommended duration */}
        {duration && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50 mt-auto">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-slate-300">
              Recommended visit: <span className="font-semibold text-slate-100">{duration}</span>
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

