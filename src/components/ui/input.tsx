import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-9 w-full rounded-md border border-border bg-panel px-3 py-1 text-sm text-text shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };
