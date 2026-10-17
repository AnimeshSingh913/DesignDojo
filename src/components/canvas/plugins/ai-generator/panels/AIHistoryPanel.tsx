import React, { useState, useEffect } from 'react';
import { 
  AIGeneratorHistoryManager, 
  AIHistoryRecord 
} from '../storage/AIGeneratorHistoryManager';
import { useAIGenerator } from '../context/AIGeneratorContext';
import { safeRestoreElements } from '@/lib/canvas/elementOrdering';
import { 
  History, 
  Trash2, 
  FolderOpen, 
  Search, 
  Calendar, 
  Layers, 
  Cloud, 
  Sparkles,
  AlertCircle,
  Check
} from 'lucide-react';

interface Props {
  excalidrawAPI: any;
  onSelectRecord?: (record: AIHistoryRecord) => void;
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function AIHistoryPanel({ excalidrawAPI, onSelectRecord }: Props) {
  const [historyItems, setHistoryItems] = useState<AIHistoryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLoadedId, setActiveLoadedId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const {
    setPrompt,
    setComplexity,
    setCloudProvider,
    setExplanationData,
    setLoadedElements,
  } = useAIGenerator();

  const loadHistory = () => {
    const items = AIGeneratorHistoryManager.getHistory();
    setHistoryItems(items);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleLoadItem = async (item: AIHistoryRecord) => {
    if (!excalidrawAPI) return;

    setActiveLoadedId(item.id);
    setPrompt(item.prompt);
    setComplexity(item.complexity);
    setCloudProvider(item.cloudProvider);

    if (item.explanation) {
      setExplanationData(item.explanation);
    }

    if (item.elements && Array.isArray(item.elements)) {
      try {
        const validElements = await safeRestoreElements(item.elements, null);
        
        excalidrawAPI.updateScene({
          elements: validElements,
          appState: item.appState ? { ...item.appState, viewBackgroundColor: item.appState.viewBackgroundColor || '#fffce8' } : undefined,
        });
        excalidrawAPI.scrollToContent(validElements, { fitToContent: true });
        setLoadedElements(validElements);

        // Update active working session with restored item
        AIGeneratorHistoryManager.saveSession({
          prompt: item.prompt,
          complexity: item.complexity,
          cloudProvider: item.cloudProvider,
          elements: validElements,
          appState: item.appState,
          explanationData: item.explanation,
        });
      } catch (err) {
        console.error('Failed to restore elements from history:', err);
      }
    }

    if (onSelectRecord) {
      onSelectRecord(item);
    }
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    AIGeneratorHistoryManager.deleteHistory(id);
    loadHistory();
    if (activeLoadedId === id) {
      setActiveLoadedId(null);
    }
  };

  const handleClearAll = () => {
    AIGeneratorHistoryManager.clearAllHistory();
    setHistoryItems([]);
    setConfirmClearAll(false);
  };

  const filteredItems = historyItems.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      item.title.toLowerCase().includes(query) ||
      item.prompt.toLowerCase().includes(query) ||
      item.cloudProvider.toLowerCase().includes(query) ||
      item.complexity.toLowerCase().includes(query)
    );
  });

  const getProviderBadge = (provider: string) => {
    switch (provider.toUpperCase()) {
      case 'AWS':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
      case 'GCP':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/30';
      case 'AZURE':
        return 'bg-sky-500/10 text-sky-700 border-sky-500/30';
      default:
        return 'bg-slate-500/10 text-slate-700 border-slate-500/30';
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Search and Action Bar */}
      <div className="p-4 border-b border-primary/10 space-y-3 shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past architectures..."
            className="w-full pl-9 pr-3 py-2 bg-transparent border border-primary/20 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {historyItems.length > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-primary/60 font-medium">
              {filteredItems.length} {filteredItems.length === 1 ? 'diagram' : 'diagrams'}
            </span>
            {confirmClearAll ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-red-600 font-semibold">Clear all?</span>
                <button
                  onClick={handleClearAll}
                  className="px-2 py-0.5 bg-red-600 text-white rounded text-[11px] font-bold hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmClearAll(false)}
                  className="px-2 py-0.5 bg-primary/10 text-primary-ink rounded text-[11px] hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClearAll(true)}
                className="text-primary/40 hover:text-red-500 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                title="Clear all history"
              >
                <Trash2 size={12} /> Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* History Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {historyItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary/40 mb-3">
              <History size={20} />
            </div>
            <p className="text-sm font-semibold text-primary-ink">No Generated Architectures</p>
            <p className="text-xs text-primary/50 mt-1 max-w-[200px]">
              Generate a system design from a prompt to start building your history.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center text-primary/50 text-xs py-8">
            No architecture matches &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSelected = activeLoadedId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleLoadItem(item)}
                className={`group p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-purple-500/10 border-purple-500/40 shadow-sm'
                    : 'bg-white hover:bg-primary/5 border-primary/10 hover:border-primary/20 shadow-sm hover:shadow'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-semibold text-xs text-primary-ink line-clamp-1 leading-snug">
                    {item.title}
                  </h3>
                  <button
                    onClick={(e) => handleDeleteItem(e, item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-primary/40 hover:text-red-500 hover:bg-red-50 rounded transition-all cursor-pointer shrink-0"
                    title="Delete item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <p className="text-[11px] text-primary/70 line-clamp-2 mb-2.5 leading-relaxed font-mono bg-primary/[0.03] p-1.5 rounded-md border border-primary/5">
                  &quot;{item.prompt}&quot;
                </p>

                <div className="flex items-center justify-between gap-1 pt-1 border-t border-primary/5 text-[10px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded border font-semibold ${getProviderBadge(item.cloudProvider)}`}>
                      {item.cloudProvider}
                    </span>
                    <span className="px-1.5 py-0.5 rounded border bg-primary/5 border-primary/10 text-primary/70 font-medium">
                      {item.complexity}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-primary/40 shrink-0">
                    <Calendar size={10} />
                    <span>{formatTimeAgo(item.createdAt)}</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-purple-700 font-semibold">
                    <Check size={12} /> Active on Canvas
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
