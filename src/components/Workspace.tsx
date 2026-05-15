import React, { useState, useCallback } from 'react';
import { LayoutGrid, HardDrive, Activity, Github } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useWorkspaceData } from '@/hooks/useWorkspaceData';
import { Project } from '@/lib/types';
import { useParams, useNavigate } from 'react-router-dom';

import { WorkspaceHeader } from './workspace/WorkspaceHeader';
import { WorkspaceHero } from './workspace/WorkspaceHero';
import { SpecList } from './workspace/SpecList';
import { TeamList } from './workspace/TeamList';
import { LogPanel } from './workspace/LogPanel';
import { FileList } from './workspace/FileList';
import { InviteMemberModal } from './workspace/InviteMemberModal';
import { GithubViewer } from './workspace/GithubViewer';

export function Workspace() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const onBack = () => navigate('/dashboard');
  const onSelectSpec = (id: string) => navigate(`/projects/${projectId}/spec/${id}`);

  if (!projectId) {
    return <div className="min-h-screen bg-slate-950" />;
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
  const [localProject, setLocalProject] = useState<Project | null>(project);
  const isOwner = (localProject?.user_id ?? project?.user_id) === currentUser?.id;

  const handleProjectUpdate = useCallback((updated: Project) => {
    setLocalProject(updated);
  }, []);

  React.useEffect(() => {
    if (project) setLocalProject(project);
  }, [project]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LayoutGrid className="w-8 h-8 animate-pulse text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <WorkspaceHeader
        project={localProject}
        onBack={onBack}
        onCreateSpec={(type) => handleCreateSpec(type, onSelectSpec)}
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
            <TabsList className="bg-slate-900/50 p-1 border border-slate-800 rounded-2xl w-full justify-start overflow-x-auto no-scrollbar">
              <TabsTrigger value="storage" className="gap-2 rounded-xl px-6 data-[state=active]:bg-slate-800">
                <HardDrive className="w-4 h-4" />
                Storage
              </TabsTrigger>
              <TabsTrigger value="github" className="gap-2 rounded-xl px-6 data-[state=active]:bg-slate-800">
                <Github className="w-4 h-4" />
                GitHub
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2 rounded-xl px-6 data-[state=active]:bg-slate-800">
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
    </div>
  );
}
