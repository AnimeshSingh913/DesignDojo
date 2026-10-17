'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Paperclip, ArrowUp, X, FileText, Image as ImageIcon, ChevronDown, Brain, ShieldCheck, LayoutDashboard, BookOpen } from 'lucide-react';
import { useMentorStore, MentorMode } from '@/store/useMentorStore';

const MODES: { value: MentorMode; label: string; icon: any }[] = [
  { value: 'mentor', label: 'Mentor', icon: Brain },
  { value: 'interview', label: 'Interview', icon: ShieldCheck },
  { value: 'review', label: 'Review', icon: LayoutDashboard },
  { value: 'learning', label: 'Learning', icon: BookOpen },
];

export interface MentorInputProps {
  onSend: (content: string, mode?: MentorMode) => void;
  isStreaming: boolean;
  onStop: () => void;
}

export function MentorInput({ onSend, isStreaming, onStop }: MentorInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [localMode, setLocalMode] = useState<MentorMode>('mentor');
  const { activeAttachments, addAttachment, removeAttachment, activeChatId, chats, setMode } = useMentorStore();

  const activeChat = chats.find(c => c.id === activeChatId);
  const currentMode = activeChat?.mode || localMode;
  const CurrentModeIcon = MODES.find(m => m.value === currentMode)?.icon || Brain;

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!input.trim() && activeAttachments.length === 0) return;
    onSend(input, currentMode);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const processFile = async (file: File) => {
    if (file.type.startsWith('image/')) {
      alert('Image upload is temporarily disabled as Groq has decommissioned their Vision models.');
      return;
    } else if (file.type === 'application/pdf') {
      if (file.size > 10 * 1024 * 1024) {
        alert('PDF is too large (max 10 MB).');
        return;
      }
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/ai/mentor/parse-pdf', {
          method: 'POST',
          body: formData
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert(data.error || data.message || 'Failed to read the PDF.');
          return;
        }
        if (data.text) {
          addAttachment({
            type: 'pdf',
            fileName: file.name,
            url: '', // No preview for PDF
            extractedText: data.text
          });
          if (data.truncated) {
            alert('Only the first part of this PDF (50 pages / 50,000 characters) will be used as context.');
          }
        } else {
          alert('No selectable text was found in this PDF.');
        }
      } catch (err) {
        console.error('Failed to parse PDF', err);
        alert('Failed to read the PDF.');
      }
    } else {
      alert('Only PDF attachments are supported.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(processFile);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files.length > 0) {
      // Only process pdfs on paste, ignore images
      const files = Array.from(e.clipboardData.files).filter(f => !f.type.startsWith('image/'));
      if (files.length > 0) {
        e.preventDefault();
        files.forEach(processFile);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(processFile);
    }
  };

  return (
    <div className="p-4 bg-surface w-full relative">
      {activeAttachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {activeAttachments.map(att => (
            <div key={att.id} className="relative flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-lg p-2 pr-8 shadow-sm">
              {att.type === 'image' ? <ImageIcon size={16} className="text-primary" /> : <FileText size={16} className="text-primary" />}
              <span className="text-xs font-medium text-primary-ink truncate max-w-[150px]">{att.fileName}</span>
              <button 
                onClick={() => removeAttachment(att.id)}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/10 rounded-md text-primary/50 hover:text-primary-ink transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="relative flex items-end gap-2 bg-white border border-primary/20 shadow-sm rounded-2xl p-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all"
      >
        <div className="relative mb-0.5">
          <button 
            onClick={() => setShowModeDropdown(!showModeDropdown)}
            className="flex items-center gap-1.5 p-2 text-primary/60 hover:text-primary-ink hover:bg-primary/5 rounded-xl transition-colors cursor-pointer"
            title="Select AI Mode"
          >
            <CurrentModeIcon size={18} />
            <span className="text-sm font-medium hidden sm:inline">{MODES.find(m => m.value === currentMode)?.label}</span>
            <ChevronDown size={14} className={`transition-transform ${showModeDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showModeDropdown && (
            <div className="absolute bottom-full left-0 mb-2 w-40 bg-surface border border-primary/10 rounded-xl shadow-lg p-1 z-50">
              {MODES.map(m => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.value}
                    onClick={() => {
                      if (activeChatId) {
                        setMode(activeChatId, m.value);
                      } else {
                        setLocalMode(m.value);
                      }
                      setShowModeDropdown(false);
                    }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                      currentMode === m.value 
                        ? 'bg-primary/10 text-primary-ink font-semibold' 
                        : 'text-primary/70 hover:bg-primary/5 hover:text-primary-ink'
                    }`}
                  >
                    <Icon size={16} />
                    {m.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Ask a System Design question or attach a PDF..."
          className="flex-1 max-h-[200px] bg-transparent resize-none py-2.5 outline-none text-primary-ink text-sm md:text-base custom-scrollbar"
          rows={1}
        />
        
        {isStreaming ? (
          <button 
            onClick={onStop}
            className="p-2.5 bg-primary hover:bg-primary/90 text-surface rounded-xl transition-colors mb-0.5 flex items-center justify-center shrink-0 shadow-md cursor-pointer"
            title="Stop generating"
          >
            <X size={20} />
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={!input.trim() && activeAttachments.length === 0}
            className="p-2.5 bg-primary hover:bg-primary/90 disabled:bg-primary/20 disabled:text-primary/40 text-surface rounded-xl transition-colors mb-0.5 flex items-center justify-center shrink-0 shadow-md disabled:shadow-none cursor-pointer"
            title="Send Message"
          >
            <ArrowUp size={20} />
          </button>
        )}
      </div>
      <div className="text-center mt-2">
        <span className="text-[11px] text-primary/40 font-medium tracking-wide">
          AI Design Mentor can make mistakes. Verify important architectural decisions.
        </span>
      </div>
    </div>
  );
}
