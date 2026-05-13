import React, { useState, useCallback } from 'react';
import { LayoutGrid, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { HardDrive, Activity, FileText, Github } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useWorkspaceData } from '@/hooks/useWorkspaceData';
import { Project } from '@/lib/types';

// Modular Components
import { WorkspaceHeader } from './workspace/WorkspaceHeader';
import { SpecList } from './workspace/SpecList';
import { LogPanel } from './workspace/LogPanel';
import { FileList } from './workspace/FileList';
import { TeamList } from './workspace/TeamList';
import { InviteMemberModal } from './workspace/InviteMemberModal';
import { GithubViewer } from './workspace/GithubViewer';

interface WorkspaceProps {
  projectId: string;
  onSelectSpec: (id: string) => void;
  onBack: () => void;
}

/**
 * Workspace Component
 * Main container for project management, including specs, files, and activity logs.
 */
export function Workspace({ projectId, onSelectSpec, onBack }: WorkspaceProps) {
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

  const [showAddMenu, setShowAddMenu] = useState(false);
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
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-slate-900 rounded-xl w-fit">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <WorkspaceHeader 
          project={localProject} 
          onNewSpec={() => setShowAddMenu(true)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-8">
          <SpecList 
            specs={specs}
            showAddMenu={showAddMenu}
            setShowAddMenu={setShowAddMenu}
            onCreateSpec={(type) => handleCreateSpec(type, onSelectSpec)}
            onSelectSpec={onSelectSpec}
            onRenameSpec={async (spec) => {
              const newTitle = prompt("Enter new title", spec.title);
              if (newTitle && newTitle !== spec.title) {
                await handleRenameSpec(spec, newTitle);
              }
            }}
            onDeleteSpec={handleDeleteSpec}
          />

          <TeamList 
            project={localProject}
            isOwner={isOwner}
            currentUserId={currentUser?.id}
            onAddMember={addMember}
            onRemoveMember={removeMember}
            onOpenInviteModal={() => setInviteModalOpen(true)}
          />
        </div>

        <div className="lg:col-span-3">
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
        </div>
      </div>

      {/* Project Description */}
      {localProject?.description && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-2 text-slate-400">
            <FileText className="w-5 h-5" />
            <h2 className="font-bold text-lg">Project Description</h2>
          </div>
          <div className="prose prose-invert prose-orange max-w-none">
            <ReactMarkdown>{localProject.description}</ReactMarkdown>
          </div>
        </div>
      )}
      
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
