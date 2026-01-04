import type { ReactNode } from 'react';

export default function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={`px-3 py-1 rounded-full border border-slateborder bg-slatebase ${className ?? ''}`}>
      {children}
    </span>
  );
}
