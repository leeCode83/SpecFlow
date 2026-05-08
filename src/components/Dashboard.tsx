import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Clock, ExternalLink, Trash2, Rocket, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '../lib/supabase';
import { Project } from '../types';
import { toast } from 'sonner';

interface DashboardProps {
  onSelectProject: (id: string) => void;
}

export function Dashboard({ onSelectProject }: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setProjects(projects.filter(p => p.id !== id));
      toast.success("Project deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete project");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Your Projects</h1>
          <p className="text-slate-500">Manage your product specs and ideation workspaces.</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" className="gap-2 border-slate-800">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl space-y-4">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-500">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">No projects yet</h3>
            <p className="text-slate-500">Start by describing your idea on the landing page.</p>
          </div>
          <Button onClick={() => window.location.reload()} className="bg-orange-500 hover:bg-orange-600">
            Get Started
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              layoutId={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              onClick={() => onSelectProject(project.id)}
              className="cursor-pointer group"
            >
              <Card className="h-full bg-slate-900/50 hover:bg-slate-900 border-slate-800 hover:border-orange-500/30 transition-all p-6 rounded-2xl flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover:text-orange-500 transition-colors">
                      <Rocket className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className={`${
                      project.mode === 'Hackathon' ? 'bg-orange-500/10 text-orange-500' :
                      project.mode === 'Startup' ? 'bg-emerald-500/10 text-emerald-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {project.mode}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold truncate">{project.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(project.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => deleteProject(project.id, e)}
                      className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
