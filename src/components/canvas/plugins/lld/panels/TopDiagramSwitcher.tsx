import React, { useState } from 'react';
import { useLLDWorkspace } from '../context/LLDWorkspaceContext';
import { DiagramType } from '../types';
import { ChevronDown, Network } from 'lucide-react';

const DIAGRAM_TYPES: DiagramType[] = [
  'Class Diagram',
  'Object Diagram',
  'Package Diagram',
  'Sequence Diagram',
  'Activity Diagram',
  'State Diagram',
  'Use Case Diagram',
  'Component Diagram',
  'Deployment Diagram'
];

export function TopDiagramSwitcher() {
  const { activeDiagramType, setActiveDiagramType } = useLLDWorkspace();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-20">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white/95 backdrop-blur-md border border-gray-200/80 px-3.5 py-2 rounded-xl shadow-md hover:bg-[#f1f0ff] transition-colors cursor-pointer"
        >
          <Network size={16} className="text-gray-700" />
          <span className="font-semibold text-gray-800 text-sm tracking-wide">
            {activeDiagramType}
          </span>
          <ChevronDown size={14} className="text-gray-500" />
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 w-52 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-xl shadow-xl overflow-hidden py-1 z-50">
            {DIAGRAM_TYPES.map(type => (
              <button
                key={type}
                onClick={() => {
                  setActiveDiagramType(type);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-sm transition-colors cursor-pointer ${
                  activeDiagramType === type 
                    ? 'bg-[#ececfc] text-[#1e1e38] font-medium' 
                    : 'text-gray-700 hover:bg-[#f1f0ff]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
