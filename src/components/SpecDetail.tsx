import React from 'react';
import { useSpecChat } from '@/hooks/useSpecChat';
import { toast } from 'sonner';

// Modular Components
import { SpecHeader } from './spec-detail/SpecHeader';
import { EditorPanel } from './spec-detail/EditorPanel';
import { ChatPanel } from './spec-detail/ChatPanel';
import { ConfirmProposal } from './spec-detail/ConfirmProposal';

interface SpecDetailProps {
  specId: string;
  projectId: string;
  onBack: () => void;
}

/**
 * SpecDetail Component
 * Main interface for editing a specific technical specification.
 * Integrates an AI chat assistant with RAG capabilities and a Markdown editor.
 * Refactored to use useSpecChat hook and modular sub-components.
 */
export function SpecDetail({ specId, projectId, onBack }: SpecDetailProps) {
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
    <div className="h-screen flex items-center justify-center bg-slate-950 text-slate-500">
      Loading specification...
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
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
    </div>
  );
}
