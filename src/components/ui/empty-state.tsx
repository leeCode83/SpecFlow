import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  illustration?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action, className, illustration }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={cn('col-span-full flex flex-col items-center justify-center py-20 text-center', className)}
    >
      {illustration ? (
        <div className="mb-6">{illustration}</div>
      ) : (
        <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-4">
          <div className="w-8 h-8 text-brand">{icon}</div>
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground/80">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
