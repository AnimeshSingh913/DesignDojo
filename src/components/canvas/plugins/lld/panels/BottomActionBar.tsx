import React, { useState, useEffect } from 'react';
import { Code, Download, Save, FolderOpen } from 'lucide-react';
import { CodeGenerationModal } from './CodeGenerationModal';
import { ExportDiagramModal } from '@/components/canvas/export/ExportDiagramModal';
import { SaveDiagramModal } from '@/components/canvas/storage/SaveDiagramModal';
import { DiagramHistoryModal } from '@/components/canvas/storage/DiagramHistoryModal';
import { SavedDiagramManager, SavedDiagramItem } from '@/lib/storage/savedDiagramManager';
import { useLLDWorkspace } from '../context/LLDWorkspaceContext';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  excalidrawAPI?: any;
}

export function BottomActionBar({ excalidrawAPI }: Props) {
  const [isCodeGenOpen, setIsCodeGenOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const [currentDiagramId, setCurrentDiagramId] = useState<string | null>(null);
  const [currentDiagramName, setCurrentDiagramName] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState<number>(0);

  const { currentQuestion, activeDiagramType, setActiveDiagramType } = useLLDWorkspace();
  const diagramType = currentQuestion?.recommendedDiagramType || activeDiagramType || 'Class Diagram';
  const projectName = currentDiagramName || currentQuestion?.title || 'LLD_Architecture';

  useEffect(() => {
    const updateCount = () => {
      const list = SavedDiagramManager.getDiagramsList('lld');
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

  return (
    <>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] px-3 py-1.5 flex items-center gap-2 z-20">
        <button 
          onClick={() => setIsSaveOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors text-white cursor-pointer text-xs font-semibold shadow-xs"
          title="Save LLD Diagram with custom name"
        >
          <Save size={14} />
          <span>Save Diagram</span>
        </button>

        <button 
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-primary/5 border border-primary/15 transition-colors text-primary-ink cursor-pointer text-xs font-semibold shadow-xs"
          title="View and restore saved LLD diagrams"
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
          onClick={() => setIsCodeGenOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#f1f0ff] transition-colors group text-indigo-600 hover:text-indigo-700 cursor-pointer text-xs font-medium"
        >
          <Code size={15} />
          <span>Generate Code</span>
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

      {isSaveOpen && (
        <SaveDiagramModal
          isOpen={isSaveOpen}
          onClose={() => setIsSaveOpen(false)}
          excalidrawAPI={excalidrawAPI}
          workspaceType="lld"
          diagramType={diagramType}
          linkedQuestionId={currentQuestion?.id || null}
          currentDiagramId={currentDiagramId}
          currentDiagramName={currentDiagramName}
          onSaveSuccess={handleSaveSuccess}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
      )}

      {isHistoryOpen && (
        <DiagramHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          excalidrawAPI={excalidrawAPI}
          currentWorkspace="lld"
          activeDiagramId={currentDiagramId}
          onLoadDiagram={handleLoadDiagram}
          onNewDiagram={handleNewCanvas}
          onOpenSaveModal={() => setIsSaveOpen(true)}
        />
      )}

      {isCodeGenOpen && (
        <CodeGenerationModal 
          excalidrawAPI={excalidrawAPI}
          diagramType={diagramType}
          onClose={() => setIsCodeGenOpen(false)}
        />
      )}

      {isExportOpen && (
        <ExportDiagramModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          excalidrawAPI={excalidrawAPI}
          projectName={projectName}
          diagramType={diagramType}
          workspaceType="lld"
        />
      )}
    </>
  );
}

