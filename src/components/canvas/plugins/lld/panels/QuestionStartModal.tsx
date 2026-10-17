import React from 'react';
import { useLLDWorkspace } from '../context/LLDWorkspaceContext';
import { X, File, FilePlus } from 'lucide-react';
import { starterTemplates } from '../data/starterTemplates';

import { safeRestoreElements } from '@/lib/canvas/elementOrdering';

interface Props {
  excalidrawAPI: any;
}

export function QuestionStartModal({ excalidrawAPI }: Props) {
  const { 
    isStartModalOpen, 
    setIsStartModalOpen, 
    pendingQuestionId, 
    setPendingQuestionId,
    setActiveQuestionId
  } = useLLDWorkspace();

  if (!isStartModalOpen || !pendingQuestionId) return null;

  const handleSelectMode = async (mode: 'blank' | 'template') => {
    setActiveQuestionId(pendingQuestionId);
    
    if (excalidrawAPI) {
      if (mode === 'template') {
        const rawElements = starterTemplates[pendingQuestionId] || starterTemplates['default'];
        try {
          const validElements = await safeRestoreElements(rawElements, null);
          excalidrawAPI.updateScene({ elements: validElements, appState: { viewBackgroundColor: "#fffce8" } });
          setTimeout(() => {
            excalidrawAPI.scrollToContent(validElements, { fitToContent: true });
          }, 80);
        } catch (err) {
          console.error("Error loading template elements", err);
        }
      } else {
        // Blank Canvas
        excalidrawAPI.updateScene({ elements: [], appState: { viewBackgroundColor: "#fffce8" } });
      }
    }
    
    setIsStartModalOpen(false);
    setPendingQuestionId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[500px] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-800 text-lg">Start Practicing</h3>
          <button 
            onClick={() => { setIsStartModalOpen(false); setPendingQuestionId(null); }}
            className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <p className="text-gray-600 text-sm mb-2 text-center">
            How would you like to begin this architecture design?
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSelectMode('blank')}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors">
                <File size={24} />
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-800 mb-1">Blank Canvas</div>
                <div className="text-xs text-gray-500">Start from scratch with a clean slate.</div>
              </div>
            </button>

            <button
              onClick={() => handleSelectMode('template')}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center text-gray-500 group-hover:text-purple-600 transition-colors">
                <FilePlus size={24} />
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-800 mb-1">Starter Template</div>
                <div className="text-xs text-gray-500">Begin with placeholder diagrams & hints.</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
