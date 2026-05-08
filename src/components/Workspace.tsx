import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Plus, 
  ChevronLeft, 
  Sparkles, 
  Settings, 
  MoreVertical,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '../lib/supabase';
import { Project, Spec, SpecType } from '../types';
import { toast } from 'sonner';
import { SPEC_TEMPLATES } from '../constants/spec-templates';

interface WorkspaceProps {
  projectId: string;
  onSelectSpec: (id: string) => void;
  onBack: () => void;
}

const SPEC_TYPES: SpecType[] = ['Auth', 'API', 'Frontend', 'AI', 'Infrastructure', 'Custom'];

export function Workspace({ projectId, onSelectSpec, onBack }: WorkspaceProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [loading, setLoading] = useState(true);
  const [creationLoading, setCreationLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, specRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('specs').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
      ]);

      if (projRes.error) throw projRes.error;
      if (specRes.error) throw specRes.error;

      setProject(projRes.data);
      setSpecs(specRes.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpec = async (type: SpecType) => {
    setCreationLoading(true);
    try {
      const initialContent = SPEC_TEMPLATES[type] || `# New ${type} Specification\n\nClick "Generate with AI" to start the conversation and build this spec.`;
      
      const { data, error } = await supabase.from('specs').insert({
        project_id: projectId,
        title: `New ${type} Spec`,
        type,
        content: initialContent,
        status: 'draft'
      }).select().single();

      if (error) throw error;
      setSpecs([data, ...specs]);
      onSelectSpec(data.id);
      toast.success("Spec created");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create spec");
    } finally {
      setCreationLoading(false);
    }
  };

  const filteredSpecs = specs.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LayoutGrid className="w-8 h-8 animate-pulse text-orange-500" />
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-slate-900 rounded-xl">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight truncate">{project?.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant="outline" className="bg-orange-500/5 text-orange-500 border-orange-500/20">
              {project?.mode}
            </Badge>
            <span className="text-slate-500 text-sm">•</span>
            <span className="text-slate-500 text-sm">{specs.length} specs generated</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 border-slate-800">
            <Settings className="w-4 h-4" />
            Config
          </Button>
          <Button onClick={() => handleCreateSpec('Custom')} className="bg-orange-500 hover:bg-orange-600 gap-2 font-bold px-6">
            <Plus className="w-4 h-4" />
            New Spec
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: New Spec Templates */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 px-2">Templates</h3>
            <div className="space-y-1">
              {SPEC_TYPES.map(type => (
                <button
                  key={type}
                  disabled={creationLoading}
                  onClick={() => handleCreateSpec(type)}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-900 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/5 border border-orange-500/10 flex items-center justify-center text-orange-500">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{type}</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Spec List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input 
                placeholder="Search specs..." 
                className="pl-10 bg-transparent border-none focus-visible:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')} className="hidden sm:block">
              <TabsList className="bg-transparent h-8 p-0">
                <TabsTrigger value="grid" className="data-[state=active]:bg-slate-800 rounded-lg p-2"><LayoutGrid className="w-4 h-4" /></TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-slate-800 rounded-lg p-2"><List className="w-4 h-4" /></TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-3"}>
            {filteredSpecs.map((spec) => (
              <motion.div
                key={spec.id}
                layoutId={spec.id}
                onClick={() => onSelectSpec(spec.id)}
                className="group cursor-pointer"
              >
                {viewMode === 'grid' ? (
                  <Card className="bg-slate-900/40 border-slate-800 p-5 rounded-2xl hover:border-orange-500/30 hover:bg-slate-900/60 transition-all flex items-center gap-4 border-l-4 border-l-transparent group-hover:border-l-orange-500">
                    <div className={`p-3 rounded-xl ${
                      spec.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {spec.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                         <h4 className="font-bold truncate">{spec.title}</h4>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{spec.type}</span>
                        <span className="text-slate-700">•</span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Clock className="w-3 h-3" />
                          {new Date(spec.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                    </Button>
                  </Card>
                ) : (
                  <Card className="bg-slate-900/40 border-slate-800 p-4 rounded-xl hover:border-orange-500/30 hover:bg-slate-900/60 transition-all flex items-center gap-6 border-l-2 border-l-transparent group-hover:border-l-orange-500">
                    <div className={`flex-shrink-0 p-2 rounded-lg ${
                      spec.status === 'completed' ? 'bg-emerald-500/5 text-emerald-500' : 'bg-slate-800/50 text-slate-500'
                    }`}>
                      {spec.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-sm">{spec.title}</h4>
                    </div>

                    <div className="flex items-center gap-8 text-xs">
                      <div className="w-24">
                        <Badge variant="outline" className="bg-slate-900 border-slate-800 text-slate-400 font-mono text-[9px] px-2 py-0">
                          {spec.type}
                        </Badge>
                      </div>

                      <div className="w-32 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${spec.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                        <span className={`uppercase tracking-tighter font-bold text-[9px] ${spec.status === 'completed' ? 'text-emerald-500' : 'text-slate-500'}`}>
                          {spec.status === 'completed' ? 'Ready' : 'Draft'}
                        </span>
                      </div>

                      <div className="w-32 text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(spec.created_at).toLocaleDateString()}</span>
                      </div>

                      <Sparkles className="w-4 h-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Card>
                )}
              </motion.div>
            ))}

            {filteredSpecs.length === 0 && (
              <div className="col-span-full py-20 text-center space-y-4">
                <FileText className="w-12 h-12 text-slate-800 mx-auto" />
                <p className="text-slate-500">No specs found. Create your first technical blueprint.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
