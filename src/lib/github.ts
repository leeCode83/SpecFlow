import { GithubRepoData } from '@/lib/types';

export interface GithubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url?: string;
}

export interface GithubFileContent {
  content: string;
  size: number;
  sha: string;
}

export function parseGithubUrl(url: string): { owner: string; repo: string; branch?: string } | null {
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?(?:\/tree\/([^\/]+))?/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
        branch: match[3] || undefined,
      };
    }
  }
  return null;
}

export async function fetchRepoInfo(owner: string, repo: string): Promise<GithubRepoData> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { 'Accept': 'application/vnd.github.v3+json' },
  });

  if (response.status === 404) {
    throw new Error('Repository not found');
  }
  if (response.status === 403) {
    throw new Error('Access denied. This might be a private repository.');
  }
  if (response.status === 429) {
    throw new Error('GitHub rate limit reached. Try again in an hour.');
  }
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    fullName: data.full_name,
    description: data.description,
    stars: data.stargazers_count,
    language: data.language,
    topics: data.topics || [],
    defaultBranch: data.default_branch,
  };
}

export async function fetchRepoTree(owner: string, repo: string, branch: string): Promise<GithubTreeItem[]> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers: { 'Accept': 'application/vnd.github.v3+json' } }
  );

  if (response.status === 404) {
    throw new Error('Branch or repository not found');
  }
  if (response.status === 403) {
    throw new Error('Access denied. This might be a private repository.');
  }
  if (response.status === 429) {
    throw new Error('GitHub rate limit reached. Try again in an hour.');
  }
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();
  return data.tree.filter((item: GithubTreeItem) => item.type === 'blob');
}

export async function fetchFileContent(owner: string, repo: string, branch: string, path: string): Promise<string> {
  const response = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`);

  if (response.status === 404) {
    throw new Error('File not found');
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.status}`);
  }

  return response.text();
}

const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'ico', 'webp', 'svg', 'bmp', 'tiff', 'tif',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'zip', 'tar', 'gz', 'rar', '7z',
  'woff', 'woff2', 'ttf', 'eot', 'otf', 'css', 'map',
  'exe', 'dmg', 'app', 'dll', 'so', 'dylib',
  'mp3', 'mp4', 'wav', 'avi', 'mov', 'webm', 'mkv',
  'ttf', 'woff', 'woff2', 'eot',
]);

export function isBinaryFile(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return BINARY_EXTENSIONS.has(ext);
}

export function getFileLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const langMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'mjs': 'javascript',
    'cjs': 'javascript',
    'py': 'python',
    'rb': 'ruby',
    'java': 'java',
    'kt': 'kotlin',
    'cs': 'csharp',
    'cpp': 'cpp',
    'c': 'c',
    'h': 'c',
    'hpp': 'cpp',
    'go': 'go',
    'rs': 'rust',
    'rust': 'rust',
    'php': 'php',
    'swift': 'swift',
    'vue': 'vue',
    'svelte': 'svelte',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'scss',
    'less': 'less',
    'json': 'json',
    'jsonc': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'md': 'markdown',
    'markdown': 'markdown',
    'sql': 'sql',
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'fish': 'bash',
    'ps1': 'powershell',
    'psm1': 'powershell',
    'dockerfile': 'dockerfile',
    'toml': 'toml',
    'ini': 'ini',
    'cfg': 'ini',
    'conf': 'nginx',
    'nginx': 'nginx',
    'lua': 'lua',
    'r': 'r',
    'dart': 'dart',
    'scala': 'scala',
    'clj': 'clojure',
    'ex': 'elixir',
    'exs': 'elixir',
    'erl': 'erlang',
    'hs': 'haskell',
    'jl': 'julia',
    'pl': 'perl',
    'pm': 'perl',
    'asm': 'asm',
    's': 'asm',
    'v': 'verilog',
    'vhd': 'vhdl',
  };
  return langMap[ext] || 'text';
}

export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  size?: number;
}

export function buildFileTree(items: GithubTreeItem[]): TreeNode[] {
  const filteredItems = items.filter(item => !isBinaryFile(item.path));

  const root: TreeNode[] = [];

  for (const item of filteredItems) {
    const parts = item.path.split('/');
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');

      if (isFile) {
        currentLevel.push({
          name: part,
          path: item.path,
          type: 'file',
          size: item.size,
        });
      } else {
        let existingFolder = currentLevel.find(
          node => node.type === 'folder' && node.name === part
        );
        if (!existingFolder) {
          existingFolder = {
            name: part,
            path: currentPath,
            type: 'folder',
            children: [],
          };
          currentLevel.push(existingFolder);
        }
        currentLevel = existingFolder.children!;
      }
    }
  }

  const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
    return nodes
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      })
      .map(node => {
        if (node.children) {
          node.children = sortNodes(node.children);
        }
        return node;
      });
  };

  return sortNodes(root);
}

export function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const iconMap: Record<string, string> = {
    'ts': '📘',
    'tsx': '⚛️',
    'js': '📒',
    'jsx': '⚛️',
    'json': '📋',
    'md': '📝',
    'html': '🌐',
    'css': '🎨',
    'scss': '🎨',
    'py': '🐍',
    'go': '🔵',
    'rs': '🦀',
    'java': '☕',
    'kt': '🟣',
    'rb': '💎',
    'php': '🐘',
    'swift': '🍎',
    'vue': '💚',
    'svelte': '🔥',
    'sql': '🗃️',
    'sh': '⚡',
    'yaml': '📄',
    'yml': '📄',
    'xml': '📄',
    'dockerfile': '🐳',
    'gitignore': '🔍',
    'env': '🔐',
    'lock': '🔒',
    'txt': '📄',
    'png': '🖼️',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'gif': '🖼️',
    'svg': '🖼️',
    'ico': '🖼️',
    'pdf': '📕',
    'zip': '📦',
  };
  return iconMap[ext] || '📄';
}