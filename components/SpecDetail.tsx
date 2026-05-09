import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Sparkles, 
  Save, 
  Copy, 
  MessageSquare, 
  Eye, 
  Code,
  Send,
  Loader2,
  Terminal,
  Download,
  BrainCircuit,
  History,
  FileSearch,
  Pencil,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/lib/supabase/supabase';
import { getProjectById } from '@/lib/supabase/supabase-projects';
import { getSpecsByProjectId, updateSpec, getSpecById } from '@/lib/supabase/supabase-specs';
import { getEmbedding } from '@/lib/gemini/gemini-embeddings';
import { generateSpec } from '@/lib/gemini/gemini-specs';
import { Project, Spec, Message } from '@/lib/types';
import { toast } from 'sonner';

interface SpecDetailProps {
  specId: string;
  projectId: string;
  onBack: () => void;
}

export function SpecDetail({ specId, projectId, onBack }: SpecDetailProps) {
  const [spec, setSpec] = useState<Spec | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [similarSpecs, setSimilarSpecs] = useState<string[]>([]);
  
  // New state for confirmation logic
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingContent, setPendingContent] = useState('');
  const [cleanMessage, setCleanMessage] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentContentRef = useRef(content);

  useEffect(() => {
    if (spec) {
      setHasUnsavedChanges(content !== spec.content);
    }
    currentContentRef.current = content;
  }, [content, spec?.content]);

  useEffect(() => {
    fetchData();
  }, [specId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [specData, projectData] = await Promise.all([
        getSpecById(specId),
        getProjectById(projectId)
      ]);

      setSpec(specData);
      setProject(projectData);
      setContent(specData.content);
      setTitle(specData.title || '');
      setNewTitle(specData.title || '');
      
      // Perform vector search for similar specs
      if (specData.embedding) {
        // In a real pgvector setup, you'd use a RPC call. 
        // For this MVP, we'll just pull some context OR mock the vector search.
        const allSpecs = await getSpecsByProjectId(projectId);
        const others = allSpecs.filter(s => s.id !== specId).slice(0, 3);
        setSimilarSpecs(others.map(o => o.content));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load spec");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTitle = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      await updateSpec(specId, { title: newTitle });

      setTitle(newTitle);
      setSpec(prev => prev ? { ...prev, title: newTitle } : null);
      setIsEditingTitle(false);
      toast.success("Title updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update title");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (contentToSave: string, showToast = true) => {
    if (saving) return;
    setSaving(true);
    try {
      // 1. Save content first without embedding
      const status = contentToSave.length > 500 ? 'completed' : 'draft';
      await updateSpec(specId, { content: contentToSave, status });

      // Update local state immediately after content save
      setSpec(prev => prev ? { ...prev, content: contentToSave, status } : null);
      setHasUnsavedChanges(false);
      
      if (showToast) toast.success("Spec saved successfully");

      // 2. Start embedding process in the background if save was successful
      getEmbedding(contentToSave.substring(0, 5000))
        .then(embedding => updateSpec(specId, { embedding }))
        .then(() => console.log(`Vector index updated for specId: ${specId}`))
        .catch(err => console.error("Failed to generate and save embedding:", err));

      return true;
    } catch (error) {
      console.error("Save Error:", error);
      if (showToast) toast.error("Failed to save spec. Please check your connection.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleBackAndSave = async () => {
    if (hasUnsavedChanges) {
      const success = await handleSave(currentContentRef.current, false);
      if (!success) {
        toast.error("Auto-save failed. Stay here to save manually?");
        return; // Prevent exit if save failed
      }
    }
    onBack();
  };

  const handleSendMessage = async () => {
    if (!input.trim() || chatLoading) return;
    
    const newMsg: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput('');
    setChatLoading(true);

    try {
      // This is the "Interview" model. If it's the first message, we set context.
      const response = await generateSpec(
        updatedMessages, 
        spec?.type || 'Custom',
        project?.description || '',
        similarSpecs
      );
      
      // Check if there is a generation proposal in the response
      const generateIndex = response.indexOf('[GENERATE_SPEC]');
      const generateEndIndex = response.indexOf('[/GENERATE_SPEC]');
      
      let displayMessage = response;
      let specToProcess = '';
      
      if (generateIndex !== -1 && generateEndIndex !== -1) {
        specToProcess = response.substring(generateIndex + 15, generateEndIndex).trim();
        // Remove the spec content from the chat display message
        displayMessage = response.replace(/\[GENERATE_SPEC\][\s\S]*?\[\/GENERATE_SPEC\]/, '').trim();
        
        if (!displayMessage) displayMessage = "I've drafted a specification update for you. Would you like to apply it?";
        
        setPendingContent(specToProcess);
        setCleanMessage(displayMessage);
        setIsConfirmOpen(true);
      }
      
      setMessages([...updatedMessages, { role: 'assistant', content: displayMessage }]);
    } catch (error) {
      console.error(error);
      toast.error("AI Generation failed");
    } finally {
      setChatLoading(false);
    }
  };

  const copyPrompt = () => {
    const prompt = `--- CURSOR/DEVIN PROMPT ---
Context:
Project Name: ${project?.title}
Project Goal: ${project?.description}

Specification (${spec?.type}):
${content}

Task: Implement the technical structure defined in this specification.
Focus: ${spec?.title}
Instructions: Strictly follow the technical decisions, folder structure, and rationale provided above.
--- END PROMPT ---`;
    
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied to clipboard!");
  };

  if (loading) return <div>Loading spec...</div>;

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBackAndSave} className="p-2 hover:bg-slate-900 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </Button>
          <div className="flex items-center gap-3">
             {spec?.status === 'completed' && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-1 h-5 text-[9px]">READY</Badge>}
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                 <FileText className="w-4 h-4 text-orange-500" />
               </div>
               <h1 className="text-lg font-bold tracking-tight">{title}</h1>
               <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-slate-500 hover:text-orange-500 hover:bg-orange-500/10 rounded-md"
                onClick={() => {
                  setNewTitle(title);
                  setIsEditingTitle(true);
                }}
               >
                 <Pencil className="w-3.5 h-3.5" />
               </Button>
             </div>
             {hasUnsavedChanges && <span className="text-[10px] text-orange-500 font-bold animate-pulse">● UNSAVED</span>}
          </div>
        </div>

        <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle>Edit Spec Name</DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter a new name for this specification.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Spec name..."
                className="bg-slate-950 border-slate-800 text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateTitle();
                }}
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsEditingTitle(false)} className="text-slate-400">Cancel</Button>
              <Button onClick={handleUpdateTitle} disabled={saving} className="bg-orange-500 hover:bg-orange-600">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={copyPrompt}
            className="border-slate-800 hover:bg-slate-900 text-xs font-semibold uppercase tracking-wider gap-2 px-6"
          >
            <Terminal className="w-4 h-4 text-orange-500" />
            Copy Prompt
          </Button>
          <Button 
            onClick={() => handleSave(content, true)} 
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 font-bold gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Spec
          </Button>
        </div>
      </header>

      {/* Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor vs Preview */}
        <div className="flex-1 overflow-hidden flex flex-col border-r border-slate-800">
          <Tabs defaultValue="editor" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-2 border-b border-slate-900 flex justify-between items-center bg-slate-950/50">
              <TabsList className="bg-slate-900 h-9 p-1">
                <TabsTrigger value="editor" className="data-[state=active]:bg-slate-800 text-xs gap-2">
                  <Code className="w-3.5 h-3.5" /> Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-slate-800 text-xs gap-2">
                  <Eye className="w-3.5 h-3.5" /> Preview
                </TabsTrigger>
              </TabsList>
              

            </div>

            <TabsContent value="editor" className="flex-1 m-0 p-0 overflow-hidden">
              <Textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full p-8 font-mono text-sm bg-transparent border-none focus-visible:ring-0 resize-none selection:bg-orange-500/20"
                placeholder="# Describe your technical specification..."
              />
            </TabsContent>
            
            <TabsContent value="preview" className="flex-1 m-0 p-0 overflow-auto">
              <div className="max-w-3xl mx-auto p-12 prose prose-invert prose-orange prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-orange-500">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* AI Assistant Sidebar */}
        <aside className="w-96 border-l border-slate-800 bg-slate-950/50 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Spec Generator</h2>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="text-center py-10 space-y-4">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Start AI Interview</p>
                    <p className="text-xs text-slate-500">I'll ask questions to help you build a bullet-proof {spec?.type} spec.</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-orange-500 font-bold"
                    onClick={() => {
                      setInput(`Help me build the ${spec?.type} specification for this project.`);
                      setTimeout(handleSendMessage, 100);
                    }}
                  >
                    Launch Conversation
                  </Button>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user' ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-slate-900 text-slate-300 rounded-tl-none border border-slate-800'
                  }`}>
                    {m.role === 'user' ? (
                      m.content
                    ) : (
                      <div className="prose prose-invert prose-orange prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 animate-pulse flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 space-y-4">
              <div className="flex gap-2">
                <Textarea 
                  placeholder="Type your requirements..."
                  className="min-h-[80px] bg-slate-900/50 border-slate-800 text-xs p-3 rounded-xl resize-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  size="icon" 
                  className="h-auto aspect-square bg-orange-500 hover:bg-orange-600 self-stretch"
                  onClick={handleSendMessage}
                  disabled={chatLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mb-4">
              <BrainCircuit className="w-6 h-6 text-orange-500" />
            </div>
            <DialogTitle className="text-xl">Apply AI Proposal?</DialogTitle>
            <DialogDescription className="text-slate-400 mt-2">
              The AI has generated a new draft for your <span className="text-orange-500 font-bold">{spec?.type}</span> specification. 
              Review the chat for details. This will update your current editor content.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => setIsConfirmOpen(false)} 
              className="flex-1 sm:flex-none text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setContent(pendingContent);
                setIsConfirmOpen(false);
                toast.success("Draft updated! Don't forget to save.");
              }} 
              className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 font-bold"
            >
              Process & Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
