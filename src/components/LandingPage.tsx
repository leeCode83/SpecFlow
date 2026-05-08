import { useState } from 'react';
import { motion } from 'motion/react';
import { Rocket, Sparkles, BrainCircuit, Target, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { analyzeIdea } from '../lib/gemini';
import { supabase } from '../lib/supabase';
import { Mode, IdeaFeedback } from '../types';
import { toast } from 'sonner';

interface LandingPageProps {
  onCreateProject: (id: string) => void;
}

export function LandingPage({ onCreateProject }: LandingPageProps) {
  const [idea, setIdea] = useState('');
  const [mode, setMode] = useState<Mode>('Hackathon');
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<IdeaFeedback | null>(null);

  const handleAnalyze = async () => {
    if (!idea.trim()) return toast.error("Please describe your idea first");
    setAnalyzing(true);
    try {
      const result = await analyzeIdea(idea, mode);
      setFeedback(result);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze idea. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveProject = async () => {
    if (!feedback) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // In a real app, trigger auth. For MVP, we assume user is there if they can see this.
      toast.error("Please sign in to save your project.");
      return;
    }

    try {
      const { data, error } = await supabase.from('projects').insert({
        user_id: user.id,
        title: idea.split(' ').slice(0, 5).join(' ') + '...',
        description: idea,
        mode,
        refined_idea_json: feedback
      }).select().single();

      if (error) throw error;
      if (data) {
        toast.success("Project saved!");
        onCreateProject(data.id);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save project.");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center py-20 px-6">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[60%] bg-orange-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[20%] w-[40%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl w-full text-center space-y-12">
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800 text-xs text-orange-500 font-medium"
          >
            <Sparkles className="w-3 h-3" />
            <span>AI-Driven Specification Workspace</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent italic"
          >
            Idea to Spec <br/> in Seconds.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto"
          >
            The spec-driven development workspace for high-speed hackers and founders. 
            Brainstorm, refine, and generate technical blueprints with Gemini.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex flex-wrap gap-4 mb-6">
            <ModeButton 
              active={mode === 'Learning'} 
              onClick={() => setMode('Learning')} 
              icon={<BrainCircuit className="w-4 h-4" />} 
              label="Learning" 
              color="blue"
            />
            <ModeButton 
              active={mode === 'Hackathon'} 
              onClick={() => setMode('Hackathon')} 
              icon={<Zap className="w-4 h-4" />} 
              label="Hackathon" 
              color="orange"
            />
            <ModeButton 
              active={mode === 'Startup'} 
              onClick={() => setMode('Startup')} 
              icon={<Target className="w-4 h-4" />} 
              label="Startup" 
              color="emerald"
            />
          </div>

          <Textarea 
            placeholder="Describe your project idea... (e.g. A real-time collaborative code editor for technical interviews with built-in AI debugging)"
            className="min-h-[150px] bg-slate-950/50 border-slate-800 focus:border-orange-500/50 text-lg p-6 rounded-xl resize-none"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
          />

          <div className="mt-6 flex justify-end">
            <Button 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white gap-2 px-8 rounded-xl"
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Idea...
                </>
              ) : (
                <>
                  Generate Analysis
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {feedback && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
          >
            <Card className="md:col-span-2 bg-slate-900/50 border-slate-800 p-8 rounded-2xl space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-orange-500" />
                  Strategic Summary
                </h3>
                <p className="text-slate-400 leading-relaxed">{feedback.summary}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {feedback.techStack.frontend.map(t => <Badge key={t} variant="outline" className="bg-blue-500/5 border-blue-500/20 text-blue-400">{t}</Badge>)}
                    {feedback.techStack.backend.map(t => <Badge key={t} variant="outline" className="bg-purple-500/5 border-purple-500/20 text-purple-400">{t}</Badge>)}
                    {feedback.techStack.ai.map(t => <Badge key={t} variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-emerald-400">{t}</Badge>)}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Next Steps</h4>
                  <ul className="text-sm text-slate-400 space-y-1">
                    {feedback.nextSteps.map((step, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-orange-500 font-bold">0{i+1}.</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Button 
                onClick={handleSaveProject} 
                className="w-full bg-slate-50 text-slate-950 font-bold py-6 rounded-xl hover:bg-slate-200"
              >
                Create Workspace & Start SpecFlow
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 p-8 rounded-2xl flex flex-col justify-between">
              <h3 className="text-xl font-bold mb-6">Strategic Scores</h3>
              <div className="space-y-6 flex-1">
                <ScoreItem label="Originality" score={feedback.originality} color="orange" />
                {mode === 'Hackathon' && (
                  <>
                    <ScoreItem label="Buildability" score={feedback.buildability} color="blue" />
                    <ScoreItem label="Impact" score={feedback.impact} color="emerald" />
                  </>
                )}
                {mode === 'Learning' && (
                  <>
                    <ScoreItem label="Feasibilty" score={feedback.feasibility} color="blue" />
                    <ScoreItem label="Learning Value" score={feedback.learningValue} color="emerald" />
                  </>
                )}
                {mode === 'Startup' && (
                  <>
                    <ScoreItem label="Market Size" score={feedback.marketSize} color="blue" />
                    <ScoreItem label="Monetization" score={feedback.monetization} color="emerald" />
                  </>
                )}
              </div>
              <div className="mt-8 pt-8 border-t border-slate-800 text-center">
                <p className="text-sm text-slate-500 italic">"Good luck with your project!"</p>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ModeButton({ active, onClick, icon, label, color }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, color: string }) {
  const colorMap: Record<string, string> = {
    orange: active ? 'bg-orange-500 border-orange-500 text-white' : 'hover:border-orange-500/50 text-slate-400',
    blue: active ? 'bg-blue-500 border-blue-500 text-white' : 'hover:border-blue-500/50 text-slate-400',
    emerald: active ? 'bg-emerald-500 border-emerald-500 text-white' : 'hover:border-emerald-500/50 text-slate-400',
  };

  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-800 transition-all duration-200 text-sm font-medium ${colorMap[color]}`}
    >
      {icon}
      {label}
    </button>
  );
}

function ScoreItem({ label, score, color }: { label: string, score: number, color: 'orange' | 'blue' | 'emerald' }) {
  const colorMap = {
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500'
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
        <span>{label}</span>
        <span className="text-slate-100">{score}/10</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          className={`h-full ${colorMap[color]}`} 
        />
      </div>
    </div>
  );
}
