import React, { useState, useEffect } from 'react';
import { useLLDWorkspace } from '../context/LLDWorkspaceContext';
import { DIAGRAM_TOOLS_MAP } from './DiagramTools';
import { 
  Square, Box, List, Layout, FileText, ArrowRight, CornerDownRight, 
  Focus, Link, GitMerge, MoveRight, User, Play, StopCircle, 
  Circle, HelpCircle, ArrowLeftRight, Navigation
} from 'lucide-react';
import { 
  generateClassNode, generateInterfaceNode, generateAbstractClassNode, 
  generateEnumNode, generatePackageNode, generateNoteNode,
  generateObjectNode, generateActorNode, generateLifelineNode,
  generateActivationNode, generateInitialNode, generateFinalNode,
  generateActionNode, generateDecisionNode, generateMergeNode,
  generateForkNode, generateJoinNode, generateUseCaseNode,
  generateComponentNode, generateDeviceNode, generateArtifactNode
} from '../nodes/generators';
import { safeMergeElements } from '@/lib/canvas/elementOrdering';

// Dummy generator for unknown diagrams
const generateGenericNode = (x: number, y: number, name: string) => generateClassNode(x, y, name);

interface Props {
  excalidrawAPI?: any;
}

export function UMLToolbarPlugin({ excalidrawAPI }: Props) {
  const { activeDiagramType } = useLLDWorkspace();
  const [activeNodeTool, setActiveNodeTool] = useState<string | null>(null);
  const [activeEdgeTool, setActiveEdgeTool] = useState<string | null>(null);

  const tools = DIAGRAM_TOOLS_MAP[activeDiagramType] || { nodes: [], edges: [] };

  useEffect(() => {
    if (!activeNodeTool || !excalidrawAPI) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.target instanceof HTMLCanvasElement) {
        e.preventDefault();
        e.stopPropagation();
        
        const appState = excalidrawAPI.getAppState();
        const canvasRect = (e.target as HTMLCanvasElement).getBoundingClientRect();
        const zoom = appState.zoom?.value || 1;
        
        const x = (e.clientX - canvasRect.left) / zoom - appState.scrollX;
        const y = (e.clientY - canvasRect.top) / zoom - appState.scrollY;

        let newElements: any[] = [];
        
        // Map tool to specific generator
        switch (activeNodeTool) {
          case 'Class': newElements = generateClassNode(x, y); break;
          case 'Interface': newElements = generateInterfaceNode(x, y); break;
          case 'AbstractClass': newElements = generateAbstractClassNode(x, y); break;
          case 'Enum': newElements = generateEnumNode(x, y); break;
          case 'Package': newElements = generatePackageNode(x, y); break;
          case 'Note': newElements = generateNoteNode(x, y); break;
          case 'Object': newElements = generateObjectNode(x, y); break;
          case 'Actor': newElements = generateActorNode(x, y); break;
          case 'Lifeline': newElements = generateLifelineNode(x, y); break;
          case 'Activation': newElements = generateActivationNode(x, y); break;
          case 'InitialNode': 
          case 'InitialState': newElements = generateInitialNode(x, y); break;
          case 'FinalNode': 
          case 'FinalState': newElements = generateFinalNode(x, y); break;
          case 'Action': 
          case 'State': newElements = generateActionNode(x, y, activeNodeTool); break;
          case 'Decision': newElements = generateDecisionNode(x, y); break;
          case 'Merge': newElements = generateMergeNode(x, y); break;
          case 'Fork': newElements = generateForkNode(x, y); break;
          case 'Join': newElements = generateJoinNode(x, y); break;
          case 'UseCase': newElements = generateUseCaseNode(x, y); break;
          case 'Component': newElements = generateComponentNode(x, y); break;
          case 'Device': newElements = generateDeviceNode(x, y); break;
          case 'Artifact': newElements = generateArtifactNode(x, y); break;
          // For newly added diagrams, use a generic fallback until fully implemented
          default: newElements = generateGenericNode(x, y, activeNodeTool); break;
        }

        if (newElements.length > 0) {
          const currentElements = excalidrawAPI.getSceneElements();
          safeMergeElements(currentElements, newElements).then((merged) => {
            excalidrawAPI.updateScene({ elements: merged });
          }).catch(err => console.error("Error updating scene with UML elements", err));
        }

        setActiveNodeTool(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, { capture: true });
    return () => document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
  }, [activeNodeTool, excalidrawAPI]);

  const handleToolClick = (toolId: string, isEdge: boolean) => {
    if (!excalidrawAPI) return;
    
    if (isEdge) {
      setActiveNodeTool(null);
      if (activeEdgeTool === toolId) {
        setActiveEdgeTool(null);
        excalidrawAPI.updateScene({ appState: { activeTool: { type: 'selection' } } });
        return;
      }
      setActiveEdgeTool(toolId);
      let updateState: any = { activeTool: { type: 'arrow' }, currentItemStrokeStyle: "solid", currentItemStartArrowhead: null, currentItemEndArrowhead: "arrow" };
      
      switch (toolId) {
        case 'Association':
          updateState = { ...updateState, currentItemStrokeStyle: "solid", currentItemEndArrowhead: "arrow" };
          break;
        case 'Message':
          updateState = { ...updateState, currentItemStrokeStyle: "solid", currentItemEndArrowhead: "triangle" };
          break;
        case 'ControlFlow':
        case 'Transition':
        case 'CommunicationPath':
          updateState = { ...updateState, currentItemStrokeStyle: "solid", currentItemEndArrowhead: "arrow" };
          break;
        case 'Dependency':
        case 'ReturnMessage':
        case 'Include':
        case 'Extend':
          updateState = { ...updateState, currentItemStrokeStyle: "dashed", currentItemEndArrowhead: "arrow" };
          break;
        case 'Inheritance':
          updateState = { ...updateState, currentItemStrokeStyle: "solid", currentItemEndArrowhead: "triangle_outline" };
          break;
        case 'Realization':
          updateState = { ...updateState, currentItemStrokeStyle: "dashed", currentItemEndArrowhead: "triangle_outline" };
          break;
        case 'Aggregation':
          updateState = { ...updateState, currentItemStrokeStyle: "solid", currentItemStartArrowhead: "diamond_outline", currentItemEndArrowhead: null };
          break;
        case 'Composition':
          updateState = { ...updateState, currentItemStrokeStyle: "solid", currentItemStartArrowhead: "diamond", currentItemEndArrowhead: null };
          break;
        case 'SelfMessage':
          updateState = { ...updateState, currentItemStrokeStyle: "solid", currentItemEndArrowhead: "arrow" }; // Needs custom logic, defaulting to arrow
          break;
      }
      
      excalidrawAPI.updateScene({ appState: updateState });
    } else {
      setActiveEdgeTool(null);
      const nextTool = activeNodeTool === toolId ? null : toolId;
      setActiveNodeTool(nextTool);
      excalidrawAPI.updateScene({ appState: { activeTool: { type: 'selection' } } });
    }
  };

  const InterfaceIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="4" x2="17" y2="4" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="7" y1="20" x2="17" y2="20" />
    </svg>
  );

  const getIcon = (id: string) => {
    switch (id) {
      case 'Class': return <Square size={18} />;
      case 'Interface': return <InterfaceIcon />;
      case 'AbstractClass': return <Box size={18} />;
      case 'Enum': return <List size={18} />;
      case 'Package': return <Layout size={18} />;
      case 'Note': return <FileText size={18} />;
      
      case 'Actor': return <User size={18} />;
      case 'UseCase': return <Circle size={18} />;
      case 'Lifeline': return <MoveRight size={18} />;
      case 'Activation': return <Layout size={18} />;
      
      case 'InitialNode': 
      case 'InitialState': return <Play size={18} />;
      case 'FinalNode': 
      case 'FinalState': return <StopCircle size={18} />;
      case 'Action': 
      case 'State': return <Square size={18} />;
      case 'Component': return <Box size={18} />;
      case 'Device': return <Box size={18} />;
      case 'Artifact': return <FileText size={18} />;
      case 'Decision': return <HelpCircle size={18} />;
      case 'Merge': 
      case 'Join': return <GitMerge size={18} />;
      case 'Fork': return <Navigation size={18} />;
      
      case 'Association':
      case 'Message':
      case 'ControlFlow':
      case 'CommunicationPath':
      case 'Transition': return <ArrowRight size={18} />;
      case 'Aggregation': return <Focus size={18} />;
      case 'Composition': return <Link size={18} />;
      case 'Dependency':
      case 'ReturnMessage':
      case 'Include':
      case 'Extend': return <MoveRight size={18} />;
      case 'Inheritance': return <CornerDownRight size={18} />;
      case 'Realization': return <GitMerge size={18} />;
      case 'SelfMessage': return <ArrowLeftRight size={18} />;
      default: return <Square size={18} />;
    }
  };

  return (
    <div className="absolute top-[72px] left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] px-3 py-1.5 flex items-center gap-3 z-10 transition-all">
      
      {tools.nodes.length > 0 && (
        <div className={`flex items-center gap-1 ${tools.edges.length > 0 ? 'border-r border-gray-200/80 pr-3' : ''}`}>
          <div className="text-[10px] uppercase font-bold text-gray-400 mr-1.5 tracking-wider select-none">Nodes</div>
          {tools.nodes.map(tool => (
            <ToolbarButton 
              key={tool.id} 
              icon={getIcon(tool.id)} 
              tooltip={tool.label} 
              isActive={activeNodeTool === tool.id} 
              onClick={() => handleToolClick(tool.id, false)} 
            />
          ))}
        </div>
      )}
      
      {tools.edges.length > 0 && (
        <div className="flex items-center gap-1">
          <div className="text-[10px] uppercase font-bold text-gray-400 mr-1.5 tracking-wider select-none">Edges</div>
          {tools.edges.map(tool => (
            <ToolbarButton 
              key={tool.id} 
              icon={getIcon(tool.id)} 
              tooltip={tool.label} 
              isActive={activeEdgeTool === tool.id}
              onClick={() => handleToolClick(tool.id, true)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ToolbarButton({ icon, tooltip, isActive, onClick }: { icon: React.ReactNode; tooltip: string; isActive?: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors group relative cursor-pointer ${
        isActive 
          ? "bg-[#ececfc] text-black font-bold [&_svg]:stroke-[2.4px]" 
          : "text-[#5f6368] hover:bg-[#f1f0ff] hover:text-gray-900 [&_svg]:stroke-[1.8px]"
      }`}
      aria-label={tooltip}
      title={tooltip}
    >
      {icon}
      <span className="absolute top-full mt-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-gray-900 text-white text-[11px] font-medium rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-150">
        {tooltip}
      </span>
    </button>
  );
}
