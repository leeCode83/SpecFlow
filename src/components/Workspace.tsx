import React, { useState, useCallback } from 'react';
import { LayoutGrid, HardDrive, Activity, Github } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useWorkspaceData } from '@/hooks/useWorkspaceData';
import { Project } from '@/lib/types';
import { useParams, useNavigate } from 'react-router-dom';
import { updateProject } from '@/lib/supabase/supabase-projects';
import { toast } from 'sonner';

import { WorkspaceHeader } from './workspace/WorkspaceHeader';
import { WorkspaceHero } from './workspace/WorkspaceHero';
import { SpecList } from './workspace/SpecList';
import { TeamList } from './workspace/TeamList';
import { LogPanel } from './workspace/LogPanel';
import { FileList } from './workspace/FileList';
import { InviteMemberModal } from './workspace/InviteMemberModal';
import { GithubViewer } from './workspace/GithubViewer';
import { RenameProjectDialog } from './workspace/RenameProjectDialog';

export function Workspace() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const onBack = () => navigate('/dashboard');
  const onSelectSpec = (id: string) => navigate(`/projects/${projectId}/spec/${id}`);

  if (!projectId) {
    return <div className="min-h-screen bg-background" />;
  }
  const {
    project,
    specs,
    files,
    logs,
    loading,
    currentUser,
    logPage,
    setLogPage,
    logTotalPages,
    handleCreateSpec,
    handleDeleteSpec,
    handleRenameSpec,
    handleFileUpload,
    deleteFile,
    addMember,
    removeMember
  } = useWorkspaceData(projectId);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [localProject, setLocalProject] = useState<Project | null>(project);
  const isOwner = (localProject?.user_id ?? project?.user_id) === currentUser?.id;

  const handleRenameProject = async (newTitle: string) => {
    if (!localProject) return;
    try {
      await updateProject(localProject.id, { title: newTitle });
      setLocalProject({ ...localProject, title: newTitle });
      toast.success('Project renamed successfully');
    } catch {
      toast.error('Failed to rename project');
      throw new Error('Failed to rename');
    }
  };

  const handleProjectUpdate = useCallback((updated: Project) => {
    setLocalProject(updated);
  }, []);

  React.useEffect(() => {
    if (project) setLocalProject(project);
  }, [project]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LayoutGrid className="w-8 h-8 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <WorkspaceHeader
        project={localProject}
        onBack={onBack}
        onCreateSpec={(type) => handleCreateSpec(type, onSelectSpec)}
        onRenameProject={() => setRenameDialogOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-20">
        <WorkspaceHero
          project={localProject}
          specs={specs}
          files={files}
          teamCount={(localProject?.teammates?.length || 0) + 1}
        />

        <section>
          <SpecList
            specs={specs}
            onSelectSpec={onSelectSpec}
            onRenameSpec={async (spec) => {
              const newTitle = prompt("Enter new title", spec.title);
              if (newTitle && newTitle !== spec.title) {
                await handleRenameSpec(spec, newTitle);
              }
            }}
            onDeleteSpec={handleDeleteSpec}
          />
        </section>

        <section>
          <TeamList
            project={localProject}
            isOwner={isOwner}
            currentUserId={currentUser?.id}
            onAddMember={addMember}
            onRemoveMember={removeMember}
            onOpenInviteModal={() => setInviteModalOpen(true)}
          />
        </section>

        <section>
          <Tabs defaultValue="storage" className="w-full">
            <TabsList className="bg-card p-1 border border-border rounded-2xl w-full justify-start overflow-x-auto no-scrollbar">
              <TabsTrigger value="storage" className="gap-2 rounded-xl px-6 data-[state=active]:bg-muted">
                <HardDrive className="w-4 h-4" />
                Storage
              </TabsTrigger>
              <TabsTrigger value="github" className="gap-2 rounded-xl px-6 data-[state=active]:bg-muted">
                <Github className="w-4 h-4" />
                GitHub
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2 rounded-xl px-6 data-[state=active]:bg-muted">
                <Activity className="w-4 h-4" />
                Activity Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="storage" className="mt-6 space-y-6">
              <FileList
                files={files}
                onUpload={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) await handleFileUpload(file);
                }}
                onDelete={deleteFile}
                isOwner={isOwner}
                currentUserId={currentUser?.id}
              />
            </TabsContent>

            <TabsContent value="github" className="mt-6 space-y-6">
              {localProject && <GithubViewer project={localProject} onProjectUpdate={handleProjectUpdate} />}
            </TabsContent>

            <TabsContent value="activity" className="mt-6 space-y-6">
              <LogPanel
                logs={logs}
                page={logPage}
                totalPages={logTotalPages}
                onPageChange={setLogPage}
              />
            </TabsContent>
          </Tabs>
        </section>
      </main>

      {inviteModalOpen && localProject && (
        <InviteMemberModal
          projectId={localProject.id}
          isOwner={isOwner}
          onClose={() => setInviteModalOpen(false)}
        />
      )}

      {localProject && (
        <RenameProjectDialog
          open={renameDialogOpen}
          onOpenChange={setRenameDialogOpen}
          currentTitle={localProject.title}
          onRename={handleRenameProject}
        />
      )}
    </div>
  );
}
