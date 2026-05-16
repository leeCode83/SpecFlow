import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageTransition } from '@/components/ui/page-transition';
import { Rocket, Sparkles, BrainCircuit, Target, Zap, ArrowRight, Loader2, MessageSquare, ArrowLeft, Bot } from 'lucide-react';
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
import { PitchQuote, RiskCards, DifficultyBadge, CompetitorInsight, MetricCard, MonetizationModel, CopyAnalysisButton, type MetricType } from '@/components/ui/ideation-cards';
import { useNavigate } from 'react-router-dom';

export function IdeationPage() {
  const navigate = useNavigate();
  const onBack = () => navigate('/');
  const [idea, setIdea] = useState('');
  const [mode, setMode] = useState<Mode>('Hackathon');
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<IdeaFeedback | null>(null);

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

  const getTechStackByCategory = () => {
    if (!feedback?.techStack) return [] as { category: string; items: string[]; color: string }[];
    const result: { category: string; items: string[]; color: string }[] = [];
    const colorCycle = ['text-blue-400 border-blue-500/20 bg-blue-500/5', 'text-purple-400 border-purple-500/20 bg-purple-500/5', 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', 'text-amber-400 border-amber-500/20 bg-amber-500/5', 'text-rose-400 border-rose-500/20 bg-rose-500/5', 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5'];
    let ci = 0;
    Object.entries(feedback.techStack).forEach(([category, techArray]) => {
      if (!Array.isArray(techArray) || techArray.length === 0) return;
      const items: string[] = [];
      techArray.forEach(t => {
        if (typeof t === 'string') items.push(t);
        else if (typeof t === 'object' && t !== null) {
          if ('tech' in t) items.push((t as any).tech);
          else if ('lib' in t) items.push((t as any).lib);
        }
      });
      if (items.length > 0) {
        result.push({ category, items: items.slice(0, 4), color: colorCycle[ci % colorCycle.length] });
        ci++;
      }
    });
    return result;
  };

  const techCategories = getTechStackByCategory();

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

  const getMetrics = (): { type: MetricType; score: number }[] => {
    if (!feedback) return [];
    if (feedback.mode === 'Hackathon') {
      return [
        { type: 'originality' as MetricType, score: Number(feedback.originality) || Number(feedback.hackathonAnalysis?.originalityScore) || 8 },
        { type: 'buildability' as MetricType, score: Number(feedback.buildability) || 8 },
        { type: 'impact' as MetricType, score: Number(feedback.impact) || 8 },
      ];
    }
    if (feedback.mode === 'Learning') {
      return [
        { type: 'originality' as MetricType, score: Number(feedback.originality) || 8 },
        { type: 'feasibility' as MetricType, score: Number(feedback.feasibility) || 8 },
        { type: 'learningValue' as MetricType, score: Number(feedback.learningValue) || 8 },
      ];
    }
    if (feedback.mode === 'Startup') {
      return [
        { type: 'originality' as MetricType, score: Number(feedback.originality) || 8 },
        { type: 'marketSize' as MetricType, score: Number(feedback.marketSize) || 8 },
        { type: 'monetization' as MetricType, score: Number(feedback.monetization) || 8 },
      ];
    }
    return [];
  };

  const metrics = getMetrics();

  return (
    <PageTransition className="min-h-screen bg-background text-foreground relative">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <header className="flex items-center gap-4 px-6 py-4 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="IdeaFrame" className="w-7 h-7" />
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
              <p className="text-muted-foreground text-lg">
                Describe your idea and let IdeaFrame generate a complete technical blueprint and feature roadmap.
              </p>
            </div>

            <div className="relative bg-card/80 border border-border rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
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
                className="min-h-[200px] bg-background/50 border-border focus:border-primary/50 text-lg p-6 rounded-xl resize-none"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAnalyze();
                  }
                }}
              />

              <div className="mt-8 flex justify-end gap-3">
                <p className="text-xs text-muted-foreground self-center">Press Enter to analyze, Shift+Enter for new line</p>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white gap-2 px-8 rounded-xl font-bold h-12"
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
            {/* Results panel - 7/12 */}
            <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-6">
                {/* Strategic Summary */}
                <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card/80 to-card/60 border-border/60 p-8 rounded-2xl space-y-6">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                  <div className="space-y-2 relative z-10">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-primary" />
                      Strategic Summary
                    </h3>
                    <p className="text-foreground/80 leading-relaxed text-lg">{feedback.summary || feedback.refinedIdea?.oneLiner}</p>
                    <p className="text-muted-foreground mt-2">{feedback.refinedIdea?.problem}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/50 relative z-10">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tech Stack</h4>
                      <div className="flex flex-wrap gap-2">
                        {techCategories.length > 0 ? techCategories.map((cat, ci) => (
                          <div key={ci} className="space-y-1.5 w-full">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 block">{cat.category}</span>
                            <div className="flex flex-wrap gap-1.5">
                              {cat.items.map((item, ii) => (
                                <Badge key={ii} variant="outline" className={cn('h-auto whitespace-normal break-words text-left py-1 text-[11px] max-w-full', cat.color)}>
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )) : (
                          <span className="text-xs text-muted-foreground">No tech stack specified</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Next Steps</h4>
                      <ul className="text-sm text-muted-foreground space-y-3">
                        {nextSteps.map((step, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.08 }}
                            className="flex gap-3 items-start"
                          >
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold mt-0.5">0{i+1}</span>
                            <span className="leading-tight">{step}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>

                <PitchQuote text={feedback.pitchDeck} delay={0.15} />
                <DifficultyBadge difficultyLevel={feedback.difficultyLevel} timeEstimateHours={feedback.timeEstimateHours} delay={0.2} />

                {/* Key Insights */}
                <Card className="bg-card/50 border-border p-8 rounded-2xl flex flex-col h-fit">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Key Insights
                  </h3>
                  <div className="space-y-4">
                    {metrics.map((metric, i) => (
                      <MetricCard key={metric.type} type={metric.type} score={metric.score} index={i} />
                    ))}

                    {feedback.mode === 'Hackathon' && (
                      <>
                        <div className="mt-4 text-sm text-muted-foreground">
                          <span className="font-bold text-foreground/80">Time estimate:</span> {feedback.timeEstimateHours || feedback.hackathonAnalysis?.timeEstimate}
                        </div>
                        <CompetitorInsight text={feedback.competitorInsight} delay={0.4} />
                      </>
                    )}
                    {feedback.mode === 'Learning' && (
                      <>
                        <div className="mt-4 text-sm text-muted-foreground space-y-2 p-4 rounded-xl bg-background/50 border border-border/60">
                           <div className="flex items-center gap-2">
                             <Bot className="w-4 h-4 text-muted-foreground" />
                             <span><span className="font-bold text-foreground/80">Time Estimate:</span> {feedback.timeEstimateHours || feedback.learningAnalysis?.timeEstimate}</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <Bot className="w-4 h-4 text-muted-foreground" />
                             <span><span className="font-bold text-foreground/80">Complexity:</span> {feedback.difficultyLevel || feedback.learningAnalysis?.complexityLevel}</span>
                           </div>
                           <div><span className="font-bold text-foreground/80">Complexity Reason:</span> {feedback.learningAnalysis?.complexityReason}</div>
                        </div>
                      </>
                    )}
                    {feedback.mode === 'Startup' && (
                      <>
                        <div className="mt-4 text-sm text-muted-foreground space-y-3 p-4 rounded-xl bg-background/50 border border-border/60">
                           <div><span className="font-bold text-foreground/80 block mb-1">Market Size</span> {feedback.marketAnalysis?.marketSize}</div>
                           <div><span className="font-bold text-foreground/80 block mb-1">Growth Trend</span> {feedback.marketAnalysis?.growthTrend}</div>
                           <div><span className="font-bold text-foreground/80 block mb-1">Target Segment</span> {feedback.marketAnalysis?.targetSegment}</div>
                           <div><span className="font-bold text-foreground/80 block mb-1">Differentiator</span> {feedback.competitiveLandscape?.yourMoat}</div>
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

            {/* Chat panel - 5/12 */}
            <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-6 sticky top-24 h-[100vh] max-h-[85vh]">
                <div className="flex-1 min-h-0 bg-card/80 border border-border rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col relative w-full">
                   <div className="p-4 border-b border-border bg-background/50 flex flex-col gap-1 z-10 shrink-0">
                      <div className="flex flex-row gap-3 items-center">
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold text-foreground/90">Idea Elaboration Consultant</span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-[44px]">Refine features, MVP scope or architecture</p>
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
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-xl shadow-lg shrink-0"
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
    </PageTransition>
  );
}

function ModeButton({ active, onClick, icon, label, color }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, color: string }) {
  const colorMap: Record<string, string> = {
    orange: active ? 'bg-primary border-primary text-white' : 'bg-background border-border hover:border-primary/50 text-muted-foreground',
    blue: active ? 'bg-blue-500 border-blue-500 text-white' : 'bg-background border-border hover:border-blue-500/50 text-muted-foreground',
    emerald: active ? 'bg-brand-secondary border-emerald-500 text-white' : 'bg-background border-border hover:border-emerald-500/50 text-muted-foreground',
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
