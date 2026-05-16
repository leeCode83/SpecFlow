import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageTransition } from '@/components/ui/page-transition';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase/supabase';
import { toast } from 'sonner';
import { type Mode } from '@/lib/types';
import { AnimatedBackground } from './create-project/AnimatedBackground';
import { ProgressBar } from './create-project/ProgressBar';
import { ChoiceStep } from './create-project/ChoiceStep';
import { FormStep } from './create-project/FormStep';
import { pageVariants } from './create-project/transitions';

export function CreateProject() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = (location.state as { initialData?: { title: string; description: string; mode: string } })?.initialData;
  const [step, setStep] = useState<'choice' | 'form'>(initialData ? 'form' : 'choice');
  const [loading, setLoading] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [direction, setDirection] = useState(0);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    mode: (initialData?.mode as Mode) || 'Startup',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          mode: formData.mode,
          refined_idea_json: null,
        })
        .select()
        .single();
      if (error) throw error;
      setLoading(false);
      setCelebrating(true);
      setTimeout(() => {
        navigate('/projects/' + data.id);
      }, 1400);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to create project');
      setLoading(false);
    }
  };

  const goToForm = useCallback(() => {
    setDirection(1);
    setStep('form');
  }, []);

  const goToChoice = useCallback(() => {
    setDirection(-1);
    setStep('choice');
  }, []);

  const isLoading = loading || celebrating;

  return (
    <PageTransition className="relative min-h-screen">
      <AnimatedBackground />
      <ProgressBar step={step} />
      <div className="relative z-10 p-8 max-w-4xl mx-auto">
        {step === 'form' && (
          <button
            onClick={goToChoice}
            disabled={isLoading}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-8 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Options
          </button>
        )}
        <AnimatePresence mode="wait" custom={direction}>
          {step === 'choice' ? (
            <motion.div
              key="choice"
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <ChoiceStep
                onIdeation={() => navigate('/ideation')}
                onDirect={goToForm}
              />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex justify-center"
            >
              <FormStep
                title={formData.title}
                description={formData.description}
                mode={formData.mode}
                loading={loading}
                celebrating={celebrating}
                onTitleChange={(v) => setFormData((prev) => ({ ...prev, title: v }))}
                onDescriptionChange={(v) => setFormData((prev) => ({ ...prev, description: v }))}
                onModeChange={(v) => setFormData((prev) => ({ ...prev, mode: v }))}
                onSubmit={handleCreate}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
