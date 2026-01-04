'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrapeLogViewer } from '@/components/scrape-log-viewer';
import { Doc } from '@/convex/_generated/dataModel';

interface ScrapeLogDialogProps {
  scrapeLog: Doc<'scrapeLog'> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScrapeLogDialog({ scrapeLog, open, onOpenChange }: ScrapeLogDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='lg:max-w-1/2 max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{scrapeLog?.title || 'Scrape Log'}</DialogTitle>
        </DialogHeader>

        {scrapeLog && scrapeLog.status === 'completed' && (
          <ScrapeLogViewer summarizedMarkdown={scrapeLog.summarizedMarkdown} structuredInsights={scrapeLog.structuredInsights} />
        )}
      </DialogContent>
    </Dialog>
  );
}
