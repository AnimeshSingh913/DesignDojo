'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Search, 
  FolderOpen, 
  Trash2, 
  Edit3, 
  Check, 
  Copy, 
  Calendar, 
  Layers, 
  Plus, 
  ArrowUpRight, 
  Download,
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  SavedDiagramManager, 
  WorkspaceType, 
  SavedDiagramItem 
} from '@/lib/storage/savedDiagramManager';
import { safeRestoreElements } from '@/lib/canvas/elementOrdering';

interface DiagramHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  excalidrawAPI: any;
  currentWorkspace: WorkspaceType;
  activeDiagramId?: string | null;
  onLoadDiagram: (diagram: SavedDiagramItem) => void;
  onNewDiagram?: () => void;
  onOpenSaveModal?: () => void;
}

export function DiagramHistoryModal({
  isOpen,
  onClose,
  excalidrawAPI,
  currentWorkspace,
  activeDiagramId,
  onLoadDiagram,
  onNewDiagram,
  onOpenSaveModal,
}: DiagramHistoryModalProps) {
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceType | 'all'>(currentWorkspace);
  const [searchQuery, setSearchQuery] = useState('');
  const [diagrams, setDiagrams] = useState<SavedDiagramItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load diagrams and subscribe to changes
  const refreshDiagrams = () => {
    const list = SavedDiagramManager.getDiagramsList(selectedWorkspace);
    setDiagrams(list);
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedWorkspace(currentWorkspace);
      refreshDiagrams();
    }
  }, [isOpen, currentWorkspace]);

  useEffect(() => {
    refreshDiagrams();
    const unsubscribe = SavedDiagramManager.subscribe(refreshDiagrams);
    return () => unsubscribe();
  }, [selectedWorkspace]);

  // Filtered diagrams based on search query
  const filteredDiagrams = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return diagrams;

    return diagrams.filter((diag) => {
      const matchName = diag.name.toLowerCase().includes(query);
      const matchType = diag.diagramType?.toLowerCase().includes(query);
      const matchDesc = diag.description?.toLowerCase().includes(query);
      return matchName || matchType || matchDesc;
    });
  }, [diagrams, searchQuery]);

  if (!isOpen) return null;

  const handleOpenDiagram = async (diagram: SavedDiagramItem) => {
    if (!excalidrawAPI) {
      onLoadDiagram(diagram);
      onClose();
      return;
    }

    try {
      if (diagram.elements && Array.isArray(diagram.elements)) {
        const validElements = await safeRestoreElements(diagram.elements, null);
        excalidrawAPI.updateScene({
          elements: validElements,
          appState: {
            ...(diagram.appState || {}),
            viewBackgroundColor: diagram.appState?.viewBackgroundColor || '#fffce8',
            scrollToContent: true,
          },
          commitToHistory: true,
        });

        // Trigger zoom to fit nicely
        setTimeout(() => {
          if (excalidrawAPI.scrollToContent) {
            excalidrawAPI.scrollToContent(validElements, {
              fitToViewport: true,
              viewportZoomFactor: 0.85,
              animate: true,
              duration: 300,
            });
          }
        }, 100);
      }
    } catch (e) {
      console.error('[DiagramHistoryModal] Restore error:', e);
    }

    onLoadDiagram(diagram);
    onClose();
  };

  const handleStartRename = (diagram: SavedDiagramItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(diagram.id);
    setEditingName(diagram.name);
  };

  const handleSaveRename = (diagram: SavedDiagramItem, e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (editingName.trim()) {
      SavedDiagramManager.renameDiagram(diagram.workspaceType, diagram.id, editingName);
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleDuplicate = (diagram: SavedDiagramItem, e: React.MouseEvent) => {
    e.stopPropagation();
    SavedDiagramManager.duplicateDiagram(diagram.workspaceType, diagram.id);
  };

  const handleDelete = (diagram: SavedDiagramItem, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    SavedDiagramManager.deleteDiagram(diagram.workspaceType, diagram.id);
    setDiagrams((prev) => prev.filter((d) => d.id !== diagram.id));
    refreshDiagrams();
    setDeleteConfirmId(null);
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[85vh] bg-surface border border-primary/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-primary/10 flex items-center justify-between bg-primary/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center font-bold">
              <FolderOpen size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-primary-ink font-heading">
                  Saved Diagrams & History
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary-ink">
                  {diagrams.length} {diagrams.length === 1 ? 'Diagram' : 'Diagrams'}
                </span>
              </div>
              <p className="text-xs text-primary/60">
                Browse, search, rename, and load your architecture diagrams
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNewDiagram && (
              <button
                onClick={() => {
                  onClose();
                  onNewDiagram();
                }}
                className="bg-white hover:bg-primary/5 border border-primary/20 text-primary-ink px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                New Canvas
              </button>
            )}

            {onOpenSaveModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSaveModal();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-purple-500/20"
              >
                <Plus size={14} />
                Save Current
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-primary/40 hover:text-primary-ink hover:bg-primary/10 rounded-lg transition-colors cursor-pointer ml-1"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 border-b border-primary/10 bg-surface flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Workspace Tabs */}
          <div className="flex p-1 bg-primary/5 rounded-xl border border-primary/10 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSelectedWorkspace(currentWorkspace)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedWorkspace === currentWorkspace
                  ? 'bg-white shadow-xs text-purple-600'
                  : 'text-primary/60 hover:text-primary-ink'
              }`}
            >
              Current ({currentWorkspace.toUpperCase()})
            </button>
            <button
              type="button"
              onClick={() => setSelectedWorkspace('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedWorkspace === 'all'
                  ? 'bg-white shadow-xs text-purple-600'
                  : 'text-primary/60 hover:text-primary-ink'
              }`}
            >
              All Workspaces
            </button>
            <button
              type="button"
              onClick={() => setSelectedWorkspace('canvas')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedWorkspace === 'canvas'
                  ? 'bg-white shadow-xs text-purple-600'
                  : 'text-primary/60 hover:text-primary-ink'
              }`}
            >
              Blank
            </button>
            <button
              type="button"
              onClick={() => setSelectedWorkspace('lld')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedWorkspace === 'lld'
                  ? 'bg-white shadow-xs text-purple-600'
                  : 'text-primary/60 hover:text-primary-ink'
              }`}
            >
              LLD
            </button>
            <button
              type="button"
              onClick={() => setSelectedWorkspace('hld')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedWorkspace === 'hld'
                  ? 'bg-white shadow-xs text-purple-600'
                  : 'text-primary/60 hover:text-primary-ink'
              }`}
            >
              HLD
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or type..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-primary/20 rounded-xl text-xs text-primary-ink placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary-ink text-xs"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Diagrams Grid / List */}
        <div className="flex-1 overflow-y-auto p-5">
          {filteredDiagrams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 mb-3 border border-purple-100">
                <FolderOpen size={30} />
              </div>
              <h3 className="text-sm font-bold text-primary-ink mb-1">
                {searchQuery ? 'No matching diagrams found' : 'No saved diagrams yet'}
              </h3>
              <p className="text-xs text-primary/50 max-w-sm mb-4">
                {searchQuery 
                  ? `No diagrams matched "${searchQuery}". Try a different search term.` 
                  : 'Save your current canvas diagram to access it here anytime.'}
              </p>
              {onOpenSaveModal && !searchQuery && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSaveModal();
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-purple-500/20"
                >
                  <Plus size={14} />
                  Save Current Canvas
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDiagrams.map((diag) => {
                const isCurrentActive = activeDiagramId === diag.id;
                const isEditing = editingId === diag.id;
                const isConfirmingDelete = deleteConfirmId === diag.id;

                const workspaceBadgeColor = 
                  diag.workspaceType === 'lld' 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : diag.workspaceType === 'hld' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-purple-50 text-purple-700 border-purple-200';

                return (
                  <div
                    key={diag.id}
                    onClick={() => handleOpenDiagram(diag)}
                    className={`group relative bg-white border rounded-2xl p-3.5 transition-all cursor-pointer flex flex-col justify-between hover:shadow-lg hover:border-purple-500/30 ${
                      isCurrentActive 
                        ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-md' 
                        : 'border-primary/10'
                    }`}
                  >
                    {/* Top Badges & Actions */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${workspaceBadgeColor}`}>
                          {diag.workspaceType}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-primary/5 text-primary/70 border border-primary/10">
                          {diag.diagramType}
                        </span>
                        {isCurrentActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-600 text-white shadow-xs">
                            Active
                          </span>
                        )}
                      </div>

                      {/* Card Action Menu */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(diag, e)}
                          title="Rename diagram"
                          className="p-1 text-primary/40 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDuplicate(diag, e)}
                          title="Duplicate diagram"
                          className="p-1 text-primary/40 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(diag, e)}
                          title="Delete diagram"
                          className="p-1 rounded-lg text-primary/40 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Thumbnail Image Container */}
                    <div className="w-full h-36 bg-[#fffce8]/50 border border-primary/10 rounded-xl overflow-hidden relative flex items-center justify-center my-2 group-hover:bg-[#fffce8] transition-colors">
                      {diag.previewImage ? (
                        <img
                          src={diag.previewImage}
                          alt={diag.name}
                          className="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-primary/30 text-xs">
                          <Layers size={22} />
                          <span>{diag.elements?.length || 0} Elements</span>
                        </div>
                      )}

                      {/* Hover Overlay Button */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="bg-white/95 text-primary-ink text-xs font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                          <ArrowUpRight size={13} className="text-purple-600" />
                          Open in Canvas
                        </span>
                      </div>
                    </div>

                    {/* Diagram Details & Inline Rename */}
                    <div className="mt-1">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 my-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(diag, e);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                            className="flex-1 px-2 py-1 text-xs border border-purple-500 rounded-lg text-primary-ink bg-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={(e) => handleSaveRename(diag, e)}
                            className="p-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1 bg-primary/10 text-primary/60 rounded-lg hover:bg-primary/20 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <h4 className="text-sm font-bold text-primary-ink line-clamp-1 group-hover:text-purple-600 transition-colors" title={diag.name}>
                          {diag.name}
                        </h4>
                      )}

                      {diag.description && (
                        <p className="text-[11px] text-primary/60 line-clamp-1 mt-0.5">
                          {diag.description}
                        </p>
                      )}

                      {/* Footer Info */}
                      <div className="flex items-center justify-between text-[10px] text-primary/50 mt-2.5 pt-2 border-t border-primary/5">
                        <div className="flex items-center gap-1">
                          <Clock size={11} />
                          <span>{formatTimeAgo(diag.updatedAt || diag.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 font-medium">
                          <span>{diag.elements?.length || 0} items</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
