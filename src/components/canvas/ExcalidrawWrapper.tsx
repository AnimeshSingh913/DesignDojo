'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import '@/components/providers/UnloadPolicyFix';
import '@excalidraw/excalidraw/index.css';

interface ExcalidrawWrapperProps {
  onAPI?: (api: any) => void;
  onChange?: (elements: readonly any[], appState: any, files: any) => void;
  initialData?: any;
  storageKey?: string;
  autoSave?: boolean;
  showSaveIndicator?: boolean;
  workspaceTitle?: string;
}

const DesignDojoCanvas = dynamic(
  () => import('./DesignDojoCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full bg-[#faf9f6]">
        <div className="text-primary/50 text-sm font-medium animate-pulse">Loading Canvas Workspace...</div>
      </div>
    ),
  }
);

export default function ExcalidrawWrapper({ 
  onAPI, 
  onChange, 
  initialData, 
  storageKey, 
  autoSave = false, 
  showSaveIndicator = false,
  workspaceTitle
}: ExcalidrawWrapperProps) {
  return (
    <div className="w-full h-full excalidraw-designdojo-theme">
      <DesignDojoCanvas 
        onAPI={onAPI} 
        onChange={onChange}
        initialData={initialData}
        storageKey={storageKey}
        autoSave={autoSave}
        showSaveIndicator={showSaveIndicator}
        workspaceTitle={workspaceTitle}
      />
      <style dangerouslySetInnerHTML={{__html: `
        .excalidraw-designdojo-theme {
          --color-bg-canvas: #faf9f6 !important;
          --color-primary: #1e293b !important;
          --color-primary-darker: #0f172a !important;
          --color-primary-darkest: #020617 !important;
          
          /* Custom UI Styling */
          --border-radius: 12px !important;
          --font-family: var(--font-inter) !important;
        }

        /* Hide unused vendor UI elements (Library, Help, Lock, Hand, Shapes) */
        .excalidraw .layer-ui__wrapper .help-icon,
        .excalidraw .layer-ui__wrapper button[title*="Help"],
        .excalidraw .layer-ui__wrapper button[aria-label*="Help"],
        .excalidraw .layer-ui__wrapper [data-testid="help-menu"],
        .excalidraw .layer-ui__wrapper .sidebar-trigger,
        .excalidraw .layer-ui__wrapper button[title*="Library"],
        .excalidraw .layer-ui__wrapper button[aria-label*="Library"],
        .excalidraw .layer-ui__wrapper [data-testid="library-button"],
        .excalidraw .layer-ui__wrapper .library-menu-control,
        .excalidraw .layer-ui__wrapper label[title*="Lock"],
        .excalidraw .layer-ui__wrapper label[title*="Keep"],
        .excalidraw .layer-ui__wrapper [aria-label*="Lock"],
        .excalidraw .layer-ui__wrapper [aria-label*="Keep"],
        .excalidraw .layer-ui__wrapper [data-testid="toggle-lock"],
        .excalidraw .layer-ui__wrapper label[title*="Hand"],
        .excalidraw .layer-ui__wrapper [aria-label*="Hand"],
        .excalidraw .layer-ui__wrapper [data-testid="toolbar-hand"],
        .excalidraw .layer-ui__wrapper button[aria-label*="More"],
        .excalidraw .layer-ui__wrapper button[aria-label*="Shapes"],
        .excalidraw .layer-ui__wrapper [title*="Shapes"],
        .excalidraw .layer-ui__wrapper [aria-label="More tools"],
        .excalidraw .layer-ui__wrapper [data-testid="toolbar-more-tools"] {
          display: none !important;
        }
      `}} />
    </div>
  );
}
