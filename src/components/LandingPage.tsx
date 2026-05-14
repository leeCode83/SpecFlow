import { useState, useEffect } from 'react';
import { motion, LayoutGroup, AnimatePresence } from 'motion/react';
import Floating, { FloatingElement } from "@/components/ui/parallax-floating";
import { TextRotate } from "@/components/ui/text-rotate";
import { Rocket, Sparkles, BrainCircuit, Target, Zap, ArrowRight, Loader2, FileCode2, MessageSquareQuote, MessageSquare, Users, Github, LayoutDashboard, CheckCircle2, Lightbulb } from 'lucide-react';
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

import { TestimonialsColumn, Testimonial } from "@/components/ui/testimonials-columns-1";

interface ModeButtonProps { }

const testimonials: Testimonial[] = [
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
  {
    quote: "It's like having a senior engineer review your ideas instantly. The architecture suggestions alone are worth their weight in gold.",
    author: "David Lee",
    role: "Indie Hacker",
    initials: "DL"
  },
  {
    quote: "We use it for our entire agency. Rapid prototyping and spec generation has reduced our planning phase from weeks to days.",
    author: "Elena Rodriguez",
    role: "Agency Owner",
    initials: "ER"
  },
  {
    quote: "Pushing generated specs directly to GitHub and having them as actionable issues is pure magic. Seamless workflow.",
    author: "Michael Chang",
    role: "Product Manager",
    initials: "MC"
  },
  {
    quote: "The way it breaks down complex features into small, testable chunks is exactly how I like to work, but automated.",
    author: "Sarah Jenkins",
    role: "Senior Software Engineer",
    initials: "SJ"
  },
  {
    quote: "I was skeptical about AI blueprints, but IdeaFrame proved me wrong. It generated scalable architecture from prompt one.",
    author: "Chris Evans",
    role: "CTO",
    initials: "CE"
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);


const heroImages = [
  {
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    title: "Code on screen",
  },
  {
    url: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1200&q=80",
    title: "Github Integration",
  },
  {
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    title: "Laptop with code",
  },
  {
    url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    title: "Mac code",
  },
  {
    url: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80",
    title: "Workspace",
  },
];

import { Mail, Facebook, Instagram, Twitter } from "lucide-react";
import { TextHoverEffect, FooterBackgroundGradient } from "@/components/ui/hover-footer";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Ideation Engine",
    description: "Describe your idea in plain text. Our AI generates a complete technical blueprint with tech stack recommendations, strategic scores, and a refined product vision.",
    iconBg: "bg-orange-500/10 text-orange-500",
    span: "lg" as const,
  },
  {
    icon: FileCode2,
    title: "Smart Specs",
    description: "Generate technical specifications in 6 categories: Auth, API, Frontend, AI, Infrastructure, and Custom. Full Markdown editor with live preview.",
    iconBg: "bg-blue-500/10 text-blue-400",
    span: "sm" as const,
  },
  {
    icon: MessageSquare,
    title: "AI Chat Refinement",
    description: "Chat interactively with AI to refine features, scope, and architecture. Get intelligent suggestions while building your technical blueprint.",
    iconBg: "bg-purple-500/10 text-purple-400",
    span: "sm" as const,
  },
  {
    icon: Github,
    title: "GitHub Sync",
    description: "Link any GitHub repository, browse the complete file tree, and preview code with full syntax highlighting powered by Shiki.",
    iconBg: "bg-slate-500/10 text-slate-300",
    span: "lg" as const,
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Invite teammates to your workspace with email invitations. Accept/decline workflow with automatic expiration tracking.",
    iconBg: "bg-emerald-500/10 text-emerald-400",
    span: "lg" as const,
  },
  {
    icon: LayoutDashboard,
    title: "Smart Dashboard",
    description: "Get a bird's-eye view of all your projects with stats, activity logs, recent projects, and quick access to any workspace.",
    iconBg: "bg-orange-500/10 text-orange-500",
    span: "sm" as const,
  },
];

const quickPrompts = [
  "A real-time collaborative code editor for technical interviews with AI debugging",
  "An AI-powered personal finance tracker with budgeting and smart insights",
  "A social marketplace for indie game developers to share assets and tools",
  "A SaaS platform for automated social media content scheduling and analytics",
];

const subtitles = [
  "Describe your idea in plain English — let AI do the rest.",
  "Choose a mode: Hackathon, Startup, or Learning.",
  "Get instant strategic scores and tech stack analysis.",
  "Refine your blueprint with AI-powered suggestions.",
];

export function LandingPage({ onCreateProject, onSignIn, onStartIdeation }: LandingPageProps) {
  const [idea, setIdea] = useState('');
  const [mode, setMode] = useState<Mode>('Hackathon');
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<IdeaFeedback | null>(null);
  const [subtitleIdx, setSubtitleIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSubtitleIdx((p) => (p + 1) % subtitles.length), 4000);
    return () => clearInterval(interval);
  }, []);

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
          <img src="/logo.png" alt="IdeaFrame" className="w-7 h-7" />
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
        <section className="w-full h-screen overflow-hidden md:overflow-visible flex flex-col items-center justify-center relative py-20 pb-0 md:pb-20">
          <Floating sensitivity={-0.5} className="h-full z-0 pointer-events-none">
            <FloatingElement
              depth={0.5}
              className="top-[15%] left-[2%] md:top-[25%] md:left-[5%]"
            >
              <motion.img
                src={heroImages[0].url}
                alt={heroImages[0].title}
                className="w-16 h-12 sm:w-24 sm:h-16 md:w-28 md:h-20 lg:w-32 lg:h-24 object-cover transition-transform -rotate-[3deg] shadow-[0_0_30px_rgba(249,115,22,0.1)] rounded-xl opacity-80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              />
            </FloatingElement>

            <FloatingElement
              depth={1}
              className="top-[0%] left-[8%] md:top-[6%] md:left-[11%]"
            >
              <motion.img
                src={heroImages[1].url}
                alt={heroImages[1].title}
                className="w-40 h-28 sm:w-48 sm:h-36 md:w-56 md:h-44 lg:w-60 lg:h-48 object-cover transition-transform -rotate-12 shadow-[0_0_30px_rgba(59,130,246,0.1)] rounded-xl opacity-60 pointer-events-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              />
            </FloatingElement>

            <FloatingElement
              depth={4}
              className="top-[90%] left-[6%] md:top-[80%] md:left-[8%]"
            >
              <motion.img
                src={heroImages[2].url}
                alt={heroImages[2].title}
                className="w-40 h-40 sm:w-48 sm:h-48 md:w-60 md:h-60 lg:w-64 lg:h-64 object-cover -rotate-[4deg] transition-transform shadow-[0_0_30px_rgba(249,115,22,0.15)] rounded-xl opacity-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              />
            </FloatingElement>

            <FloatingElement
              depth={2}
              className="top-[0%] left-[87%] md:top-[2%] md:left-[83%]"
            >
              <motion.img
                src={heroImages[3].url}
                alt={heroImages[3].title}
                className="w-40 h-36 sm:w-48 sm:h-44 md:w-60 md:h-52 lg:w-64 lg:h-56 object-cover transition-transform shadow-[0_0_30px_rgba(59,130,246,0.1)] rotate-[6deg] rounded-xl opacity-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              />
            </FloatingElement>

            <FloatingElement
              depth={1}
              className="top-[78%] left-[83%] md:top-[68%] md:left-[83%]"
            >
              <motion.img
                src={heroImages[4].url}
                alt={heroImages[4].title}
                className="w-44 h-44 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 object-cover transition-transform shadow-2xl rotate-[19deg] rounded-xl opacity-70 pointer-events-auto shadow-[0_0_40px_rgba(249,115,22,0.1)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
              />
            </FloatingElement>
          </Floating>

          <div className="flex flex-col justify-center items-center w-full z-50 pointer-events-auto px-6 max-w-5xl text-center">
            <motion.h1
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-center w-full justify-center items-center flex-col flex whitespace-pre leading-tight font-bold tracking-tight space-y-1 md:space-y-4"
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut", delay: 0.3 }}
            >
              <span className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">Idea to</span>
              <LayoutGroup>
                <motion.span layout className="flex whitespace-pre flex-col md:flex-row items-center gap-1 md:gap-4 mt-2">
                  <TextRotate
                    texts={[
                      "Spec",
                      "Blueprint",
                      "Architecture",
                      "Roadmap",
                      "Code",
                    ]}
                    mainClassName="overflow-hidden text-orange-500 py-0"
                    splitLevelClassName="overflow-hidden"
                    staggerDuration={0.03}
                    staggerFrom="last"
                    rotationInterval={3000}
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  />
                  <motion.span
                    layout
                    className="flex whitespace-pre bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  >
                    in Seconds.
                  </motion.span>
                </motion.span>
              </LayoutGroup>
            </motion.h1>
            <motion.p
              className="text-sm sm:text-lg md:text-xl lg:text-2xl text-center text-slate-400 pt-6 sm:pt-8 md:pt-10 lg:pt-12 max-w-2xl"
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut", delay: 0.5 }}
            >
              The spec-driven development workspace for high-speed hackers and founders. 
              Brainstorm, refine, and generate technical blueprints instantly with Gemini.
            </motion.p>

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 items-center mt-10 md:mt-16 w-full">
              <motion.button
                onClick={onStartIdeation}
                className="w-full sm:w-auto text-base md:text-lg font-bold tracking-tight text-white bg-orange-500 px-8 py-4 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                  delay: 0.7,
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { type: "spring", damping: 30, stiffness: 400 },
                }}
              >
                Try Ideation Feature
              </motion.button>
              <motion.button
                onClick={onSignIn}
                className="w-full sm:w-auto flex justify-center items-center gap-2 text-base md:text-lg font-bold tracking-tight text-slate-300 bg-slate-900 border border-slate-700 px-8 py-4 rounded-full shadow-xl"
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                  delay: 0.7,
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { type: "spring", damping: 30, stiffness: 400 },
                }}
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
            </div>
          </div>
        </section>

        {/* Features Section - Animated Card Grid */}
        <section className="w-full bg-slate-900/30 border-y border-slate-800/50 py-24 overflow-hidden">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-4 mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-orange-500 to-orange-200 bg-clip-text text-transparent">Features</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Everything you need to turn raw ideas into production-ready specifications.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
              }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {features.map((feature) => (
                <FeatureCard key={feature.title} feature={feature} span={feature.span} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* Try Ideation Section */}
        <section className="relative w-full max-w-5xl mx-auto px-6 py-24 z-10 overflow-hidden">
          {/* Gradient Mesh Background */}
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute top-[-5%] left-[20%] w-80 h-80 bg-orange-500/5 blur-[120px] rounded-full animate-[slow-drift_20s_ease-in-out_infinite]" />
            <div className="absolute bottom-[-5%] right-[20%] w-96 h-96 bg-blue-500/5 blur-[140px] rounded-full animate-[slow-drift-reverse_25s_ease-in-out_infinite]" />
            <div className="absolute top-[40%] left-[45%] w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full animate-[slow-drift_30s_ease-in-out_infinite_reverse]" />
          </div>

          {/* Zone 1: Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <motion.div
              initial={{ scale: 0.85 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-semibold mb-4"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Live Demo
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-orange-500 to-orange-200 bg-clip-text text-transparent">Try the Ideation Engine</span>
            </h2>
            <div className="h-8">
              <AnimatePresence mode="wait">
                <motion.p
                  key={subtitleIdx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="text-slate-400 text-lg max-w-2xl mx-auto"
                >
                  {subtitles[subtitleIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Zone 2-4: Main Interactive Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 md:p-10 shadow-2xl"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/[0.02] to-transparent pointer-events-none" />

            {/* Zone 2: Mode Selector */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="flex flex-wrap gap-3 mb-6"
            >
              {[
                { value: 'Learning' as Mode, icon: <BrainCircuit className="w-4 h-4" />, activeClass: 'bg-blue-500 border-blue-500 text-white shadow-lg' },
                { value: 'Hackathon' as Mode, icon: <Zap className="w-4 h-4" />, activeClass: 'bg-orange-500 border-orange-500 text-white shadow-lg' },
                { value: 'Startup' as Mode, icon: <Target className="w-4 h-4" />, activeClass: 'bg-emerald-500 border-emerald-500 text-white shadow-lg' },
              ].map((m) => (
                <motion.button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold transition-all duration-300 ${
                    mode === m.value ? m.activeClass : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-orange-500/50 hover:text-slate-200'
                  }`}
                >
                  {m.icon}
                  {m.value}
                  {mode === m.value && (
                    <motion.div
                      layoutId="modeGlow"
                      className="absolute inset-0 rounded-xl bg-orange-500/10 blur-sm -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>

            {/* Zone 3: Input Area */}
            <div className="relative">
              <Textarea
                placeholder="Describe your project idea..."
                className="min-h-[140px] bg-slate-950/50 border-slate-800 focus:border-orange-500/50 text-lg p-6 rounded-xl resize-none transition-all duration-300"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
              />
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
                className="flex flex-wrap gap-2 mt-4"
              >
                {quickPrompts.map((prompt) => (
                  <motion.button
                    key={prompt}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIdea(prompt)}
                    className="px-3 py-1.5 text-xs rounded-full bg-slate-800/40 border border-slate-700/50 text-slate-500 hover:text-slate-200 hover:border-orange-500/30 hover:bg-slate-800/60 transition-all duration-200 truncate max-w-[240px]"
                  >
                    <Lightbulb className="w-3 h-3 inline mr-1.5 text-orange-500/70" />
                    {prompt}
                  </motion.button>
                ))}
              </motion.div>
            </div>

            {/* Zone 4: Generate Button */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex justify-end"
            >
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 rounded-xl opacity-0 group-hover:opacity-75 blur transition-all duration-500 group-hover:duration-300" />
                <Button
                  size="lg"
                  className="relative bg-orange-500 hover:bg-orange-600 text-white gap-2 px-10 rounded-xl font-bold h-12 shadow-lg transition-all duration-300"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing</span>
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
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
          </motion.div>

          {/* Zone 5: Results */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-8"
              >
                {/* Summary Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="md:col-span-2"
                >
                  <Card className="bg-slate-900/50 border-slate-800 p-8 rounded-2xl space-y-6 h-full">
                    <div className="space-y-2">
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl font-bold flex items-center gap-2"
                      >
                        <BrainCircuit className="w-5 h-5 text-orange-500" />
                        Strategic Summary
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-400 leading-relaxed"
                      >
                        {feedback.summary || feedback.refinedIdea?.oneLiner}
                      </motion.p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-2"
                      >
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Tech Stack</h4>
                        <div className="flex flex-wrap gap-2">
                          {feedback.techStack.frontend?.map((t, i) => (
                            <motion.span
                              key={t.tech}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.6 + i * 0.05 }}
                            >
                              <Badge variant="outline" className="bg-blue-500/5 border-blue-500/20 text-blue-400">{t.tech}</Badge>
                            </motion.span>
                          ))}
                          {feedback.techStack.backend?.map((t, i) => (
                            <motion.span
                              key={t.tech}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.6 + (feedback.techStack.frontend?.length || 0 + i) * 0.05 }}
                            >
                              <Badge variant="outline" className="bg-purple-500/5 border-purple-500/20 text-purple-400">{t.tech}</Badge>
                            </motion.span>
                          ))}
                          {feedback.techStack.ai?.map((t, i) => (
                            <motion.span
                              key={t.tech}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.6 + ((feedback.techStack.frontend?.length ?? 0) + (feedback.techStack.backend?.length ?? 0) + i) * 0.05 }}
                            >
                              <Badge variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-emerald-400">{t.tech}</Badge>
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className="space-y-2"
                      >
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Next Steps</h4>
                        <ul className="text-sm text-slate-400 space-y-2">
                          {feedback.nextSteps?.map((step, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.65 + i * 0.08 }}
                              className="flex gap-2 items-start"
                            >
                              <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                              <span>{step}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-800"
                    >
                      <Button
                        onClick={onSignIn}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold h-14 rounded-xl transition-all duration-200"
                      >
                        Log In to Elaborate
                      </Button>
                      <Button
                        onClick={handleSaveProject}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold h-14 rounded-xl transition-all duration-200"
                      >
                        Sign In & Create Project
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </Card>
                </motion.div>

                {/* Scores Card - Hybrid Donut + Bar */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                >
                  <Card className="bg-slate-900/50 border-slate-800 p-8 rounded-2xl flex flex-col h-full">
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="text-xl font-bold mb-6"
                    >
                      Strategic Scores
                    </motion.h3>
                    <div className="flex-1 space-y-6">
                      {/* Donut: Originality */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.45, type: "spring", stiffness: 150, damping: 15 }}
                        className="flex flex-col items-center"
                      >
                        <ScoreDonut score={Number(feedback.originality) || 8} color="orange" size="lg" />
                        <span className="text-sm font-bold text-slate-400 mt-2">Originality</span>
                      </motion.div>

                      {/* Bars: mode-specific scores */}
                      <div className="space-y-4 pt-2 border-t border-slate-800/60">
                        {mode === 'Hackathon' && (
                          <>
                            <ScoreItem label="Buildability" score={Number(feedback.buildability) || 8} color="blue" />
                            <ScoreItem label="Impact" score={Number(feedback.impact) || 8} color="emerald" />
                          </>
                        )}
                        {mode === 'Learning' && (
                          <>
                            <ScoreItem label="Feasibility" score={Number(feedback.feasibility) || 8} color="blue" />
                            <ScoreItem label="Learning Value" score={Number(feedback.learningValue) || 8} color="emerald" />
                          </>
                        )}
                        {mode === 'Startup' && (
                          <>
                            <ScoreItem label="Market Size" score={Number(feedback.marketSize) || 8} color="blue" />
                            <ScoreItem label="Monetization" score={Number(feedback.monetization) || 8} color="emerald" />
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="w-full bg-slate-900/30 border-y border-slate-800/50 py-24 overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 text-center space-y-12">
            <div className="space-y-4">
              <MessageSquareQuote className="w-12 h-12 text-orange-500 mx-auto opacity-50" />
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">What Builders Say</h2>
            </div>
            
            <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[740px] overflow-hidden">
              <TestimonialsColumn testimonials={firstColumn} duration={25} />
              <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={35} />
              <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={30} />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950/80 border-t border-slate-800/80 relative h-fit overflow-hidden mt-24">
        <div className="max-w-7xl mx-auto p-14 z-40 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12">
            {/* Brand section */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Rocket className="w-8 h-8 text-orange-500" />
                <span className="text-white text-3xl font-bold tracking-tight italic">IdeaFrame</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                The spec-driven development workspace for high-speed hackers and founders.
              </p>
            </div>

            {/* Footer link sections */}
            {[
              {
                title: "Product",
                links: [
                  { label: "Features", href: "#" },
                  { label: "Pricing", href: "#" },
                  { label: "Documentation", href: "#" },
                  { label: "Changelog", href: "#" },
                ],
              },
              {
                title: "Resources",
                links: [
                  { label: "Community", href: "#" },
                  { label: "Templates", href: "#" },
                  { label: "Blog", href: "#" },
                  {
                    label: "Discord",
                    href: "#",
                    pulse: true,
                  },
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="text-white text-lg font-semibold mb-6">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label} className="relative">
                      <a
                        href={link.href}
                        className="text-slate-400 hover:text-orange-500 transition-colors"
                      >
                        {link.label}
                      </a>
                      {link.pulse && (
                        <span className="absolute top-0 right-[40px] w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact section */}
            <div>
              <h4 className="text-white text-lg font-semibold mb-6">
                Contact Us
              </h4>
              <ul className="space-y-4">
                {[
                  {
                    icon: <Mail size={18} className="text-orange-500" />,
                    text: "hello@ideaframe.dev",
                    href: "mailto:hello@ideaframe.dev",
                  },
                  {
                    icon: <Github size={18} className="text-orange-500" />,
                    text: "ideaframe-dev",
                    href: "#",
                  },
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    {item.icon}
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-slate-400 hover:text-orange-500 transition-colors"
                      >
                        {item.text}
                      </a>
                    ) : (
                      <span className="text-slate-400 hover:text-orange-500 transition-colors">
                        {item.text}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <hr className="border-t border-slate-800 my-8" />

          {/* Footer bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0">
            {/* Social icons */}
            <div className="flex space-x-6 text-slate-400">
              {[
                { icon: <Facebook size={20} />, label: "Facebook", href: "#" },
                { icon: <Instagram size={20} />, label: "Instagram", href: "#" },
                { icon: <Twitter size={20} />, label: "Twitter", href: "#" },
              ].map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="hover:text-orange-500 transition-colors"
                >
                  {icon}
                </a>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-center md:text-left text-slate-500">
              &copy; {new Date().getFullYear()} IdeaFrame. All rights reserved.
            </p>
          </div>
        </div>

        {/* Text hover effect */}
        <div className="lg:flex hidden h-[20rem] -mt-32 -mb-20 overflow-hidden pointer-events-none">
          <div className="pointer-events-auto w-full">
            <TextHoverEffect 
              text="IDEAFRAME" 
              className="z-50 [&_h1]:text-[5rem]" 
            />
          </div>
        </div>

        <FooterBackgroundGradient />
      </footer>
    </div>
  );
}

function ScoreDonut({ score, color, size = 'md' }: { score: number; color: 'orange' | 'blue' | 'emerald'; size?: 'sm' | 'md' | 'lg' }) {
  const colorMap = {
    orange: '#f97316',
    blue: '#3b82f6',
    emerald: '#10b981',
  };
  const dims = { sm: 60, md: 80, lg: 100 };
  const strokes = { sm: 5, md: 6, lg: 7 };
  const d = dims[size];
  const sw = strokes[size];
  const r = (d - sw) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (score / 10) * c;

  return (
    <svg width={d} height={d} viewBox={`0 0 ${d} ${d}`}>
      <circle cx={d / 2} cy={d / 2} r={r} fill="none" stroke="rgb(30,41,59)" strokeWidth={sw} />
      <motion.circle
        cx={d / 2} cy={d / 2} r={r}
        fill="none" stroke={colorMap[color]}
        strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: off }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        transform={`rotate(-90 ${d / 2} ${d / 2})`}
      />
      <text
        x={d / 2} y={d / 2}
        textAnchor="middle" dominantBaseline="central"
        fill="rgb(226,232,240)"
        fontSize={d * 0.32}
        fontWeight="700"
      >
        {score}
      </text>
    </svg>
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

function FeatureCard({ feature, span }: { feature: typeof features[0]; span: "sm" | "lg" }) {
  const Icon = feature.icon;
  const lg = span === "lg";
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
      }}
      whileHover={{ y: -6, transition: { type: "spring", stiffness: 300, damping: 20 } }}
      className={`group relative bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl transition-all duration-300 hover:border-orange-500/30 hover:shadow-[0_0_30px_rgba(249,115,22,0.08)] ${lg ? 'md:col-span-2 p-8 md:p-10' : 'p-6 md:p-8'}`}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className={`${lg ? 'w-14 h-14' : 'w-12 h-12'} rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${feature.iconBg}`}>
        <Icon className={lg ? 'w-7 h-7' : 'w-6 h-6'} />
      </div>

      <h3 className={`font-bold text-slate-100 mb-3 group-hover:text-orange-400 transition-colors duration-300 ${lg ? 'text-xl' : 'text-lg'}`}>
        {feature.title}
      </h3>
      <p className={`text-slate-400 leading-relaxed ${lg ? 'text-base max-w-2xl' : 'text-sm'}`}>
        {feature.description}
      </p>

      <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}
