import { useState } from 'react';
import { motion } from 'motion/react';
import { Rocket, Sparkles, BrainCircuit, Target, Zap, ArrowRight, Loader2, Code2, GitMerge, FileCode2, CheckCircle2, ChevronRight, MessageSquareQuote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { analyzeIdea } from '@/lib/gemini/gemini-ideation';
import { supabase } from '@/lib/supabase/supabase';
import { createProject } from '@/lib/supabase/supabase-projects';
import { Mode, IdeaFeedback } from '@/lib/types';
import { toast } from 'sonner';

interface LandingPageProps {
  onCreateProject: (id: string) => void;
  onSignIn?: () => void;
  onStartIdeation?: () => void;
}

const testimonials = [
  {
    quote: "IdeaFrame literally saved our hackathon team. We generated our specs in 5 minutes and knew exactly what to build. Shipped a day early.",
    author: "Jane Doe",
    role: "Hackathon Winner",
    initials: "JD"
  },
  {
    quote: "The strategic scoring feedback helps us prioritize our product features before writing a single line of code. Absolutely game-changing.",
    author: "Alex Morgan",
    role: "Startup Founder",
    initials: "AM"
  },
  {
    quote: "I use this for every new side project. It takes my messy brain dumps and organizes them into a clean, actionable tech stack.",
    author: "Sam Chen",
    role: "Full-Stack Developer",
    initials: "SC"
  },
  {
    quote: "Instead of staring at a blank repository, our team gets a structured blueprint on day one. IdeaFrame is now part of our core workflow.",
    author: "Taylor Smith",
    role: "Engineering Manager",
    initials: "TS"
  },
];

export function LandingPage({ onCreateProject, onSignIn, onStartIdeation }: LandingPageProps) {
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
      toast.error("Please sign in to save your project.");
      if (onSignIn) onSignIn();
      return;
    }

    try {
      const data = await createProject({
        user_id: user.id,
        title: idea.split(' ').slice(0, 5).join(' ') + '...',
        description: feedback.summary,
        mode,
        refined_idea_json: feedback
      });

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
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-slate-950 font-sans text-slate-50">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[60%] bg-orange-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[20%] w-[40%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 rounded-lg p-1.5">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-xl italic">IdeaFrame</span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={onSignIn}>
            Log In
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold" onClick={onStartIdeation}>
            Get Started
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full">
        {/* Hero Section */}
        <section className="w-full max-w-6xl mx-auto px-6 py-24 md:py-32 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
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
              className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent leading-tight"
            >
              Idea to Spec <br/> in Seconds.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 text-lg md:text-xl max-w-xl leading-relaxed"
            >
              The spec-driven development workspace for high-speed hackers and founders. 
              Brainstorm, refine, and generate technical blueprints instantly with Gemini.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-4"
            >
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 font-bold h-14 px-8 text-base" onClick={onStartIdeation}>
                Start Building Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1 w-full max-w-lg relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-blue-500/20 blur-3xl rounded-full" />
            <img 
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80" 
              alt="Code on screen" 
              className="rounded-2xl border border-slate-800 shadow-2xl relative z-10 object-cover aspect-[4/3]"
            />
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="w-full bg-slate-900/30 border-y border-slate-800/50 py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Why Choose IdeaFrame?</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Stop guessing your architecture. We provide structure so you can focus on writing code.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<BrainCircuit className="w-8 h-8 text-orange-500" />}
                title="AI Ideation Workshop"
                desc="Turn a vague sentence into a comprehensive tech stack and feature roadmap in seconds."
              />
              <FeatureCard 
                icon={<FileCode2 className="w-8 h-8 text-blue-500" />}
                title="Structured Blueprints"
                desc="Generate clear, actionable specifications for your Next.js, React, or Python applications."
              />
              <FeatureCard 
                icon={<GitMerge className="w-8 h-8 text-emerald-500" />}
                title="Iterative Refinement"
                desc="Break down massive features into manageable, trackable components. Never lose context."
              />
            </div>
          </div>
        </section>

        {/* Try Ideation Section */}
        <section className="w-full max-w-5xl mx-auto px-6 py-24 z-10">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Try the Ideation Engine</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Test it right here. Tell us what you want to build.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-xl"
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
                className="bg-orange-500 hover:bg-orange-600 text-white gap-2 px-8 rounded-xl font-bold h-12"
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-8"
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
                      {feedback.techStack.ai?.map(t => <Badge key={t} variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-emerald-400">{t}</Badge>)}
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

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-800">
                  <Button 
                    onClick={onSignIn} 
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold h-14 rounded-xl"
                  >
                    Log In to Elaborate
                  </Button>
                  <Button 
                    onClick={handleSaveProject} 
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold h-14 rounded-xl"
                  >
                    Sign In & Create Project
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
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
              </Card>
            </motion.div>
          )}
        </section>

        <section className="w-full bg-slate-900/30 border-y border-slate-800/50 py-24 overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 text-center space-y-12">
            <div className="space-y-4">
              <MessageSquareQuote className="w-12 h-12 text-orange-500 mx-auto opacity-50" />
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">What Builders Say</h2>
            </div>
            
            <div className="relative w-full overflow-hidden flex before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-20 before:bg-gradient-to-r before:from-slate-950 before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-20 after:bg-gradient-to-l after:from-slate-950 after:to-transparent">
              <motion.div 
                className="flex gap-6 w-max"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ ease: "linear", duration: 40, repeat: Infinity }}
              >
                {[...testimonials, ...testimonials].map((t, i) => (
                  <Card key={i} className="w-[350px] md:w-[400px] shrink-0 bg-slate-900/50 border-slate-800 p-8 rounded-2xl flex flex-col justify-between whitespace-normal text-left">
                    <p className="text-slate-300 text-lg leading-relaxed italic mb-8">
                      "{t.quote}"
                    </p>
                    <div className="flex items-center gap-4 mt-auto">
                      <div className="w-10 h-10 shrink-0 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 font-bold text-sm border border-slate-700">
                        {t.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-200 truncate">{t.author}</p>
                        <p className="text-sm text-slate-500 truncate">{t.role}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <Rocket className="w-5 h-5 text-orange-500" />
            <span className="font-bold tracking-tight text-white italic">IdeaFrame</span>
          </div>
          <p className="text-slate-500 text-sm text-center md:text-left">
            © {new Date().getFullYear()} IdeaFrame. All rights reserved. 
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-slate-500 hover:text-orange-500 text-sm transition-colors">Privacy</a>
            <a href="#" className="text-slate-500 hover:text-orange-500 text-sm transition-colors">Terms</a>
            <a href="#" className="text-slate-500 hover:text-orange-500 text-sm transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-slate-700 transition-colors">
      <div className="mb-6 p-4 bg-slate-950/50 rounded-xl inline-block border border-slate-800/50">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-100">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function ModeButton({ active, onClick, icon, label, color }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, color: string }) {
  const colorMap: Record<string, string> = {
    orange: active ? 'bg-orange-500 border-orange-500 text-white' : 'bg-slate-950 border-slate-800 hover:border-orange-500/50 text-slate-400',
    blue: active ? 'bg-blue-500 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 hover:border-blue-500/50 text-slate-400',
    emerald: active ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 hover:border-emerald-500/50 text-slate-400',
  };

  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all duration-200 text-sm font-bold ${colorMap[color]}`}
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
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
        <span>{label}</span>
        <span className="text-slate-200">{score}/10</span>
      </div>
      <div className="h-2.5 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          className={`h-full ${colorMap[color]}`} 
        />
      </div>
    </div>
  );
}
