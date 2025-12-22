'use client';

import { TipsCard } from '@/types/attraction-page';

interface SafetyTipCardProps {
  tips: TipsCard;
}

export function SafetyTipCard({ tips }: SafetyTipCardProps) {
  if (!tips) return null;

  // Take first safety tip and first two insider tips
  const safetyTips = (tips.safety ?? []).slice(0, 1);
  const insiderTips = (tips.insider ?? []).slice(0, 2);

  if (safetyTips.length === 0 && insiderTips.length === 0) return null;

  return (
    <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-850/90 via-slate-900/90 to-slate-950/90 border border-slate-800/50 p-4 md:p-5 flex flex-col gap-3 min-h-[260px] h-full transition-all duration-300 hover:border-emerald-700/30 hover:scale-[1.02] group">
      {/* Decorative backdrop */}
      <div className="pointer-events-none absolute inset-0">
        {/* Soft gradient glow from top-left */}
        <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-amber-400/15 blur-3xl transition-all duration-500 group-hover:bg-amber-400/25 group-hover:blur-2xl" />
      </div>

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-sky-500/20 animate-pulse" />
      </div>

      {/* Tips header with read more */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-1 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900 transition-all duration-300 group-hover:bg-amber-300 group-hover:scale-105">
          <span>Tips</span>
        </div>
        <button
          onClick={() => {
            const section = document.getElementById('section-tips');
            if (section) {
              // Account for both headers: main header (64px) + sections navbar (72px) + padding (16px)
              const mainHeaderHeight = 64;
              const sectionsNavbarHeight = 72;
              const totalOffset = mainHeaderHeight + sectionsNavbarHeight + 16;

              const elementPosition = section.getBoundingClientRect().top + window.pageYOffset;
              const offsetPosition = elementPosition - totalOffset;

              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
              });
            }
          }}
          className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-100 transition-all duration-300 uppercase tracking-[0.25em] cursor-pointer hover:scale-105 border border-slate-600/60 hover:border-slate-500"
        >
          Read more
        </button>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-3 md:grid-cols-2 animate-in fade-in duration-700 delay-150">
        {safetyTips.length > 0 && (
          <div className="space-y-2">
            {safetyTips.map((tip, index) => (
              <div
                key={`safety-${index}-${tip.id ?? 'no-id'}`}
                className="flex items-start gap-2 transition-all duration-300 hover:scale-105"
              >
                <span className="mt-[2px] inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-xs transition-all duration-300 group-hover:bg-emerald-500/30">
                  🛡️
                </span>
                <p className="text-xs md:text-sm text-slate-100 leading-snug transition-colors duration-300 group-hover:text-white">{tip.text}</p>
              </div>
            ))}
          </div>
        )}

        {insiderTips.length > 0 && (
          <div className="space-y-2">
            {insiderTips.map((tip, index) => (
              <div
                key={`insider-${index}-${tip.id ?? 'no-id'}`}
                className="flex items-start gap-2 transition-all duration-300 hover:scale-105"
              >
                <span className="mt-[2px] inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-sky-300 text-xs transition-all duration-300 group-hover:bg-sky-500/30">
                  💡
                </span>
                <p className="text-xs md:text-sm text-slate-100 leading-snug transition-colors duration-300 group-hover:text-white">{tip.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

