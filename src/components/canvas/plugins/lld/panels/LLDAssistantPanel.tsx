import React, { useRef, useEffect, useState } from 'react';
import { ShieldAlert, Code2, Layers, Zap, Loader2, AlertCircle, X, MessageSquare, Send, User, Bot, Trash2, Save, Check, History } from 'lucide-react';
import { useAIEvaluation } from '../hooks/useAIEvaluation';
import { useLLDChat } from '../hooks/useLLDChat';
import { useLLDWorkspace } from '../context/LLDWorkspaceContext';
import { SavedHistoryPanel } from './SavedHistoryPanel';

interface Props {
  excalidrawAPI?: any;
  onClose?: () => void;
}

export function LLDAssistantPanel({ excalidrawAPI, onClose }: Props) {
  const { currentQuestion, loadedHistory } = useLLDWorkspace();
  const diagramType = currentQuestion?.recommendedDiagramType || 'Unknown Diagram';
  
  const [activeTab, setActiveTab] = useState<'evaluation' | 'chat' | 'history'>('evaluation');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Switch back to evaluation when history is loaded
  useEffect(() => {
    if (loadedHistory) {
      setActiveTab('evaluation');
    }
  }, [loadedHistory]);

  // Evaluation Hook
  const { loading, retryCount, error, evaluation, evaluateDesign } = useAIEvaluation(excalidrawAPI, diagramType, currentQuestion?.id);

  // Chat Hook
  const { messages, input, setInput, isChatLoading, chatError, sendMessage, clearChat } = useLLDChat(excalidrawAPI, diagramType, currentQuestion?.id);

  // Focus management for accessibility
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'evaluation' && !loading && (evaluation || error) && resultsContainerRef.current) {
      resultsContainerRef.current.focus();
    }
  }, [loading, evaluation, error, activeTab]);

  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatLoading, activeTab]);

  const handleSaveHistory = async () => {
    if (!evaluation || !excalidrawAPI) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const { ASTEngine } = await import('../ast/ASTEngine');
      const { preprocessAST } = await import('@/services/ai/utils/astPreprocessor');
      const elements = excalidrawAPI.getSceneElements();
      const rawAST = ASTEngine.parseFromCanvas(elements);
      const optimizedAST = preprocessAST(rawAST, diagramType);

      // Generate preview image
      let previewImage = '';
      try {
        const { exportToBlob } = await import('@excalidraw/excalidraw');
        const blob = await exportToBlob({
          elements,
          appState: { ...excalidrawAPI.getAppState(), exportBackground: true, viewBackgroundColor: '#ffffff' },
          mimeType: "image/png",
        });
        
        previewImage = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.error('Failed to generate preview image', err);
      }

      // Serialize elements to drop any non-serializable properties that might be silently dropped by fetch
      const safeElements = JSON.parse(JSON.stringify(elements));

      const response = await fetch('/api/ai/lld-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagramType,
          ast: optimizedAST,
          elements: safeElements,
          previewImage,
          evaluation,
          chatHistory: messages
        })
      });

      if (!response.ok) throw new Error('Failed to save');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Failed to save history.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-[400px] h-full bg-surface border-l border-primary/10 flex flex-col shrink-0 shadow-xl">
      <div className="p-4 border-b border-primary/10 flex flex-col gap-4 bg-surface relative z-10 shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-heading font-bold text-lg text-primary-ink">LLD Assistant</h2>
            <p className="text-xs text-primary/60 mt-1">AI-powered design feedback</p>
          </div>
          <div className="flex items-center gap-2">
            {onClose && (
              <button 
                onClick={onClose}
                className="p-1.5 text-primary/60 hover:text-primary-ink hover:bg-primary/10 rounded-lg transition-colors shrink-0 cursor-pointer"
                aria-label="Close Assistant"
                title="Close Assistant"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-primary/5 rounded-lg">
          <button 
            onClick={() => setActiveTab('evaluation')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'evaluation' ? 'bg-white shadow-sm text-primary-ink' : 'text-primary/60 hover:text-primary-ink'}`}
          >
            Evaluation
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'chat' ? 'bg-white shadow-sm text-primary-ink' : 'text-primary/60 hover:text-primary-ink'}`}
          >
            <MessageSquare size={14} />
            Chat
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'history' ? 'bg-white shadow-sm text-primary-ink' : 'text-primary/60 hover:text-primary-ink'}`}
          >
            <History size={14} />
            History
          </button>
        </div>
      </div>
      
      {activeTab === 'history' && (
        <div className="flex-1 overflow-hidden relative">
          <SavedHistoryPanel />
        </div>
      )}

      {activeTab === 'evaluation' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 bg-surface border-b border-primary/5 flex justify-end gap-2">
            {evaluation && (
              <button
                onClick={handleSaveHistory}
                disabled={isSaving || saveSuccess}
                className="bg-white border border-primary/10 hover:bg-primary/5 text-primary-ink px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : 
                 saveSuccess ? <Check size={16} className="text-green-500" /> : 
                 <Save size={16} />}
                {saveSuccess ? 'Saved' : 'Save'}
              </button>
            )}
            <button
              onClick={evaluateDesign}
              disabled={loading || !excalidrawAPI}
              aria-label={loading ? (retryCount > 0 ? "Retrying evaluation" : "Evaluating design") : "Evaluate Design"}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {retryCount > 0 ? `Retrying... (${retryCount}/2)` : 'Evaluating...'}
                </>
              ) : (
                'Evaluate Design'
              )}
            </button>
          </div>
          <div 
            ref={resultsContainerRef}
            tabIndex={-1} 
            className="flex-1 overflow-y-auto p-4 space-y-4 focus:outline-none"
            aria-live="polite"
            aria-busy={loading}
          >
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm flex gap-2" role="alert">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {!evaluation && !loading && !error && (
              <div className="text-center text-primary/50 text-sm mt-10">
                Click "Evaluate Design" to get AI feedback on your architecture.
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center text-primary/50 text-sm mt-10 space-y-3">
                <Loader2 size={32} className="animate-spin text-purple-500" />
                <p>{retryCount > 0 ? `Connection failed. Retrying... (Attempt ${retryCount}/2)` : 'Analyzing architecture structure...'}</p>
              </div>
            )}

            {evaluation && !loading && (
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* Score Breakdown */}
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-primary-ink">Score Breakdown</h3>
                    <span className="font-bold text-lg text-primary-ink">{evaluation.overallScore}/100</span>
                  </div>
                  {evaluation.scoreBreakdown && Object.keys(evaluation.scoreBreakdown).length > 0 && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-primary/10">
                      {Object.values(evaluation.scoreBreakdown).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-primary/70">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  (item.score / item.max) > 0.8 ? 'bg-green-500' : 
                                  (item.score / item.max) > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${(item.score / item.max) * 100}%` }}
                              />
                            </div>
                            <span className="font-medium text-primary-ink w-8 text-right">{item.score}/{item.max}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div>
                  <h3 className="font-semibold text-sm text-primary-ink mb-2">Executive Summary</h3>
                  <p className="text-sm text-primary/80 leading-relaxed">{evaluation.summary}</p>
                </div>

                {/* Specific Diagram Feedback */}
                {evaluation.solidReview?.overall && (
                  <div>
                    <h3 className="font-semibold text-sm text-primary-ink mb-2 flex items-center gap-2">
                      <Layers size={16} className="text-blue-500" />
                      SOLID Principles
                    </h3>
                    <p className="text-sm text-primary/80 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100">{evaluation.solidReview.overall}</p>
                  </div>
                )}

                {/* Issues */}
                {evaluation.issues && evaluation.issues.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-primary-ink mb-3 flex items-center gap-2">
                      <ShieldAlert size={16} className="text-amber-500" />
                      Identified Issues
                    </h3>
                    <div className="space-y-3">
                      {evaluation.issues.map((issue, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border ${
                          issue.severity === 'high' ? 'bg-red-50 border-red-100' :
                          issue.severity === 'medium' ? 'bg-amber-50 border-amber-100' :
                          'bg-blue-50 border-blue-100'
                        }`}>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`font-semibold text-sm ${
                              issue.severity === 'high' ? 'text-red-700' :
                              issue.severity === 'medium' ? 'text-amber-700' :
                              'text-blue-700'
                            }`}>{issue.title}</h4>
                            {issue.confidence && (
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/50 text-primary/60">
                                {issue.confidence}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-primary/70 mb-2">{issue.description}</p>
                          <div className="text-xs font-medium text-primary-ink bg-white/60 p-2 rounded border border-black/5">
                            <span className="opacity-50 mr-1">Fix:</span>{issue.recommendation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improvements */}
                {evaluation.improvements && Object.values(evaluation.improvements).some(arr => arr && arr.length > 0) && (
                  <div>
                    <h3 className="font-semibold text-sm text-primary-ink mb-3 flex items-center gap-2">
                      <Zap size={16} className="text-green-500" />
                      Recommended Improvements
                    </h3>
                    <ul className="space-y-2">
                      {evaluation.improvements.highPriority?.map((item, idx) => (
                        <li key={`high-${idx}`} className="flex items-start gap-2 text-sm text-primary/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                      {evaluation.improvements.mediumPriority?.map((item, idx) => (
                        <li key={`med-${idx}`} className="flex items-start gap-2 text-sm text-primary/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                      {evaluation.improvements.lowPriority?.map((item, idx) => (
                        <li key={`low-${idx}`} className="flex items-start gap-2 text-sm text-primary/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="flex flex-col flex-1 overflow-hidden relative bg-surface">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !isChatLoading && (
              <div className="text-center text-primary/50 text-sm mt-10">
                Ask a question about your architecture design.
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 text-white rounded-tr-sm' 
                    : 'bg-primary/5 border border-primary/10 text-primary-ink rounded-tl-sm'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isChatLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-primary/5 border border-primary/10 text-primary-ink">
                  <Loader2 size={16} className="animate-spin text-primary/50" />
                </div>
              </div>
            )}

            {chatError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm flex gap-2" role="alert">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{chatError}</p>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-surface border-t border-primary/10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
            <form onSubmit={sendMessage} className="relative">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about your design..."
                disabled={isChatLoading || !excalidrawAPI}
                className="w-full pl-4 pr-12 py-3 bg-white border border-primary/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 shadow-inner"
              />
              <button
                type="submit"
                disabled={isChatLoading || !input.trim() || !excalidrawAPI}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
            {messages.length > 0 && (
              <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-[10px] text-primary/40">AI can make mistakes. Verify important details.</span>
                <button 
                  onClick={clearChat}
                  className="text-[10px] text-primary/60 hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 size={12} /> Clear Chat
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
