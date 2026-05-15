import React, { useRef } from 'react';
import { Upload, Trash2, File, ExternalLink, Loader2, FileText, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectFile } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Progress } from '@/components/ui/progress';

interface FileListProps {
  files: ProjectFile[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onDelete: (file: ProjectFile) => Promise<void>;
  isOwner: boolean;
  currentUserId?: string;
}

/**
 * FileList Component
 * Manages project-related assets and files with preview support and upload capabilities.
 */
export function FileList({
  files,
  onUpload,
  onDelete,
  isOwner,
  currentUserId
}: FileListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);
    try {
      await onUpload(e);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Project Assets</h2>
          <p className="text-muted-foreground text-sm">Manage shared documents, images, and resources.</p>
        </div>
        <Button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-primary hover:bg-primary/90 font-bold gap-2"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Upload File'}
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange} 
        />
      </div>

      {uploading && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Uploading your file...</span>
            <span className="animate-pulse">Please wait</span>
          </div>
          <Progress />
        </div>
      )}

      <TooltipProvider delay={200}>
        <div className="flex flex-col space-y-2">
          {files.map(file => (
            <div key={file.id} className="bg-card/40 border border-border p-3 rounded-xl hover:bg-card/80 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-4 flex-1 overflow-hidden">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-10 h-10 shrink-0 bg-muted rounded-lg flex items-center justify-center text-muted-foreground overflow-hidden relative cursor-default border border-border/70">
                      {file.type.includes('image') ? (
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    className="p-0 border-border bg-card overflow-hidden shadow-2xl z-50"
                  >
                    {file.type.includes('image') ? (
                      <div className="w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center bg-black/50">
                        <img src={file.url} alt={file.name} className="max-w-full max-h-full object-contain" />
                      </div>
                    ) : (
                      <div className="p-3 text-xs text-muted-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>No preview available</span>
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>
                
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground/90 truncate">{file.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    <span className="w-1 h-1 rounded-full bg-muted/80"></span>
                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-foreground/90 hover:bg-muted"
                  onClick={() => window.open(file.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                { (isOwner || file.user_id === currentUserId) && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(file)} 
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {files.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl space-y-4">
              <HardDrive className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground text-sm">No files uploaded yet. Shared assets will appear here.</p>
            </div>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}
