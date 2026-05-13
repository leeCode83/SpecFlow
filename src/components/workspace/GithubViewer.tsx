import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GithubRepoData, Project } from '@/lib/types';
import {
  parseGithubUrl,
  fetchRepoInfo,
  fetchRepoTree,
  fetchFileContent,
  buildFileTree,
  getFileLanguage,
  getFileIcon,
  isBinaryFile,
  TreeNode,
  GithubTreeItem,
} from '@/lib/github';
import { updateProject } from '@/lib/supabase/supabase-projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { toast } from 'sonner';
import {
  Github,
  Link2,
  Star,
  Copy,
  Check,
  FileCode,
  FolderOpenIcon,
  FolderIcon,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { createHighlighter } from 'shiki';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

const MAX_FILE_SIZE = 500 * 1024;

interface GithubViewerProps {
  project: Project;
  onProjectUpdate?: (updated: Project) => void;
}

export function GithubViewer({ project, onProjectUpdate }: GithubViewerProps) {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [repoInfo, setRepoInfo] = useState<GithubRepoData | null>(null);
  const [treeData, setTreeData] = useState<GithubTreeItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadingTree, setLoadingTree] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [highlightedHtml, setHighlightedHtml] = useState<string>('');
  const [highlighting, setHighlighting] = useState(false);
  const [treeError, setTreeError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  const hasGithubUrl = Boolean(project.github_url);

  const loadRepo = useCallback(async (url: string) => {
    const parsed = parseGithubUrl(url);
    if (!parsed) {
      toast.error('Invalid GitHub URL');
      return;
    }

    setLoading(true);
    setTreeError(null);
    try {
      const info = await fetchRepoInfo(parsed.owner, parsed.repo);
      setRepoInfo(info);
      setConnected(true);

      setLoadingTree(true);
      try {
        const tree = await fetchRepoTree(parsed.owner, parsed.repo, parsed.branch || info.defaultBranch);
        setTreeData(tree);
        setExpandedFolders(new Set());
        setSelectedFile(null);
        setFileContent(null);
      } catch (treeErr) {
        const treeMessage = treeErr instanceof Error ? treeErr.message : 'Failed to load file tree';
        setTreeError(treeMessage);
        toast.error(treeMessage);
      } finally {
        setLoadingTree(false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load repository';
      toast.error(message);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (project.github_url) {
      setUrlInput(project.github_url);
      setConnected(true);
      loadRepo(project.github_url);
    }
  }, [project.github_url, loadRepo]);

  const handleConnect = async () => {
    if (!urlInput.trim()) return;

    await loadRepo(urlInput);

    try {
      await updateProject(project.id, { github_url: urlInput.trim() });
      if (onProjectUpdate) {
        onProjectUpdate({ ...project, github_url: urlInput.trim() });
      }
      toast.success('Repository connected');
    } catch (error) {
      console.error('Failed to save github_url:', error);
    }
  };

  const handleFileClick = async (path: string) => {
    if (!project.github_url) return;

    const parsed = parseGithubUrl(project.github_url);
    if (!parsed || !repoInfo) return;

    if (isBinaryFile(path)) {
      toast.warning('Cannot preview binary files');
      return;
    }

    setSelectedFile(path);
    setLoadingContent(true);
    setHighlightedHtml('');

    try {
      const content = await fetchFileContent(parsed.owner, parsed.repo, parsed.branch || repoInfo.defaultBranch, path);

      if (content.length > MAX_FILE_SIZE) {
        toast.warning('File is too large to preview (>500KB)');
        setFileContent(null);
        setSelectedFile(null);
        return;
      }

      setFileContent(content);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load file';
      toast.error(message);
      setFileContent(null);
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => {
    if (!fileContent || !selectedFile) return;

    let mounted = true;
    setHighlighting(true);

    async function highlight() {
      try {
        const lang = getFileLanguage(selectedFile!);
        const shikiTheme = resolvedTheme === 'dark' ? 'one-dark-pro' : 'min-light';

        const highlighter = await createHighlighter({
          langs: [
            'typescript', 'javascript', 'tsx', 'jsx', 'json', 'css', 'scss',
            'html', 'markdown', 'python', 'go', 'rust', 'java', 'bash',
            'yaml', 'sql', 'dockerfile', 'vue', 'svelte', 'php', 'ruby',
          ],
          themes: [shikiTheme],
        });

        const html = highlighter.codeToHtml(fileContent!, {
          lang: lang === 'tsx' ? 'typescript' : lang,
          theme: shikiTheme,
        });

        if (mounted) {
          setHighlightedHtml(html);
        }
      } catch (error) {
        if (mounted) {
          setHighlightedHtml(`<pre><code>${fileContent}</code></pre>`);
        }
      } finally {
        if (mounted) {
          setHighlighting(false);
        }
      }
    }

    highlight();
    return () => { mounted = false; };
  }, [fileContent, selectedFile, resolvedTheme]);

  const handleCopy = () => {
    if (fileContent) {
      navigator.clipboard.writeText(fileContent);
      setCopied(true);
      toast.success('Content copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const fileTree = useMemo(() => buildFileTree(treeData), [treeData]);

  const renderTreeNode = (node: TreeNode, depth: number = 0) => {
    const isFolder = node.type === 'folder';
    const isExpanded = expandedFolders.has(node.path);

    return (
      <div key={node.path}>
        <button
          onClick={() => isFolder ? toggleFolder(node.path) : handleFileClick(node.path)}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors text-left',
            selectedFile === node.path ? 'bg-slate-800 text-orange-400' : 'hover:bg-slate-800/50 text-slate-300',
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {isFolder ? (
            <>
              {isExpanded ? (
                <FolderOpenIcon className="w-4 h-4 text-slate-500" />
              ) : (
                <FolderIcon className="w-4 h-4 text-slate-500" />
              )}
              <span className="truncate">{node.name}</span>
            </>
          ) : (
            <>
              <span className="text-base">{getFileIcon(node.name)}</span>
              <span className="truncate">{node.name}</span>
            </>
          )}
        </button>
        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!hasGithubUrl && !repoInfo) {
    return (
      <div className="space-y-6">
        <div className="flex gap-3">
          <Input
            placeholder="https://github.com/owner/repo"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="bg-slate-900/50 border-slate-800"
          />
          <Button
            onClick={handleConnect}
            disabled={!urlInput.trim() || loading}
            className={connected ? 'bg-green-600 hover:bg-green-700 font-bold gap-2' : 'bg-orange-500 hover:bg-orange-600 font-bold gap-2'}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {connected ? 'Connected ✓' : 'Connect'}
          </Button>
        </div>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Github className="w-12 h-12 text-slate-700 mb-4" />
            <p className="text-slate-400 mb-2">No repository connected</p>
            <p className="text-slate-600 text-sm">
              Paste a public GitHub repository URL above to browse its files
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Input
          placeholder="https://github.com/owner/repo"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="bg-slate-900/50 border-slate-800"
        />
        <Button
          onClick={handleConnect}
          disabled={!urlInput.trim() || loading}
          className="bg-orange-500 hover:bg-orange-600 font-bold gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Connect
        </Button>
      </div>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full bg-slate-900/50" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-64 w-full bg-slate-900/50" />
            <Skeleton className="h-64 w-full bg-slate-900/50" />
          </div>
        </div>
      )}

      {!loading && repoInfo && (
        <>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Github className="w-5 h-5 text-orange-500" />
                    <h3 className="font-bold text-lg text-slate-200 truncate">
                      {repoInfo.fullName}
                    </h3>
                  </div>
                  {repoInfo.description && (
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                      {repoInfo.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    {repoInfo.stars > 0 && (
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {repoInfo.stars.toLocaleString()}
                      </div>
                    )}
                    {repoInfo.language && (
                      <Badge variant="outline" className="text-xs border-slate-700">
                        {repoInfo.language}
                      </Badge>
                    )}
                    {repoInfo.topics.slice(0, 3).map(topic => (
                      <Badge key={topic} variant="secondary" className="text-xs bg-slate-800">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-slate-400 hover:text-slate-200"
                >
                  <a
                    href={`https://github.com/${repoInfo.fullName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <ResizablePanelGroup direction="horizontal" className="border border-slate-800 rounded-2xl overflow-hidden">
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="h-full flex flex-col bg-slate-900/30">
                <div className="p-3 border-b border-slate-800 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-400">Files</span>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {loadingTree ? (
                      <div className="space-y-2">
                        {[...Array(8)].map((_, i) => (
                          <Skeleton key={i} className="h-8 w-full bg-slate-800/50" />
                        ))}
                      </div>
                    ) : treeError ? (
                      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                        <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
                        <p className="text-sm text-slate-400 mb-1">Failed to load files</p>
                        <p className="text-xs text-slate-600">{treeError}</p>
                      </div>
                    ) : (
                      fileTree.map(node => renderTreeNode(node))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={60} minSize={20}>
              <div className="h-full flex flex-col bg-slate-900/30">
                {selectedFile ? (
                  <>
                    <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="outline" className="text-xs border-slate-700 uppercase">
                          {selectedFile.split('.').pop()}
                        </Badge>
                        <span className="text-sm text-slate-400 truncate">
                          {selectedFile}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="p-4">
                        {loadingContent || highlighting ? (
                          <div className="space-y-2">
                            {[...Array(10)].map((_, i) => (
                              <Skeleton key={i} className="h-5 w-full bg-slate-800/50" />
                            ))}
                          </div>
                        ) : highlightedHtml ? (
                          <div
                            className="shiki-gh rounded-xl text-sm"
                            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                          />
                        ) : null}
                      </div>
                    </ScrollArea>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <FileCode className="w-12 h-12 text-slate-700 mb-4" />
                    <p className="text-slate-500">Select a file to preview</p>
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </>
      )}

      <style>{`
        .shiki-gh { border: 1px solid hsl(var(--border)); }
        .shiki-gh pre { margin: 0; padding: 1rem; overflow: visible; background: transparent !important; min-width: max-content; }
        .shiki-gh code { background: transparent; padding: 0; border-radius: 0; font-family: inherit; font-size: 0.875rem; line-height: 1.6; }
      `}</style>
    </div>
  );
}