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
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Project Details</h1>
        <p className="text-muted-foreground text-lg">
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
          <label className="text-sm font-medium text-foreground/80">Project Mode</label>
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
                className="w-14 h-14 rounded-full bg-brand-secondary mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30"
              >
                <Check className="h-6 w-6 text-foreground" />
              </motion.div>
            ) : (
              <motion.button
                key="submit"
                type="submit"
                disabled={loading}
                className="relative w-full h-12 rounded-xl bg-primary hover:bg-brand/90 disabled:opacity-60 font-bold text-base text-foreground transition-colors overflow-hidden"
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
            ? '-top-2.5 text-[11px] text-primary/80 bg-background'
            : 'top-3 text-sm text-muted-foreground'
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
          className="bg-foreground/[0.03] border-foreground/[0.06] focus:border-primary/50 focus:ring-2 focus:ring-primary/10 min-h-[120px] pt-6 resize-none placeholder:text-muted-foreground"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={active ? '' : placeholder}
          className="bg-foreground/[0.03] border-foreground/[0.06] focus:border-primary/50 focus:ring-2 focus:ring-primary/10 h-12 pt-5 placeholder:text-muted-foreground"
        />
      )}
    </div>
  );
}
