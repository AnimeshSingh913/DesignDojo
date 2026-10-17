'use client';

import React, { useEffect, useState } from 'react';
import { MentorSidebar } from './MentorSidebar';
import { MentorChatArea } from './MentorChatArea';
import { useMentorStore } from '@/store/useMentorStore';
import { Loader2 } from 'lucide-react';

export function MentorLayout() {
  const { setChats } = useMentorStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ai/mentor/history')
      .then(res => res.json())
      .then(data => {
        if (data.chats) {
          setChats(data.chats);
        }
      })
      .catch(err => console.error('Error fetching chats:', err))
      .finally(() => setLoading(false));
  }, [setChats]);

  if (loading) {
    return (
      <div className="flex h-full w-full bg-surface items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-surface overflow-hidden relative">
      <MentorSidebar />
      <MentorChatArea />
    </div>
  );
}
