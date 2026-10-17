'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import ExcalidrawWrapper from '../../ExcalidrawWrapper';
import { AIControlPanel } from './panels/AIControlPanel';
import { ArchitectureExplanationPanel } from './panels/ArchitectureExplanationPanel';
import { AIGeneratorProvider, useAIGenerator } from './context/AIGeneratorContext';
import { AIGeneratorHistoryManager } from './storage/AIGeneratorHistoryManager';
import { CanvasDebouncedSaver, STORAGE_KEYS, sanitizeAppState, areElementsEqual } from '@/lib/storage/canvasPersistence';
import { safeRestoreElements } from '@/lib/canvas/elementOrdering';
import { Sparkles, Info, CloudCheck, Loader2, Download } from 'lucide-react';
import { ExportDiagramModal } from '@/components/canvas/export/ExportDiagramModal';

function WorkspaceContent() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const hasRestoredRef = useRef(false);
  const saverRef = useRef<CanvasDebouncedSaver | null>(null);
  const statusTimerRef = useRef<any>(null);
  const lastSavedElementsRef = useRef<readonly any[] | undefined>(undefined);

  const { 
    prompt,
    setPrompt,
    complexity,
    setComplexity,
    cloudProvider,
    setCloudProvider,
    explanationData, 
    setExplanationData,
    setLoadedElements 
  } = useAIGenerator();

  const handleAPI = useCallback((api: any) => {
    setExcalidrawAPI(api);
  }, []);

  // Initialize debounced auto-saver for session persistence
  useEffect(() => {
    saverRef.current = new CanvasDebouncedSaver(STORAGE_KEYS.AI_SESSION, 400, (success) => {
      if (success) {
        setSaveStatus('saved');
        if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
        statusTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2500);
      }
    });

    return () => {
      if (saverRef.current) saverRef.current.destroy();
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  // Suppress Excalidraw's internal controlled input and vendor warnings
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('A component is changing a controlled input')) return;
      if (typeof args[0] === 'string' && args[0].includes('Linear element is not normalized')) return;
      if (typeof args[0] === 'string' && args[0].includes('Fractional indices invariant')) return;
      if (typeof args[0] === 'string' && args[0].includes('Permissions policy violation: unload')) return;
      originalError(...args);
    };

    console.warn = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('Permissions policy violation: unload')) return;
      originalWarn(...args);
    };

    return () => { 
      console.error = originalError; 
      console.warn = originalWarn;
    };
  }, []);

  // Restore saved session metadata on initial mount (with 24h expiration check)
  useEffect(() => {
    if (!hasRestoredRef.current) {
      hasRestoredRef.current = true;
      
      // 1. Check if previous active session is older than 24 hours (1 day).
      // If older, automatically archive it to History and clear active session so workspace opens blank.
      const isExpired = AIGeneratorHistoryManager.checkAndArchiveExpiredSession();
      if (isExpired) {
        setPrompt('');
        setExplanationData(null);
        setLoadedElements([]);
        return;
      }

      const session = AIGeneratorHistoryManager.loadSession();
      if (session) {
        if (session.elements && Array.isArray(session.elements)) {
          const active = session.elements.filter((el: any) => el && !el.isDeleted);
          if (active.length > 0) {
            lastSavedElementsRef.current = active;
          }
        }
        if (session.prompt && !prompt) setPrompt(session.prompt);
        if (session.complexity) setComplexity(session.complexity);
        if (session.cloudProvider) setCloudProvider(session.cloudProvider);
        if (session.explanationData) setExplanationData(session.explanationData);
      }
    }
  }, []);

  // Auto-open explanation when data arrives
  useEffect(() => {
    if (explanationData) {
      setIsExplanationOpen(true);
    }
  }, [explanationData]);

  // Handle canvas changes and trigger debounced auto-save
  const handleCanvasChange = useCallback((elements: readonly any[], appState: any) => {
    const isUnchanged = areElementsEqual(lastSavedElementsRef.current, elements);
    const isBlank = (!elements || elements.length === 0) && (!lastSavedElementsRef.current || lastSavedElementsRef.current.length === 0);

    if (saverRef.current && !isUnchanged && !isBlank) {
      lastSavedElementsRef.current = elements;
      setSaveStatus('saving');
      saverRef.current.save({
        prompt,
        complexity,
        cloudProvider,
        elements,
        appState: sanitizeAppState(appState),
        explanationData,
        timestamp: Date.now(),
      });
    }
  }, [prompt, complexity, cloudProvider, explanationData]);

  return (
    <div className="absolute inset-0 bg-[#faf9f6] overflow-hidden flex w-full">
      
      {/* Left Panel - Control Panel with Generate & History */}
      {isSidebarOpen && (
        <AIControlPanel 
          excalidrawAPI={excalidrawAPI} 
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Center Canvas Workspace */}
      <div className="flex-1 relative h-full">
        
        <ExcalidrawWrapper 
          storageKey={STORAGE_KEYS.AI_SESSION}
          onAPI={handleAPI} 
          onChange={handleCanvasChange}
        />

        {/* Sidebar Toggle Button */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 bg-surface border border-primary/10 rounded-xl shadow-lg p-2 flex items-center justify-center text-purple-600 hover:bg-primary/5 transition-colors z-10 cursor-pointer"
            title="Open AI Architect Panel"
          >
            <Sparkles size={20} />
          </button>
        )}

        {/* Explanation Toggle Button */}
        {!isExplanationOpen && explanationData && (
          <button 
            onClick={() => setIsExplanationOpen(true)}
            className="absolute top-20 right-4 bg-surface border border-primary/10 rounded-xl shadow-lg p-2 flex items-center justify-center text-blue-600 hover:bg-primary/5 transition-colors z-10 cursor-pointer"
            title="View Architecture Details"
          >
            <Info size={20} />
          </button>
        )}

        {/* Bottom Floating Action Bar for Export */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] px-3 py-1.5 flex items-center gap-2 z-20">
          <button 
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 transition-colors text-purple-700 cursor-pointer text-sm font-semibold shadow-xs"
            title="Export as Mermaid (.mmd), GitHub Markdown (.md), PNG, or SVG"
          >
            <Download size={16} />
            <span>Export Diagram</span>
            <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.2 rounded font-mono font-bold">.mmd</span>
          </button>
        </div>

        {/* Auto-Save Status Badge */}
        {saveStatus !== 'idle' && (
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-surface/90 backdrop-blur-md border border-primary/10 rounded-full shadow-sm text-xs font-medium text-primary/70 transition-all duration-300 pointer-events-none select-none">
            {saveStatus === 'saving' ? (
              <>
                <Loader2 size={13} className="animate-spin text-primary" />
                <span>Saving AI workspace...</span>
              </>
            ) : (
              <>
                <CloudCheck size={14} className="text-emerald-600" />
                <span className="text-emerald-700">AI workspace saved to device</span>
              </>
            )}
          </div>
        )}

        {isExportOpen && (
          <ExportDiagramModal
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            excalidrawAPI={excalidrawAPI}
            projectName={prompt ? prompt.substring(0, 30).replace(/\s+/g, '_') : 'AI_Architecture'}
            diagramType="System Architecture"
            workspaceType="ai"
          />
        )}
      </div>

      {/* Right Panel */}
      {isExplanationOpen && (
        <ArchitectureExplanationPanel 
          onClose={() => setIsExplanationOpen(false)} 
          excalidrawAPI={excalidrawAPI}
        />
      )}
      
    </div>
  );
}

export function AIGeneratorLayout() {
  return (
    <AIGeneratorProvider>
      <WorkspaceContent />
    </AIGeneratorProvider>
  );
}
