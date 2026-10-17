import React from 'react';
import { useHLDWorkspace } from '../context/HLDWorkspaceContext';
import { X, File, FilePlus } from 'lucide-react';
import { starterTemplates } from '../data/starterTemplates';
import { DIAGRAM_TOOLS_MAP } from '../toolbar/DiagramTools';
import { generateHLDNode } from '../nodes/generators';
import { createArrow } from '../utils/elementGenerator';
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
    setActiveQuestionId,
    activeDiagramType
  } = useHLDWorkspace();

  if (!isStartModalOpen || !pendingQuestionId) return null;

  const handleSelectMode = async (mode: 'blank' | 'template') => {
    setActiveQuestionId(pendingQuestionId);
    
    if (excalidrawAPI) {
      if (mode === 'template') {
        const template = starterTemplates[pendingQuestionId] || starterTemplates['default'];
        const tools = DIAGRAM_TOOLS_MAP[activeDiagramType] || { nodes: [], edges: [] };
        
        const allElements: any[] = [];
        const allFiles: any[] = [];
        
        // Map local template id to the actual Excalidraw main box element ID
        const nodeIdMap = new Map<string, string>();
        const nodeCoordinatesMap = new Map<string, { x: number, y: number }>();

        // Generate Nodes
        for (const item of template.nodes) {
          const toolDef = tools.nodes.find(t => t.id === item.toolId);
          if (toolDef) {
            try {
              const { elements, file } = await generateHLDNode(item.x, item.y, toolDef);
              allElements.push(...elements);
              if (file) allFiles.push(file);
              
              // elements[1] is the main box
              const mainBox = elements[1];
              if (mainBox) {
                nodeIdMap.set(item.id, mainBox.id);
                nodeCoordinatesMap.set(item.id, { x: item.x, y: item.y });
              }
            } catch (err) {
              console.error("Failed to generate node for template item", item, err);
            }
          }
        }

        // Generate Edges
        if (template.edges) {
          for (const edge of template.edges) {
            const sourceId = nodeIdMap.get(edge.source);
            const targetId = nodeIdMap.get(edge.target);
            const sourceCoords = nodeCoordinatesMap.get(edge.source);
            const targetCoords = nodeCoordinatesMap.get(edge.target);
            
            if (sourceId && targetId && sourceCoords && targetCoords) {
              // Determine edge routing based on relative positions (box is 220x72)
              let startX = sourceCoords.x + 110;
              let startY = sourceCoords.y + 36;
              let endX = targetCoords.x + 110;
              let endY = targetCoords.y + 36;
              
              const dxCenter = endX - startX;
              const dyCenter = endY - startY;
              
              if (Math.abs(dxCenter) > Math.abs(dyCenter)) {
                // Connect horizontally
                if (dxCenter > 0) {
                  startX = sourceCoords.x + 220; // right edge
                  endX = targetCoords.x; // left edge
                } else {
                  startX = sourceCoords.x; // left edge
                  endX = targetCoords.x + 220; // right edge
                }
              } else {
                // Connect vertically
                if (dyCenter > 0) {
                  startY = sourceCoords.y + 72; // bottom edge
                  endY = targetCoords.y; // top edge
                } else {
                  startY = sourceCoords.y; // top edge
                  endY = targetCoords.y + 72; // bottom edge
                }
              }
              
              const dx = endX - startX;
              const dy = endY - startY;
              
              const arrowElement = createArrow(
                startX, startY,
                [[0, 0], [dx, dy]],
                {
                  startBinding: { elementId: sourceId, gap: 5 },
                  endBinding: { elementId: targetId, gap: 5 },
                  strokeStyle: edge.isAsync ? "dashed" : "solid",
                  endArrowhead: edge.isAsync ? "triangle" : "arrow",
                  strokeColor: "#64748b",
                  roundness: { type: 2 } // Curved arrow
                }
              );
              allElements.push(arrowElement);
            }
          }
        }

        try {
          const validElements = await safeRestoreElements(allElements, null);
          if (allFiles.length > 0) {
            excalidrawAPI.addFiles(allFiles);
          }
          excalidrawAPI.updateScene({ elements: validElements, appState: { viewBackgroundColor: "#fffce8" } });
          setTimeout(() => {
            excalidrawAPI.scrollToContent(validElements, { fitToContent: true });
          }, 100);
        } catch (err) {
          console.error("Error loading templates", err);
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
                <div className="text-xs text-gray-500">Begin with placeholder components & layout.</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
