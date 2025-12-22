import { AttractionPageResponse } from '@/types/attraction-page';
import { SectionShell } from './SectionShell';

interface TipsSectionProps {
  data: AttractionPageResponse;
}

export function AttractionTipsSection({ data }: TipsSectionProps) {
  const tips = data.cards.tips;
  // Skip first safety tip and take the rest, take first two insider tips
  const safetyTips = tips?.safety.slice(1) || [];
  const insiderTips = tips?.insider.slice(2) || [];

  if (!tips || (safetyTips.length === 0 && insiderTips.length === 0)) return null;

  return (
    <SectionShell
      id="tips"
      title="Safety & Insider tips"
      subtitle="Crowd hacks and small details that make the visit smoother."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Safety Tips Card */}
        {safetyTips.length > 0 && (
          <div className="group rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 p-6 shadow-sm hover:shadow-xl hover:border-red-300 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Safety Tips</h3>
                <p className="text-xs text-gray-600">Stay safe and secure</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {safetyTips.map((tip, idx) => (
                <div 
                  key={`safety-${idx}-${tip.id ?? 'no-id'}`}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-red-100 hover:bg-white transition-colors"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-red-600">{idx + 1}</span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed flex-1">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insider Tips Card */}
        {insiderTips.length > 0 && (
          <div className="group rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-6 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Insider Tips</h3>
                <p className="text-xs text-gray-600">Pro traveler secrets</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {insiderTips.map((tip, idx) => (
                <div 
                  key={`insider-${idx}-${tip.id ?? 'no-id'}`}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-blue-100 hover:bg-white transition-colors"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-blue-600">{idx + 1}</span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed flex-1">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionShell>
  );
}

