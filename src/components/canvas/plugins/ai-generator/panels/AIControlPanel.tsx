import React, { useState, useEffect } from 'react';
import { useAIGenerator } from '../context/AIGeneratorContext';
import { Sparkles, Settings, History, PanelLeftClose, AlertTriangle, X } from 'lucide-react';
import { convertJSONToExcalidraw } from '../utils/JSONToExcalidraw';
import { safeRestoreElements } from '@/lib/canvas/elementOrdering';
import { AIGeneratorHistoryManager } from '../storage/AIGeneratorHistoryManager';
import { AIHistoryPanel } from './AIHistoryPanel';

const EXAMPLES = [
  'Design Instagram',
  'Design Uber',
  'Design Netflix',
  'Design WhatsApp',
  'Design Discord',
  'Design URL Shortener',
];

interface AIControlPanelProps {
  excalidrawAPI: any;
  onClose?: () => void;
}

export function AIControlPanel({ excalidrawAPI, onClose }: AIControlPanelProps) {
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [historyCount, setHistoryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const {
    prompt,
    setPrompt,
    isGenerating,
    setIsGenerating,
    setExplanationData,
    complexity,
    setComplexity,
    cloudProvider,
    setCloudProvider,
    setLoadedElements,
  } = useAIGenerator();

  const refreshHistoryCount = () => {
    const items = AIGeneratorHistoryManager.getHistory();
    setHistoryCount(items.length);
  };

  useEffect(() => {
    refreshHistoryCount();
  }, [activeTab]);

  const handleGenerate = async () => {
    if (!prompt.trim() || !excalidrawAPI) return;
    
    setErrorMessage(null);
    setIsGenerating(true);
    setExplanationData(null);
    
    try {
      const res = await fetch('/api/ai/generate-architecture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, complexity, cloudProvider }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(data.error || data.message || 'Generation failed. Please try again.');
        setIsGenerating(false);
        return;
      }
      
      // Convert JSON to Excalidraw Elements
      const rawElements = convertJSONToExcalidraw(data);
      const elements = await safeRestoreElements(rawElements, null);
      
      // Update Canvas
      excalidrawAPI.updateScene({ elements });
      excalidrawAPI.scrollToContent(elements, { fitToContent: true });
      
      // Save elements to state for persistence/resets
      setLoadedElements(elements);
      
      // Set explanation panel data
      setExplanationData(data.explanation);

      // Save to Generation History
      AIGeneratorHistoryManager.addHistory({
        prompt,
        complexity,
        cloudProvider,
        elements,
        appState: excalidrawAPI.getAppState(),
        explanation: data.explanation,
      });
      refreshHistoryCount();

      // Save active session
      AIGeneratorHistoryManager.saveSession({
        prompt,
        complexity,
        cloudProvider,
        elements,
        appState: excalidrawAPI.getAppState(),
        explanationData: data.explanation,
      });
      
    } catch (err: any) {
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-84 h-full bg-surface border-r border-primary/10 flex flex-col shadow-xl z-20 transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-primary/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles size={18} />
          </div>
          <h2 className="font-heading font-bold text-base text-primary-ink">AI Architect</h2>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 text-primary/60 hover:text-primary-ink hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="Close Panel"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="flex p-1 bg-primary/5 rounded-xl border border-primary/10">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'generate'
                ? 'bg-white shadow-sm text-primary-ink'
                : 'text-primary/60 hover:text-primary-ink'
            }`}
          >
            <Sparkles size={13} />
            <span>Generate</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white shadow-sm text-primary-ink'
                : 'text-primary/60 hover:text-primary-ink'
            }`}
          >
            <History size={13} />
            <span>History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 bg-primary/10 text-primary-ink rounded-full text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'history' ? (
        <AIHistoryPanel 
          excalidrawAPI={excalidrawAPI} 
          onSelectRecord={() => refreshHistoryCount()} 
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          
          {/* Prompt Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-primary-ink">System Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. Design Instagram, WhatsApp, Uber, Netflix..."
              className="w-full h-28 p-3 bg-transparent border border-primary/20 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs leading-relaxed"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-2.5 bg-primary hover:bg-primary-ink disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-surface rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            {isGenerating ? (
              <span className="animate-pulse">Generating Architecture...</span>
            ) : (
              <>
                <Sparkles size={16} /> Generate Architecture
              </>
            )}
          </button>

          {/* In-Panel Limit / Error Alert */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-primary-ink flex items-start gap-2.5 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-900">Notice</p>
                <p className="mt-0.5 text-primary/80 leading-relaxed text-[11px]">{errorMessage}</p>
              </div>
              <button 
                onClick={() => setErrorMessage(null)}
                className="text-primary/40 hover:text-primary-ink p-0.5 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Settings */}
          <div className="space-y-3 pt-1 border-t border-primary/10">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary-ink">
              <Settings size={14} /> Generation Settings
            </div>
            
            <div className="space-y-1">
              <label className="text-[11px] text-primary/60">Complexity</label>
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value)}
                className="w-full p-2 bg-transparent border border-primary/20 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="FAANG Interview">FAANG Interview</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-primary/60">Cloud Provider</label>
              <select
                value={cloudProvider}
                onChange={(e) => setCloudProvider(e.target.value)}
                className="w-full p-2 bg-transparent border border-primary/20 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
              >
                <option value="Generic">Generic</option>
                <option value="AWS">AWS</option>
                <option value="Azure">Azure</option>
                <option value="GCP">GCP</option>
              </select>
            </div>
          </div>

          {/* Examples */}
          <div className="space-y-2 pt-1 border-t border-primary/10">
            <label className="text-xs font-semibold text-primary-ink">Example Prompts</label>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="px-2.5 py-1 bg-primary/5 hover:bg-primary/10 rounded-full text-[11px] font-medium text-primary/80 transition-colors cursor-pointer"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
