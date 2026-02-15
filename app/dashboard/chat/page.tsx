'use client';

import { SourcesPanel } from '@/components/sources-panel';
import { ChatPanel } from '@/components/chat-panel';

export default function ChatPage() {
  return (
    <div className='flex h-[calc(100vh-7rem)] gap-3'>
      <SourcesPanel />
      <ChatPanel />
    </div>
  );
}
