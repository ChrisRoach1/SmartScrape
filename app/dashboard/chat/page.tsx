'use client';

import { SourcesPanel } from '@/components/sources-panel';
import { ChatPanel } from '@/components/chat-panel';
import { ThreadsPanel } from '@/components/threads-panel';
import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';

export default function ChatPage() {
  const [selectedSources, setSelectedSources] = useState<Id<'sources'>[] | null>(null);
  const [selectedSummaries, setSelectedSummaries] = useState<Id<'scrapeLog'>[] | null>(null);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);

  return (
    <div className='flex h-[calc(100vh-7rem)] gap-3'>
      <SourcesPanel
        handleSetSelectedSources={setSelectedSources}
        selectedSources={selectedSources}
        handleSetSelectedSummaries={setSelectedSummaries}
        selectedSummaries={selectedSummaries}
        disabled={!!selectedThread}
      />
      <ChatPanel
        selectedSources={selectedSources}
        selectedSummaries={selectedSummaries}
        selectedThread={selectedThread}
        handleSetSelectedThread={setSelectedThread}
      />
      <ThreadsPanel selectedThread={selectedThread} handleSetSelectedThread={setSelectedThread} />
    </div>
  );
}
