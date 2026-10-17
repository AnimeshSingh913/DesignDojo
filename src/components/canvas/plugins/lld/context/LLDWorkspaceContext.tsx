'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DiagramType, QuestionProgress, ProgressStatus, Question } from '../types';
import { mockQuestions } from '../data/mockQuestions';

interface LLDWorkspaceState {
  activeDiagramType: DiagramType;
  setActiveDiagramType: (type: DiagramType) => void;
  activeQuestionId: string | null;
  setActiveQuestionId: (id: string | null) => void;
  progressMap: Record<string, QuestionProgress>;
  updateProgress: (questionId: string, status: ProgressStatus) => void;
  isStartModalOpen: boolean;
  setIsStartModalOpen: (open: boolean) => void;
  pendingQuestionId: string | null;
  setPendingQuestionId: (id: string | null) => void;
  currentQuestion: Question | null;
  loadedHistory: any | null;
  setLoadedHistory: (history: any | null) => void;
}

const LLDWorkspaceContext = createContext<LLDWorkspaceState | null>(null);

export function LLDWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [activeDiagramType, setActiveDiagramType] = useState<DiagramType>('Class Diagram');
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, QuestionProgress>>({});
  
  // Start Modal flow
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [pendingQuestionId, setPendingQuestionId] = useState<string | null>(null);
  
  // History Loading flow
  const [loadedHistory, setLoadedHistory] = useState<any | null>(null);

  // Load progress from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('designdojo_lld_progress');
      if (stored) {
        setProgressMap(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load progress", e);
    }
  }, []);

  const updateProgress = (questionId: string, status: ProgressStatus) => {
    setProgressMap(prev => {
      const next = {
        ...prev,
        [questionId]: { questionId, status, lastUpdated: Date.now() }
      };
      localStorage.setItem('designdojo_lld_progress', JSON.stringify(next));
      return next;
    });
  };

  // Whenever a question actually becomes active (after template modal), switch diagram type
  useEffect(() => {
    if (activeQuestionId) {
      const q = mockQuestions.find(q => q.id === activeQuestionId);
      if (q && q.recommendedDiagramType) {
        setActiveDiagramType(q.recommendedDiagramType);
      }
    }
  }, [activeQuestionId]);

  const currentQuestion = activeQuestionId ? mockQuestions.find(q => q.id === activeQuestionId) || null : null;

  return (
    <LLDWorkspaceContext.Provider value={{
      activeDiagramType,
      setActiveDiagramType,
      activeQuestionId,
      setActiveQuestionId,
      progressMap,
      updateProgress,
      isStartModalOpen,
      setIsStartModalOpen,
      pendingQuestionId,
      setPendingQuestionId,
      currentQuestion,
      loadedHistory,
      setLoadedHistory
    }}>
      {children}
    </LLDWorkspaceContext.Provider>
  );
}

export function useLLDWorkspace() {
  const context = useContext(LLDWorkspaceContext);
  if (!context) {
    throw new Error("useLLDWorkspace must be used within LLDWorkspaceProvider");
  }
  return context;
}

