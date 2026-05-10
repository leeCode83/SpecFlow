import React, { useState } from 'react';
import { Users, User, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Project } from '@/lib/types';

interface TeamListProps {
  project: Project | null;
  isOwner: boolean;
  currentUserId?: string;
  onAddMember: (email: string) => Promise<void>;
  onRemoveMember: (uuid: string) => Promise<void>;
}

/**
 * TeamList Component
 * Manages the list of project members and allows the owner to add/remove teammates.
 */
export function TeamList({ 
  project, 
  isOwner, 
  currentUserId, 
  onAddMember, 
  onRemoveMember 
}: TeamListProps) {
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const handleAdd = async () => {
    if (!newMemberEmail.trim()) return;
    await onAddMember(newMemberEmail);
    setNewMemberEmail('');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-2 flex items-center gap-2">
        <Users className="w-3 h-3" />
        Project Team
      </h3>
      <div className="bg-slate-900/30 rounded-2xl border border-slate-800/50 p-4 space-y-4">
        <div className="space-y-3">
          {/* Owner Entry */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/20 border border-slate-800/40">
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">Owner</p>
              <p className="text-[10px] text-slate-500 truncate">
                {project?.user_id === currentUserId ? 'You' : 'Founder'}
              </p>
            </div>
          </div>

          {/* Teammates List */}
          {project?.teammates?.map(teammateId => (
            <div key={teammateId} className="flex items-center gap-3 p-2 group">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{teammateId.substring(0, 8)}...</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Member</p>
              </div>
              {isOwner && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onRemoveMember(teammateId)}
                  className="opacity-0 group-hover:opacity-100 h-7 w-7 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Add Member Section */}
        {isOwner && (
          <div className="pt-2 border-t border-slate-800/50 space-y-2">
            <p className="text-[9px] font-bold text-slate-500 uppercase text-center">Add Teammate</p>
            <div className="flex gap-2">
              <Input 
                placeholder="Email address..." 
                className="h-8 text-xs bg-slate-950 border-slate-800 rounded-lg"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
              <Button onClick={handleAdd} size="icon" className="h-8 w-8 shrink-0 bg-slate-800 hover:bg-slate-700">
                <UserPlus className="w-3.5 h-3.5 text-orange-500" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
