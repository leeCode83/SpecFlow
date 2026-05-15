import { motion } from 'motion/react';
import { Card } from '@/components/ui/card';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  accentClass: string;
  delay?: number;
  onClick?: () => void;
}

export function StatCard({ icon: Icon, label, value, accentClass, delay = 0, onClick }: StatCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card
        size="sm"
        className={`bg-card border-border ${onClick ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
        onClick={onClick}
      >
        <div className="p-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accentClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
