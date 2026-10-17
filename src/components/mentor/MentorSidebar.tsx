'use client';

import React, { useState, useMemo } from 'react';
import { useMentorStore } from '@/store/useMentorStore';
import { Search, Plus, MessageSquare, Trash2, Pin, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MentorSidebar() {
  const { chats, activeChatId, setActiveChat, createChat, deleteChat, togglePinChat, sidebarCollapsed } = useMentorStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Deep Search logic: filter by title OR messages
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const lowerQuery = searchQuery.toLowerCase();
    
    return chats.filter(chat => {
      if (chat.title.toLowerCase().includes(lowerQuery)) return true;
      const messageMatch = chat.messages.some(msg => 
        msg.content.toLowerCase().includes(lowerQuery)
      );
      return messageMatch;
    });
  }, [chats, searchQuery]);

  const pinnedChats = filteredChats.filter(c => c.pinned);
  const unpinnedChats = filteredChats.filter(c => !c.pinned);

  const renderChatList = (chatList: typeof chats, label: string) => {
    if (chatList.length === 0) return null;
    return (
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-primary/40 uppercase tracking-wider mb-2 px-3">{label}</h4>
        <div className="flex flex-col gap-1">
          {chatList.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`group flex items-center justify-between p-3 mx-2 rounded-xl cursor-pointer transition-colors ${
                activeChatId === chat.id 
                  ? 'bg-primary/10 text-primary-ink' 
                  : 'hover:bg-primary/5 text-primary-ink'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} className={activeChatId === chat.id ? 'text-primary' : 'text-primary/40'} />
                <span className="text-sm font-medium truncate">{chat.title}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); togglePinChat(chat.id); }}
                  className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-primary/10 rounded-md transition-all cursor-pointer"
                  title={chat.pinned ? "Unpin Chat" : "Pin Chat"}
                >
                  <Pin size={14} className={chat.pinned ? 'fill-current' : ''} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                  className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-primary/10 text-primary/70 hover:text-primary-ink rounded-md transition-all cursor-pointer"
                  title="Delete Chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={false}
      animate={{ width: sidebarCollapsed ? 0 : 280 }}
      className="relative flex flex-col h-full bg-surface border-r border-primary/10 shrink-0 overflow-hidden"
    >
      <div className="p-4 border-b border-primary/10 shrink-0">
        <button 
          onClick={() => createChat()}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-surface py-2.5 px-4 rounded-xl font-semibold transition-colors cursor-pointer"
        >
          <Plus size={18} />
          <span>New Chat</span>
        </button>

        <div className="mt-4 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
          <input 
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-primary/5 border border-primary/10 rounded-lg text-sm text-primary-ink focus:outline-none focus:border-primary/30 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {renderChatList(pinnedChats, 'Pinned')}
        {renderChatList(unpinnedChats, 'Recent')}
        
        {filteredChats.length === 0 && (
          <div className="text-center text-sm text-primary/50 mt-10 px-4">
            {searchQuery ? 'No conversations found.' : 'No conversations yet.'}
          </div>
        )}
      </div>
      
      {/* Absolute collapse button inside sidebar for smaller screens, though we can also manage from Layout */}
    </motion.div>
  );
}
