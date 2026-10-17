import React, { useEffect, useState } from 'react';
import { Server, Zap, HardDrive } from 'lucide-react';
import { normalizeFractionalIndices } from '@/lib/canvas/elementOrdering';

interface Props {
  excalidrawAPI: any;
}

type NodeSize = 'small' | 'medium' | 'large';

export function NodePropertiesMenu({ excalidrawAPI }: Props) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [currentSize, setCurrentSize] = useState<NodeSize>('small');
  const [nodeType, setNodeType] = useState<string>('');

  useEffect(() => {
    if (!excalidrawAPI) return;

    const checkSelection = () => {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const selectedIds = Object.keys(appState.selectedElementIds || {}).filter(
        id => appState.selectedElementIds[id]
      );

      if (selectedIds.length === 0) {
        setSelectedNodeId(null);
        return;
      }

      // Find the first selected element
      const firstEl = elements.find((el: any) => el.id === selectedIds[0]);
      if (!firstEl) {
        setSelectedNodeId(null);
        return;
      }

      const topLevelGroupId = firstEl.groupIds?.[firstEl.groupIds.length - 1];

      let dataElement = null;
      
      if (topLevelGroupId) {
        // If it's a group, check if ALL selected elements belong to this group (to avoid showing menu when multiple unrelated nodes are selected)
        const allSelectedInSameGroup = selectedIds.every((id: string) => {
          const el = elements.find((e: any) => e.id === id);
          return el && el.groupIds?.includes(topLevelGroupId);
        });

        if (allSelectedInSameGroup) {
          const groupElements = elements.filter((el: any) => el.groupIds?.includes(topLevelGroupId));
          // Look for any element in the group that has customData
          dataElement = groupElements.find((e: any) => e.customData?.type === 'node');
        }
      } else if (selectedIds.length === 1) {
        // Single element without group
        dataElement = firstEl.customData?.type === 'node' ? firstEl : null;
      }

      if (dataElement) {
        if (['User', 'WebApp', 'MobileApp', 'Admin'].includes(dataElement.customData.id)) {
          setSelectedNodeId(null);
          return;
        }
        
        // We track the group ID as the selected node so we can update all elements in it
        setSelectedNodeId(topLevelGroupId || dataElement.id);
        setNodeType(dataElement.customData.label || dataElement.customData.id);
        setCurrentSize(dataElement.customData.size || 'small');
      } else {
        setSelectedNodeId(null);
      }
    };

    const unsubscribe = excalidrawAPI.onChange(() => {
      checkSelection();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [excalidrawAPI]);

  const handleSizeChange = async (newSize: NodeSize) => {
    if (!excalidrawAPI || !selectedNodeId) return;

    try {
      const elements = excalidrawAPI.getSceneElements();
      
      let updatedCount = 0;
      const newElements = elements.map((el: any) => {
        if ((el.groupIds && el.groupIds.includes(selectedNodeId)) || el.id === selectedNodeId) {
          if (el.customData && el.customData.type === 'node') {
            updatedCount++;
            return {
              ...el,
              customData: {
                ...el.customData,
                size: newSize
              },
              version: el.version + 1,
              versionNonce: Math.floor(Math.random() * 1000000000)
            };
          }
        }
        return el;
      });
      
      if (updatedCount > 0) {
        // Force an update to the canvas with completely new element references
        excalidrawAPI.updateScene({ elements: normalizeFractionalIndices(newElements) });
        setCurrentSize(newSize);
      }
    } catch (e) {
      console.error("Failed to update node size", e);
    }
  };

  if (!selectedNodeId) return null;

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-surface/95 backdrop-blur-md border border-primary/20 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 z-20 animate-in slide-in-from-top-4 duration-200">
      <div className="text-xs font-semibold text-primary/60 uppercase tracking-wider px-1 text-center">
        {nodeType} Capacity
      </div>
      <div className="flex items-center gap-1.5 p-1 bg-primary/5 rounded-xl border border-primary/10">
        <button
          onClick={() => handleSizeChange('small')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentSize === 'small' 
              ? 'bg-white shadow-sm text-blue-600 border border-blue-200 scale-[1.02]' 
              : 'text-primary/70 hover:bg-white/50 hover:text-primary-ink'
          }`}
        >
          <Server size={14} /> Small
        </button>
        <button
          onClick={() => handleSizeChange('medium')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentSize === 'medium' 
              ? 'bg-white shadow-sm text-purple-600 border border-purple-200 scale-[1.02]' 
              : 'text-primary/70 hover:bg-white/50 hover:text-primary-ink'
          }`}
        >
          <HardDrive size={14} /> Medium
        </button>
        <button
          onClick={() => handleSizeChange('large')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentSize === 'large' 
              ? 'bg-white shadow-sm text-orange-600 border border-orange-200 scale-[1.02]' 
              : 'text-primary/70 hover:bg-white/50 hover:text-primary-ink'
          }`}
        >
          <Zap size={14} /> Large
        </button>
      </div>
    </div>
  );
}
