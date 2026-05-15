import { motion } from 'motion/react';

interface ProgressBarProps {
  step: 'choice' | 'form';
}

export function ProgressBar({ step }: ProgressBarProps) {
  const progress = step === 'choice' ? 50 : 100;

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] bg-white/[0.05] z-50">
      <motion.div
        className="h-full bg-gradient-to-r from-orange-500 to-amber-400"
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        style={{ willChange: 'width' }}
      />
    </div>
  );
}
