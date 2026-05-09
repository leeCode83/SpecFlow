import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Sparkles, BrainCircuit, Target, Zap, ArrowRight, Loader2, MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import { analyzeIdea } from '@/lib/gemini/gemini-ideation';
import { chatWithIdea } from '@/lib/gemini/gemini-chat';
import { Mode, IdeaFeedback, Message } from '@/lib/types';
import { toast } from 'sonner';

interface IdeationPageProps {
  onCreateProject: (id?: string, title?: string, description?: string, feedback?: IdeaFeedback, mode?: Mode) => void;
  onBack: () => void;
}

export function IdeationPage({ onCreateProject, onBack }: IdeationPageProps) {
  const [idea, setIdea] = useState('');
  const [mode, setMode] = useState<Mode>('Hackathon');
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<IdeaFeedback | null>(null);

  // Chat states
  const [elaborationMode, setElaborationMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatting, setChatting] = useState(false);

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

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const newMessages = [...chatMessages, { role: 'user' as const, content: chatInput }];
    setChatMessages(newMessages);
    setChatInput('');
    setChatting(true);

    try {
      const responseText = await chatWithIdea(newMessages, idea, mode);
      setChatMessages([...newMessages, { role: 'assistant' as const, content: responseText }]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to get response from AI.");
    } finally {
      setChatting(false);
    }
  };

  const handleCreateProject = () => {
    if (!feedback) return;
    // Combine chat context into description if needed or just pass it
    let fullDescription = feedback.summary;
    if (chatMessages.length > 0) {
      fullDescription += '\n\nElaboration History:\n' + chatMessages.map(m => `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`).join('\n');
    }
      
    // pass it to the CreateProject view which can handle saving or we trigger it here.
    // wait, if user isn't auth'd, it will go to auth then we might lose state.
    // But since create_project is an authenticated route, passing info via props might be tricky if we don't save.
    // We can bubble these up to App then change view.
    onCreateProject(undefined, idea.split(' ').slice(0, 5).join(' ') + '...', fullDescription, feedback, mode);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <header className="flex items-center gap-4 px-6 py-4 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 rounded-lg p-1.5">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-lg">Ideation Engine</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {!feedback ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">What are you building?</h1>
              <p className="text-slate-400 text-lg">
                Describe your idea and let IdeaFrame generate a complete technical blueprint and feature roadmap.
              </p>
            </div>

            <div className="relative bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
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
                className="min-h-[200px] bg-slate-950/50 border-slate-800 focus:border-orange-500/50 text-lg p-6 rounded-xl resize-none"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
              />

              <div className="mt-8 flex justify-end">
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
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {!elaborationMode ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 bg-slate-900/50 border-slate-800 p-8 rounded-2xl space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-orange-500" />
                      Strategic Summary
                    </h3>
                    <p className="text-slate-300 leading-relaxed text-lg">{feedback.summary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-800/50">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Tech Stack</h4>
                      <div className="flex flex-wrap gap-2">
                        {feedback.techStack.frontend.map(t => <Badge key={t} variant="outline" className="bg-blue-500/5 border-blue-500/20 text-blue-400">{t}</Badge>)}
                        {feedback.techStack.backend.map(t => <Badge key={t} variant="outline" className="bg-purple-500/5 border-purple-500/20 text-purple-400">{t}</Badge>)}
                        {feedback.techStack.ai?.map(t => <Badge key={t} variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-emerald-400">{t}</Badge>)}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Next Steps</h4>
                      <ul className="text-sm text-slate-400 space-y-2">
                        {feedback.nextSteps.map((step, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="text-orange-500 font-bold">0{i+1}.</span>
                            <span className="leading-tight">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-8 flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={() => setElaborationMode(true)} 
                      className="flex-1 bg-slate-800 text-white font-bold h-14 rounded-xl hover:bg-slate-700"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Elaborate with AI
                    </Button>
                    <Button 
                      onClick={handleCreateProject} 
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold h-14 rounded-xl"
                    >
                      Create Project Based on This
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800 p-8 rounded-2xl flex flex-col justify-between h-fit sticky top-24">
                  <h3 className="text-xl font-bold mb-6">Strategic Scores</h3>
                  <div className="space-y-6">
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
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
                <div className="lg:col-span-2 flex flex-col bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
                  <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-orange-500" />
                      </div>
                      <span className="font-bold">Idea Elaboration Consultant</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setElaborationMode(false)} className="text-slate-400 hover:text-white">
                      Back to Report
                    </Button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="flex items-start gap-4 mr-12">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                        <Rocket className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="bg-slate-800/50 rounded-2xl rounded-tl-sm px-5 py-3.5 border border-slate-800/80 text-sm text-slate-200">
                        I'm here to help you refine your idea. We can discuss features, simplify your scope, or plan out your architecture. What are you unsure about?
                      </div>
                    </div>

                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse ml-12' : 'mr-12'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-orange-500 border-orange-400' : 'bg-slate-800 border-slate-700'}`}>
                          {msg.role === 'user' ? <span className="font-bold text-xs">U</span> : <Rocket className="w-4 h-4 text-orange-500" />}
                        </div>
                        <div className={`rounded-2xl px-5 py-3.5 text-sm ${msg.role === 'user' ? 'bg-orange-500/10 text-orange-50 border border-orange-500/20 rounded-tr-sm' : 'bg-slate-800/50 border border-slate-800/80 text-slate-200 rounded-tl-sm markdown-body'}`}>
                          {msg.role === 'user' ? (
                            msg.content
                          ) : (
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {chatting && (
                      <div className="flex items-start gap-4 mr-12">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                          <Rocket className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="bg-slate-800/50 rounded-2xl rounded-tl-sm px-5 py-4 border border-slate-800/80">
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-slate-800 bg-slate-950/50">
                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
                      className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 focus-within:border-orange-500/50 transition-colors"
                    >
                      <input 
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Discuss your idea..."
                        className="flex-1 bg-transparent border-none focus:outline-none text-slate-100 px-3 py-2 text-sm"
                        disabled={chatting}
                      />
                      <Button type="submit" size="icon" className="bg-orange-500 hover:bg-orange-600 rounded-lg h-9 w-9 shrink-0 text-white" disabled={chatting || !chatInput.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </div>
                
                <div className="flex flex-col gap-6">
                  <Card className="bg-slate-900/50 border-slate-800 p-6 rounded-2xl space-y-4">
                    <h3 className="font-bold text-slate-300">Tips for Elaboration</h3>
                    <ul className="text-sm text-slate-400 space-y-2">
                      <li>• Discuss potential roadblocks</li>
                      <li>• Ask what edge cases you missed</li>
                      <li>• Brainstorm pricing strategies</li>
                      <li>• Ask how to simplify the MVP</li>
                    </ul>
                  </Card>
                  
                  <div className="mt-auto">
                    <Button 
                      onClick={handleCreateProject} 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-14 rounded-xl shadow-lg"
                    >
                      Ready to Build!
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>
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
