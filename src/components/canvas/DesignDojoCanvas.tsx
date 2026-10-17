import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import '@/components/providers/UnloadPolicyFix';
import { Excalidraw, MainMenu, WelcomeScreen } from '@excalidraw/excalidraw';
import { LogoIcon } from '@/components/icons/LogoIcon';
import { 
  loadCanvasData, 
  sanitizeAppState, 
  CanvasDebouncedSaver, 
  STORAGE_KEYS,
  PersistedCanvasData,
  areElementsEqual
} from '@/lib/storage/canvasPersistence';
import { normalizeFractionalIndices } from '@/lib/canvas/elementOrdering';
import { reconcileCanvasElements } from '@/lib/canvas/elementReconciliation';
import { AIGeneratorHistoryManager } from './plugins/ai-generator/storage/AIGeneratorHistoryManager';
import { CloudCheck, Cloud, Loader2 } from 'lucide-react';

interface Props {
  onAPI?: (api: any) => void;
  onChange?: (elements: readonly any[], appState: any, files: any) => void;
  initialData?: any;
  storageKey?: string;
  autoSave?: boolean;
  showSaveIndicator?: boolean;
  workspaceTitle?: string;
}

export default function DesignDojoCanvas({ 
  onAPI, 
  onChange, 
  initialData: propInitialData, 
  storageKey, 
  autoSave = false,
  showSaveIndicator = false,
  workspaceTitle
}: Props) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saverRef = useRef<CanvasDebouncedSaver | null>(null);
  const statusTimerRef = useRef<any>(null);
  const lastSavedElementsRef = useRef<readonly any[] | undefined>(undefined);
  const internalApiRef = useRef<any>(null);

  const handleAPI = useCallback((api: any) => {
    internalApiRef.current = api;
    if (onAPI) {
      onAPI(api);
    }
  }, [onAPI]);

  // Initialize storage saver if autoSave is enabled or storageKey is provided
  useEffect(() => {
    if (storageKey && autoSave) {
      saverRef.current = new CanvasDebouncedSaver(storageKey, 400, (success) => {
        if (success) {
          setSaveStatus('saved');
          if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
          statusTimerRef.current = setTimeout(() => {
            setSaveStatus('idle');
          }, 2500);
        }
      });
    }

    return () => {
      if (saverRef.current) {
        saverRef.current.destroy();
      }
      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current);
      }
    };
  }, [storageKey, autoSave]);

  // Suppress Excalidraw benign internal dev warnings
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('A component is changing a controlled input')) return;
      if (typeof args[0] === 'string' && args[0].includes('Linear element is not normalized')) return;
      if (typeof args[0] === 'string' && args[0].includes('Fractional indices invariant')) return;
      if (typeof args[0] === 'string' && args[0].includes('Permissions policy violation: unload')) return;
      originalError(...args);
    };

    console.warn = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('Permissions policy violation: unload')) return;
      originalWarn(...args);
    };

    return () => { 
      console.error = originalError; 
      console.warn = originalWarn;
    };
  }, []);

  // Compute initial data from storage if not provided via props
  const computedInitialData = useMemo(() => {
    if (propInitialData) {
      const activeElements = Array.isArray(propInitialData.elements)
        ? propInitialData.elements.filter((el: any) => el && !el.isDeleted)
        : [];
      if (activeElements.length > 0) {
        const { elements: reconciled } = reconcileCanvasElements(activeElements);
        const normalized = normalizeFractionalIndices(reconciled);
        lastSavedElementsRef.current = normalized;
        return {
          ...propInitialData,
          elements: normalized,
          appState: {
            viewBackgroundColor: '#fffce8',
            showWelcomeScreen: false,
            ...(propInitialData.appState || {}),
          },
        };
      }
    }

    if (storageKey) {
      if (storageKey === STORAGE_KEYS.AI_SESSION) {
        AIGeneratorHistoryManager.checkAndArchiveExpiredSession();
      }
      const saved = loadCanvasData<PersistedCanvasData>(storageKey);
      if (saved && Array.isArray(saved.elements)) {
        const activeElements = saved.elements.filter((el: any) => el && !el.isDeleted);
        if (activeElements.length > 0) {
          const { elements: reconciled } = reconcileCanvasElements(activeElements);
          const normalized = normalizeFractionalIndices(reconciled);
          lastSavedElementsRef.current = normalized;
          return {
            elements: normalized,
            appState: {
              viewBackgroundColor: '#fffce8',
              showWelcomeScreen: false,
              ...(saved.appState || {}),
            },
            files: saved.files || {},
            scrollToContent: true,
          };
        }
      }
    }

    return { 
      elements: [],
      appState: { 
        viewBackgroundColor: '#fffce8',
        showWelcomeScreen: true,
      },
      files: {},
    };
  }, [propInitialData, storageKey]);

  /**
   * Registers a global listener to ensure that active radix-ui popovers 
   * are properly dismissed when interacting with the canvas element.
   */
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (e.target instanceof HTMLCanvasElement) {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      }
    };
    
    // Use capture phase to ensure it runs before Excalidraw's internal handlers might stop propagation
    document.addEventListener('pointerdown', handlePointerDown, { capture: true });
    return () => document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
  }, []);

  const isReconcilingRef = useRef(false);
  const wasEditingRef = useRef(false);

  const handleChange = useCallback((elements: readonly any[], appState: any, files: any) => {
    // If this onChange was triggered by our own reconciliation updateScene, ignore to prevent feedback loop
    if (isReconcilingRef.current) {
      isReconcilingRef.current = false;
      if (onChange) {
        onChange(elements, appState, files);
      }
      return;
    }

    let currentElements = elements;
    const editingElementId = appState?.editingElement?.id || null;

    // Run layout reconciliation live on all elements; active editing text is untouched to preserve cursor
    const { elements: reconciled, changed } = reconcileCanvasElements(elements, editingElementId);

    if (changed) {
      currentElements = reconciled;
      if (internalApiRef.current) {
        isReconcilingRef.current = true;
        internalApiRef.current.updateScene({ elements: reconciled });
      }
    }

    const isUnchanged = areElementsEqual(lastSavedElementsRef.current, currentElements);
    const isBlank = (!currentElements || currentElements.length === 0) && (!lastSavedElementsRef.current || lastSavedElementsRef.current.length === 0);

    if (autoSave && saverRef.current && !isUnchanged && !isBlank) {
      lastSavedElementsRef.current = currentElements;
      setSaveStatus('saving');
      saverRef.current.save({
        elements: currentElements,
        appState: sanitizeAppState(appState),
        files,
        timestamp: Date.now(),
      });
    }

    if (onChange) {
      onChange(currentElements, appState, files);
    }
  }, [autoSave, onChange]);

  const resolvedHeading = useMemo(() => {
    if (workspaceTitle) return workspaceTitle;
    if (storageKey === STORAGE_KEYS.LLD_AUTOSAVE) return 'Low-Level Design (LLD) Workspace';
    if (storageKey === STORAGE_KEYS.HLD_AUTOSAVE) return 'High-Level Design (HLD) Workspace';
    if (storageKey === STORAGE_KEYS.AI_SESSION) return 'AI Architecture Studio';
    return 'Blank Canvas Workspace';
  }, [workspaceTitle, storageKey]);

  return (
    <div className="relative w-full h-full">
      <Excalidraw 
        key={`designdojo-canvas-${storageKey || 'default'}`}
        theme="light"
        name="DesignDojo Canvas"
        initialData={computedInitialData}
        UIOptions={{
          welcomeScreen: true,
        }}
        excalidrawAPI={handleAPI}
        onChange={handleChange}
      >
        {/* Custom Main Menu Configuration */}
        <MainMenu>
          <MainMenu.DefaultItems.SaveToActiveFile />
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.Separator />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>

        {/* Custom Welcome Screen Configuration */}
        <WelcomeScreen>
          <WelcomeScreen.Hints.MenuHint />
          <WelcomeScreen.Hints.ToolbarHint />
          
          <WelcomeScreen.Center>
            <WelcomeScreen.Center.Logo>
              <div className="flex items-center gap-3 select-none mb-4">
                <LogoIcon className="w-10 h-10" />
                <span className="text-3xl font-extrabold text-[#354259] tracking-tight" style={{ fontFamily: 'var(--font-inter)' }}>DesignDojo</span>
              </div>
            </WelcomeScreen.Center.Logo>
            <WelcomeScreen.Center.Heading>
              {resolvedHeading}
            </WelcomeScreen.Center.Heading>
          </WelcomeScreen.Center>
        </WelcomeScreen>

        {/* CSS to hide Excalidraw's internal Library and Sidebar buttons that overlap with our custom UI */}
        <style>{`
          .excalidraw .sidebar-trigger,
          .excalidraw [data-testid="sidebar-trigger"],
          .excalidraw [aria-label="Library"],
          .excalidraw .layer-ui__library-button,
          .excalidraw .layer-ui__wrapper button[title*="Help"],
          .excalidraw .layer-ui__wrapper button[aria-label*="Help"],
          .excalidraw .layer-ui__wrapper [data-testid="help-menu"],
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
          .excalidraw .layer-ui__wrapper button[title*="Shapes"],
          .excalidraw .layer-ui__wrapper button[title*="More tools"],
          .excalidraw .layer-ui__wrapper [aria-label="More tools"],
          .excalidraw .layer-ui__wrapper [data-testid="toolbar-more-tools"] {
            display: none !important;
          }

          /* Push Excalidraw's left menu to the right to make room for our Explorer button */
          .excalidraw .App-menu_top__left {
            margin-left: 56px !important;
          }
        `}</style>
      </Excalidraw>

      {/* Persistent Auto-Save Status Indicator */}
      {showSaveIndicator && saveStatus !== 'idle' && (
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-surface/90 backdrop-blur-md border border-primary/10 rounded-full shadow-sm text-xs font-medium text-primary/70 transition-all duration-300 pointer-events-none select-none">
          {saveStatus === 'saving' ? (
            <>
              <Loader2 size={13} className="animate-spin text-primary" />
              <span>Saving changes...</span>
            </>
          ) : (
            <>
              <CloudCheck size={14} className="text-emerald-600" />
              <span className="text-emerald-700">Auto-saved to device</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
