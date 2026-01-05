'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export type ScaleAnchors = Record<number, string>;

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  anchors: ScaleAnchors;
  helperTitle: string;
};

function getAnchorLabel(value: number, anchors: ScaleAnchors) {
  if (anchors[value]) return anchors[value];
  const sorted = Object.keys(anchors).map(Number).sort((a, b) => a - b);
  const lower = [...sorted].reverse().find((key) => key < value);
  const upper = sorted.find((key) => key > value);
  if (!lower || !upper) return anchors[value] ?? '';
  return `${anchors[lower]} → ${anchors[upper]}`;
}

export function Scale10({ label, value, onChange, anchors, helperTitle }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text">{label}</span>
        <Button variant="ghost" size="sm" onClick={() => setOpen((prev) => !prev)}>
          {open ? 'Ocultar' : '¿Cómo medir?'}
        </Button>
      </div>
      {open && (
        <div className="rounded-md border border-border bg-surface p-3 text-xs text-muted">
          <p className="font-semibold text-text">{helperTitle}</p>
          <div className="mt-2 space-y-1">
            {Object.entries(anchors)
              .map(([key, text]) => ({ key: Number(key), text }))
              .sort((a, b) => a.key - b.key)
              .map((entry) => (
                <div key={entry.key}>
                  <span className="font-semibold">{entry.key}</span> — {entry.text}
                </div>
              ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
          <button
            key={score}
            type="button"
            className={`h-8 w-8 rounded-md border text-xs ${
              score === value ? 'border-accent bg-accent text-white' : 'border-border text-text'
            }`}
            onClick={() => onChange(score)}
          >
            {score}
          </button>
        ))}
      </div>
      <div className="text-xs text-muted">{getAnchorLabel(value, anchors)}</div>
    </div>
  );
}
