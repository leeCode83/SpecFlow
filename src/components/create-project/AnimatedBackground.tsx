import { motion } from 'motion/react';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(251,146,60,0.08),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_80%,rgba(99,102,241,0.04),transparent)]" />
      <motion.div
        className="absolute -top-48 -right-48 h-[600px] w-[600px] rounded-full opacity-70"
        style={{
          background: 'radial-gradient(circle, rgba(251,146,60,0.06) 0%, transparent 70%)',
        }}
        animate={{ x: [0, 40, -30, 0], y: [0, -30, 40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute -bottom-48 -left-48 h-[700px] w-[700px] rounded-full opacity-70"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
        }}
        animate={{ x: [0, -40, 30, 0], y: [0, 30, -40, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
