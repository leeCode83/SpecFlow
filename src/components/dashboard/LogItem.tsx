import { motion } from 'motion/react';
import { Clock, PlusCircle, GitBranch, Edit2, UserPlus, UserMinus, FilePlus, Trash2, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProjectLog } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface LogItemProps {
  log: ProjectLog;
  projectName: string;
  index: number;
}

function getLogVisuals(action: string) {
  const act = (action || '').toUpperCase().replace(/_/g, ' ');
  if (act.includes('CREATE SPEC')) return { icon: PlusCircle, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/20' };
  if (act.includes('UPDATE GITHUB')) return { icon: GitBranch, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/20' };
  if (act.includes('EDIT SPEC')) return { icon: Edit2, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/20' };
  if (act.includes('ADD MEMBER')) return { icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/20' };
  if (act.includes('REMOVE MEMBER')) return { icon: UserMinus, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/20' };
  if (act.includes('UPLOAD FILE')) return { icon: FilePlus, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/20' };
  if (act.includes('DELETE FILE')) return { icon: Trash2, color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/20' };

  const palettes = [
    { color: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/20' },
    { color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500/20' },
    { color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/20' },
    { color: 'text-lime-400', bg: 'bg-lime-500/20', border: 'border-lime-500/20' },
    { color: 'text-teal-400', bg: 'bg-teal-500/20', border: 'border-teal-500/20' },
    { color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/20', border: 'border-fuchsia-500/20' },
    { color: 'text-violet-400', bg: 'bg-violet-500/20', border: 'border-violet-500/20' },
    { color: 'text-sky-400', bg: 'bg-sky-500/20', border: 'border-sky-500/20' }
  ];
  let hash = 0;
  for (let i = 0; i < act.length; i++) {
    hash = act.charCodeAt(i) + ((hash << 5) - hash);
  }
  return { icon: Activity, ...palettes[Math.abs(hash) % palettes.length] };
}

function renderLogDetails(log: ProjectLog) {
  const details = (log.details as any) || {};
  const action = log.action || '';
  const actUpper = action.toUpperCase().replace(/_/g, ' ');

  if (actUpper.includes('CREATE SPEC')) {
    return (
      <div className="flex flex-col gap-0.5">
        <p className="text-xs text-slate-300">
          Generated a new <span className="font-bold text-orange-400">{details.type || 'Custom'}</span> specification
        </p>
      </div>
    );
  }
  if (actUpper.includes('UPDATE GITHUB')) {
    return (
      <div className="flex flex-col gap-0.5">
        <p className="text-xs text-slate-300">Linked a new GitHub repository</p>
        {details.url && <p className="text-[10px] text-blue-400 truncate max-w-xs">{details.url}</p>}
      </div>
    );
  }
  if (actUpper.includes('EDIT SPEC')) {
    return <p className="text-xs text-slate-300">Updated specification content</p>;
  }
  if (actUpper.includes('ADD MEMBER')) {
    return (
      <p className="text-xs text-slate-300">
        Added <span className="text-emerald-400 font-medium">{details.email || details.uuid || 'a new member'}</span> to the team
      </p>
    );
  }
  if (actUpper.includes('REMOVE MEMBER')) {
    return <p className="text-xs text-slate-300">Revoked teammate access</p>;
  }
  if (actUpper.includes('UPLOAD FILE')) {
    return (
      <p className="text-xs text-slate-300">
        Uploaded <span className="text-cyan-400 font-medium">{details.filename || 'file'}</span>
        {details.size ? <> ({(details.size / 1024 / 1024).toFixed(2)} MB)</> : null}
      </p>
    );
  }
  if (actUpper.includes('DELETE FILE')) {
    return (
      <p className="text-xs text-slate-300">
        Deleted <span className="text-rose-400/80 line-through">{details.filename || 'file'}</span>
      </p>
    );
  }
  const message = details.message || (typeof details === 'string' ? details : null);
  return <p className="text-xs italic text-slate-400">{message || log.action || 'Performed an action'}</p>;
}

export function LogItem({ log, projectName, index }: LogItemProps) {
  const visuals = getLogVisuals(log.action);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 flex items-start gap-3 hover:bg-slate-800/30 transition-colors group"
    >
      <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105 ${visuals.bg} ${visuals.color} ${visuals.border}`}>
        <visuals.icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0 border-transparent ${visuals.bg} ${visuals.color}`}>
              {log.action}
            </Badge>
            <span className="text-xs font-semibold text-slate-300">{projectName}</span>
          </div>
          <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
          </span>
        </div>
        {renderLogDetails(log)}
      </div>
    </motion.div>
  );
}
