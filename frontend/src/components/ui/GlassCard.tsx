import clsx from 'clsx';
import { HTMLAttributes } from 'react';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  glowHover?: boolean;
}

export function GlassCard({ children, className, glowHover = false, ...props }: GlassCardProps) {
  return (
    <div 
      className={clsx(
        "glass-card p-6 md:p-8 relative overflow-hidden transition-all duration-300", 
        glowHover && "hover:border-[var(--color-primary)] hover:shadow-[0_0_30px_rgba(176,200,240,0.15)] hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
