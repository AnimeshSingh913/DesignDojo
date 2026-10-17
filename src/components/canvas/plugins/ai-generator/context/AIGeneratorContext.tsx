'use client';

import React, { createContext, useContext, useState } from 'react';
import { AIGeneratedArchitecture } from '@/services/ai/types';

interface AIGeneratorContextType {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  explanationData: AIGeneratedArchitecture['explanation'] | null;
  setExplanationData: (data: AIGeneratedArchitecture['explanation'] | null) => void;
  complexity: string;
  setComplexity: (complexity: string) => void;
  cloudProvider: string;
  setCloudProvider: (cloudProvider: string) => void;
  loadedElements: any[] | null;
  setLoadedElements: (elements: any[] | null) => void;
}

const AIGeneratorContext = createContext<AIGeneratorContextType | undefined>(undefined);

export function AIGeneratorProvider({ children }: { children: React.ReactNode }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [explanationData, setExplanationData] = useState<AIGeneratedArchitecture['explanation'] | null>(null);
  const [complexity, setComplexity] = useState('Intermediate');
  const [cloudProvider, setCloudProvider] = useState('Generic');
  const [loadedElements, setLoadedElements] = useState<any[] | null>(null);

  return (
    <AIGeneratorContext.Provider
      value={{
        prompt,
        setPrompt,
        isGenerating,
        setIsGenerating,
        explanationData,
        setExplanationData,
        complexity,
        setComplexity,
        cloudProvider,
        setCloudProvider,
        loadedElements,
        setLoadedElements,
      }}
    >
      {children}
    </AIGeneratorContext.Provider>
  );
}

export function useAIGenerator() {
  const context = useContext(AIGeneratorContext);
  if (context === undefined) {
    throw new Error('useAIGenerator must be used within an AIGeneratorProvider');
  }
  return context;
}
