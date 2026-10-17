import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/services/ai/types';
import { HLDASTEngine } from '../ast/HLDASTEngine';
import { useHLDWorkspace } from '../context/HLDWorkspaceContext';

export function useHLDChat(excalidrawAPI: any, diagramType: string, questionId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const { loadedHistory } = useHLDWorkspace();

  const storageKey = questionId 
    ? `designdojo_hld_chat_${questionId}_${diagramType}` 
    : `designdojo_hld_latest_chat_${diagramType}`;

  // Restore from loadedHistory
  useEffect(() => {
    if (loadedHistory && loadedHistory.chatHistory) {
      setMessages(loadedHistory.chatHistory);
      setChatError(null);
    }
  }, [loadedHistory]);

  useEffect(() => {
    if (!loadedHistory) {
      setMessages([]);
    }
  }, [storageKey, loadedHistory]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const clearChat = () => {
    setMessages([]);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !excalidrawAPI) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsChatLoading(true);
    setChatError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // 1. Get elements from Excalidraw
      const elements = excalidrawAPI.getSceneElements();
      const activeElements = elements.filter((el: any) => !el.isDeleted);
      
      if (activeElements.length === 0) {
        setChatError("Please draw your architecture first. You haven't drawn anything yet.");
        setIsChatLoading(false);
        setMessages(messages);
        return;
      }

      // 2. Extract AST
      const hldAST = HLDASTEngine.parseFromCanvas(elements);

      // 3. Send to backend API
      const response = await fetch('/api/ai/hld-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages, 
          ast: hldAST, 
          diagramType 
        }),
        signal: abortControllerRef.current.signal
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setChatError(result.message || result.error || 'Chat request failed.');
        return;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: result.data }]);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setChatError(err.message || 'An unexpected error occurred during chat.');
    } finally {
      setIsChatLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isChatLoading,
    chatError,
    sendMessage,
    clearChat
  };
}
