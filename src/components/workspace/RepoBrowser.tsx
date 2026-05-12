import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FolderClosed, File, ChevronRight, ChevronDown, Loader2, Search, ArrowLeft } from 'lucide-react';
import { getRepoContents, getRepoFile } from '@/lib/github/github-client';
import type { GithubContentItem, GithubFileContent } from '@/lib/types';
import { cn } from '@/lib/utils';

interface RepoBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fullName: string;
}

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size: number;
  children: TreeNode[];
  expanded: boolean;
  loading: boolean;
}

function buildTree(items: GithubContentItem[]): TreeNode[] {
  return items
    .map(item => ({
      name: item.name,
      path: item.path,
      type: item.type,
      size: item.size,
      children: [] as TreeNode[],
      expanded: false,
      loading: false,
    }))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: 'TypeScript', tsx: 'TSX', js: 'JavaScript', jsx: 'JSX',
    json: 'JSON', md: 'Markdown', css: 'CSS', html: 'HTML',
    py: 'Python', rs: 'Rust', go: 'Go', java: 'Java',
    yml: 'YAML', yaml: 'YAML', toml: 'TOML', sql: 'SQL',
    sh: 'Shell', bash: 'Shell', dockerfile: 'Dockerfile',
    vue: 'Vue', svelte: 'Svelte', prisma: 'Prisma',
  };
  return langMap[ext || ''] || '';
}

const MAX_PREVIEW_LINES = 300;
const MAX_PREVIEW_SIZE = 50000;

export function RepoBrowser({ open, onOpenChange, fullName }: RepoBrowserProps) {
  const [rootItems, setRootItems] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<GithubFileContent | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [nodeMap, setNodeMap] = useState<Map<string, TreeNode>>(new Map());

  const fetchDirectory = useCallback(async (parentPath: string): Promise<TreeNode[]> => {
    const items = await getRepoContents(fullName, parentPath);
    return buildTree(items);
  }, [fullName]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setSelectedFile(null);
    setSelectedFilePath(null);
    setRootItems([]);
    setSearchQuery('');

    fetchDirectory('')
      .then(children => {
        setRootItems(children);
        const map = new Map<string, TreeNode>();
        children.forEach(n => map.set(n.path, n));
        setNodeMap(map);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, fullName, fetchDirectory]);

  const toggleExpand = async (node: TreeNode) => {
    if (node.type !== 'dir') return;

    if (node.expanded) {
      node.expanded = false;
      setRootItems([...rootItems]);
      return;
    }

    if (node.children.length > 0) {
      node.expanded = true;
      setRootItems([...rootItems]);
      return;
    }

    node.loading = true;
    setRootItems([...rootItems]);

    try {
      const children = await fetchDirectory(node.path);
      node.children = children;
      node.expanded = true;
      const map = new Map(nodeMap);
      children.forEach(n => map.set(n.path, n));
      setNodeMap(map);
    } catch (err: any) {
      setError(err.message);
    } finally {
      node.loading = false;
      setRootItems([...rootItems]);
    }
  };

  const openFile = async (node: TreeNode) => {
    if (node.type !== 'file') return;
    if (node.size > MAX_PREVIEW_SIZE) {
      setSelectedFile({ content: `File too large to preview (${(node.size / 1024).toFixed(1)} KB). Maximum preview: ${(MAX_PREVIEW_SIZE / 1024).toFixed(0)} KB.`, size: node.size, sha: '' });
      setSelectedFilePath(node.path);
      return;
    }
    setSelectedFilePath(node.path);
    setFileLoading(true);
    try {
      const file = await getRepoFile(fullName, node.path);
      const lines = file.content.split('\n');
      if (lines.length > MAX_PREVIEW_LINES) {
        file.content = lines.slice(0, MAX_PREVIEW_LINES).join('\n') + `\n\n... truncated (${lines.length} total lines, showing first ${MAX_PREVIEW_LINES})`;
      }
      setSelectedFile(file);
    } catch (err: any) {
      setSelectedFile({ content: `Error loading file: ${err.message}`, size: 0, sha: '' });
    } finally {
      setFileLoading(false);
    }
  };

  const filteredNodes = (nodes: TreeNode[]): TreeNode[] => {
    if (!searchQuery) return nodes;
    const q = searchQuery.toLowerCase();
    const result: TreeNode[] = [];
    for (const n of nodes) {
      if (n.name.toLowerCase().includes(q)) {
        result.push(n);
      } else if (n.type === 'dir') {
        const matchingChildren = filteredNodes(n.children);
        if (matchingChildren.length > 0) {
          result.push({ ...n, expanded: true, children: matchingChildren });
        }
      }
    }
    return result;
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isSelected = selectedFilePath === node.path;
    return (
      <div key={node.path}>
        <button
          onClick={() => node.type === 'dir' ? toggleExpand(node) : openFile(node)}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors text-left",
            "hover:bg-slate-800/50",
            isSelected ? "bg-orange-500/10 text-orange-400" : "text-slate-300"
          )}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          {node.type === 'dir' ? (
            <>
              {node.loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500 shrink-0" />
              ) : node.expanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
              <FolderClosed className="w-4 h-4 text-orange-400 shrink-0" />
            </>
          ) : (
            <>
              <span className="w-3.5" />
              <File className="w-4 h-4 text-slate-500 shrink-0" />
            </>
          )}
          <span className="truncate flex-1">{node.name}</span>
          {node.type === 'file' && (
            <span className="text-[10px] text-slate-600 shrink-0">
              {node.size > 1024 ? `${(node.size / 1024).toFixed(1)} KB` : `${node.size} B`}
            </span>
          )}
        </button>
        {node.type === 'dir' && node.expanded && node.children.map(child => renderNode(child, depth + 1))}
      </div>
    );
  };

  const displayNodes = searchQuery ? filteredNodes(rootItems) : rootItems;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[85vh] max-h-[85vh] p-0 bg-slate-950 border-slate-800 text-white flex flex-col">
        <DialogHeader className="p-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <FolderClosed className="w-4 h-4 text-orange-500" />
              {fullName}
            </DialogTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-slate-900 border-slate-700 rounded-lg"
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex min-h-0">
          {/* Tree sidebar */}
          <div className="w-72 border-r border-slate-800 flex flex-col shrink-0">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : error ? (
              <div className="p-4 text-xs text-red-400">{error}</div>
            ) : displayNodes.length === 0 ? (
              <div className="p-4 text-xs text-slate-500">
                {searchQuery ? 'No files matching search' : 'Empty repository'}
              </div>
            ) : (
              <ScrollArea className="flex-1 p-2">
                {displayNodes.map(node => renderNode(node))}
              </ScrollArea>
            )}
          </div>

          {/* Preview panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {fileLoading ? (
              <div className="flex items-center justify-center flex-1 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : selectedFile ? (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="px-4 py-2 border-b border-slate-800 text-xs text-slate-500 flex items-center gap-2 shrink-0">
                  <span className="font-mono text-slate-300">{selectedFilePath}</span>
                  <span>•</span>
                  <span>{getLanguage(selectedFilePath || '')}</span>
                  <span>•</span>
                  <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
                <ScrollArea className="flex-1">
                  <pre className="p-4 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
                    <code>{selectedFile.content}</code>
                  </pre>
                </ScrollArea>
              </div>
            ) : (
              <div className="flex items-center justify-center flex-1 text-slate-600 text-xs">
                Select a file to preview
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
