import { create } from 'zustand';
import { nanoid } from 'nanoid';

export type AIProviderName = 'groq' | 'openai' | 'anthropic';
export type MentorMode = 'mentor' | 'interview' | 'review' | 'learning';

export interface Attachment {
  id: string;
  type: 'image' | 'pdf';
  fileName: string;
  url: string; // base64 or blob url
  extractedText?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  createdAt: number;
  attachments?: Attachment[];
}

export interface MentorChat {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  pinned: boolean;
  mode: MentorMode;
}

interface MentorState {
  chats: MentorChat[];
  activeChatId: string | null;
  activeAttachments: Attachment[]; // Attachments uploaded for the CURRENT message before sending
  currentProvider: AIProviderName;
  sidebarCollapsed: boolean;
  
  // Chats
  setChats: (chats: MentorChat[]) => void;
  createChat: (mode?: MentorMode) => string;
  setActiveChat: (id: string | null) => void;
  updateChatTitle: (id: string, title: string) => void;
  deleteChat: (id: string) => void;
  togglePinChat: (id: string) => void;
  setMode: (chatId: string, mode: MentorMode) => void;

  // Messaging
  addMessage: (chatId: string, message: Omit<ChatMessage, 'id' | 'createdAt'>) => string;
  updateMessage: (chatId: string, messageId: string, content: string, options?: { persist?: boolean }) => void;
  truncateChat: (chatId: string, messageId: string) => void;
  
  // Attachments
  addAttachment: (attachment: Omit<Attachment, 'id'>) => void;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;

  // Settings
  setProvider: (provider: AIProviderName) => void;

  // Sidebar
  toggleSidebar: () => void;
}

// Pending "create chat" requests, so updates never race ahead of the initial POST.
const pendingCreates = new Map<string, Promise<unknown>>();
// Debounce timers: rapid edits (typing, streaming) collapse into a single PUT per chat.
const syncTimers = new Map<string, ReturnType<typeof setTimeout>>();
const SYNC_DEBOUNCE_MS = 800;

const putChat = async (chat: MentorChat) => {
  try {
    await pendingCreates.get(chat.id);
    await fetch(`/api/ai/mentor/history/${chat.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chat)
    });
  } catch (error) {
    console.error('Failed to sync chat:', error);
  }
};

const syncChatWithDB = (chat: MentorChat) => {
  const existing = syncTimers.get(chat.id);
  if (existing) clearTimeout(existing);
  syncTimers.set(chat.id, setTimeout(() => {
    syncTimers.delete(chat.id);
    putChat(chat);
  }, SYNC_DEBOUNCE_MS));
};

const cancelSync = (chatId: string) => {
  const existing = syncTimers.get(chatId);
  if (existing) clearTimeout(existing);
  syncTimers.delete(chatId);
};

export const useMentorStore = create<MentorState>()(
  (set) => ({
    chats: [],
    activeChatId: null,
    activeAttachments: [],
    currentProvider: 'groq',
    sidebarCollapsed: true,

    setChats: (chats) => set({ chats }),

    createChat: (mode = 'mentor') => {
      const newChat: MentorChat = {
        id: nanoid(),
        title: 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        pinned: false,
        mode
      };
      set((state) => ({
        chats: [newChat, ...state.chats],
        activeChatId: newChat.id,
      }));

      // Background sync
      const createRequest = fetch('/api/ai/mentor/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChat)
      })
        .catch(err => console.error(err))
        .finally(() => pendingCreates.delete(newChat.id));
      pendingCreates.set(newChat.id, createRequest);

      return newChat.id;
    },

    setActiveChat: (id) => set({ activeChatId: id }),

    updateChatTitle: (id, title) => set((state) => {
      const newChats = state.chats.map(chat => 
        chat.id === id ? { ...chat, title, updatedAt: Date.now() } : chat
      );
      const updatedChat = newChats.find(c => c.id === id);
      if (updatedChat) syncChatWithDB(updatedChat);
      return { chats: newChats };
    }),

    deleteChat: (id) => {
      set((state) => ({
        chats: state.chats.filter(chat => chat.id !== id),
        activeChatId: state.activeChatId === id ? null : state.activeChatId
      }));
      // DB Delete (after any in-flight create, and without a pending update recreating it)
      cancelSync(id);
      Promise.resolve(pendingCreates.get(id))
        .then(() => fetch(`/api/ai/mentor/history/${id}`, { method: 'DELETE' }))
        .catch(err => console.error(err));
    },

    togglePinChat: (id) => set((state) => {
      const newChats = state.chats.map(chat => 
        chat.id === id ? { ...chat, pinned: !chat.pinned, updatedAt: Date.now() } : chat
      );
      const updatedChat = newChats.find(c => c.id === id);
      if (updatedChat) syncChatWithDB(updatedChat);
      return { chats: newChats };
    }),

    setMode: (chatId, mode) => set((state) => {
      const newChats = state.chats.map(chat => 
        chat.id === chatId ? { ...chat, mode, updatedAt: Date.now() } : chat
      );
      const updatedChat = newChats.find(c => c.id === chatId);
      if (updatedChat) syncChatWithDB(updatedChat);
      return { chats: newChats };
    }),

    addMessage: (chatId, message) => {
      const id = nanoid();
      set((state) => {
        const newChats = state.chats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [...chat.messages, { ...message, id, createdAt: Date.now() }],
              updatedAt: Date.now()
            };
          }
          return chat;
        });
        const updatedChat = newChats.find(c => c.id === chatId);
        if (updatedChat) syncChatWithDB(updatedChat);
        return { chats: newChats };
      });
      return id;
    },

    updateMessage: (chatId, messageId, content, options) => set((state) => {
      const newChats = state.chats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: chat.messages.map(msg => 
              msg.id === messageId ? { ...msg, content } : msg
            ),
            updatedAt: Date.now()
          };
        }
        return chat;
      });
      const updatedChat = newChats.find(c => c.id === chatId);
      if (updatedChat && options?.persist !== false) syncChatWithDB(updatedChat);
      return { chats: newChats };
    }),

    truncateChat: (chatId, messageId) => set((state) => {
      const newChats = state.chats.map(chat => {
        if (chat.id === chatId) {
          const index = chat.messages.findIndex(m => m.id === messageId);
          if (index !== -1) {
            return {
              ...chat,
              messages: chat.messages.slice(0, index),
              updatedAt: Date.now()
            };
          }
        }
        return chat;
      });
      const updatedChat = newChats.find(c => c.id === chatId);
      if (updatedChat) syncChatWithDB(updatedChat);
      return { chats: newChats };
    }),

    addAttachment: (attachment) => set((state) => ({
      activeAttachments: [...state.activeAttachments, { ...attachment, id: nanoid() }]
    })),

    removeAttachment: (id) => set((state) => ({
      activeAttachments: state.activeAttachments.filter(a => a.id !== id)
    })),

    clearAttachments: () => set({ activeAttachments: [] }),

    setProvider: (provider) => {
      set({ currentProvider: provider });
    },

    toggleSidebar: () => {
      set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
    }
  })
);
