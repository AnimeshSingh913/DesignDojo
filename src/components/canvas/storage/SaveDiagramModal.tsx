'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Check, 
  Loader2, 
  FileText, 
  Layers, 
  Image as ImageIcon,
  History,
  CopyPlus
} from 'lucide-react';
import { 
  SavedDiagramManager, 
  WorkspaceType, 
  SavedDiagramItem 
} from '@/lib/storage/savedDiagramManager';

interface SaveDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  excalidrawAPI: any;
  workspaceType: WorkspaceType;
  diagramType?: string;
  linkedQuestionId?: string | null;
  currentDiagramId?: string | null;
  currentDiagramName?: string | null;
  onSaveSuccess?: (savedItem: SavedDiagramItem) => void;
  onOpenHistory?: () => void;
}

export function SaveDiagramModal({
  isOpen,
  onClose,
  excalidrawAPI,
  workspaceType,
  diagramType,
  linkedQuestionId,
  currentDiagramId,
  currentDiagramName,
  onSaveSuccess,
  onOpenHistory,
}: SaveDiagramModalProps) {
  const [diagramName, setDiagramName] = useState('');
  const [description, setDescription] = useState('');
  const [saveMode, setSaveMode] = useState<'update' | 'new'>('new');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Generate sensible default name
  const getDefaultName = () => {
    if (currentDiagramName) return currentDiagramName;
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    if (workspaceType === 'lld') {
      return `${diagramType || 'LLD Diagram'} (${dateStr} ${timeStr})`;
    } else if (workspaceType === 'hld') {
      return `${diagramType || 'HLD Architecture'} (${dateStr} ${timeStr})`;
    } else {
      return `Canvas Architecture (${dateStr} ${timeStr})`;
    }
  };

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      const initialName = currentDiagramName || getDefaultName();
      setDiagramName(initialName);
      setDescription('');
      setSaveMode(currentDiagramId ? 'update' : 'new');
      setIsSaved(false);
      setError(null);

      // Focus input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 80);

      // Generate preview thumbnail
      if (excalidrawAPI) {
        setIsGeneratingPreview(true);
        try {
          const elements = excalidrawAPI.getSceneElements?.() || [];
          const appState = excalidrawAPI.getAppState?.() || {};
          SavedDiagramManager.generatePreviewThumbnail(elements, appState)
            .then((url) => {
              setPreviewUrl(url);
              setIsGeneratingPreview(false);
            })
            .catch(() => setIsGeneratingPreview(false));
        } catch {
          setIsGeneratingPreview(false);
        }
      }
    }
  }, [isOpen, currentDiagramId, currentDiagramName, workspaceType, diagramType]);

  if (!isOpen) return null;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const nameToSave = diagramName.trim();
    if (!nameToSave) {
      setError('Please enter a name for the diagram.');
      return;
    }

    if (!excalidrawAPI) {
      setError('Canvas is not ready yet.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const elements = excalidrawAPI.getSceneElements?.() || [];
      const appState = excalidrawAPI.getAppState?.() || {};

      if (!elements || elements.length === 0) {
        setError('Canvas is empty. Draw some elements before saving.');
        setIsSaving(false);
        return;
      }

      const targetId = (saveMode === 'update' && currentDiagramId) ? currentDiagramId : undefined;

      const savedItem = await SavedDiagramManager.saveDiagram({
        id: targetId,
        name: nameToSave,
        workspaceType,
        diagramType: diagramType || (workspaceType === 'lld' ? 'Class Diagram' : workspaceType === 'hld' ? 'System Architecture' : 'Freeform Architecture'),
        linkedQuestionId,
        elements,
        appState,
        previewImage: previewUrl,
        description: description.trim() || undefined,
      });

      setIsSaved(true);
      if (onSaveSuccess) {
        onSaveSuccess(savedItem);
      }

      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('[SaveDiagramModal] Save error:', err);
      setError(err?.message || 'Failed to save diagram.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-surface border border-primary/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-primary/10 flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center font-bold">
              <Save size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-primary-ink font-heading">
                {currentDiagramId ? 'Save Diagram' : 'Save New Diagram'}
              </h2>
              <p className="text-xs text-primary/60">
                Save your canvas design to access or restore anytime
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-primary/40 hover:text-primary-ink hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Mode Switcher if editing existing */}
          {currentDiagramId && (
            <div className="flex p-1 bg-primary/5 rounded-xl border border-primary/10">
              <button
                type="button"
                onClick={() => setSaveMode('update')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  saveMode === 'update'
                    ? 'bg-white shadow-xs text-purple-600'
                    : 'text-primary/60 hover:text-primary-ink'
                }`}
              >
                <Save size={14} />
                Update Current
              </button>
              <button
                type="button"
                onClick={() => setSaveMode('new')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  saveMode === 'new'
                    ? 'bg-white shadow-xs text-purple-600'
                    : 'text-primary/60 hover:text-primary-ink'
                }`}
              >
                <CopyPlus size={14} />
                Save as New Copy
              </button>
            </div>
          )}

          {/* Diagram Name Input */}
          <div>
            <label className="block text-xs font-semibold text-primary-ink mb-1.5">
              Diagram Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={diagramName}
                onChange={(e) => setDiagramName(e.target.value)}
                placeholder="e.g., Microservices Architecture, User Authentication Flow"
                className="w-full px-3.5 py-2.5 bg-white border border-primary/20 rounded-xl text-sm text-primary-ink placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all"
                disabled={isSaving || isSaved}
              />
            </div>
          </div>

          {/* Optional Notes / Description */}
          <div>
            <label className="block text-xs font-semibold text-primary/70 mb-1.5">
              Description / Notes <span className="text-primary/40 font-normal">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key notes, design decisions, or references..."
              rows={2}
              className="w-full px-3.5 py-2 bg-white border border-primary/20 rounded-xl text-xs text-primary-ink placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all resize-none"
              disabled={isSaving || isSaved}
            />
          </div>

          {/* Live Preview Card */}
          <div>
            <label className="block text-xs font-semibold text-primary/70 mb-1.5 flex items-center justify-between">
              <span>Preview</span>
              <span className="text-[11px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                {diagramType || (workspaceType === 'lld' ? 'LLD' : workspaceType === 'hld' ? 'HLD' : 'Blank Canvas')}
              </span>
            </label>
            <div className="w-full h-32 bg-white border border-primary/10 rounded-xl overflow-hidden relative flex items-center justify-center shadow-inner">
              {isGeneratingPreview ? (
                <div className="flex flex-col items-center gap-1.5 text-primary/50 text-xs">
                  <Loader2 size={18} className="animate-spin text-purple-500" />
                  <span>Generating preview...</span>
                </div>
              ) : previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Diagram Preview" 
                  className="w-full h-full object-contain p-2" 
                />
              ) : (
                <div className="flex items-center gap-2 text-primary/40 text-xs">
                  <ImageIcon size={18} />
                  <span>Canvas elements will be saved</span>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between gap-3">
            {onOpenHistory ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHistory();
                }}
                className="text-xs font-semibold text-primary/70 hover:text-purple-600 flex items-center gap-1.5 transition-colors cursor-pointer py-2 px-1"
              >
                <History size={14} />
                View Saved History
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-primary/70 hover:text-primary-ink hover:bg-primary/5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving || isSaved || !diagramName.trim()}
                className={`px-5 py-2 text-xs font-bold rounded-xl text-white shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                  isSaved
                    ? 'bg-emerald-600 shadow-emerald-500/20'
                    : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20 active:scale-95'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : isSaved ? (
                  <>
                    <Check size={14} className="animate-bounce" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>{saveMode === 'update' ? 'Save Changes' : 'Save Diagram'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
