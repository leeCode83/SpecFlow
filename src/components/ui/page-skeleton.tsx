import { cn } from '@/lib/utils';

interface SkeletonBlockProps {
  width?: string;
  height?: string;
  className?: string;
}

function SkeletonBlock({ width = '100%', height = '16px', className }: SkeletonBlockProps) {
  return (
    <div
      className={cn('bg-muted animate-pulse rounded-xl', className)}
      style={{ width, height }}
    />
  );
}

function PageSkeleton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-card/60 animate-pulse rounded-3xl border border-border/50 p-8', className)}>
      {children}
    </div>
  );
}

export { PageSkeleton, SkeletonBlock };
