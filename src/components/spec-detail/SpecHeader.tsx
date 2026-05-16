import React, { useState } from 'react';
import { ChevronLeft, Save, Terminal, Loader2, FileText, Pencil } from 'lucide-react';
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
  onBack: () => void;
  onSave: () => void;
  onUpdateTitle: (newTitle: string) => Promise<boolean>;
  content: string;
}

export function SpecHeader({
  spec,
  project,
  title,
  hasUnsavedChanges,
  saving,
  onBack,
  onSave,
  onUpdateTitle,
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
    <header className="border-b border-border bg-background/50 backdrop-blur-md p-4 flex items-center justify-between z-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-card rounded-xl">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <div className="flex items-center gap-3">
           {spec?.status === 'completed' && (
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-1 h-5 text-[9px]">
               READY
             </Badge>
           )}
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
             </div>
             <h1 className="text-lg font-bold tracking-tight">{title}</h1>
             <Button 
              variant="ghost" 
              size="icon" 
               className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md"
              onClick={() => {
                setNewTitle(title);
                setIsEditingTitle(true);
              }}
             >
               <Pencil className="w-3.5 h-3.5" />
             </Button>
           </div>
           {hasUnsavedChanges && (
              <span className="text-[10px] text-primary font-bold animate-pulse">● UNSAVED</span>
           )}
        </div>
      </div>

      <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Edit Spec Name</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter a new name for this specification.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Spec name..."
              className="bg-background border-border text-foreground"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditingTitle(false)} className="text-muted-foreground">Cancel</Button>
            <Button onClick={handleTitleSubmit} disabled={saving} className="bg-primary hover:bg-brand/90">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={copyPrompt}
          className="border-border hover:bg-card text-xs font-semibold uppercase tracking-wider gap-2 px-6"
        >
          <Terminal className="w-4 h-4 text-primary" />
          Copy Prompt
        </Button>
        <Button 
          onClick={onSave} 
          disabled={saving}
          className="bg-primary hover:bg-brand/90 font-bold gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Spec
        </Button>
      </div>
    </header>
  );
}
