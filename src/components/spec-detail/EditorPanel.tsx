import React from 'react';
import { Code, Eye } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';

interface EditorPanelProps {
  content: string;
  onContentChange: (value: string) => void;
}

/**
 * EditorPanel Component
 * Provides a split view with a Markdown editor and a live preview.
 */
export function EditorPanel({ content, onContentChange }: EditorPanelProps) {
  return (
    <div className="flex-1 overflow-hidden flex flex-col border-r border-border">
      <Tabs defaultValue="editor" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-2 border-b border-card flex justify-between items-center bg-background/50">
          <TabsList className="bg-card h-9 p-1">
            <TabsTrigger value="editor" className="data-[state=active]:bg-muted text-xs gap-2">
              <Code className="w-3.5 h-3.5" /> Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-muted text-xs gap-2">
              <Eye className="w-3.5 h-3.5" /> Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="editor" className="flex-1 m-0 p-0 overflow-hidden">
          <Textarea 
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className="w-full h-full p-8 font-mono text-sm bg-transparent border-none focus-visible:ring-0 resize-none selection:bg-primary/30"
            placeholder="# Describe your technical specification..."
          />
        </TabsContent>
        
        <TabsContent value="preview" className="flex-1 m-0 p-0 overflow-auto">
          <div className="max-w-3xl mx-auto p-12 prose prose-invert prose-orange prose-p:leading-relaxed prose-pre:bg-card prose-pre:border prose-pre:border-border prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
