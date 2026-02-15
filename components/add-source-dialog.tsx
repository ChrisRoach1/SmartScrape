'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Upload, X } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.txt,.csv,.html,.json,.md,.rtf,.xml';
const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
  'text/html',
  'application/json',
  'text/markdown',
  'application/rtf',
  'application/xml',
  'text/xml',
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AddSourceDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.source.generateUploadUrl);
  const sendFile = useMutation(api.source.sendfile);
  const sendNonFileSource = useMutation(api.source.createNonFileSource);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const newFiles = Array.from(incoming).filter((file) => {
      const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
      return ACCEPTED_TYPES.includes(ext) || ACCEPTED_MIME_TYPES.includes(file.type);
    });
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const unique = newFiles.filter((f) => !existing.has(`${f.name}-${f.size}`));
      return [...prev, ...unique];
    });
  }, []);

  const handleSaveFiles = () => {
    files.forEach(async (file) => {
      const postUrl = await generateUploadUrl();

      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'content-type': file.type },
        body: file,
      });

      const { storageId } = await result.json();

      await sendFile({ fileName: file.name, fileSize: file.size, storageId: storageId });
    });

    toast('Files uploaded successfully!');
    handleClose(false);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
        e.target.value = '';
      }
    },
    [addFiles],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClose = useCallback(
    (open: boolean) => {
      if (!open) {
        setFiles([]);
        setIsDragOver(false);
      }
      onOpenChange(open);
    },
    [onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='  tracking-tight'>Add sources</DialogTitle>
          <DialogDescription>Upload documents to your research library.</DialogDescription>
        </DialogHeader>

        {/* Drop Zone */}
        <div
          role='button'
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all ${
            isDragOver ? 'scale-[1.01] border-primary/50 bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-primary/[0.02]'
          }`}
        >
          <input ref={inputRef} type='file' multiple accept={ACCEPTED_TYPES} onChange={handleInputChange} className='hidden' />

          <div
            className={`mb-4 rounded-2xl p-3.5 transition-all ${
              isDragOver ? 'bg-primary/15 shadow-sm ring-1 ring-primary/20' : 'bg-gradient-to-br from-primary/10 to-primary/5'
            }`}
          >
            <Upload className={`size-6 transition-colors ${isDragOver ? 'text-primary' : 'text-primary/60'}`} />
          </div>

          <p className='  text-sm font-semibold tracking-tight text-foreground'>{isDragOver ? 'Drop to upload' : 'Drop files here'}</p>
          <p className='mt-1 text-xs text-muted-foreground'>
            or <span className='text-primary/80 underline underline-offset-2'>click to browse</span>
          </p>
          <p className='mt-3 text-[10px] text-muted-foreground/60'>PDF, DOC, TXT, CSV, HTML, JSON, MD</p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className='animate-fade-in flex max-h-40 flex-col gap-1.5 overflow-y-auto'>
            {files.map((file, index) => (
              <div
                key={`${file.name}-${file.size}`}
                className='flex items-center gap-2.5 rounded-lg border border-border bg-secondary/30 px-3 py-2 transition-colors hover:bg-secondary/50'
              >
                <span className='min-w-0 flex-1 truncate text-xs font-medium text-foreground'>{file.name}</span>
                <Badge variant='secondary' className='shrink-0 text-[10px] font-normal text-muted-foreground'>
                  {formatFileSize(file.size)}
                </Badge>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className='shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
                >
                  <X className='size-3.5' />
                </button>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant='ghost' size='sm' onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button onClick={() => handleSaveFiles()} size='sm' disabled={files.length === 0} className='gap-2'>
            <Plus className='size-3.5' />
            Add {files.length > 0 ? `${files.length} source${files.length > 1 ? 's' : ''}` : 'sources'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
