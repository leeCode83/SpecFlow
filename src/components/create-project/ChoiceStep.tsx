import { motion } from 'motion/react';
import { Sparkles, Layout, ArrowRight, Bolt } from 'lucide-react';
import { staggerContainer, staggerItem } from './transitions';

interface ChoiceStepProps {
  onIdeation: () => void;
  onDirect: () => void;
}

export function ChoiceStep({ onIdeation, onDirect }: ChoiceStepProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-12"
    >
      <motion.div variants={staggerItem} className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Create New Project
        </h1>
        <p className="text-slate-500 text-lg">
          How would you like to start your journey?
        </p>
      </motion.div>

      <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ y: -6, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="group relative cursor-pointer"
          onClick={onIdeation}
        >
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-b from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
          <div className="relative h-full rounded-3xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-8 space-y-6 flex flex-col items-center text-center group-hover:border-orange-500/30 transition-colors">
            <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-500">
              <Sparkles className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Ideation Workshop</h3>
              <p className="text-slate-400 leading-relaxed text-sm max-w-xs">
                Let AI help you brainstorm, validate, and refine your idea before diving into technical details.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[11px] font-medium">AI-Powered</span>
              <span className="px-2.5 py-1 rounded-full bg-white/[0.05] text-slate-400 text-[11px] font-medium">Brainstorming</span>
              <span className="px-2.5 py-1 rounded-full bg-white/[0.05] text-slate-400 text-[11px] font-medium">Validation</span>
            </div>
            <div className="flex-1" />
            <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] py-3 text-sm font-semibold text-white transition-colors">
              Start Ideation
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -6, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="group relative cursor-pointer"
          onClick={onDirect}
        >
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-b from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
          <div className="relative h-full rounded-3xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-8 space-y-6 flex flex-col items-center text-center group-hover:border-emerald-500/30 transition-colors">
            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Layout className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Direct Creation</h3>
              <p className="text-slate-400 leading-relaxed text-sm max-w-xs">
                Have a clear vision already? Jump straight into building your workspace and defining specs.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-medium">Quick Setup</span>
              <span className="px-2.5 py-1 rounded-full bg-white/[0.05] text-slate-400 text-[11px] font-medium">Blank Canvas</span>
              <span className="px-2.5 py-1 rounded-full bg-white/[0.05] text-slate-400 text-[11px] font-medium">Full Control</span>
            </div>
            <div className="flex-1" />
            <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] py-3 text-sm font-semibold text-white transition-colors">
              Create Manually
              <Bolt className="h-4 w-4" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
