import React, { useState, useEffect, useRef } from 'react';
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
  Filter,
  Shield,
  Database,
  Monitor,
  Brain,
  Server,
  Zap,
  Github,
  Users,
  HardDrive,
  Activity,
  Trash2,
  UserPlus,
  ExternalLink,
  Upload,
  User,
  X,
  PlusCircle,
  UserMinus,
  FilePlus,
  GitBranch
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/supabase';
import { getProjectById, updateProject } from '@/lib/supabase/supabase-projects';
import { getSpecsByProjectId, createSpec } from '@/lib/supabase/supabase-specs';
import { getFilesByProjectId, createProjectFile, deleteProjectFile } from '@/lib/supabase/supabase-files';
import { getLogsByProjectId, logProjectEvent } from '@/lib/supabase/supabase-logs';
import { Project, Spec, SpecType, ProjectFile, ProjectLog } from '@/lib/types';
import { toast } from 'sonner';
import { SPEC_TEMPLATES } from '@/constants/spec-templates';

interface WorkspaceProps {
  projectId: string;
  onSelectSpec: (id: string) => void;
  onBack: () => void;
}

const SPEC_TYPES: SpecType[] = ['Auth', 'API', 'Frontend', 'AI', 'Infrastructure', 'Custom'];

const TYPE_ICONS: Record<SpecType, any> = {
  Auth: Shield,
  API: Database,
  Frontend: Monitor,
  AI: Brain,
  Infrastructure: Server,
  Custom: Zap
};

export function Workspace({ projectId, onSelectSpec, onBack }: WorkspaceProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [logs, setLogs] = useState<ProjectLog[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [creationLoading, setCreationLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  // States for new features
  const [editingGithub, setEditingGithub] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [uploading, setUploading] = useState(false);
  const [logFilter, setLogFilter] = useState({ user: 'All', action: 'All' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
    fetchData();
  }, [projectId]);

  const logAction = async (action: string, details: any) => {
    if (!currentUser) return;
    try {
      await logProjectEvent(projectId, action, details, currentUser.id);
      fetchLogs();
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  };

  const fetchData = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [projectData, specsData] = await Promise.all([
        getProjectById(projectId),
        getSpecsByProjectId(projectId)
      ]);

      setProject(projectData);
      setGithubUrl(projectData.github_url || '');
      setSpecs(specsData);

      fetchFiles();
      fetchLogs();
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast.error("Failed to load workspace data");
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const data = await getFilesByProjectId(projectId);
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const data = await getLogsByProjectId(projectId);
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const updateGithubUrl = async () => {
    try {
      await updateProject(projectId, { github_url: githubUrl });
      setProject(p => p ? { ...p, github_url: githubUrl } : null);
      setEditingGithub(false);
      logAction('Update GitHub', { url: githubUrl });
      toast.success("GitHub URL updated");
    } catch (error) {
      toast.error("Failed to update GitHub URL");
    }
  };

  const addMember = async () => {
    if (!newMemberEmail || !project) return;
    try {
      const currentTeammates = project.teammates || [];
      const updatedTeammates = [...currentTeammates, newMemberEmail];
      
      await updateProject(projectId, { teammates: updatedTeammates });
        
      setProject({ ...project, teammates: updatedTeammates });
      setNewMemberEmail('');
      logAction('Add Member', { email: newMemberEmail });
      toast.success("Teammate added");
    } catch (error) {
      toast.error("Failed to add teammate. Ensure it is a valid UUID.");
    }
  };

  const removeMember = async (uuid: string) => {
    if (!project) return;
    try {
      const updatedTeammates = (project.teammates || []).filter(id => id !== uuid);
      await updateProject(projectId, { teammates: updatedTeammates });
        
      setProject({ ...project, teammates: updatedTeammates });
      logAction('Remove Member', { uuid });
      toast.success("Teammate removed");
    } catch (error) {
      toast.error("Failed to remove teammate");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setUploading(true);
    try {
      const fileName = `${projectId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('project-assets').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('project-assets').getPublicUrl(fileName);

      const fileData = await createProjectFile({
        project_id: projectId,
        name: file.name,
        url: publicUrl,
        size: file.size,
        type: file.type,
        user_id: currentUser.id
      });

      setFiles([fileData, ...files]);
      logAction('Upload File', { filename: file.name, size: file.size });
      toast.success("File uploaded");
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (file: ProjectFile) => {
    try {
      // Storage deletion usually requires more permissions/exact path
      const path = file.url.split('project-assets/')[1];
      if (path) await supabase.storage.from('project-assets').remove([path]);
      
      await deleteProjectFile(file.id);
      setFiles(files.filter(f => f.id !== file.id));
      logAction('Delete File', { filename: file.name });
      toast.success("File deleted");
    } catch (error) {
      toast.error("Failed to delete file");
    }
  };

  const handleCreateSpec = async (type: SpecType) => {
    setCreationLoading(true);
    try {
      const initialContent = SPEC_TEMPLATES[type] || `# New ${type} Specification\n\nClick "Generate with AI" to start the conversation and build this spec.`;
      
      const data = await createSpec({
        project_id: projectId,
        title: `New ${type} Spec`,
        type,
        content: initialContent,
        status: 'draft'
      });

      setSpecs([data, ...specs]);
      logAction('Create Spec', { title: data.title, type: type });
      onSelectSpec(data.id);
      toast.success("Spec created");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create spec");
    } finally {
      setCreationLoading(false);
    }
  };

  const isOwner = project?.user_id === currentUser?.id;
  const uniqueUsers = Array.from(new Set(logs.map(l => l.user_id).filter(Boolean)));
  const actions = Array.from(new Set(logs.map(l => l.action).filter(Boolean)));

  const filteredLogs = logs.filter(l => 
    (logFilter.user === 'All' || l.user_id === logFilter.user) &&
    (logFilter.action === 'All' || l.action === logFilter.action)
  );

  const getLogVisuals = (action: string) => {
    switch (action) {
      case 'Create Spec': return { icon: PlusCircle, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/20' };
      case 'Update GitHub': return { icon: GitBranch, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/20' };
      case 'Add Member': return { icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/20' };
      case 'Remove Member': return { icon: UserMinus, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/20' };
      case 'Upload File': return { icon: FilePlus, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/20' };
      case 'Delete File': return { icon: Trash2, color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/20' };
      default: return { icon: Activity, color: 'text-slate-400', bg: 'bg-slate-800/50', border: 'border-slate-800' };
    }
  };

  const renderLogDetails = (log: ProjectLog) => {
    const details = log.details || {};
    
    switch (log.action) {
      case 'Create Spec':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-slate-200">
              Generated a new <span className="font-bold text-orange-400">{details.type || 'Custom'}</span> specification
            </p>
            <p className="text-xs text-slate-400">Title: "{details.title || 'Untitled'}"</p>
          </div>
        );
      case 'Update GitHub':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-slate-200">Linked a new GitHub repository</p>
            <p className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 w-fit truncate max-w-xs">{details.url || 'No URL'}</p>
          </div>
        );
      case 'Add Member':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-slate-200">Added a new contributor to the team</p>
            <p className="text-xs text-emerald-400 font-medium">{details.email || details.uuid || 'Unknown User'}</p>
          </div>
        );
      case 'Remove Member':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-slate-200 text-red-300/80">Revoked teammate access</p>
            <p className="text-[10px] text-slate-500">Member ID: {details.uuid || 'N/A'}</p>
          </div>
        );
      case 'Upload File':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-slate-200">Uploaded project asset: <span className="text-cyan-400 font-medium">{details.filename || 'File'}</span></p>
            {details.size && <p className="text-[10px] text-slate-500 italic">File Size: {(details.size / 1024 / 1024).toFixed(2)} MB</p>}
          </div>
        );
      case 'Delete File':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-slate-400">Deleted asssed from storage: <span className="text-rose-400/80 line-through">{details.filename}</span></p>
          </div>
        );
      default:
        // Generic fallback that avoids curly braces if details is a simple object
        const message = details.message || (typeof details === 'string' ? details : null);
        return (
          <div className="flex flex-col gap-1 italic text-slate-400 text-xs">
            {message ? <p>{message}</p> : <p>Performed {log.action || 'an action'}</p>}
          </div>
        );
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LayoutGrid className="w-8 h-8 animate-pulse text-orange-500" />
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-slate-900 rounded-xl w-fit">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight truncate">{project?.title}</h1>
          <div className="flex items-center gap-3 mt-1 text-slate-500 text-sm">
            <Badge variant="outline" className="bg-orange-500/5 text-orange-500 border-orange-500/20">
              {project?.mode}
            </Badge>
            <span>•</span>
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4" />
              {project?.github_url ? (
                <a href={project.github_url} target="_blank" rel="noreferrer" className="hover:text-orange-500 transition-colors underline flex items-center gap-1">
                  Repository <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="italic opacity-60">No repository linked</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editingGithub ? (
            <div className="flex items-center gap-2 bg-slate-900 p-1 pr-1 rounded-xl border border-slate-800">
              <Input 
                value={githubUrl} 
                onChange={(e) => setGithubUrl(e.target.value)} 
                placeholder="https://github.com/..."
                className="bg-transparent border-none focus-visible:ring-0 text-xs w-48"
              />
              <Button size="sm" onClick={updateGithubUrl} className="bg-orange-500 text-xs h-7 px-3">Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingGithub(false)} className="text-xs h-7 px-2">Cancel</Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setEditingGithub(true)} className="gap-2 border-slate-800 text-xs py-1 h-9">
              <Github className="w-4 h-4" />
              {project?.github_url ? 'Change Repo' : 'Link GitHub'}
            </Button>
          )}
          <Button onClick={() => setShowAddMenu(true)} className="bg-orange-500 hover:bg-orange-600 gap-2 font-bold px-6 h-9">
            <Plus className="w-4 h-4" />
            New Spec
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Spec Collection & Team */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Spec Collection</h3>
              <div className="relative">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7 rounded-lg hover:bg-slate-800 text-orange-500"
                  onClick={() => setShowAddMenu(!showAddMenu)}
                >
                  <Plus className="w-4 h-4" />
                </Button>

                {showAddMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
                    <div className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 overflow-hidden backdrop-blur-xl">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 px-3 py-2 border-b border-slate-800 mb-1">
                        Select Template
                      </p>
                      {SPEC_TYPES.map(type => {
                        const Icon = TYPE_ICONS[type];
                        return (
                          <button
                            key={type}
                            onClick={() => {
                              handleCreateSpec(type);
                              setShowAddMenu(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-3"
                          >
                            <Icon className="w-3.5 h-3.5 text-orange-500" />
                            <span>{type}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-slate-900/30 rounded-2xl border border-slate-800/50 p-2 space-y-1">
              {specs.map(spec => (
                <button
                  key={spec.id}
                  onClick={() => onSelectSpec(spec.id)}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-900/60 transition-all flex items-center gap-3 group"
                >
                  <div className={`p-1.5 rounded-lg ${
                    spec.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {TYPE_ICONS[spec.type] ? React.createElement(TYPE_ICONS[spec.type], { className: "w-3.5 h-3.5" }) : <FileText className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-slate-300 group-hover:text-white transition-colors">{spec.title}</p>
                    <p className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Badge variant="outline" className="text-[8px] px-1 py-0 h-3 border-slate-800">{spec.type}</Badge>
                      <span>•</span>
                      {spec.status === 'completed' ? 'Ready' : 'Draft'}
                    </p>
                  </div>
                </button>
              ))}
              {specs.length === 0 && <p className="text-[10px] text-slate-600 text-center py-4">No specs yet</p>}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-2 flex items-center gap-2">
              <Users className="w-3 h-3" />
              Project Team
            </h3>
            <div className="bg-slate-900/30 rounded-2xl border border-slate-800/50 p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/20 border border-slate-800/40">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">Owner</p>
                    <p className="text-[10px] text-slate-500 truncate">{project?.user_id === currentUser?.id ? 'You' : 'Founder'}</p>
                  </div>
                </div>
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
                        onClick={() => removeMember(teammateId)}
                        className="opacity-0 group-hover:opacity-100 h-7 w-7 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
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
                    <Button onClick={addMember} size="icon" className="h-8 w-8 shrink-0 bg-slate-800 hover:bg-slate-700">
                      <UserPlus className="w-3.5 h-3.5 text-orange-500" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="storage" className="w-full">
            <TabsList className="bg-slate-900/50 p-1 border border-slate-800 rounded-2xl w-full justify-start overflow-x-auto no-scrollbar">
              <TabsTrigger value="storage" className="gap-2 rounded-xl px-6 data-[state=active]:bg-slate-800">
                <HardDrive className="w-4 h-4" />
                Storage
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2 rounded-xl px-6 data-[state=active]:bg-slate-800">
                <Activity className="w-4 h-4" />
                Activity Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="storage" className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Project Assets</h2>
                  <p className="text-slate-500 text-sm">Manage shared documents, images, and resources.</p>
                </div>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-orange-500 hover:bg-orange-600 font-bold gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload File'}
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map(file => (
                  <Card key={file.id} className="bg-slate-900/40 border-slate-800 p-4 rounded-2xl hover:bg-slate-900/60 transition-all flex flex-col group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                        {file.type.includes('image') ? <Monitor className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                      </div>
                      <div className="flex items-center gap-1">
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-slate-400")}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        { (isOwner || file.user_id === currentUser?.id) && (
                          <Button variant="ghost" size="icon" onClick={() => deleteFile(file)} className="h-8 w-8 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-sm truncate mb-1">{file.name}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                      <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      <span>{new Date(file.created_at).toLocaleDateString()}</span>
                    </div>
                  </Card>
                ))}
                {files.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl space-y-4">
                    <HardDrive className="w-10 h-10 text-slate-800 mx-auto" />
                    <p className="text-slate-500 text-sm">No files uploaded yet. Shared assets will appear here.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Activity Log</h2>
                  <p className="text-slate-500 text-sm">Detailed history of actions performed within this project.</p>
                </div>
                <div className="flex gap-2">
                  <select 
                    className="bg-slate-900 border-slate-800 text-xs rounded-xl px-3 py-2 outline-none focus:ring-1 ring-orange-500/50"
                    value={logFilter.user}
                    onChange={(e) => setLogFilter({...logFilter, user: e.target.value})}
                  >
                    <option value="All">All Users</option>
                    {uniqueUsers.map(email => <option key={email} value={email}>{email}</option>)}
                  </select>
                  <select 
                    className="bg-slate-900 border-slate-800 text-xs rounded-xl px-3 py-2 outline-none focus:ring-1 ring-orange-500/50"
                    value={logFilter.action}
                    onChange={(e) => setLogFilter({...logFilter, action: e.target.value})}
                  >
                    <option value="All">All Actions</option>
                    {actions.map(action => <option key={action} value={action}>{action}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-slate-900/30 rounded-3xl border border-slate-800/50 overflow-hidden">
                <div className="divide-y divide-slate-800/50">
                  {filteredLogs.map(log => {
                    const visuals = getLogVisuals(log.action);
                    return (
                      <div key={log.id} className="p-5 flex items-start gap-4 hover:bg-slate-800/20 transition-colors group">
                        <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105 ${visuals.bg} ${visuals.color} ${visuals.border}`}>
                          <visuals.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0 border-transparent ${visuals.bg} ${visuals.color}`}>
                              {log.action}
                            </Badge>
                            <span className="text-[10px] text-slate-600 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(log.created_at).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="text-xs mb-3">
                            {renderLogDetails(log)}
                          </div>

                          <div className="flex items-center gap-2 text-[9px] text-slate-500">
                            <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center">
                              <User className="w-2.5 h-2.5" />
                            </div>
                            <span>ID: {log.user_id?.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredLogs.length === 0 && (
                    <div className="py-20 text-center space-y-3">
                      <Activity className="w-8 h-8 text-slate-800 mx-auto" />
                      <p className="text-slate-500 text-sm">No activity records match your filters.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
