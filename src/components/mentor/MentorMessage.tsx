'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, Bot, User, Edit2, FileText } from 'lucide-react';
import { ChatMessage } from '@/store/useMentorStore';
import { MermaidViewer } from '@/components/ui/MermaidViewer';

interface MentorMessageProps {
  message: ChatMessage;
  onEdit?: (messageId: string, newContent: string) => void;
}

export function MentorMessage({ message, onEdit }: MentorMessageProps) {
  const isAssistant = message.role === 'assistant' || message.role === 'system';
  const isSystem = message.role === 'system';
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSave = () => {
    if (editContent.trim() !== message.content && onEdit) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  if (isSystem) return null; // We don't render system prompts usually in the chat UI.

  return (
    <div className={`py-6 flex gap-4 px-4 md:px-8 group ${isAssistant ? 'bg-primary/5' : 'flex-row-reverse'}`}>
      <div className="shrink-0 mt-1">
        {isAssistant ? (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm">
            <Bot size={18} />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent-dark shadow-sm">
            <User size={18} />
          </div>
        )}
      </div>

      <div className={`flex-1 min-w-0 ${isAssistant ? '' : 'flex flex-col items-end'}`}>
        <div className={`font-semibold text-primary-ink mb-1 flex items-center gap-2 ${isAssistant ? '' : 'flex-row-reverse'}`}>
          {isAssistant ? 'Design Mentor' : 'You'}
          {!isAssistant && !isEditing && onEdit && (
            <button 
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 p-1 text-primary/40 hover:text-primary transition-opacity"
              title="Edit message"
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>
        
        {/* Render Attachments if any */}
        {message.attachments && message.attachments.length > 0 && (
          <div className={`flex flex-wrap gap-2 mb-4 ${isAssistant ? '' : 'justify-end'}`}>
            {message.attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-2 bg-surface border border-primary/20 rounded-lg p-2 max-w-[200px]">
                {att.type === 'image' ? (
                  <Image src={att.url} alt={att.fileName} width={40} height={40} className="w-10 h-10 object-cover rounded" unoptimized />
                ) : (
                  <div className="flex flex-col items-center justify-center w-10 h-10 bg-primary/5 rounded">
                    <span className="font-bold text-primary mb-1 text-[10px]">PDF</span>
                    <FileText size={12} className="text-primary/70" />
                  </div>
                )}
                <span className="text-xs text-primary/70 truncate">{att.fileName}</span>
              </div>
            ))}
          </div>
        )}

        {/* Render Markdown Content */}
        {isEditing ? (
          <div className="w-full max-w-2xl bg-surface border border-primary/20 rounded-xl p-3 shadow-sm mt-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-transparent resize-y min-h-[100px] outline-none text-primary-ink text-sm md:text-base custom-scrollbar p-1"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-primary/10">
              <button 
                onClick={() => { setIsEditing(false); setEditContent(message.content); }}
                className="px-3 py-1.5 text-sm font-medium text-primary/70 hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={!editContent.trim()}
                className="px-3 py-1.5 text-sm font-medium bg-primary text-surface hover:bg-primary/90 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
              >
                Save & Submit
              </button>
            </div>
          </div>
        ) : (
          <div className={`prose prose-sm md:prose-base max-w-none prose-pre:bg-[#1E1E1E] prose-pre:text-white prose-code:text-primary-ink ${isAssistant ? 'text-primary-ink/90' : 'bg-primary/10 px-5 py-3 rounded-2xl rounded-tr-sm inline-block text-primary-ink text-left'}`}>
            {message.content === '...' ? (
              <div className="flex space-x-1 items-center h-6">
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    const codeString = String(children).replace(/\n$/, '');

                    if (!inline && match) {
                      if (language.toLowerCase() === 'mermaid') {
                        return (
                          <div className="my-4 not-prose">
                            <MermaidViewer 
                              chart={codeString}
                              title="Architecture Diagram"
                              showControls={true}
                              initialMode="preview"
                            />
                          </div>
                        );
                      }

                      return (
                        <div className="relative group mt-4 mb-4 rounded-xl overflow-hidden shadow-sm text-left not-prose">
                          <div className="bg-[#1E1E1E] text-white/50 text-xs px-4 py-2 flex justify-between items-center border-b border-black/30">
                            <span>{language}</span>
                            <button 
                              onClick={() => handleCopy(codeString)}
                              className="hover:text-white transition-colors cursor-pointer"
                            >
                              {copiedText === codeString ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <SyntaxHighlighter
                            {...props}
                            style={vscDarkPlus as any}
                            language={language}
                            PreTag="div"
                            className="!m-0 !rounded-none !bg-[#1E1E1E]"
                          >
                            {codeString}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }
                    return (
                      <code {...props} className="bg-primary/10 px-1.5 py-0.5 rounded text-sm font-mono text-primary-ink">
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
