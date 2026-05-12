import React, { useState } from 'react';
import { ChevronLeft, Save, Terminal, Loader2, FileText, Pencil, GitPullRequest } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Project, Spec } from '@/lib/types';
import { toast } from 'sonner';

interface SpecHeaderProps {
  spec: Spec | null;
  project: Project | null;
  title: string;
  hasUnsavedChanges: boolean;
  saving: boolean;
  pushingPR: boolean;
  githubFullName: string | null;
  onBack: () => void;
  onSave: () => void;
  onUpdateTitle: (newTitle: string) => Promise<boolean>;
  onPushPR: () => void;
  content: string;
}

export function SpecHeader({
  spec,
  project,
  title,
  hasUnsavedChanges,
  saving,
  pushingPR,
  githubFullName,
  onBack,
  onSave,
  onUpdateTitle,
  onPushPR,
  content
}: SpecHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const handleTitleSubmit = async () => {
    const success = await onUpdateTitle(newTitle);
    if (success) setIsEditingTitle(false);
  };

  const copyPrompt = () => {
    const prompt = `--- CURSOR/DEVIN PROMPT ---
Context:
Project Name: ${project?.title}
Project Goal: ${project?.description}

Specification (${spec?.type}):
${content}

Task: Implement the technical structure defined in this specification.
Focus: ${title}
Instructions: Strictly follow the technical decisions, folder structure, and rationale provided above.
--- END PROMPT ---`;
    
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied to clipboard!");
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md p-4 flex items-center justify-between z-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-slate-900 rounded-xl">
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </Button>
        <div className="flex items-center gap-3">
           {spec?.status === 'completed' && (
             <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-1 h-5 text-[9px]">
               READY
             </Badge>
           )}
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
           {hasUnsavedChanges && (
             <span className="text-[10px] text-orange-500 font-bold animate-pulse">● UNSAVED</span>
           )}
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
                if (e.key === 'Enter') handleTitleSubmit();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditingTitle(false)} className="text-slate-400">Cancel</Button>
            <Button onClick={handleTitleSubmit} disabled={saving} className="bg-orange-500 hover:bg-orange-600">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2">
        {githubFullName && (
          <Button 
            variant="outline" 
            onClick={onPushPR}
            disabled={pushingPR}
            className="border-slate-800 hover:bg-slate-900 text-xs font-semibold uppercase tracking-wider gap-2 px-4"
          >
            {pushingPR ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitPullRequest className="w-4 h-4" />}
            Push PR
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={copyPrompt}
          className="border-slate-800 hover:bg-slate-900 text-xs font-semibold uppercase tracking-wider gap-2 px-6"
        >
          <Terminal className="w-4 h-4 text-orange-500" />
          Copy Prompt
        </Button>
        <Button 
          onClick={onSave} 
          disabled={saving}
          className="bg-orange-500 hover:bg-orange-600 font-bold gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Spec
        </Button>
      </div>
    </header>
  );
}
