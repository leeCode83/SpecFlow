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
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
        <DialogHeader>
          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mb-4">
            <BrainCircuit className="w-6 h-6 text-orange-500" />
          </div>
          <DialogTitle className="text-xl">Apply AI Proposal?</DialogTitle>
          <DialogDescription className="text-slate-400 mt-2">
            The AI has generated a new draft for your <span className="text-orange-500 font-bold">{specType || 'Custom'}</span> specification. 
            Review the chat for details. This will update your current editor content.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 pt-4">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)} 
            className="flex-1 sm:flex-none text-slate-400 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button 
            onClick={onApply} 
            className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 font-bold"
          >
            Process & Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
