import React, { useState } from 'react';
import { X, Code2, Loader2, Copy, Check } from 'lucide-react';
import { ASTEngine } from '../ast/ASTEngine';
import { preprocessAST } from '@/services/ai/utils/astPreprocessor';

interface Props {
  excalidrawAPI: any;
  diagramType: string;
  onClose: () => void;
}

const LANGUAGES = ['Java', 'C++', 'Python', 'TypeScript'];

export function CodeGenerationModal({ excalidrawAPI, diagramType, onClose }: Props) {
  const [language, setLanguage] = useState<string>('Java');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!excalidrawAPI) return;
    
    setLoading(true);
    setError(null);
    setGeneratedCode(null);

    try {
      // 1. Get elements and AST
      const elements = excalidrawAPI.getSceneElements();
      const activeElements = elements.filter((el: any) => !el.isDeleted);
      
      if (activeElements.length === 0) {
        setError("Please draw your diagram first. You haven't drawn anything yet.");
        setLoading(false);
        return;
      }

      const rawAST = ASTEngine.parseFromCanvas(elements);
      const optimizedAST = preprocessAST(rawAST, diagramType);

      // 2. Call API
      const response = await fetch('/api/ai/lld-codegen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ast: optimizedAST,
          diagramType,
          language
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate code.');
      }

      setGeneratedCode(result.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-primary/10 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Code2 size={20} />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-primary-ink">Generate Code</h2>
              <p className="text-sm text-primary/60">Generate {language} skeleton code from your diagram</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={loading}
              className="px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-lg text-sm font-medium text-primary-ink outline-none focus:border-blue-500 disabled:opacity-50"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Generating...' : 'Generate'}
            </button>

            <button 
              onClick={onClose}
              className="p-2 text-primary/60 hover:text-primary-ink hover:bg-primary/10 rounded-lg transition-colors ml-2 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-primary/5 p-4 flex flex-col relative min-h-[300px]">
          {error && (
            <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {!generatedCode && !loading && !error && (
            <div className="flex-1 flex flex-col items-center justify-center text-primary/50 text-center">
              <Code2 size={48} className="mb-4 opacity-20" />
              <p className="font-medium text-primary-ink mb-1">No code generated yet</p>
              <p className="text-sm max-w-sm">Select your preferred language and click Generate to transform your architecture diagram into code.</p>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-primary/50 text-center">
              <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
              <p className="font-medium text-primary-ink">Analyzing Diagram & Generating Code...</p>
            </div>
          )}

          {generatedCode && !loading && (
            <div className="flex-1 bg-[#1E1E1E] rounded-xl overflow-hidden shadow-inner border border-primary/20 flex flex-col relative">
              <div className="bg-[#2D2D2D] px-4 py-2 flex justify-between items-center shrink-0 border-b border-black/20">
                <span className="text-xs font-mono text-white/60">{language} output</span>
                <button 
                  onClick={handleCopy}
                  className="text-white/60 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="p-4 overflow-auto flex-1 custom-scrollbar">
                <pre className="font-mono text-sm text-[#D4D4D4] whitespace-pre-wrap break-words">
                  <code>{generatedCode}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
