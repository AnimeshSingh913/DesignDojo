'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useMentorStore, MentorMode } from '@/store/useMentorStore';
import { MentorMessage } from './MentorMessage';
import { MentorInput } from './MentorInput';
import { ContextManager } from '@/services/ai/utils/contextManager';
import { Download, Share, LayoutDashboard, Brain, BookOpen, ShieldCheck, Menu } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const SUGGESTED_PROMPTS = [
  "Design Instagram",
  "Design WhatsApp",
  "Design Uber",
  "Design Netflix",
  "CAP Theorem",
  "Rate Limiter",
];

const MODES: { value: MentorMode; label: string; icon: any }[] = [
  { value: 'mentor', label: 'Mentor', icon: Brain },
  { value: 'interview', label: 'Interview', icon: ShieldCheck },
  { value: 'review', label: 'Review', icon: LayoutDashboard },
  { value: 'learning', label: 'Learning', icon: BookOpen },
];

export function MentorChatArea() {
  const { chats, activeChatId, createChat, addMessage, updateMessage, truncateChat, activeAttachments, clearAttachments, updateChatTitle, setMode, sidebarCollapsed, toggleSidebar } = useMentorStore();
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeChat = chats.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming]);

  const handleSend = async (content: string, mode?: MentorMode) => {
    let targetChatId = activeChatId;
    let isNewChat = false;

    if (!targetChatId) {
      targetChatId = createChat(mode || 'mentor');
      isNewChat = true;
    }

    // Stop ongoing stream if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Read history from the store (not the render closure) so edits/truncations are reflected
    const priorChat = useMentorStore.getState().chats.find(c => c.id === targetChatId);
    const priorMessages = priorChat?.messages || [];

    // Generate Title if this is the first message
    if (priorMessages.length === 0 || isNewChat) {
      fetch('/api/ai/mentor/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content })
      })
      .then(res => res.json())
      .then(data => {
        if (data.title) updateChatTitle(targetChatId, data.title);
      })
      .catch(console.error);
    }

    // Capture attachments before sending
    const currentAttachments = [...activeAttachments];
    
    addMessage(targetChatId, {
      role: 'user',
      content,
      attachments: currentAttachments
    });

    clearAttachments();

    // Create a temporary assistant message ID
    const assistantMessageId = addMessage(targetChatId, {
      role: 'assistant',
      content: '...'
    });

    setIsStreaming(true);
    let fullResponse = '';

    try {
      // The system prompt is built server-side from the mode; we only send the conversation.
      const currentMode = priorChat?.mode || mode || 'mentor';
      const historyWithNew = [...priorMessages, { id: 'temp', role: 'user' as const, content, createdAt: 0, attachments: currentAttachments }];
      const payload = ContextManager.buildPayload(historyWithNew, currentAttachments);
      const hasImages = currentAttachments.some(a => a.type === 'image');

      const response = await fetch('/api/ai/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payload.messages,
          documents: payload.documents,
          mode: currentMode,
          hasImages
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        updateMessage(targetChatId, assistantMessageId, errorData.error || errorData.message || 'Limit reached or request failed.');
        setIsStreaming(false);
        return;
      }

      if (!response.body) {
        updateMessage(targetChatId, assistantMessageId, 'No response stream received from server.');
        setIsStreaming(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
          // Update the UI per chunk, but only persist once the stream has finished
          updateMessage(targetChatId, assistantMessageId, fullResponse, { persist: false });
        }
      }
      updateMessage(targetChatId, assistantMessageId, fullResponse || 'No response received. Please try again.');

    } catch (error: any) {
      if (error?.name === 'AbortError') {
        // Persist whatever was streamed before the user pressed stop
        updateMessage(targetChatId, assistantMessageId, fullResponse || '[Stopped]');
        return;
      }
      updateMessage(targetChatId, assistantMessageId, `[Error: ${error.message || 'Unknown error'}]`);
    } finally {
      setIsStreaming(false);
    }
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (!activeChatId || !activeChat) return;
    const msg = activeChat.messages.find(m => m.id === messageId);
    if (!msg) return;
    
    truncateChat(activeChatId, messageId);
    handleSend(newContent);
  };

  const handleExportPDF = async () => {
    if (!chatContainerRef.current) return;
    const canvas = await html2canvas(chatContainerRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${activeChat?.title || 'Chat_Export'}.pdf`);
  };

  const handleExportMarkdown = () => {
    if (!activeChat) return;
    const md = activeChat.messages.map(m => `**${m.role.toUpperCase()}**\n\n${m.content}\n\n---\n`).join('\n');
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeChat.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col bg-bg relative overflow-hidden">
      {/* Top Header */}
      <div className="h-14 shrink-0 border-b border-primary/10 bg-surface flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar} 
            className="p-2 hover:bg-primary/5 rounded-lg text-primary/60 transition-colors cursor-pointer" 
            title={sidebarCollapsed ? "Open Sidebar" : "Close Sidebar"}
          >
            <Menu size={18} />
          </button>
          <h3 className="font-semibold text-primary-ink truncate max-w-sm">{activeChat?.title || 'New Conversation'}</h3>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Brain size={32} />
            </div>
            <h1 className="text-3xl font-heading font-extrabold text-primary-ink mb-4">How can I help you design?</h1>
            <p className="text-primary/70 mb-10">Ask any System Design question, request an architecture review, or prepare for your next interview.</p>

          </div>
        ) : (
          <div className="pb-10">
            {messages.map((msg, index) => (
            <MentorMessage 
              key={`${msg.id}-${index}`} 
              message={msg} 
              onEdit={msg.role === 'user' ? handleEditMessage : undefined}
            />
          ))}  <div ref={scrollRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 bg-surface border-t border-primary/10">
        <MentorInput onSend={handleSend} isStreaming={isStreaming} onStop={stopGenerating} />
      </div>
    </div>
  );
}
