'use client';

import { SourcesPanel } from '@/components/sources-panel';
import { ChatPanel } from '@/components/chat-panel';
import { ThreadsPanel, Thread } from '@/components/threads-panel';
import { useState } from 'react';
import { Doc } from '@/convex/_generated/dataModel';

export default function ChatPage() {
  const [selectedSources, setSelectedSources] = useState<Doc<'sources'>[] | null>(null);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);

  return (
    <div className='flex h-[calc(100vh-7rem)] gap-3'>
      <SourcesPanel handleSetSelectedSources={setSelectedSources} selectedSources={selectedSources} />
      <ChatPanel selectedSources={selectedSources} selectedThread={selectedThread} />
      <ThreadsPanel selectedThread={selectedThread} handleSetSelectedThread={setSelectedThread} />

    </div>
  );
}
