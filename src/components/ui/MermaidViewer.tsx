'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  AlertCircle,
  Eye,
  Code
} from 'lucide-react';
import { downloadMermaidFile, downloadMarkdownFile, formatAsGitHubMarkdown } from '@/lib/export/mermaidExporter';

interface MermaidViewerProps {
  chart: string;
  title?: string;
  className?: string;
  showControls?: boolean;
  initialMode?: 'preview' | 'code';
}

export function MermaidViewer({
  chart,
  title = 'Architecture Diagram',
  className = '',
  showControls = true,
  initialMode = 'preview'
}: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'raw' | 'github' | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>(initialMode);
  const reactId = useId();
  const renderIdRef = useRef<string>(`mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      // 'strict' sanitises labels and disables click handlers — diagrams come from AI output
      securityLevel: 'strict',
      fontFamily: 'Inter, system-ui, sans-serif',
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        padding: 15
      },
      sequence: {
        actorMargin: 50,
        showSequenceNumbers: true
      },
      class: {
        hideEmptyMembersBox: true
      }
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      if (!chart || !chart.trim()) {
        setSvgContent('');
        setError(null);
        return;
      }

      try {
        setError(null);
        const uniqueId = `${renderIdRef.current}-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, chart.trim());
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        console.warn('Mermaid rendering error:', err);
        if (isMounted) {
          setError(err?.message || 'Failed to render Mermaid diagram. Review syntax in code view.');
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(chart);
    setCopiedType('raw');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyGitHubMarkdown = () => {
    const md = formatAsGitHubMarkdown(chart, title);
    navigator.clipboard.writeText(md);
    setCopiedType('github');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadMmd = () => {
    downloadMermaidFile(chart, `${title.toLowerCase().replace(/\s+/g, '_')}.mmd`);
  };

  const handleDownloadMd = () => {
    const md = formatAsGitHubMarkdown(chart, title);
    downloadMarkdownFile(md, `${title.toLowerCase().replace(/\s+/g, '_')}.md`);
  };

  return (
    <div className={`flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm ${className}`}>
      {/* Header / Controls Bar */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs text-gray-700">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700">
              Mermaid
            </span>
            <span className="text-gray-800 font-semibold truncate max-w-[200px] sm:max-w-xs">{title}</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-200/80 p-0.5 rounded-lg mr-1">
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'preview' ? 'bg-white shadow-xs text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Preview Diagram"
              >
                <Eye size={13} />
                <span>Visual</span>
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'code' ? 'bg-white shadow-xs text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'
                }`}
                title="View Mermaid Code"
              >
                <Code size={13} />
                <span>Code</span>
              </button>
            </div>

            {/* Zoom Controls (preview only) */}
            {viewMode === 'preview' && !error && (
              <div className="hidden sm:flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-lg px-1 py-0.5 mr-1">
                <button
                  onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
                  className="p-1 hover:bg-white rounded text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[11px] text-gray-500 w-9 text-center font-mono">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
                  className="p-1 hover:bg-white rounded text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={13} />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="p-1 hover:bg-white rounded text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                  title="Reset Zoom"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            )}

            {/* Quick Copy Buttons */}
            <button
              onClick={handleCopyRaw}
              className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer"
              title="Copy Mermaid Code"
            >
              {copiedType === 'raw' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
              <span>{copiedType === 'raw' ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleCopyGitHubMarkdown}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium cursor-pointer"
              title="Copy formatted with ```mermaid block for GitHub README"
            >
              {copiedType === 'github' ? <Check size={13} className="text-green-600" /> : <FileText size={13} />}
              <span className="hidden sm:inline">{copiedType === 'github' ? 'Copied Markdown' : 'Copy for GitHub'}</span>
              <span className="sm:hidden">GitHub</span>
            </button>

            {/* Download Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleDownloadMmd}
                className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer"
                title="Download .mmd file"
              >
                <FileCode size={13} />
                <span>.mmd</span>
              </button>
              <button
                onClick={handleDownloadMd}
                className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer"
                title="Download .md (GitHub README) file"
              >
                <Download size={13} />
                <span>.md</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="relative min-h-[260px] max-h-[550px] overflow-auto p-4 flex items-center justify-center bg-gray-50/50">
        {viewMode === 'code' ? (
          <div className="w-full h-full text-left">
            <pre className="p-4 bg-[#1e1e2e] text-emerald-300 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-gray-800 shadow-inner select-text">
              <code>{chart}</code>
            </pre>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center p-6 max-w-md">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
              <AlertCircle size={22} />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Visual Render Preview</h4>
            <p className="text-xs text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => setViewMode('code')}
              className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Switch to Code View
            </button>
          </div>
        ) : svgContent ? (
          <div
            ref={containerRef}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.15s ease-out' }}
            className="w-full flex items-center justify-center overflow-visible"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="text-gray-400 text-xs flex items-center gap-2">
            <span>Generating diagram preview...</span>
          </div>
        )}
      </div>

      {/* Footer Info / GitHub badge */}
      <div className="px-4 py-2 bg-white border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
        <span className="flex items-center gap-1 text-gray-600">
          <span className="text-purple-600 font-semibold">GitHub Native:</span> Renders directly in README.md, PRs & Wikis
        </span>
        <span className="font-mono text-gray-400 text-[10px]">
          {chart.split('\n').length} lines
        </span>
      </div>
    </div>
  );
}
