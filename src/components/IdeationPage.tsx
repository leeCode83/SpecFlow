import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Sparkles, BrainCircuit, Target, Zap, ArrowRight, Loader2, MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { analyzeIdea } from '@/lib/gemini/gemini-ideation';
import { chatWithIdea } from '@/lib/gemini/gemini-chat';
import { simplifyProjectDescription } from '@/lib/gemini/gemini-simplify';
import { Mode, IdeaFeedback, Message } from '@/lib/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AnimatedAIChat } from '@/components/ui/animated-ai-chat';
import { PitchQuote, RiskCards, DifficultyBadge, CompetitorInsight, TechJustification, MonetizationModel, CopyAnalysisButton } from '@/components/ui/ideation-cards';
import { useNavigate } from 'react-router-dom';

export function IdeationPage() {
  const navigate = useNavigate();
  const onBack = () => navigate('/');
  const [idea, setIdea] = useState('');
  const [mode, setMode] = useState<Mode>('Hackathon');
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<IdeaFeedback | null>(null);

  // Chat states
  // Remove elaboration mode state if present
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatting, setChatting] = useState(false);
  const [isStructuring, setIsStructuring] = useState(false);

  const handleAnalyze = async () => {
    if (!idea.trim()) return toast.error("Please describe your idea first");
    setAnalyzing(true);
    try {
      const result = await analyzeIdea(idea, mode);
      setFeedback(result);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze idea. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSendChat = async (textToSend?: string) => {
    const messageContent = typeof textToSend === 'string' ? textToSend : chatInput;
    if (!messageContent.trim() || chatting) return;

    const newMessages = [...chatMessages, { role: 'user' as const, content: messageContent }];
    setChatMessages(newMessages);
    if (!textToSend) setChatInput('');
    setChatting(true);

    try {
      const responseText = await chatWithIdea(newMessages, idea, mode);
      setChatMessages([...newMessages, { role: 'assistant' as const, content: responseText }]);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to get response from AI.");
    } finally {
      setChatting(false);
    }
  };

  const handleCreateProject = async () => {
    if (!feedback) return;
    setIsStructuring(true);
    let fullDescription = (feedback.refinedIdea?.oneLiner || '') + '\n\n' + (feedback.refinedIdea?.problem || '') + '\n\nTarget User: ' + (feedback.refinedIdea?.targetUser || '');
    
    try {
      if (chatMessages.length > 0) {
        fullDescription = await simplifyProjectDescription(idea, feedback, chatMessages);
      }

      navigate('/projects/new', { state: { initialData: { title: feedback.refinedIdea?.title || idea.split(' ').slice(0, 5).join(' ') + '...', description: fullDescription, mode } } });
    } catch (e) {
      toast.error('Failed to simplify description. Creating anyway with raw data.');
      if (chatMessages.length > 0) {
        fullDescription += '\n\nElaboration History:\n' + chatMessages.map(m => `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`).join('\n');
      }
      navigate('/projects/new', { state: { initialData: { title: feedback.refinedIdea?.title || idea.split(' ').slice(0, 5).join(' ') + '...', description: fullDescription, mode } } });
    } finally {
      setIsStructuring(false);
    }
  };

  const getTechStackList = () => {
    if (!feedback?.techStack) return [];
    const list: string[] = [];
    Object.values(feedback.techStack).forEach((techArray) => {
      if (Array.isArray(techArray)) {
        techArray.forEach(t => {
          if (typeof t === 'string') list.push(t);
          else if (typeof t === 'object' && t !== null) {
            if ('tech' in t) list.push((t as any).tech);
            else if ('lib' in t) list.push((t as any).lib);
            else list.push(JSON.stringify(t));
          }
        });
      }
    });
    return list;
  };

  const techList = getTechStackList();
  
  const getNextSteps = () => {
    if (feedback?.nextSteps && feedback.nextSteps.length > 0) return feedback.nextSteps;
    if (feedback?.mode === 'Learning') {
       return feedback.learningPath?.week1 || feedback.mvpScope?.learningMilestones || [];
    }
    if (feedback?.mode === 'Hackathon') {
       return feedback.quickWins?.day1Morning || feedback.mvpScope?.mustHave || [];
    }
    if (feedback?.mode === 'Startup') {
       const steps = [];
       if (feedback.roadmap?.['month1-3']) steps.push(feedback.roadmap['month1-3']);
       if (feedback.mvpScope?.mustHave) steps.push(...feedback.mvpScope.mustHave);
       return steps.slice(0, 4);
    }
    return [];
  };

  const nextSteps = getNextSteps();

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

      <main className={cn("mx-auto px-6 py-12 space-y-12 transition-all duration-500", feedback ? "max-w-7xl" : "max-w-4xl")}>
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
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-6">
                <Card className="bg-slate-900/50 border-slate-800 p-8 rounded-2xl space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-orange-500" />
                      Strategic Summary
                    </h3>
                    <p className="text-slate-300 leading-relaxed text-lg">{feedback.summary || feedback.refinedIdea?.oneLiner}</p>
                    <p className="text-slate-400 mt-2">{feedback.refinedIdea?.problem}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-800/50">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Tech Stack</h4>
                      <div className="flex flex-wrap gap-2">
                        {techList.slice(0, 10).map((t, i) => (
                           <Badge key={i} variant="outline" className={`h-auto whitespace-normal break-words text-left py-1 text-xs max-w-full ${i % 3 === 0 ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' : i % 3 === 1 ? 'bg-purple-500/5 border-purple-500/20 text-purple-400' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'}`}>{t}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Next Steps</h4>
                      <ul className="text-sm text-slate-400 space-y-2">
                        {nextSteps.map((step, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="text-orange-500 font-bold">0{i+1}.</span>
                            <span className="leading-tight">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <TechJustification text={feedback.techJustification} delay={0.45} />
                </Card>

                <PitchQuote text={feedback.pitchDeck} delay={0.15} />
                <DifficultyBadge difficultyLevel={feedback.difficultyLevel} timeEstimateHours={feedback.timeEstimateHours} delay={0.2} />

                <Card className="bg-slate-900/50 border-slate-800 p-8 rounded-2xl flex flex-col h-fit">
                  <h3 className="text-xl font-bold mb-6">Key Insights</h3>
                  <div className="space-y-6">
                    {feedback.mode === 'Hackathon' && (
                      <>
                        <ScoreItem label="Originality" score={Number(feedback.originality) || Number(feedback.hackathonAnalysis?.originalityScore) || 8} color="orange" />
                        <ScoreItem label="Buildability" score={Number(feedback.buildability) || 8} color="blue" />
                        <ScoreItem label="Impact" score={Number(feedback.impact) || 8} color="emerald" />
                        <div className="mt-4 text-sm text-slate-400">
                          <span className="font-bold text-slate-300">Time estimate:</span> {feedback.timeEstimateHours || feedback.hackathonAnalysis?.timeEstimate}
                        </div>
                        <CompetitorInsight text={feedback.competitorInsight} delay={0.4} />
                      </>
                    )}
                    {feedback.mode === 'Learning' && (
                      <>
                        <ScoreItem label="Originality" score={Number(feedback.originality) || 8} color="orange" />
                        <ScoreItem label="Feasibility" score={Number(feedback.feasibility) || 8} color="blue" />
                        <ScoreItem label="Learning Value" score={Number(feedback.learningValue) || 8} color="emerald" />
                        <div className="mt-4 text-sm text-slate-400 space-y-2">
                           <div><span className="font-bold text-slate-300">Time Estimate:</span> {feedback.timeEstimateHours || feedback.learningAnalysis?.timeEstimate}</div>
                           <div><span className="font-bold text-slate-300">Complexity:</span> {feedback.difficultyLevel || feedback.learningAnalysis?.complexityLevel}</div>
                           <div><span className="font-bold text-slate-300">Complexity Reason:</span> {feedback.learningAnalysis?.complexityReason}</div>
                        </div>
                      </>
                    )}
                    {feedback.mode === 'Startup' && (
                      <>
                        <ScoreItem label="Originality" score={Number(feedback.originality) || 8} color="orange" />
                        <ScoreItem label="Market Size" score={Number(feedback.marketSize) || 8} color="blue" />
                        <ScoreItem label="Monetization" score={Number(feedback.monetization) || 8} color="emerald" />
                        <div className="mt-4 text-sm text-slate-400 space-y-3">
                           <div><span className="font-bold text-slate-300 block mb-1">Market Size</span> {feedback.marketAnalysis?.marketSize}</div>
                           <div><span className="font-bold text-slate-300 block mb-1">Growth Trend</span> {feedback.marketAnalysis?.growthTrend}</div>
                           <div><span className="font-bold text-slate-300 block mb-1">Target Segment</span> {feedback.marketAnalysis?.targetSegment}</div>
                           <div><span className="font-bold text-slate-300 block mb-1">Differentiator</span> {feedback.competitiveLandscape?.yourMoat}</div>
                        </div>
                        <CompetitorInsight text={feedback.competitorInsight} delay={0.4} />
                        <MonetizationModel text={feedback.monetizationModel} delay={0.5} />
                      </>
                    )}
                  </div>
                </Card>

                <RiskCards risks={feedback.keyRisks} delay={0.3} />

                <CopyAnalysisButton feedback={feedback as unknown as Record<string, unknown>} />
            </div>

            <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-6 sticky top-24 h-[100vh] max-h-[85vh]">
                <div className="flex-1 min-h-0 bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col relative w-full">
                   <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex flex-col gap-1 z-10 shrink-0">
                      <div className="flex flex-row gap-3 items-center">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-orange-500" />
                        </div>
                        <span className="font-bold text-slate-200">Idea Elaboration Consultant</span>
                      </div>
                      <p className="text-xs text-slate-400 pl-[44px]">Refine features, MVP scope or architecture</p>
                   </div>
                   <div className="flex-1 overflow-hidden">
                       <AnimatedAIChat 
                          onSendMessage={handleSendChat}
                          isTyping={chatting}
                          messages={[
                              { role: 'assistant', content: "I'm here to help you refine your idea. We can discuss features, simplify your scope, or plan out your architecture. What are you unsure about?" },
                              ...chatMessages
                          ]}
                          compact={true}
                       />
                   </div>
                </div>

                <Button 
                    onClick={handleCreateProject} 
                    disabled={isStructuring}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-14 rounded-xl shadow-lg shrink-0"
                >
                    {isStructuring ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Structuring Requirements...
                        </>
                    ) : (
                        <>
                            Ready to Build!
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                    )}
                </Button>
            </div>
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

function StatItem({ label, text, color }: { label: string, text?: string, color: 'orange' | 'blue' | 'emerald' }) {
  const textMap = {
    orange: 'text-orange-400',
    blue: 'text-blue-400',
    emerald: 'text-emerald-400'
  };
  return (
    <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <span className={`text-sm font-bold ${textMap[color]}`}>{text || '-'}</span>
    </div>
  );
}
