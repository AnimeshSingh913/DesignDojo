'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import ExcalidrawWrapper from '../../ExcalidrawWrapper';
import { QuestionExplorerPanel } from './panels/QuestionExplorerPanel';
import { HLDAssistantPanel } from './panels/HLDAssistantPanel';
import { HLDToolbarPlugin } from './toolbar/HLDToolbarPlugin';
import { TopDiagramSwitcher } from './panels/TopDiagramSwitcher';
import { QuestionStartModal } from './panels/QuestionStartModal';
import { HLDWorkspaceProvider, useHLDWorkspace } from './context/HLDWorkspaceContext';
import { HLDStorageManager } from './storage/HLDStorageManager';
import { CostEstimatorWidget } from './components/CostEstimatorWidget';
import { NodePropertiesMenu } from './components/NodePropertiesMenu';
import { CanvasDebouncedSaver, STORAGE_KEYS, sanitizeAppState, areElementsEqual } from '@/lib/storage/canvasPersistence';
import { safeRestoreElements } from '@/lib/canvas/elementOrdering';
import { Sparkles, X, BookOpen, CloudCheck, Loader2, Download, Save, FolderOpen } from 'lucide-react';
import { ExportDiagramModal } from '@/components/canvas/export/ExportDiagramModal';
import { SaveDiagramModal } from '@/components/canvas/storage/SaveDiagramModal';
import { DiagramHistoryModal } from '@/components/canvas/storage/DiagramHistoryModal';
import { SavedDiagramManager, SavedDiagramItem } from '@/lib/storage/savedDiagramManager';

function WorkspaceContent() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [currentDiagramId, setCurrentDiagramId] = useState<string | null>(null);
  const [currentDiagramName, setCurrentDiagramName] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState<number>(0);

  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const hasRestoredRef = useRef(false);
  const saverRef = useRef<CanvasDebouncedSaver | null>(null);
  const statusTimerRef = useRef<any>(null);
  const lastSavedElementsRef = useRef<readonly any[] | undefined>(undefined);

  const { 
    loadedHistory, 
    setLoadedHistory, 
    activeQuestionId, 
    setActiveQuestionId,
    activeDiagramType,
    setActiveDiagramType
  } = useHLDWorkspace();

  const handleAPI = useCallback((api: any) => {
    setExcalidrawAPI(api);
  }, []);

  // Sync count of saved diagrams for HLD
  useEffect(() => {
    const updateCount = () => {
      const list = SavedDiagramManager.getDiagramsList('hld');
      setSavedCount(list.length);
    };
    updateCount();
    const unsubscribe = SavedDiagramManager.subscribe(updateCount);
    return () => unsubscribe();
  }, []);

  const handleLoadDiagram = (diagram: SavedDiagramItem) => {
    setCurrentDiagramId(diagram.id);
    setCurrentDiagramName(diagram.name);
    if (diagram.diagramType) {
      setActiveDiagramType(diagram.diagramType as any);
    }
  };

  const handleNewCanvas = () => {
    if (excalidrawAPI) {
      excalidrawAPI.resetScene();
    }
    setCurrentDiagramId(null);
    setCurrentDiagramName(null);
  };

  const handleSaveSuccess = (savedItem: SavedDiagramItem) => {
    setCurrentDiagramId(savedItem.id);
    setCurrentDiagramName(savedItem.name);
  };

  // Initialize debounced auto-saver
  useEffect(() => {
    saverRef.current = new CanvasDebouncedSaver(STORAGE_KEYS.HLD_AUTOSAVE, 400, (success) => {
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

  // Restore autosaved diagram metadata on initial mount
  useEffect(() => {
    if (!hasRestoredRef.current && !loadedHistory) {
      hasRestoredRef.current = true;
      const saved = HLDStorageManager.loadAutoSave();
      if (saved?.elements && Array.isArray(saved.elements)) {
        const active = saved.elements.filter((el: any) => el && !el.isDeleted);
        if (active.length > 0) {
          lastSavedElementsRef.current = active;
        }
      }
      if (saved?.metadata) {
        if (saved.metadata.linkedQuestionId && !activeQuestionId) {
          setActiveQuestionId(saved.metadata.linkedQuestionId);
        }
        if (saved.metadata.diagramType && saved.metadata.diagramType !== activeDiagramType) {
          setActiveDiagramType(saved.metadata.diagramType as any);
        }
      }
    }
  }, []);

  // Restore history to canvas when loadedHistory changes
  useEffect(() => {
    if (loadedHistory && excalidrawAPI) {
      if (loadedHistory.elements && Array.isArray(loadedHistory.elements) && loadedHistory.elements.length > 0) {
        setTimeout(async () => {
          try {
            const validElements = await safeRestoreElements(loadedHistory.elements, null);
            lastSavedElementsRef.current = validElements;
            excalidrawAPI.updateScene({ elements: validElements });
            excalidrawAPI.scrollToContent(validElements, { fitToContent: true });
            
            // Auto-save the restored history as current working state
            HLDStorageManager.autoSave(validElements, excalidrawAPI.getAppState(), {
              linkedQuestionId: activeQuestionId,
              diagramType: loadedHistory.diagramType || activeDiagramType
            });
          } catch (e) {
            console.error("Error updating excalidraw scene:", e);
          }
        }, 100);
      }
      setIsAssistantOpen(true); // Open assistant to view restored evaluation/chat
    }
  }, [loadedHistory, excalidrawAPI, activeQuestionId, activeDiagramType]);

  // Handle canvas changes and trigger debounced auto-save
  const handleCanvasChange = useCallback((elements: readonly any[], appState: any) => {
    const isUnchanged = areElementsEqual(lastSavedElementsRef.current, elements);
    const isBlank = (!elements || elements.length === 0) && (!lastSavedElementsRef.current || lastSavedElementsRef.current.length === 0);

    if (saverRef.current && !isUnchanged && !isBlank) {
      lastSavedElementsRef.current = elements;
      setSaveStatus('saving');
      saverRef.current.save({
        elements,
        appState: sanitizeAppState(appState),
        metadata: {
          linkedQuestionId: activeQuestionId,
          diagramType: activeDiagramType,
        },
        timestamp: Date.now()
      });
    }
  }, [activeQuestionId, activeDiagramType]);

  return (
    <div className="absolute inset-0 bg-[#faf9f6] overflow-hidden flex w-full">
      
      {/* Left Panel - Question Explorer */}
      {isExplorerOpen && (
        <div className="relative">
          <button 
            onClick={() => setIsExplorerOpen(false)}
            className="absolute top-4 right-4 p-1.5 text-primary/60 hover:text-primary-ink hover:bg-primary/10 rounded-lg transition-colors z-20 cursor-pointer"
            title="Close Explorer"
          >
            <X size={18} />
          </button>
          <QuestionExplorerPanel />
        </div>
      )}

      {/* Center Canvas Workspace */}
      <div className="flex-1 relative h-full">
        <TopDiagramSwitcher />
        <QuestionStartModal excalidrawAPI={excalidrawAPI} />
        
        <ExcalidrawWrapper 
          storageKey={STORAGE_KEYS.HLD_AUTOSAVE}
          onAPI={handleAPI} 
          onChange={handleCanvasChange}
        />
        
        {/* HLD Toolbar Overlay */}
        <HLDToolbarPlugin excalidrawAPI={excalidrawAPI} />

        {/* Explorer Toggle Button (Visible when closed) */}
        {!isExplorerOpen && (
          <button 
            onClick={() => setIsExplorerOpen(true)}
            className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-xl shadow-md p-2.5 flex items-center justify-center text-blue-600 hover:bg-[#f1f0ff] transition-colors z-10 cursor-pointer"
            title="Open Question Explorer"
          >
            <BookOpen size={20} />
          </button>
        )}

        {/* Assistant Toggle Button (Visible when closed) */}
        {!isAssistantOpen && (
          <button 
            onClick={() => setIsAssistantOpen(true)}
            className="absolute top-20 right-4 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-xl shadow-md p-2.5 flex items-center justify-center text-purple-600 hover:bg-[#f1f0ff] transition-colors z-10 cursor-pointer"
            title="Open HLD Assistant"
          >
            <Sparkles size={20} />
          </button>
        )}

        <NodePropertiesMenu excalidrawAPI={excalidrawAPI} />
        <CostEstimatorWidget excalidrawAPI={excalidrawAPI} />

        {/* Bottom Floating Action Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] px-3 py-1.5 flex items-center gap-2 z-20">
          <button 
            onClick={() => setIsSaveOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors text-white cursor-pointer text-xs font-semibold shadow-xs"
            title="Save HLD Diagram with custom name"
          >
            <Save size={14} />
            <span>Save Diagram</span>
          </button>

          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-primary/5 border border-primary/15 transition-colors text-primary-ink cursor-pointer text-xs font-semibold shadow-xs"
            title="View and restore saved HLD diagrams"
          >
            <FolderOpen size={14} className="text-purple-600" />
            <span>Saved Diagrams</span>
            {savedCount > 0 && (
              <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-full font-bold">
                {savedCount}
              </span>
            )}
          </button>

          <div className="w-[1px] h-4 bg-gray-200" />

          <button 
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 transition-colors text-purple-700 cursor-pointer text-xs font-semibold shadow-xs"
            title="Export as Mermaid (.mmd), GitHub Markdown (.md), PNG, or SVG"
          >
            <Download size={14} />
            <span>Export</span>
            <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.2 rounded font-mono font-bold">.mmd</span>
          </button>
        </div>

        {/* Auto-Save Status Badge */}
        {saveStatus !== 'idle' && (
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-full shadow-sm text-xs font-medium text-gray-700 transition-all duration-300 pointer-events-none select-none">
            {saveStatus === 'saving' ? (
              <>
                <Loader2 size={13} className="animate-spin text-gray-700" />
                <span>Saving HLD diagram...</span>
              </>
            ) : (
              <>
                <CloudCheck size={14} className="text-emerald-600" />
                <span className="text-emerald-700">HLD auto-saved to device</span>
              </>
            )}
          </div>
        )}

        {/* Save Diagram Modal */}
        {isSaveOpen && (
          <SaveDiagramModal
            isOpen={isSaveOpen}
            onClose={() => setIsSaveOpen(false)}
            excalidrawAPI={excalidrawAPI}
            workspaceType="hld"
            diagramType={activeDiagramType || 'System Architecture'}
            linkedQuestionId={activeQuestionId}
            currentDiagramId={currentDiagramId}
            currentDiagramName={currentDiagramName}
            onSaveSuccess={handleSaveSuccess}
            onOpenHistory={() => setIsHistoryOpen(true)}
          />
        )}

        {/* Saved History Modal */}
        {isHistoryOpen && (
          <DiagramHistoryModal
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            excalidrawAPI={excalidrawAPI}
            currentWorkspace="hld"
            activeDiagramId={currentDiagramId}
            onLoadDiagram={handleLoadDiagram}
            onNewDiagram={handleNewCanvas}
            onOpenSaveModal={() => setIsSaveOpen(true)}
          />
        )}

        {/* Export Modal */}
        {isExportOpen && (
          <ExportDiagramModal
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            excalidrawAPI={excalidrawAPI}
            projectName={currentDiagramName ? currentDiagramName.replace(/\s+/g, '_') : (activeQuestionId ? `HLD_${activeQuestionId}` : 'HLD_Architecture')}
            diagramType={activeDiagramType || 'System Architecture'}
            workspaceType="hld"
          />
        )}
      </div>

      {/* Right Panel (Slide in/out) */}
      {isAssistantOpen && (
        <div className="relative">
          <HLDAssistantPanel 
            excalidrawAPI={excalidrawAPI} 
            onClose={() => setIsAssistantOpen(false)} 
          />
        </div>
      )}
      
    </div>
  );
}



export function HLDWorkspaceLayout() {
  return (
    <HLDWorkspaceProvider>
      <WorkspaceContent />
    </HLDWorkspaceProvider>
  );
}
