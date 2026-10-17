'use client';

import React, { useState, useEffect } from 'react';
import ExcalidrawWrapper from '@/components/canvas/ExcalidrawWrapper';
import { STORAGE_KEYS } from '@/lib/storage/canvasPersistence';
import { ExportDiagramModal } from '@/components/canvas/export/ExportDiagramModal';
import { SaveDiagramModal } from '@/components/canvas/storage/SaveDiagramModal';
import { DiagramHistoryModal } from '@/components/canvas/storage/DiagramHistoryModal';
import { SavedDiagramManager, SavedDiagramItem } from '@/lib/storage/savedDiagramManager';
import { Download, Save, FolderOpen, Plus } from 'lucide-react';

export function CanvasPageClient() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const [currentDiagramId, setCurrentDiagramId] = useState<string | null>(null);
  const [currentDiagramName, setCurrentDiagramName] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState<number>(0);

  // Sync count of saved diagrams for Blank Canvas
  useEffect(() => {
    const updateCount = () => {
      const list = SavedDiagramManager.getDiagramsList('canvas');
      setSavedCount(list.length);
    };
    updateCount();
    const unsubscribe = SavedDiagramManager.subscribe(updateCount);
    return () => unsubscribe();
  }, []);

  const handleLoadDiagram = (diagram: SavedDiagramItem) => {
    setCurrentDiagramId(diagram.id);
    setCurrentDiagramName(diagram.name);
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

  return (
    <div className="absolute inset-0 bg-[#faf9f6] overflow-hidden">
      <ExcalidrawWrapper 
        storageKey={STORAGE_KEYS.BLANK_CANVAS} 
        autoSave={true} 
        showSaveIndicator={true}
        onAPI={setExcalidrawAPI}
      />

      {/* Top Left Canvas Title Pill (if active diagram loaded) */}
      {currentDiagramName && (
        <div className="absolute top-4 left-20 z-20 bg-white/90 backdrop-blur-md border border-primary/10 rounded-full px-3.5 py-1.5 shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-primary-ink truncate max-w-[200px]" title={currentDiagramName}>
            {currentDiagramName}
          </span>
          <button
            onClick={handleNewCanvas}
            title="Start New Canvas"
            className="text-[10px] text-primary/50 hover:text-purple-600 font-semibold ml-1 cursor-pointer"
          >
            (New)
          </button>
        </div>
      )}

      {/* Floating Bottom Action Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] px-3 py-1.5 flex items-center gap-2 z-20">
        <button 
          onClick={() => setIsSaveOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors text-white cursor-pointer text-xs font-semibold shadow-xs"
          title="Save Diagram with custom name"
        >
          <Save size={14} />
          <span>Save Diagram</span>
        </button>

        <button 
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-primary/5 border border-primary/15 transition-colors text-primary-ink cursor-pointer text-xs font-semibold shadow-xs"
          title="View and restore saved diagrams"
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 transition-colors text-purple-700 cursor-pointer text-xs font-semibold shadow-xs"
          title="Export as Mermaid (.mmd), GitHub Markdown (.md), PNG, or SVG"
        >
          <Download size={14} />
          <span>Export</span>
          <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.2 rounded font-mono font-bold">.mmd</span>
        </button>
      </div>

      {/* Save Diagram Modal */}
      {isSaveOpen && (
        <SaveDiagramModal
          isOpen={isSaveOpen}
          onClose={() => setIsSaveOpen(false)}
          excalidrawAPI={excalidrawAPI}
          workspaceType="canvas"
          diagramType="Freeform Architecture"
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
          currentWorkspace="canvas"
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
          projectName={currentDiagramName ? currentDiagramName.replace(/\s+/g, '_') : "Blank_Canvas_Diagram"}
          diagramType="Freeform Architecture"
          workspaceType="canvas"
        />
      )}
    </div>
  );
}

