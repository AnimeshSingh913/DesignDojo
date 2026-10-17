import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useHLDWorkspace } from '../context/HLDWorkspaceContext';
import { DIAGRAM_TOOLS_MAP, ToolDefinition } from './DiagramTools';
import { 
  Square, Box, Type, List, Layout, FileText, ArrowRight, CornerDownRight, 
  Focus, Link, GitMerge, MoveRight, User, Play, StopCircle, 
  Circle, HelpCircle, ArrowLeftRight, Navigation, Server, Database, Cloud, Activity, Settings, Network, Shield, Clock, ShieldAlert, GitPullRequest, Search, CreditCard, Mail, MessageSquare, Key, Bell, Webhook
} from 'lucide-react';
import { generateHLDNode } from '../nodes/generators';
import { safeMergeElements } from '@/lib/canvas/elementOrdering';

interface Props {
  excalidrawAPI?: any;
}

// Group definitions
const TOOL_CATEGORIES = [
  { id: 'clients', label: 'Clients', icon: <User size={16} />, tools: ['User', 'WebApp', 'MobileApp', 'Admin'] },
  { id: 'network', label: 'Networking', icon: <Network size={16} />, tools: ['DNS', 'CDN', 'APIGateway', 'ReverseProxy', 'LoadBalancer', 'WAF', 'Firewall', 'GraphQL', 'gRPC', 'WebSocket', 'Nginx', 'Consul'] },
  { id: 'compute', label: 'Compute', icon: <Server size={16} />, tools: ['AppServer', 'Microservice', 'Worker', 'CronScheduler'] },
  { id: 'storage', label: 'Storage', icon: <Database size={16} />, tools: ['SQLDatabase', 'PostgreSQL', 'MySQL', 'NoSQLDatabase', 'MongoDB', 'Redis', 'ObjectStorage', 'FileStorage', 'Elasticsearch'] },
  { id: 'messaging', label: 'Messaging', icon: <List size={16} />, tools: ['Kafka', 'RabbitMQ', 'Queue', 'EventBus'] },
  { id: 'infra', label: 'Infrastructure', icon: <Cloud size={16} />, tools: ['Docker', 'Kubernetes', 'Cloud', 'Region', 'Vault'] },
  { id: 'services', label: 'Services', icon: <Settings size={16} />, tools: ['Authentication', 'Notification', 'Search', 'Analytics', 'Monitoring', 'Logging', 'Payment', 'Email', 'SMS', 'Prometheus', 'Grafana'] },
  { id: 'external', label: 'External', icon: <Webhook size={16} />, tools: ['ThirdPartyAPI', 'ExternalService'] }
];

export function HLDToolbarPlugin({ excalidrawAPI }: Props) {
  const { activeDiagramType } = useHLDWorkspace();
  const [activeNodeTool, setActiveNodeTool] = useState<string | null>(null);
  const [activeEdgeTool, setActiveEdgeTool] = useState<string | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const tools = DIAGRAM_TOOLS_MAP[activeDiagramType] || { nodes: [], edges: [] };

  useEffect(() => {
    if (!activeNodeTool || !excalidrawAPI) return;

    const handlePointerDown = async (e: PointerEvent) => {
      if (e.target instanceof HTMLCanvasElement) {
        e.preventDefault();
        e.stopPropagation();
        
        const appState = excalidrawAPI.getAppState();
        const canvasRect = (e.target as HTMLCanvasElement).getBoundingClientRect();
        const zoom = appState.zoom?.value || 1;
        
        const x = (e.clientX - canvasRect.left) / zoom - appState.scrollX;
        const y = (e.clientY - canvasRect.top) / zoom - appState.scrollY;

        const toolDef = tools.nodes.find(t => t.id === activeNodeTool);
        if (toolDef) {
          try {
            const { elements: newElements, file } = await generateHLDNode(x, y, toolDef);
            
            if (newElements.length > 0) {
              if (file) {
                excalidrawAPI.addFiles([file]);
              }

              const currentElements = excalidrawAPI.getSceneElements();
              const merged = await safeMergeElements(currentElements, newElements);
              excalidrawAPI.updateScene({ elements: merged });
            }
          } catch (err) {
            console.error("Error generating HLD node", err);
          }
        }

        setActiveNodeTool(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, { capture: true });
    return () => document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
  }, [activeNodeTool, excalidrawAPI, tools]);

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
        case 'Connection':
          updateState = { ...updateState, currentItemStrokeStyle: "solid", currentItemEndArrowhead: "arrow", currentItemStrokeColor: "#1e1e1e" };
          break;
        case 'AsyncConnection':
          updateState = { ...updateState, currentItemStrokeStyle: "dashed", currentItemEndArrowhead: "triangle", currentItemStrokeColor: "#1e1e1e" };
          break;
        case 'HTTPConnection':
          updateState = { ...updateState, currentItemStrokeStyle: "solid", currentItemEndArrowhead: "arrow", currentItemStrokeColor: "#3b82f6" };
          break;
        case 'gRPCConnection':
          updateState = { ...updateState, currentItemStrokeStyle: "solid", currentItemEndArrowhead: "arrow", currentItemStrokeColor: "#10b981" };
          break;
        case 'WebSocketConnection':
          updateState = { ...updateState, currentItemStrokeStyle: "dashed", currentItemEndArrowhead: "arrow", currentItemStrokeColor: "#8b5cf6" };
          break;
        case 'TCPConnection':
          updateState = { ...updateState, currentItemStrokeStyle: "solid", currentItemEndArrowhead: "triangle", currentItemStrokeColor: "#f59e0b" };
          break;
      }
      excalidrawAPI.updateScene({ appState: updateState });
    } else {
      setActiveEdgeTool(null);
      const nextTool = activeNodeTool === toolId ? null : toolId;
      setActiveNodeTool(nextTool);
      if (nextTool) {
        excalidrawAPI.updateScene({ appState: { activeTool: { type: 'selection' } } });
      }
      setOpenCategory(null);
      setSearchQuery('');
      setIsSearchExpanded(false);
    }
  };

  const renderIcon = (toolId: string) => {
    switch (toolId) {
      case 'User': return <User size={16} />;
      case 'MobileApp': return <Layout size={16} />;
      case 'WebApp': return <Layout size={16} />;
      case 'Admin': return <Shield size={16} />;
      
      case 'APIGateway': return <GitMerge size={16} />;
      case 'LoadBalancer': return <GitPullRequest size={16} />;
      case 'DNS': return <Network size={16} />;
      case 'CDN': return <Cloud size={16} />;
      case 'ReverseProxy': return <GitMerge size={16} />;
      case 'WAF': return <ShieldAlert size={16} />;
      case 'Firewall': return <Shield size={16} />;
      
      case 'Microservice': return <Box size={16} />;
      case 'AppServer': return <Server size={16} />;
      case 'Worker': return <Server size={16} />;
      case 'CronScheduler': return <Clock size={16} />;
      
      case 'SQLDatabase': return <Database size={16} />;
      case 'PostgreSQL': return <Database size={16} />;
      case 'MySQL': return <Database size={16} />;
      case 'NoSQLDatabase': return <Database size={16} />;
      case 'MongoDB': return <Database size={16} />;
      case 'Redis': return <Database size={16} />;
      
      case 'Kafka': return <List size={16} />;
      case 'RabbitMQ': return <List size={16} />;
      case 'Queue': return <List size={16} />;
      case 'EventBus': return <List size={16} />;
      
      case 'ObjectStorage': return <FileText size={16} />;
      case 'FileStorage': return <FileText size={16} />;
      
      case 'Cloud': return <Cloud size={16} />;
      case 'Docker': return <Square size={16} />;
      case 'Kubernetes': return <Box size={16} />;
      case 'Region': return <Box size={16} />;
      
      case 'Authentication': return <Key size={16} />;
      case 'Notification': return <Bell size={16} />;
      case 'Search': return <Search size={16} />;
      case 'Analytics': return <Activity size={16} />;
      case 'Monitoring': return <Activity size={16} />;
      case 'Logging': return <FileText size={16} />;
      case 'Payment': return <CreditCard size={16} />;
      case 'Email': return <Mail size={16} />;
      case 'SMS': return <MessageSquare size={16} />;
      
      case 'ThirdPartyAPI': return <Webhook size={16} />;
      case 'ExternalService': return <Link size={16} />;
      
      case 'GraphQL': return <Network size={16} />;
      case 'gRPC': return <Network size={16} />;
      case 'WebSocket': return <MoveRight size={16} />;
      case 'Nginx': return <Network size={16} />;
      case 'Elasticsearch': return <Search size={16} />;
      case 'Prometheus': return <Activity size={16} />;
      case 'Grafana': return <Activity size={16} />;
      case 'Vault': return <Shield size={16} />;
      case 'Consul': return <Network size={16} />;
      
      case 'Connection': return <MoveRight size={16} />;
      case 'AsyncConnection': return <ArrowRight size={16} />;
      case 'HTTPConnection': return <MoveRight size={16} className="text-blue-500" />;
      case 'gRPCConnection': return <MoveRight size={16} className="text-green-500" />;
      case 'WebSocketConnection': return <ArrowRight size={16} className="text-purple-500" />;
      case 'TCPConnection': return <MoveRight size={16} className="text-orange-500" />;
      default: return <Box size={16} />;
    }
  };

  const handleMouseEnter = (categoryId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!searchQuery) {
      setOpenCategory(categoryId);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenCategory(null);
    }, 300);
  };

  const searchResults = useMemo(() => {
    if (!searchQuery) return null;
    const lowerQuery = searchQuery.toLowerCase();
    
    const SYNONYMS: Record<string, string[]> = {
      'database': ['SQLDatabase', 'NoSQLDatabase', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis'],
      'db': ['SQLDatabase', 'NoSQLDatabase', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis'],
      'auth': ['Authentication'],
      'api': ['APIGateway', 'GraphQL', 'ThirdPartyAPI'],
      'queue': ['Kafka', 'RabbitMQ', 'EventBus', 'Queue'],
      'cache': ['Redis'],
      'pubsub': ['Kafka', 'EventBus', 'RabbitMQ']
    };
    
    let matchedSynonymTools: string[] = [];
    Object.entries(SYNONYMS).forEach(([key, list]) => {
      if (key.includes(lowerQuery) || lowerQuery.includes(key)) {
         matchedSynonymTools = [...matchedSynonymTools, ...list];
      }
    });

    return TOOL_CATEGORIES.map(category => {
      const matchedTools = category.tools
        .map(tId => tools.nodes.find(t => t.id === tId))
        .filter((t): t is ToolDefinition => {
          if (!t) return false;
          if (t.label.toLowerCase().includes(lowerQuery) || t.id.toLowerCase().includes(lowerQuery)) return true;
          if (matchedSynonymTools.includes(t.id)) return true;
          return false;
        });
        
      return { ...category, matchedTools };
    }).filter(c => c.matchedTools.length > 0);
  }, [searchQuery, tools.nodes]);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-[95vw] bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-2.5 flex flex-col items-center gap-2 z-10 transition-all">
      
      {/* Top Row: Search Field */}
      <div className="relative flex-shrink-0 w-full flex justify-center">
        <div className="flex items-center bg-gray-50/80 border border-gray-200/80 rounded-xl transition-all duration-300 overflow-hidden w-64 pl-3 pr-2 py-1.5 focus-within:ring-2 focus-within:ring-[#6965db]/20 focus-within:border-[#6965db]">
          <Search size={16} className="text-gray-500 shrink-0 mr-2" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder:text-gray-400"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => { setOpenCategory('search'); setIsSearchExpanded(true); }}
            onBlur={() => {
              if (!searchQuery) setIsSearchExpanded(false);
            }}
            aria-label="Search architecture components"
          />
        </div>

        {/* Global Search Results Dropdown - Spawns ABOVE toolbar */}
        {searchQuery && searchResults && searchResults.length > 0 && openCategory === 'search' && (
          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-200/80 rounded-xl shadow-xl p-3 w-[320px] max-h-[400px] overflow-y-auto z-50">
            {searchResults.map(category => (
              <div key={category.id} className="mb-4 last:mb-0">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  {category.icon} {category.label}
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {category.matchedTools.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.id, false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm text-left focus:outline-none ${
                        activeNodeTool === tool.id 
                          ? "bg-[#ececfc] text-black font-semibold [&_svg]:stroke-[2.4px]" 
                          : "text-[#5f6368] hover:bg-[#f1f0ff] hover:text-gray-900 [&_svg]:stroke-[1.8px]"
                      }`}
                      aria-label={`Select ${tool.label}`}
                      tabIndex={0}
                    >
                      <span className={activeNodeTool === tool.id ? "text-black" : "text-[#5f6368]"}>{renderIcon(tool.id)}</span>
                      {tool.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Row: Categories and Edges */}
      <div className="flex items-center gap-1.5">
        
        {/* Categorized Nodes */}
        {tools.nodes.length > 0 && (
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-1 items-center ${tools.edges.length > 0 ? 'sm:border-r sm:border-gray-200/80 sm:pr-2' : ''}`}>
            {TOOL_CATEGORIES.map(category => {
              const categoryTools = tools.nodes.filter(t => category.tools.includes(t.id));
              if (categoryTools.length === 0) return null;

              const isActive = categoryTools.some(t => t.id === activeNodeTool);

              return (
                <div 
                  key={category.id} 
                  className="relative group"
                  onMouseEnter={() => handleMouseEnter(category.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button 
                    className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-sm font-medium whitespace-nowrap focus:outline-none ${
                      isActive || (openCategory === category.id && !searchQuery)
                        ? "bg-[#ececfc] text-black font-semibold [&_svg]:stroke-[2.4px]" 
                        : "text-[#5f6368] hover:bg-[#f1f0ff] hover:text-gray-900 [&_svg]:stroke-[1.8px]"
                    }`}
                    aria-haspopup="true"
                    aria-expanded={openCategory === category.id}
                    aria-label={`${category.label} Category`}
                  >
                    <span className={`${isActive || (openCategory === category.id && !searchQuery) ? "text-black" : "text-[#5f6368] group-hover:text-gray-800"} transition-colors`}>{category.icon}</span>
                    <span className="hidden md:inline">{category.label}</span>
                  </button>

                  {/* Dropdown Menu - Spawns ABOVE toolbar */}
                  {openCategory === category.id && !searchQuery && (
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-200/80 rounded-xl shadow-xl p-3 w-max min-w-[280px] z-50 transform origin-bottom animate-in zoom-in-95 duration-100">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 px-2">
                        {category.icon} {category.label}
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {categoryTools.map(tool => (
                          <button
                            key={tool.id}
                            onClick={() => handleToolClick(tool.id, false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm text-left focus:outline-none ${
                              activeNodeTool === tool.id 
                                ? "bg-[#ececfc] text-black font-semibold [&_svg]:stroke-[2.4px]" 
                                : "text-[#5f6368] hover:bg-[#f1f0ff] hover:text-gray-900 [&_svg]:stroke-[1.8px]"
                            }`}
                            aria-label={`Select ${tool.label}`}
                            tabIndex={0}
                          >
                            <span className={activeNodeTool === tool.id ? "text-black" : "text-[#5f6368]"}>{renderIcon(tool.id)}</span>
                            {tool.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Edges */}
        {tools.edges.length > 0 && (
          <div className="grid grid-cols-3 gap-1 pl-1">
            {tools.edges.map(tool => (
              <ToolbarButton 
                key={tool.id} 
                icon={renderIcon(tool.id)} 
                tooltip={tool.label} 
                isActive={activeEdgeTool === tool.id}
                onClick={() => handleToolClick(tool.id, true)} 
              />
            ))}
          </div>
        )}

      </div>
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
      className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-colors group relative cursor-pointer focus:outline-none ${
        isActive 
          ? "bg-[#ececfc] text-black font-bold [&_svg]:stroke-[2.4px]" 
          : "text-[#5f6368] hover:bg-[#f1f0ff] hover:text-gray-900 [&_svg]:stroke-[1.8px]"
      }`}
      aria-label={tooltip}
      title={tooltip}
      tabIndex={0}
    >
      {icon}
      <span className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-gray-900 text-white text-[11px] font-medium rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-150">
        {tooltip}
      </span>
    </button>
  );
}
