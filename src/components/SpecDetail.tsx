import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSpecChat } from '@/hooks/useSpecChat';
import { toast } from 'sonner';
import { PageTransition } from '@/components/ui/page-transition';

import { PageSkeleton, SkeletonBlock } from '@/components/ui/page-skeleton';

// Modular Components
import { SpecHeader } from './spec-detail/SpecHeader';
import { EditorPanel } from './spec-detail/EditorPanel';
import { ChatPanel } from './spec-detail/ChatPanel';
import { ConfirmProposal } from './spec-detail/ConfirmProposal';

/**
 * SpecDetail Component
 * Main interface for editing a specific technical specification.
 */
export function SpecDetail() {
  const { specId, projectId } = useParams<{ specId: string; projectId: string }>();
  const navigate = useNavigate();
  const onBack = () => navigate(`/projects/${projectId}`);

  if (!specId || !projectId) {
    return <div className="h-screen bg-background" />;
  }
  const {
    spec,
    project,
    content,
    setContent,
    title,
    loading,
    saving,
    chatLoading,
    messages,
    similarSpecs,
    hasUnsavedChanges,
    isConfirmOpen,
    setIsConfirmOpen,
    pendingContent,
    handleSave,
    handleUpdateTitle,
    handleSendMessage,
    currentContentRef
  } = useSpecChat(specId, projectId);

  // Handle auto-save on exit
  const handleBackAndSave = async () => {
    if (hasUnsavedChanges) {
      const success = await handleSave(currentContentRef.current, false);
      if (!success) {
        toast.error("Auto-save failed. Stay here to save manually?");
        return; 
      }
    }
    onBack();
  };

  if (loading) return (
    <PageTransition className="h-screen flex flex-col bg-background overflow-hidden p-8 gap-6">
      <PageSkeleton className="flex flex-col gap-6 h-full">
        <SkeletonBlock width="100%" height="56px" />
        <div className="flex gap-4 flex-1 min-h-0">
          <SkeletonBlock width="60%" height="100%" />
          <SkeletonBlock width="40%" height="100%" />
        </div>
      </PageSkeleton>
    </PageTransition>
  );

  return (
    <PageTransition className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <SpecHeader 
        spec={spec}
        project={project}
        title={title}
        hasUnsavedChanges={hasUnsavedChanges}
        saving={saving}
        onBack={handleBackAndSave}
        onSave={() => handleSave(content, true)}
        onUpdateTitle={handleUpdateTitle}
        content={content}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Editor & Preview */}
        <EditorPanel 
          content={content}
          onContentChange={setContent}
        />

        {/* Right Side: AI Assistant */}
        <ChatPanel 
          messages={messages}
          chatLoading={chatLoading}
          similarSpecs={similarSpecs}
          onSendMessage={handleSendMessage}
          specType={spec?.type}
        />
      </div>

      {/* AI Proposal Confirmation Modal */}
      <ConfirmProposal 
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        specType={spec?.type}
        onApply={() => {
          setContent(pendingContent);
          setIsConfirmOpen(false);
          toast.success("Draft updated! Don't forget to save.");
        }}
      />
    </PageTransition>
  );
}
