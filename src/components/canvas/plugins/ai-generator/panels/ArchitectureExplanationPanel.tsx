import React, { useState } from 'react';
import { useAIGenerator } from '../context/AIGeneratorContext';
import { X, Info, Shield, Server, Database, Activity, Layout, Download } from 'lucide-react';
import { ExportDiagramModal } from '@/components/canvas/export/ExportDiagramModal';

interface ArchitectureExplanationPanelProps {
  onClose: () => void;
  excalidrawAPI?: any;
}

export function ArchitectureExplanationPanel({ onClose, excalidrawAPI }: ArchitectureExplanationPanelProps) {
  const { explanationData, prompt } = useAIGenerator();
  const [isExportOpen, setIsExportOpen] = useState(false);

  if (!explanationData) return null;

  return (
    <div className="w-96 h-full bg-surface border-l border-primary/10 flex flex-col shadow-xl z-20 transition-all duration-300">
      <div className="p-4 border-b border-primary/10 flex justify-between items-center bg-transparent sticky top-0">
        <div className="flex items-center gap-2">
          <Info size={18} className="text-blue-600" />
          <h2 className="font-heading font-bold text-primary-ink text-sm">Architecture Details</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="Export as Mermaid (.mmd) for GitHub"
          >
            <Download size={13} />
            <span>Export</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-primary/60 hover:text-primary-ink hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#faf9f6]">
        
        {/* Overview */}
        <section className="space-y-3">
          <h3 className="font-semibold text-primary-ink flex items-center gap-2 text-sm uppercase tracking-wider">
            <Layout size={16} className="text-purple-600" /> Overview
          </h3>
          <p className="text-sm text-primary/80 leading-relaxed bg-transparent p-4 rounded-xl border border-primary/10 shadow-sm">
            {explanationData.overview}
          </p>
        </section>

        {/* Requirements */}
        <section className="space-y-4">
          <h3 className="font-semibold text-primary-ink text-sm uppercase tracking-wider">Requirements</h3>
          
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-primary/70">Functional</h4>
            <ul className="list-disc list-inside text-sm text-primary/80 space-y-1 pl-1">
              {explanationData.functionalRequirements.map((req, i) => <li key={i}>{req}</li>)}
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-primary/70">Non-Functional</h4>
            <ul className="list-disc list-inside text-sm text-primary/80 space-y-1 pl-1">
              {explanationData.nonFunctionalRequirements.map((req, i) => <li key={i}>{req}</li>)}
            </ul>
          </div>
        </section>

        {/* Request Flow */}
        <section className="space-y-3">
          <h3 className="font-semibold text-primary-ink flex items-center gap-2 text-sm uppercase tracking-wider">
            <Activity size={16} className="text-blue-500" /> Request Flow
          </h3>
          <div className="bg-transparent p-4 rounded-xl border border-primary/10 shadow-sm">
            <ol className="list-decimal list-inside text-sm text-primary/80 space-y-2">
              {explanationData.requestFlow.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
        </section>

        {/* Strategies */}
        <section className="space-y-4">
          <h3 className="font-semibold text-primary-ink flex items-center gap-2 text-sm uppercase tracking-wider">
            <Database size={16} className="text-green-600" /> Strategies
          </h3>
          
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-primary/70">Database</h4>
            <p className="text-sm text-primary/80">{explanationData.databaseStrategy}</p>
          </div>
          
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-primary/70">Cache</h4>
            <p className="text-sm text-primary/80">{explanationData.cacheStrategy}</p>
          </div>

          {explanationData.queueStrategy && (
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-primary/70">Queue</h4>
              <p className="text-sm text-primary/80">{explanationData.queueStrategy}</p>
            </div>
          )}
        </section>

        {/* Components */}
        <section className="space-y-3">
          <h3 className="font-semibold text-primary-ink flex items-center gap-2 text-sm uppercase tracking-wider">
            <Server size={16} className="text-orange-500" /> Components
          </h3>
          <div className="space-y-3">
            {explanationData.components.map((comp, i) => (
              <div key={i} className="bg-transparent p-3 rounded-xl border border-primary/10 shadow-sm space-y-1">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-sm text-primary-ink">{comp.name}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                    {comp.technology}
                  </span>
                </div>
                <p className="text-xs text-primary/70">{comp.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* System Properties */}
        <section className="space-y-4 border-t border-primary/10 pt-6">
          <h3 className="font-semibold text-primary-ink flex items-center gap-2 text-sm uppercase tracking-wider">
            <Shield size={16} className="text-red-500" /> System Properties
          </h3>
          
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-primary/70">Scalability</h4>
            <p className="text-sm text-primary/80">{explanationData.scalability}</p>
          </div>
          
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-primary/70">Fault Tolerance</h4>
            <p className="text-sm text-primary/80">{explanationData.faultTolerance}</p>
          </div>
          
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-primary/70">Security</h4>
            <ul className="list-disc list-inside text-sm text-primary/80 pl-1">
              {explanationData.security.map((sec, i) => <li key={i}>{sec}</li>)}
            </ul>
          </div>
        </section>

      </div>

      {isExportOpen && (
        <ExportDiagramModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          excalidrawAPI={excalidrawAPI}
          projectName={prompt ? prompt.substring(0, 30).replace(/\s+/g, '_') : 'AI_Architecture'}
          diagramType="System Architecture"
          workspaceType="ai"
        />
      )}
    </div>
  );
}
