import { useState, useEffect, useRef } from 'react';
import { Project, Spec, Message, GithubRepoData } from '@/lib/types';
import { getProjectById } from '@/lib/supabase/supabase-projects';
import { updateSpec, getSpecById, getSpecsByProjectId } from '@/lib/supabase/supabase-specs';
import { generateSpec } from '@/lib/gemini/gemini-specs';
import { retrieveSimilarSpecs, SimilarSpec } from '@/lib/rag';
import { authenticatedFetch } from '@/lib/api-client';
import { toast } from 'sonner';
import { parseGithubUrl, getRepoFile, getRepoContents, getRepoStatus } from '@/lib/github/github-client';

/**
 * useSpecChat Hook
 * Handles all logic for specification editing, AI chat interaction, and state management.
 */
export function useSpecChat(specId: string, projectId: string) {
  const [spec, setSpec] = useState<Spec | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [similarSpecs, setSimilarSpecs] = useState<SimilarSpec[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // State for AI proposals
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingContent, setPendingContent] = useState('');

  const currentContentRef = useRef(content);
  const similarSpecsCache = useRef<Record<string, SimilarSpec[]>>({});
  const projectSpecsCache = useRef<Spec[] | null>(null);
  const repoContextRef = useRef<string>('');

  useEffect(() => {
    if (spec) {
      setHasUnsavedChanges(content !== spec.content);
    }
    currentContentRef.current = content;
  }, [content, spec?.content]);

  useEffect(() => {
    fetchData();
  }, [specId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [specData, projectData] = await Promise.all([
        getSpecById(specId),
        getProjectById(projectId)
      ]);

      setSpec(specData);
      setProject(projectData);
      setContent(specData.content);
      setTitle(specData.title || '');

      // Auto-fetch repo context for AI
      if (projectData?.github_url) {
        const fullName = parseGithubUrl(projectData.github_url);
        if (fullName) {
          fetchRepoContext(fullName);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load spec");
    } finally {
      setLoading(false);
    }
  };

  const fetchRepoContext = async (fullName: string) => {
    try {
      const parts: string[] = [];

      // Fetch README
      try {
        const readme = await getRepoFile(fullName, 'README.md');
        parts.push(`## README\n${readme.content.substring(0, 3000)}`);
      } catch { /* no README */ }

      // Fetch package.json or pyproject.toml
      try {
        const pkg = await getRepoFile(fullName, 'package.json');
        parts.push(`## package.json\n${pkg.content.substring(0, 2000)}`);
      } catch {
        try {
          const py = await getRepoFile(fullName, 'pyproject.toml');
          parts.push(`## pyproject.toml\n${py.content.substring(0, 2000)}`);
        } catch { /* no package manifest */ }
      }

      // Fetch root-level folder listing for structure
      try {
        const contents = await getRepoContents(fullName, '');
        const structure = contents.map(c => `  ${c.type === 'dir' ? '📁' : '📄'} ${c.name}`).join('\n');
        parts.push(`## Repository Structure (root level)\n${structure}`);
      } catch { /* no access */ }

      repoContextRef.current = parts.join('\n\n');
    } catch {
      // silently fail - repo context is optional
    }
  };

  const handleSave = async (contentToSave: string, showToast = true) => {
    if (saving) return;
    setSaving(true);
    try {
      const status = contentToSave.length > 500 ? 'completed' : 'draft';
      await updateSpec(specId, { content: contentToSave, status });

      setSpec(prev => prev ? { ...prev, content: contentToSave, status } : null);
      setHasUnsavedChanges(false);
      
      if (showToast) toast.success("Spec saved successfully");

      // Background embedding
      authenticatedFetch('/api/embed-spec', {
        method: 'POST',
        body: JSON.stringify({ specId, contentToSave })
      }).catch(err => console.error("Background embedding failed:", err));

      return true;
    } catch (error) {
      console.error("Save Error:", error);
      if (showToast) toast.error("Failed to save spec");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTitle = async (newTitle: string) => {
    if (!newTitle.trim()) return false;
    setSaving(true);
    try {
      await updateSpec(specId, { title: newTitle });
      setTitle(newTitle);
      setSpec(prev => prev ? { ...prev, title: newTitle } : null);
      toast.success("Title updated");
      return true;
    } catch (error) {
      toast.error("Failed to update title");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = async (input: string) => {
    if (!input.trim() || chatLoading) return;
    
    const newMsg: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setChatLoading(true);

    try {
      let currentSimilarSpecsStr: string[] = [];
      let existingProjectSpecsStr: string[] = [];
      
      if (project?.user_id) {
        const queryContext = updatedMessages.map(m => m.content).join("\\n");
        const cacheKey = `${queryContext}-${spec?.type || 'Custom'}`;
        
        let results: SimilarSpec[];
        if (similarSpecsCache.current[cacheKey]) {
          results = similarSpecsCache.current[cacheKey];
        } else {
          results = await retrieveSimilarSpecs(queryContext, spec?.type || 'Custom', project.user_id, 3);
          similarSpecsCache.current[cacheKey] = results;
        }
        
        setSimilarSpecs(results);
        
        if (results.length > 0) {
          currentSimilarSpecsStr = results.map(r => 
            `Title: ${r.title}\nType: ${r.type}\nSimilarity: ${Math.round(r.similarity * 100)}%\nPreview: ${r.content.substring(0, 500)}`
          );
        }

        let allSpecsInProject: Spec[];
        if (projectSpecsCache.current) {
          allSpecsInProject = projectSpecsCache.current;
        } else {
          allSpecsInProject = await getSpecsByProjectId(projectId);
          projectSpecsCache.current = allSpecsInProject;
        }
        
        const otherSpecs = allSpecsInProject.filter(s => s.id !== specId);
        if (otherSpecs.length > 0) {
          existingProjectSpecsStr = otherSpecs.map(s => 
            `Title: ${s.title}\nType: ${s.type}\nContent snippet: ${s.content.substring(0, 1000)}...`
          );
        }
      }

      const enrichedContext = repoContextRef.current
        ? `${project?.description || ''}\n\n## Repository Context\n${repoContextRef.current}`
        : (project?.description || '');

      const response = await generateSpec(
        updatedMessages, 
        spec?.type || 'Custom',
        enrichedContext,
        currentSimilarSpecsStr,
        existingProjectSpecsStr
      );
      
      const generateIndex = response.indexOf('[GENERATE_SPEC]');
      const generateEndIndex = response.indexOf('[/GENERATE_SPEC]');
      
      let displayMessage = response;
      
      if (generateIndex !== -1 && generateEndIndex !== -1) {
        const proposal = response.substring(generateIndex + 15, generateEndIndex).trim();
        displayMessage = response.replace(/\[GENERATE_SPEC\][\s\S]*?\[\/GENERATE_SPEC\]/, '').trim();
        
        if (!displayMessage) displayMessage = "I've drafted a specification update for you. Would you like to apply it?";
        
        setPendingContent(proposal);
        setIsConfirmOpen(true);
      }
      
      setMessages([...updatedMessages, { role: 'assistant', content: displayMessage }]);
    } catch (error) {
      console.error(error);
      toast.error("AI Generation failed");
    } finally {
      setChatLoading(false);
    }
  };

  return {
    spec,
    project,
    content,
    setContent,
    title,
    loading,
    saving,
    chatLoading,
    messages,
    setMessages,
    similarSpecs,
    hasUnsavedChanges,
    isConfirmOpen,
    setIsConfirmOpen,
    pendingContent,
    handleSave,
    handleUpdateTitle,
    handleSendMessage,
    currentContentRef
  };
}
