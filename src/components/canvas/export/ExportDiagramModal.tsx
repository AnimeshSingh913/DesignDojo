'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  FileText, 
  Image as ImageIcon, 
  Layers, 
  Sparkles, 
  Code, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Loader2
} from 'lucide-react';

function GitHubIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

import { MermaidViewer } from '@/components/ui/MermaidViewer';
import { 
  downloadMermaidFile, 
  downloadMarkdownFile, 
  formatAsGitHubMarkdown,
  generateMermaidFromLLDAST,
  generateMermaidFromHLDAST,
  generateMermaidFromAIGeneratedArchitecture,
  generateGitHubArchitectureMarkdown,
  generateMermaidFromExcalidraw
} from '@/lib/export/mermaidExporter';
import { ASTEngine } from '../plugins/lld/ast/ASTEngine';
import { HLDASTEngine } from '../plugins/hld/ast/HLDASTEngine';
import { AIGeneratedArchitecture } from '@/services/ai/types';

interface ExportDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  excalidrawAPI: any;
  projectName?: string;
  diagramType?: string;
  workspaceType?: 'lld' | 'hld' | 'ai' | 'canvas';
  aiArchitecture?: AIGeneratedArchitecture | null;
  ast?: any;
}

export function ExportDiagramModal({
  isOpen,
  onClose,
  excalidrawAPI,
  projectName = 'Architecture_Diagram',
  diagramType = 'System Architecture',
  workspaceType = 'canvas',
  aiArchitecture,
  ast
}: ExportDiagramModalProps) {
  const [activeTab, setActiveTab] = useState<'mermaid' | 'images'>('mermaid');
  const [mermaidCode, setMermaidCode] = useState<string>('');
  const [isExportingImage, setIsExportingImage] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Generate Mermaid code whenever modal opens
  useEffect(() => {
    if (!isOpen) return;

    try {
      if (aiArchitecture) {
        setMermaidCode(generateMermaidFromAIGeneratedArchitecture(aiArchitecture));
        return;
      }

      if (excalidrawAPI) {
        const elements = excalidrawAPI.getSceneElements() || [];

        if (workspaceType === 'lld') {
          const lldAst = ast || ASTEngine.parseFromCanvas(elements);
          setMermaidCode(generateMermaidFromLLDAST(lldAst, diagramType));
        } else if (workspaceType === 'hld') {
          const hldAst = ast || HLDASTEngine.parseFromCanvas(elements);
          setMermaidCode(generateMermaidFromHLDAST(hldAst, diagramType));
        } else {
          // General canvas
          setMermaidCode(generateMermaidFromExcalidraw(elements));
        }
      }
    } catch (e) {
      console.error('Error computing Mermaid export code:', e);
      setMermaidCode(`flowchart TD\n    App["${projectName}"] --> Service["Main Service"]`);
    }
  }, [isOpen, excalidrawAPI, workspaceType, diagramType, projectName, aiArchitecture, ast]);

  if (!isOpen) return null;

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopiedType('raw');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyMarkdown = () => {
    let md = '';
    if (aiArchitecture) {
      md = generateGitHubArchitectureMarkdown(aiArchitecture, projectName);
    } else {
      md = formatAsGitHubMarkdown(mermaidCode, `${projectName} - ${diagramType}`);
    }
    navigator.clipboard.writeText(md);
    setCopiedType('markdown');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadMmd = () => {
    downloadMermaidFile(mermaidCode, `${projectName}_${diagramType}.mmd`);
  };

  const handleDownloadMd = () => {
    let md = '';
    if (aiArchitecture) {
      md = generateGitHubArchitectureMarkdown(aiArchitecture, projectName);
    } else {
      md = formatAsGitHubMarkdown(mermaidCode, `${projectName} - ${diagramType}`);
    }
    downloadMarkdownFile(md, `${projectName}_README.md`);
  };

  const handleExportPNG = async () => {
    if (!excalidrawAPI) return;
    try {
      setIsExportingImage('png');
      const { exportToBlob } = await import('@excalidraw/excalidraw');
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const blob = await exportToBlob({
        elements,
        mimeType: 'image/png',
        appState: {
          ...appState,
          exportWithDarkMode: false,
          exportScale: 2
        }
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PNG export failed', e);
    } finally {
      setIsExportingImage(null);
    }
  };

  const handleExportSVG = async () => {
    if (!excalidrawAPI) return;
    try {
      setIsExportingImage('svg');
      const { exportToSvg } = await import('@excalidraw/excalidraw');
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const svg = await exportToSvg({
        elements,
        appState
      });
      const svgString = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName.replace(/\s+/g, '_')}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('SVG export failed', e);
    } finally {
      setIsExportingImage(null);
    }
  };

  const handleExportJSON = () => {
    if (!excalidrawAPI) return;
    try {
      setIsExportingImage('json');
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const payload = {
        type: 'designdojo_scene_export',
        version: 1,
        source: 'DesignDojo',
        projectName,
        diagramType,
        elements,
        appState: {
          viewBackgroundColor: appState.viewBackgroundColor,
          theme: appState.theme
        }
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName.replace(/\s+/g, '_')}_backup.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('JSON export failed', e);
    } finally {
      setIsExportingImage(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center shadow-xs">
              <Download size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                Export & Download Diagram
                <span className="text-[11px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                  GitHub Mermaid Ready
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                Save as Mermaid format for GitHub READMEs, or export as PNG/SVG images.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-gray-100 bg-white">
          <button
            onClick={() => setActiveTab('mermaid')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer ${
              activeTab === 'mermaid'
                ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <GitHubIcon size={15} />
            <span>Mermaid (GitHub Markdown)</span>
          </button>

          <button
            onClick={() => setActiveTab('images')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer ${
              activeTab === 'images'
                ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ImageIcon size={15} />
            <span>PNG / SVG / JSON</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fafafa]">
          {activeTab === 'mermaid' ? (
            <div className="space-y-5">
              {/* GitHub Banner */}
              <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <GitHubIcon size={18} className="text-purple-300" />
                    <span className="font-semibold text-sm">Direct GitHub Documentation Integration</span>
                  </div>
                  <p className="text-xs text-purple-200 max-w-xl">
                    Mermaid renders natively in GitHub Markdown without extra plugins. Paste directly into your project's <code className="bg-black/30 px-1.5 py-0.5 rounded text-white font-mono">README.md</code> or GitHub Pull Requests.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-purple-950 hover:bg-purple-50 font-semibold text-xs rounded-lg transition-all shadow-sm cursor-pointer"
                  >
                    {copiedType === 'markdown' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    <span>{copiedType === 'markdown' ? 'Copied Markdown' : 'Copy GitHub Markdown'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* 1. Download .mmd */}
                <button
                  onClick={handleDownloadMmd}
                  className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 rounded-xl text-left transition-all shadow-xs group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FileCode size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Download .mmd</div>
                    <div className="text-[10px] text-gray-500">Mermaid diagram file</div>
                  </div>
                </button>

                {/* 2. Download .md */}
                <button
                  onClick={handleDownloadMd}
                  className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 rounded-xl text-left transition-all shadow-xs group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FileText size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Download .md</div>
                    <div className="text-[10px] text-gray-500">README documentation</div>
                  </div>
                </button>

                {/* 3. Copy Raw Code */}
                <button
                  onClick={handleCopyRaw}
                  className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl text-left transition-all shadow-xs group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {copiedType === 'raw' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">{copiedType === 'raw' ? 'Copied Code!' : 'Copy Mermaid'}</div>
                    <div className="text-[10px] text-gray-500">Raw Mermaid syntax</div>
                  </div>
                </button>

                {/* 4. Copy Markdown */}
                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 rounded-xl text-left transition-all shadow-xs group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {copiedType === 'markdown' ? <Check size={16} className="text-green-600" /> : <Code size={16} />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">{copiedType === 'markdown' ? 'Copied!' : 'Copy Markdown'}</div>
                    <div className="text-[10px] text-gray-500">```mermaid snippet</div>
                  </div>
                </button>
              </div>

              {/* Interactive Mermaid Viewer */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                  <span>Diagram Preview & Code</span>
                  <span className="text-[11px] text-gray-400 font-normal">Auto-converted from canvas AST</span>
                </div>
                <MermaidViewer 
                  chart={mermaidCode}
                  title={`${projectName} (${diagramType})`}
                  initialMode="preview"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* PNG Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-purple-300 transition-all">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <ImageIcon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">PNG Image</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        High-resolution 2x retina raster image. Great for slides, decks, and presentations.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleExportPNG}
                    disabled={isExportingImage !== null || !excalidrawAPI}
                    className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isExportingImage === 'png' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    <span>Download PNG</span>
                  </button>
                </div>

                {/* SVG Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-purple-300 transition-all">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Layers size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">SVG Vector</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Infinite resolution scalable vector graphic. Perfect for web embedding and sharp prints.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleExportSVG}
                    disabled={isExportingImage !== null || !excalidrawAPI}
                    className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isExportingImage === 'svg' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    <span>Download SVG</span>
                  </button>
                </div>

                {/* JSON Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-purple-300 transition-all">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                      <FileCode size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">DesignDojo JSON</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Full editable canvas scene backup file. Can be imported back into DesignDojo anytime.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleExportJSON}
                    disabled={isExportingImage !== null || !excalidrawAPI}
                    className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isExportingImage === 'json' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    <span>Download JSON</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100">
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-emerald-600" />
            <span>DesignDojo Export Engine • Universal format compatibility</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
