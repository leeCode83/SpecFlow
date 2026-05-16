import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmProposalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: () => void;
  specType?: string;
}

/**
 * ConfirmProposal Component
 * Modal dialog to confirm applying an AI-generated specification proposal.
 */
export function ConfirmProposal({
  isOpen,
  onOpenChange,
  onApply,
  specType
}: ConfirmProposalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground max-w-lg">
        <DialogHeader>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <BrainCircuit className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Apply AI Proposal?</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            The AI has generated a new draft for your <span className="text-primary font-bold">{specType || 'Custom'}</span> specification. 
            Review the chat for details. This will update your current editor content.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 pt-4">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)} 
            className="flex-1 sm:flex-none text-muted-foreground hover:bg-muted"
          >
            Cancel
          </Button>
          <Button 
            onClick={onApply} 
            className="flex-1 sm:flex-none bg-primary hover:bg-brand/90 font-bold"
          >
            Process & Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
