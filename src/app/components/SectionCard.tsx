import type { ReactNode } from 'react';

export default function SectionCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border border-slateborder bg-slatepanel/80 rounded-xl p-4 ${className ?? ''}`}>{children}</div>
  );
}
