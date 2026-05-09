import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Layout, ChevronLeft, Rocket, Calculator, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mode } from '@/lib/types';
import { supabase } from '@/lib/supabase/supabase';
import { toast } from 'sonner';

interface CreateProjectProps {
  onBack: () => void;
  onCreateProject: (id: string) => void;
  onStartIdeation: () => void;
  initialData?: { title: string; description: string; mode: string } | null;
}

export function CreateProject({ onBack, onCreateProject, onStartIdeation, initialData }: CreateProjectProps) {
  const [step, setStep] = useState<'choice' | 'form'>(initialData ? 'form' : 'choice');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    mode: (initialData?.mode as Mode) || 'Startup',
  });

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          mode: formData.mode,
          refined_idea_json: null
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Project created successfully");
      onCreateProject(data.id);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  if (step === 'choice') {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-12">
        <div className="space-y-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
            <p className="text-slate-500">How would you like to start your journey?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ y: -4 }}
            className="group cursor-pointer"
            onClick={onStartIdeation}
          >
            <Card className="h-full bg-slate-900/50 hover:bg-slate-900 border-slate-800 hover:border-orange-500/30 transition-all p-8 rounded-3xl space-y-6 flex flex-col items-center text-center">
              <div className="p-4 bg-orange-500/10 rounded-2xl text-orange-500 group-hover:scale-110 transition-transform">
                <Sparkles className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Ideation Workshop</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Let AI help you brainstorm, validate, and refine your idea before diving into technical details.
                </p>
              </div>
              <div className="flex-1" />
              <Button variant="secondary" className="w-full">Start Ideation</Button>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="group cursor-pointer"
            onClick={() => setStep('form')}
          >
            <Card className="h-full bg-slate-900/50 hover:bg-slate-900 border-slate-800 hover:border-emerald-500/30 transition-all p-8 rounded-3xl space-y-6 flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
                <Layout className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Direct Creation</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Have a clear vision already? Jump straight into building your workspace and defining specs.
                </p>
              </div>
              <div className="flex-1" />
              <Button variant="secondary" className="w-full">Create Manually</Button>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div className="space-y-4">
        <button 
          onClick={() => setStep('choice')}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Options
        </button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Project Details</h1>
          <p className="text-slate-500">Provide the basic information to initialize your workspace.</p>
        </div>
      </div>

      <form onSubmit={handleQuickCreate} className="space-y-6 bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Project Title</label>
            <Input 
              placeholder="e.g. My Revolutionary App"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-slate-950 border-slate-800 focus:border-orange-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Project Description</label>
            <Textarea 
              placeholder="What are you building? Who is it for?"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-slate-950 border-slate-800 focus:border-orange-500 min-h-[120px]"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Project Mode</label>
            <div className="grid grid-cols-3 gap-3">
              {(['Learning', 'Hackathon', 'Startup'] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mode: m }))}
                  className={`p-3 rounded-xl border text-xs font-medium transition-all flex flex-col items-center gap-2 ${
                    formData.mode === m 
                      ? 'bg-orange-500/10 border-orange-500 text-orange-500' 
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  {m === 'Learning' && <Rocket className="w-4 h-4" />}
                  {m === 'Hackathon' && <Calculator className="w-4 h-4" />}
                  {m === 'Startup' && <ShieldCheck className="w-4 h-4" />}
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg font-bold rounded-xl"
        >
          {loading ? "Creating..." : "Create Workspace"}
        </Button>
      </form>
    </div>
  );
}
