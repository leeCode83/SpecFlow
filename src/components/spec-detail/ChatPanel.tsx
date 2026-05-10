import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, FileSearch, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import { Message, Spec } from '@/lib/types';
import { SimilarSpec } from '@/lib/rag';

interface ChatPanelProps {
  messages: Message[];
  chatLoading: boolean;
  similarSpecs: SimilarSpec[];
  onSendMessage: (input: string) => Promise<void>;
  specType?: string;
}

/**
 * ChatPanel Component
 * Handles the AI chat interaction, message history, and memory match (RAG) results.
 */
export function ChatPanel({
  messages,
  chatLoading,
  similarSpecs,
  onSendMessage,
  specType
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || chatLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <aside className="w-96 border-l border-slate-800 bg-slate-950/50 flex flex-col overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Spec Generator</h2>
        </div>
      </div>

      {/* RAG Results (Memory Match) */}
      {similarSpecs.length > 0 && (
        <div className="p-3 border-b border-slate-800 bg-slate-900/30">
           <div className="flex items-center gap-2 mb-2">
             <FileSearch className="w-3.5 h-3.5 text-slate-400" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Memory Match</span>
           </div>
           <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
             {similarSpecs.map(s => (
               <div key={s.id} className="min-w-[140px] max-w-[140px] p-2 bg-slate-950 border border-slate-800 rounded-lg flex flex-col gap-1 shrink-0">
                 <div className="flex items-center justify-between gap-1">
                   <span className="text-[10px] font-medium text-slate-300 truncate" title={s.title}>{s.title}</span>
                   <Badge variant="outline" className="text-[9px] h-4 px-1 py-0 border-emerald-500/30 text-emerald-500 bg-emerald-500/10 leading-none flex items-center shrink-0">
                     {Math.round(s.similarity * 100)}%
                   </Badge>
                 </div>
                 <span className="text-[9px] text-slate-500 truncate">{s.type}</span>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Chat History */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="text-center py-10 space-y-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-orange-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold">Start AI Interview</p>
                <p className="text-xs text-slate-500">I'll ask questions to help you build a bullet-proof {specType || 'Custom'} spec.</p>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-orange-500 font-bold"
                onClick={() => onSendMessage(`Help me build the ${specType || 'Custom'} specification for this project.`)}
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

        {/* Input Area */}
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
                  handleSend();
                }
              }}
            />
            <Button 
              size="icon" 
              className="h-auto aspect-square bg-orange-500 hover:bg-orange-600 self-stretch"
              onClick={handleSend}
              disabled={chatLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
