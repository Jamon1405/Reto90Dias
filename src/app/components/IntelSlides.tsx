import type { ReactNode } from 'react';

export default function IntelSlides({
  slides,
  activeIndex,
  onSelect,
}: {
  slides: { id: string; title: string; content: ReactNode }[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
      <div className="space-y-2">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => onSelect(idx)}
            className={`w-full rounded-lg border px-3 py-2 text-left text-xs ${
              idx === activeIndex ? 'border-accent bg-accent/20 text-accent' : 'border-slateborder text-slate-400'
            }`}
          >
            {slide.title}
          </button>
        ))}
      </div>
      <div className="border border-slateborder bg-slatepanel/80 rounded-xl p-4 min-h-[280px]">
        {slides[activeIndex]?.content}
      </div>
    </div>
  );
}
