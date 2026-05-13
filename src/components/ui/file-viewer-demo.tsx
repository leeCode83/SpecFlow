import ComponentFileViewer, { ApiComponent } from "@/components/ui/file-viewer";

// Sample data for the demo
const sampleComponent: ApiComponent = {
  name: "file-viewer",
  version: "1.0.0",
  files: [
    {
      path: "src/types.ts",
      content: `interface ApiComponent {
  author: string;
  name: string;
  version: string;
  files: Array<{
    path: string;
    content?: string;
  }>;
}

interface TreeViewElement {
  id: string;
  name: string;
  isSelectable?: boolean;
  children?: TreeViewElement[];
}

interface TreeContextProps {
  selectedId: string | undefined;
  expandedItems: string[] | undefined;
  handleExpand: (id: string) => void;
  selectItem: (id: string) => void;
  setExpandedItems?: React.Dispatch<React.SetStateAction<string[] | undefined>>;
  indicator: boolean;
  openIcon?: React.ReactNode;
  closeIcon?: React.ReactNode;
  direction: "rtl" | "ltr";
}`,
    },
    {
      path: "src/components/shiki-viewer.tsx",
      content: `"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { createHighlighter } from "shiki";
import { cn } from "utils";

interface ShikiViewerProps {
  code: string;
  lang?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function ShikiViewer({
  code,
  lang = "tsx",
  showLineNumbers = true,
  className,
}: ShikiViewerProps) {
  const [html, setHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let mounted = true;
    async function highlight() {
      try {
        setIsLoading(true);
        const shikiTheme =
          resolvedTheme === "dark" ? "github-dark" : "github-light";
        const highlighter = await createHighlighter({
          langs: [
            "tsx",
            "typescript",
            "javascript",
            "jsx",
            "json",
            "css",
            "scss",
            "html",
            "markdown",
          ],
          themes: [shikiTheme],
        });
        const highlightedHtml = highlighter.codeToHtml(code, {
          lang: lang === "tsx" ? "typescript" : lang,
          theme: shikiTheme,
        });
        if (mounted) {
          setHtml(highlightedHtml);
          setIsLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setHtml(\`<pre><code>\${code}</code></pre>\`);
          setIsLoading(false);
        }
      }
    }
    highlight();
    return () => {
      mounted = false;
    };
  }, [code, lang, resolvedTheme]);

  const addLineNumbers = (html: string) => {
    if (!showLineNumbers) return html;
    const lines = code.split("\\n");
    const lineNumbers = lines.map((_, i) => \`<span>\${i + 1}</span>\`).join("");
    return html.replace(
      /<pre[^>]*>([\\s\\S]*)<\\/pre>/,
      \`<pre class="line-numbers"><span class="line-numbers-rows">\${lineNumbers}</span>$1</pre>\`
    );
  };

  return (
    <>
      <style>{\`
        .shiki-viewer { border-radius: 0.5rem; overflow: hidden; border: 1px solid hsl(var(--border)); }
        .shiki-viewer pre { margin: 0; padding: 1rem; overflow-x: auto; background: transparent; font-size: 0.875rem; line-height: 1.5; white-space: pre; }
        .shiki-viewer code { background: transparent; padding: 0; border-radius: 0; font-family: inherit; font-size: inherit; line-height: inherit; white-space: pre; }
        .shiki-viewer .line-numbers { display: flex; }
        .shiki-viewer .line-numbers .line-numbers-rows { display: flex; flex-direction: column; padding-right: 0.2rem; margin-right: 0.2rem; border-right: 1px solid hsl(var(--border)); text-align: right; color: hsl(var(--muted-foreground)); font-size: 0.75rem; user-select: none; }
        .shiki-viewer .line-numbers .line-numbers-rows > span { display: block; min-width: 2rem; }
      \`}</style>
      <div className={cn("shiki-viewer", className)}>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-pulse text-muted-foreground">
              Loading code...
            </div>
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: addLineNumbers(html) }} />
        )}
      </div>
    </>
  );
}`,
    },
    {
      path: "src/components/file-header.tsx",
      content: `import { Badge } from "ui/badge";
import { Button } from "ui/button";
import { Check, Copy, ExternalLink } from "lucide-react";
import type { ApiComponent } from "../types";

interface FileHeaderProps {
  file: { path: string; content?: string };
  component: ApiComponent;
  onCopy: () => void;
  copied: boolean;
}

export function FileHeader({
  file,
  component,
  onCopy,
  copied,
}: FileHeaderProps) {
  const getFileType = (filePath: string) => {
    if (filePath.endsWith(".tsx")) return "TSX";
    if (filePath.endsWith(".ts")) return "TS";
    if (filePath.endsWith(".js")) return "JS";
    if (filePath.endsWith(".jsx")) return "JSX";
    if (filePath.endsWith(".md")) return "MD";
    if (filePath.endsWith(".css")) return "CSS";
    if (filePath.endsWith(".json")) return "JSON";
    return "TXT";
  };

  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30">
      <div className="flex items-center gap-2 min-w-0">
        <Badge variant="outline" className="text-xs">
          {getFileType(file.path)}
        </Badge>
        <span className="text-xs text-muted-foreground truncate">
          {file.path}
        </span>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          className="cursor-pointer h-8 w-8 p-0"
          title="Copy file content"
        >
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-8 w-8 p-0"
          title="View on GitHub"
        >
          <a
            href="https://21st.dev/bankkroll/file-viewer/default"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </div>
    </div>
  );
}`,
    },
    {
      path: "src/components/file-tree.tsx",
      content: `"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  FileCode,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ScrollArea } from "ui/scroll-area";
import { cn } from "utils";
import type { TreeViewElement, TreeContextProps } from "../types";

// Tree Context
const TreeContext = createContext<TreeContextProps | null>(null);
const useTree = () => {
  const context = useContext(TreeContext);
  if (!context) throw new Error("useTree must be used within a TreeProvider");
  return context;
};

// Tree Components
function TreeIndicator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { direction } = useTree();
  return (
    <div
      className={cn(
        "absolute left-1.5 h-full w-px rounded-md bg-muted py-3 transition-colors hover:bg-slate-300 rtl:right-1.5",
        className
      )}
      {...props}
    />
  );
}

function Folder({
  element,
  value,
  isSelectable = true,
  isSelect,
  children,
  className,
}: {
  element: string;
  value: string;
  isSelectable?: boolean;
  isSelect?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const {
    direction,
    handleExpand,
    expandedItems,
    indicator,
    openIcon,
    closeIcon,
  } = useTree();

  return (
    <AccordionPrimitive.Item
      value={value}
      className="relative h-full overflow-hidden"
    >
      <AccordionPrimitive.Trigger
        className={cn(
          "flex items-center gap-1 rounded-md text-sm px-2 py-1 hover:bg-accent hover:text-accent-foreground cursor-pointer",
          isSelect && isSelectable && "bg-muted",
          !isSelectable && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={!isSelectable}
        onClick={() => handleExpand(value)}
      >
        {expandedItems?.includes(value)
          ? openIcon ?? <FolderOpenIcon className="h-4 w-4" />
          : closeIcon ?? <FolderIcon className="h-4 w-4" />}
        <span className="truncate">{element}</span>
      </AccordionPrimitive.Trigger>
      <AccordionPrimitive.Content className="relative h-full overflow-hidden text-sm">
        {indicator && <TreeIndicator />}
        <AccordionPrimitive.Root
          type="multiple"
          className={cn(
            "ml-5 flex flex-col gap-1 py-1",
            direction === "rtl" && "mr-5"
          )}
          value={expandedItems}
        >
          {children}
        </AccordionPrimitive.Root>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}

function File({
  value,
  isSelectable = true,
  isSelect,
  fileIcon,
  children,
  className,
  onClick,
}: {
  value: string;
  isSelectable?: boolean;
  isSelect?: boolean;
  fileIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const { selectedId, selectItem } = useTree();
  const isSelected = isSelect ?? selectedId === value;

  return (
    <button
      disabled={!isSelectable}
      className={cn(
        "flex w-fit items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors cursor-pointer",
        isSelected && isSelectable && "bg-muted",
        !isSelectable
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={() => {
        selectItem(value);
        onClick?.();
      }}
    >
      {fileIcon ?? <FileIcon className="h-4 w-4" />}
      <span className="truncate">{children}</span>
    </button>
  );
}

function Tree({
  elements,
  initialSelectedId,
  initialExpandedItems,
  children,
  className,
  indicator = true,
  openIcon,
  closeIcon,
  dir = "ltr",
}: {
  elements?: TreeViewElement[];
  initialSelectedId?: string;
  initialExpandedItems?: string[];
  children: React.ReactNode;
  className?: string;
  indicator?: boolean;
  openIcon?: React.ReactNode;
  closeIcon?: React.ReactNode;
  dir?: "rtl" | "ltr";
}) {
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialSelectedId
  );
  const [expandedItems, setExpandedItems] = useState<string[] | undefined>(
    initialExpandedItems
  );

  const getAllExpandableItems = useCallback(
    (elements?: TreeViewElement[]): string[] => {
      const expandableItems: string[] = [];
      const traverse = (items: TreeViewElement[]) => {
        items.forEach((item) => {
          if (item.children?.length) {
            expandableItems.push(item.id);
            traverse(item.children);
          }
        });
      };
      if (elements) traverse(elements);
      return expandableItems;
    },
    []
  );

  const selectItem = useCallback((id: string) => setSelectedId(id), []);
  const handleExpand = useCallback((id: string) => {
    setExpandedItems((prev) => {
      if (prev?.includes(id)) return prev.filter((item) => item !== id);
      return [...(prev ?? []), id];
    });
  }, []);

  useEffect(() => {
    if (elements) setExpandedItems(getAllExpandableItems(elements));
  }, [elements, getAllExpandableItems]);

  return (
    <TreeContext.Provider
      value={{
        selectedId,
        expandedItems,
        handleExpand,
        selectItem,
        setExpandedItems,
        indicator,
        openIcon,
        closeIcon,
        direction: dir,
      }}
    >
      <div className={cn("size-full", className)}>
        <div className="relative h-full px-2">
          <AccordionPrimitive.Root
            type="multiple"
            value={expandedItems}
            className="flex flex-col gap-1"
          >
            {children}
          </AccordionPrimitive.Root>
        </div>
      </div>
    </TreeContext.Provider>
  );
}

function TreeItem({
  item,
  selectedFile,
  onFileSelect,
}: {
  item: TreeViewElement;
  selectedFile?: string;
  onFileSelect: (file: string) => void;
}) {
  if (item.children?.length) {
    return (
      <Folder
        key={item.id}
        element={item.name}
        value={item.id}
        className="truncate"
      >
        {item.children.map((child) => (
          <TreeItem
            key={child.id}
            item={child}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
          />
        ))}
      </Folder>
    );
  }

  return (
    <File
      key={item.id}
      value={item.id}
      onClick={() => onFileSelect(item.id)}
      isSelectable={true}
      isSelect={selectedFile === item.id}
      className="truncate whitespace-nowrap"
    >
      {item.name}
    </File>
  );
}

export function FileTree({
  tree,
  selectedFile,
  onFileSelect,
}: {
  tree: TreeViewElement[];
  selectedFile?: string;
  onFileSelect: (file: string) => void;
}) {
  const allExpandableItems = useMemo(() => {
    const expandableItems: string[] = [];
    const traverse = (elements: TreeViewElement[]) => {
      elements.forEach((element) => {
        if (element.children?.length) {
          expandableItems.push(element.id);
          traverse(element.children);
        }
      });
    };
    traverse(tree);
    return expandableItems;
  }, [tree]);

  return (
    <div className="w-full h-full border-r">
      <div className="p-3 border-b flex items-center gap-2">
        <FileCode className="h-4 w-4" />
        <span className="text-sm font-medium">Files</span>
      </div>
      <ScrollArea className="h-96 lg:h-[calc(100vh-300px)]">
        <div className="p-2">
          <Tree
            elements={tree}
            initialExpandedItems={allExpandableItems}
            initialSelectedId={selectedFile}
            indicator
          >
            {tree.map((item) => (
              <TreeItem
                key={item.id}
                item={item}
                selectedFile={selectedFile}
                onFileSelect={onFileSelect}
              />
            ))}
          </Tree>
        </div>
      </ScrollArea>
    </div>
  );
}`,
    },
    {
      path: "src/components/file-viewer.tsx",
      content: `"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "ui/resizable";
import { ScrollArea } from "ui/scroll-area";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import type { ApiComponent, TreeViewElement } from "../types";
import { FileTree } from "./FileTree";
import { FileHeader } from "./FileHeader";
import { ShikiViewer } from "./ShikiViewer";

export default function ComponentFileViewer({
  component,
}: {
  component: ApiComponent;
}) {
  const [selectedFile, setSelectedFile] = useState<string | undefined>(
    undefined
  );
  const [copied, setCopied] = useState(false);
  const files = component.files.filter((f) => f.content);

  // Build tree structure
  const tree = useMemo(() => {
    const root: Record<string, any> = {};
    for (const file of files) {
      const parts = file.path.split("/");
      let current = root;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] =
            i === parts.length - 1
              ? { ...file, id: file.path, name: part, isSelectable: true }
              : {
                  id: parts.slice(0, i + 1).join("/"),
                  name: part,
                  children: {},
                  isSelectable: false,
                };
        }
        current = current[part].children || current[part];
      }
    }
    const toArray = (obj: Record<string, any>): TreeViewElement[] =>
      Object.values(obj).map((item: any) =>
        item.children ? { ...item, children: toArray(item.children) } : item
      );
    return toArray(root);
  }, [files]);

  const selected = files.find((f) => f.path === selectedFile) || files[0];

  useEffect(() => {
    if (!selectedFile && files.length > 0) {
      setSelectedFile(files[0].path);
    }
  }, [files, selectedFile]);

  const handleCopy = () => {
    if (selected?.content) {
      navigator.clipboard.writeText(selected.content);
      setCopied(true);
      toast.success("File content copied");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[600px] rounded-lg border overflow-hidden"
    >
      <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
        <FileTree
          tree={tree}
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75} minSize={40}>
        {selected && (
          <div className="h-full flex flex-col">
            <FileHeader
              file={selected}
              component={component}
              onCopy={handleCopy}
              copied={copied}
            />
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="w-full h-[calc(100vh-20rem)]">
                <ShikiViewer
                  code={selected.content || ""}
                  lang={selected.path.split(".").pop() || "txt"}
                  className="min-h-full"
                />
              </ScrollArea>
            </div>
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}`,
    },
    {
      path: "src/utils.ts",
      content: `export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}`,
    },
    {
      path: "README.md",
      content: `# Component File Viewer

A React component for viewing and navigating through component files with syntax highlighting.

## Features

- **File Tree Navigation**: Browse through component files with an expandable tree structure
- **Syntax Highlighting**: Powered by Shiki for beautiful code highlighting
- **Copy to Clipboard**: Copy file contents with a single click
- **Resizable Panels**: Adjust the file tree and code viewer sizes
- **Theme Support**: Automatically adapts to light/dark themes
- **Line Numbers**: Optional line numbering for better code readability

## Usage

\`\`\`tsx
import ComponentFileViewer, { ApiComponent } from "./components/ComponentFileViewer";

const component: ApiComponent = {
  author: "YourName",
  name: "my-component",
  version: "1.0.0",
  files: [
    {
      path: "src/index.tsx",
      content: "// Your component code here"
    }
  ]
};

function App() {
  return <ComponentFileViewer component={component} />;
}
\`\`\`

## File Structure

The component is organized into several modules:

- \`types.ts\` - TypeScript interfaces and types
- \`components/ShikiViewer.tsx\` - Code syntax highlighting component
- \`components/FileHeader.tsx\` - File header with actions
- \`components/FileTree.tsx\` - File tree navigation component
- \`components/ComponentFileViewer.tsx\` - Main component
- \`utils.ts\` - Utility functions

## Dependencies

- React
- Radix UI (Accordion, Resizable)
- Lucide React (Icons)
- Shiki (Syntax highlighting)
- Next Themes (Theme support)
- Sonner (Toast notifications)

## License

MIT`,
    },
    {
      path: "package.json",
      content: `{
  "name": "file-viewer",
  "version": "1.0.0",
  "description": "A React component for viewing and navigating through component files",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-resizable": "^1.0.0",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "lucide-react": "^0.294.0",
    "next-themes": "^0.2.1",
    "react": "^18.2.0",
    "shiki": "^1.1.7",
    "sonner": "^1.2.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "typescript": "^5.3.3"
  },
  "peerDependencies": {
    "react": ">=18.0.0"
  }
}`,
    },
  ],
};

export default function ComponentFileViewerDemo() {
  return (
    <div className="p-4 w-full max-w-5xl mx-auto">
      <ComponentFileViewer component={sampleComponent} />
    </div>
  );
}
