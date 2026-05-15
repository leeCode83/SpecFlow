import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ModeCard } from './ModeCard';
import { SuccessCelebration } from './SuccessCelebration';
import { staggerContainer, staggerItem } from './transitions';
import { type Mode } from '@/lib/types';

interface FormStepProps {
  title: string;
  description: string;
  mode: Mode;
  loading: boolean;
  celebrating: boolean;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onModeChange: (v: Mode) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function FormStep({
  title, description, mode, loading, celebrating,
  onTitleChange, onDescriptionChange, onModeChange, onSubmit,
}: FormStepProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-2xl"
    >
      <motion.div variants={staggerItem} className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight text-white">Project Details</h1>
        <p className="text-slate-500 text-lg">
          Provide the basic information to initialize your workspace.
        </p>
      </motion.div>

      <motion.form variants={staggerItem} onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          <FloatingField
            label="Project Title"
            value={title}
            onChange={onTitleChange}
            placeholder=""
          />
          <FloatingField
            label="Description"
            value={description}
            onChange={onDescriptionChange}
            placeholder=""
            multiline
          />
        </div>

        <motion.div variants={staggerItem} className="space-y-3">
          <label className="text-sm font-medium text-slate-300">Project Mode</label>
          <div className="grid grid-cols-3 gap-3">
            {(['Learning', 'Hackathon', 'Startup'] as Mode[]).map((m) => (
              <ModeCard
                key={m}
                mode={m}
                selected={mode === m}
                onClick={() => onModeChange(m)}
              />
            ))}
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="relative">
          <AnimatePresence mode="wait">
            {celebrating ? (
              <motion.div
                key="success"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-14 h-14 rounded-full bg-emerald-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30"
              >
                <Check className="h-6 w-6 text-white" />
              </motion.div>
            ) : (
              <motion.button
                key="submit"
                type="submit"
                disabled={loading}
                className="relative w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 font-bold text-base text-white transition-colors overflow-hidden"
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  'Create Workspace'
                )}
              </motion.button>
            )}
          </AnimatePresence>
          {celebrating && <SuccessCelebration />}
        </motion.div>
      </motion.form>
    </motion.div>
  );
}

function FloatingField({
  label, value, onChange, placeholder, multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative">
      <span
        className={`absolute left-3 px-1 transition-all pointer-events-none z-10 ${
          active
            ? '-top-2.5 text-[11px] text-orange-400 bg-background'
            : 'top-3 text-sm text-slate-500'
        }`}
      >
        {label}
      </span>
      {multiline ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={active ? '' : placeholder}
          className="bg-white/[0.03] border-white/[0.06] focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10 min-h-[120px] pt-6 resize-none placeholder:text-slate-600"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={active ? '' : placeholder}
          className="bg-white/[0.03] border-white/[0.06] focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10 h-12 pt-5 placeholder:text-slate-600"
        />
      )}
    </div>
  );
}
