import { type Mode } from '@/lib/types';
import { motion } from 'motion/react';
import { Rocket, Calculator, ShieldCheck, type LucideIcon } from 'lucide-react';

const modeConfig: Record<Mode, { icon: LucideIcon; description: string }> = {
  Learning: { icon: Rocket, description: 'Build to learn new skills with guided resources' },
  Hackathon: { icon: Calculator, description: 'Ship fast with MVP-focused execution' },
  Startup: { icon: ShieldCheck, description: 'Validate and build a scalable business' },
};

interface ModeCardProps {
  mode: Mode;
  selected: boolean;
  onClick: () => void;
}

export function ModeCard({ mode, selected, onClick }: ModeCardProps) {
  const config = modeConfig[mode];
  const Icon = config.icon;

  return (
    <motion.button
      type="button"
      layout
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors ${
        selected
          ? 'border-orange-500 bg-orange-500/10 text-orange-500 shadow-[0_0_15px_rgba(251,146,60,0.15)]'
          : 'border-white/[0.06] bg-white/[0.03] text-slate-400 hover:border-white/[0.12] hover:text-slate-300'
      }`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon className="h-5 w-5" />
      <span className="font-semibold">{mode}</span>
      <span className="text-[10px] leading-tight text-slate-500 max-w-[100px]">
        {config.description}
      </span>
    </motion.button>
  );
}
