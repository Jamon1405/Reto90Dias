import type { ReactNode } from 'react';

export default function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-xs uppercase tracking-[0.2em] border ${
        active ? 'bg-accent/20 border-accent text-accent' : 'border-slateborder text-slate-400 hover:text-accent'
      }`}
    >
      {children}
    </button>
  );
}
