import { ReactNode } from 'react';

interface SectionShellProps {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function SectionShell({ id, title, subtitle, children }: SectionShellProps) {
  return (
    <section id={`section-${id}`} className="scroll-mt-40 flex flex-col h-full min-h-0">
      <header className="mb-4 flex-shrink-0">
        <h2 className="text-xl md:text-2xl font-semibold mb-1 text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-600 max-w-2xl">{subtitle}</p>}
      </header>
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </section>
  );
}

