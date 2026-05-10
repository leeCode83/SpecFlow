import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabase';
import { User } from '@supabase/supabase-js';
import { Project, Spec, ProjectFile, ProjectLog, SpecType } from '@/lib/types';
import { getSpecsByProjectId, createSpec, updateSpec, deleteSpec as deleteSpecService } from '@/lib/supabase/supabase-specs';
import { getFilesByProjectId, createProjectFile, deleteProjectFile } from '@/lib/supabase/supabase-files';
import { getLogsByProjectId, logProjectEvent } from '@/lib/supabase/supabase-logs';
import { updateProject } from '@/lib/supabase/supabase-projects';
import { SPEC_TEMPLATES } from '@/constants/spec-templates';
import { toast } from 'sonner';

/**
 * Custom hook to manage all data fetching and state for the Workspace.
 * Decouples data logic from UI components.
 */
export function useWorkspaceData(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [logs, setLogs] = useState<ProjectLog[]>([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [creationLoading, setCreationLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user ?? null);
    }
    getSession();
  }, []);

  useEffect(() => {
    if (projectId) {
      loadWorkspaceData();
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      loadLogs();
    }
  }, [projectId, logPage]);

  async function loadWorkspaceData() {
    setLoading(true);
    try {
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch specs and files in parallel
      const [specsData, filesData] = await Promise.all([
        getSpecsByProjectId(projectId),
        getFilesByProjectId(projectId)
      ]);

      setSpecs(specsData);
      setFiles(filesData);
    } catch (error) {
      console.error('Error loading workspace data:', error);
      toast.error('Failed to load workspace data');
    } finally {
      setLoading(false);
    }
  }

  async function loadLogs() {
    try {
      const { data, count } = await getLogsByProjectId(projectId, logPage, ITEMS_PER_PAGE);
      setLogs(data);
      if (count !== null) {
        setLogTotalPages(Math.max(1, Math.ceil(count / ITEMS_PER_PAGE)));
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  }

  const logAction = async (action: string, details: Record<string, unknown>) => {
    if (!currentUser) return;
    try {
      await logProjectEvent(projectId, action, details, currentUser.id);
      loadLogs();
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  };

  const handleCreateSpec = async (type: SpecType, onSelect: (id: string) => void) => {
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
      onSelect(data.id);
      toast.success("Spec created");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create spec");
    } finally {
      setCreationLoading(false);
    }
  };

  const handleDeleteSpec = async (spec: Spec) => {
    try {
      await deleteSpecService(spec.id);
      setSpecs(specs.filter(s => s.id !== spec.id));
      logAction('Delete Spec', { title: spec.title });
      toast.success("Spec deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete spec");
    }
  };

  const handleRenameSpec = async (spec: Spec, newTitle: string) => {
    if (!newTitle.trim()) return;
    try {
      await updateSpec(spec.id, { title: newTitle.trim() });
      setSpecs(specs.map(s => s.id === spec.id ? { ...s, title: newTitle.trim() } : s));
      logAction('Rename Spec', { oldTitle: spec.title, newTitle: newTitle.trim() });
      toast.success("Spec renamed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to rename spec");
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!currentUser) return;
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
      return publicUrl;
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (file: ProjectFile) => {
    try {
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

  const updateGithubUrl = async (url: string) => {
    try {
      await updateProject(projectId, { github_url: url });
      setProject(p => p ? { ...p, github_url: url } : null);
      logAction('Update GitHub', { url });
      toast.success("GitHub URL updated");
    } catch (error) {
      toast.error("Failed to update GitHub URL");
    }
  };

  const addMember = async (email: string) => {
    if (!email || !project) return;
    try {
      const currentTeammates = project.teammates || [];
      const updatedTeammates = [...currentTeammates, email];
      await updateProject(projectId, { teammates: updatedTeammates });
      setProject({ ...project, teammates: updatedTeammates });
      logAction('Add Member', { email });
      toast.success("Teammate added");
    } catch (error) {
      toast.error("Failed to add teammate");
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

  return {
    project,
    specs,
    files,
    logs,
    logPage,
    logTotalPages,
    currentUser,
    loading,
    creationLoading,
    uploading,
    setLogPage,
    handleCreateSpec,
    handleDeleteSpec,
    handleRenameSpec,
    handleFileUpload,
    deleteFile,
    updateGithubUrl,
    addMember,
    removeMember,
    refreshLogs: loadLogs,
  };
}
