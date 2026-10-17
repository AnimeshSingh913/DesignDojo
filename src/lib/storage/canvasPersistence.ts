/**
 * Unified Canvas Persistence Utility for DesignDojo
 * Handles safe serialization, quota management, state sanitization,
 * fractional index normalization, and debounced auto-saving across Blank Canvas, LLD, HLD, and AI Creator.
 */

import { normalizeFractionalIndices } from '@/lib/canvas/elementOrdering';

export const STORAGE_KEYS = {
  BLANK_CANVAS: 'designdojo_blank_canvas_autosave',
  BLANK_CANVAS_DIAGRAMS: 'designdojo_blank_canvas_diagrams',
  LLD_AUTOSAVE: 'designdojo_lld_autosave',
  HLD_AUTOSAVE: 'designdojo_hld_autosave',
  AI_SESSION: 'designdojo_ai_generator_session',
  AI_HISTORY: 'designdojo_ai_history',
  LLD_DIAGRAMS: 'designdojo_lld_diagrams',
  HLD_DIAGRAMS: 'designdojo_hld_diagrams',
} as const;

export interface PersistedCanvasData {
  elements: any[];
  appState?: {
    viewBackgroundColor?: string;
    zoom?: { value: number };
    scrollX?: number;
    scrollY?: number;
    gridSize?: number | null;
  };
  files?: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp: number;
}

/**
 * Filter out transient / non-serializable properties from Excalidraw's appState
 * to avoid frozen UI or corrupted UI states upon restoration.
 */
export function sanitizeAppState(appState: any) {
  if (!appState || typeof appState !== 'object') return { viewBackgroundColor: '#fffce8' };
  return {
    viewBackgroundColor: appState.viewBackgroundColor || '#fffce8',
    zoom: appState.zoom ? { value: typeof appState.zoom.value === 'number' ? appState.zoom.value : 1 } : undefined,
    scrollX: typeof appState.scrollX === 'number' && !isNaN(appState.scrollX) ? appState.scrollX : 0,
    scrollY: typeof appState.scrollY === 'number' && !isNaN(appState.scrollY) ? appState.scrollY : 0,
    gridSize: appState.gridSize ?? null,
  };
}

/**
 * Helper to safely sanitize elements before serialization
 */
function sanitizeElements(elements: any[]): any[] {
  if (!Array.isArray(elements)) return [];
  const normalized = normalizeFractionalIndices(elements);
  // Strip non-serializable functions or references
  return normalized.map((el) => {
    if (!el || typeof el !== 'object') return el;
    const { boundElements, ...rest } = el;
    return {
      ...rest,
      boundElements: Array.isArray(boundElements) ? boundElements : undefined,
    };
  });
}

/**
 * Safely save data to localStorage with error handling for quota limits,
 * fractional index normalization, and circular structure protection.
 */
export function saveCanvasData(key: string, data: any): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const payload = { ...data };
    if (Array.isArray(payload.elements)) {
      payload.elements = sanitizeElements(payload.elements);
    }
    if (payload.appState) {
      payload.appState = sanitizeAppState(payload.appState);
    }
    payload.timestamp = Date.now();

    const serialized = JSON.stringify(payload);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error: any) {
    // If quota exceeded, try removing old scratch/history entries
    if (error?.name === 'QuotaExceededError' || error?.code === 22 || error?.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.warn(`[CanvasPersistence] Storage quota reached saving to ${key}. Attempting emergency prune.`);
      tryPruneStorage();
      try {
        const payload = { ...data };
        if (Array.isArray(payload.elements)) {
          payload.elements = sanitizeElements(payload.elements);
        }
        // If still large, drop heavy files payload to preserve diagram elements
        delete payload.files;
        localStorage.setItem(key, JSON.stringify(payload));
        return true;
      } catch (retryErr) {
        console.error(`[CanvasPersistence] Failed to write after prune:`, retryErr);
        return false;
      }
    }
    console.error(`[CanvasPersistence] Error saving to ${key}:`, error);
    return false;
  }
}

/**
 * Safely load parsed data from localStorage with fractional index normalization.
 */
export function loadCanvasData<T = PersistedCanvasData>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.elements)) {
      parsed.elements = normalizeFractionalIndices(parsed.elements);
    }
    return parsed as T;
  } catch (error) {
    console.error(`[CanvasPersistence] Error loading from ${key}:`, error);
    return null;
  }
}

/**
 * Safely remove an item from localStorage.
 */
export function clearCanvasData(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`[CanvasPersistence] Error clearing ${key}:`, error);
  }
}

/**
 * Helper to prune older history and saved entries if localStorage hits quota limit.
 */
function tryPruneStorage() {
  try {
    // 1. Prune AI history to top 3 items
    const aiHistoryRaw = localStorage.getItem(STORAGE_KEYS.AI_HISTORY);
    if (aiHistoryRaw) {
      const history = JSON.parse(aiHistoryRaw);
      if (Array.isArray(history) && history.length > 3) {
        localStorage.setItem(STORAGE_KEYS.AI_HISTORY, JSON.stringify(history.slice(0, 3)));
      }
    }

    // 2. Prune old blank canvas if too large
    const blankRaw = localStorage.getItem(STORAGE_KEYS.BLANK_CANVAS);
    if (blankRaw && blankRaw.length > 1000000) {
      const blankData = JSON.parse(blankRaw);
      delete blankData.files;
      localStorage.setItem(STORAGE_KEYS.BLANK_CANVAS, JSON.stringify(blankData));
    }
  } catch (e) {
    console.error('[CanvasPersistence] Storage pruning failed:', e);
  }
}

/**
 * Robust Debounced Canvas Saver
 * - Handles `visibilitychange` (mobile / tab switch / minimize)
 * - Handles `pagehide` and `beforeunload`
 * - Protects against cold-boot race conditions where initial mount calls onChange([])
 */
export class CanvasDebouncedSaver {
  private timer: any = null;
  private pendingData: any = null;
  private key: string;
  private delayMs: number;
  private onSaveCallback?: (saved: boolean) => void;
  private createdAt: number;
  private hasExistingNonEmptyData: boolean = false;

  constructor(key: string, delayMs = 400, onSaveCallback?: (saved: boolean) => void) {
    this.key = key;
    this.delayMs = delayMs;
    this.onSaveCallback = onSaveCallback;
    this.createdAt = Date.now();

    // Check if there is existing non-empty data
    if (typeof window !== 'undefined') {
      try {
        const existing = loadCanvasData<any>(key);
        if (existing && Array.isArray(existing.elements) && existing.elements.length > 0) {
          this.hasExistingNonEmptyData = true;
        }
      } catch {
        this.hasExistingNonEmptyData = false;
      }

      window.addEventListener('beforeunload', this.flush);
      window.addEventListener('pagehide', this.flush);
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  private handleVisibilityChange = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      this.flush();
    }
  };

  /**
   * Queue a save operation.
   * Prevents cold-boot empty mount events from accidentally wiping existing saved state.
   */
  public save(data: any) {
    // Guard: If we have existing saved data and incoming elements are empty during initial 1.5s cold boot,
    // skip overwriting unless explicitly marked as an intentional clear (isExplicitClear).
    const isColdBoot = Date.now() - this.createdAt < 1500;
    const isIncomingEmpty = Array.isArray(data?.elements) && data.elements.length === 0;

    if (this.hasExistingNonEmptyData && isColdBoot && isIncomingEmpty && !data?.isExplicitClear) {
      return;
    }

    if (Array.isArray(data?.elements) && data.elements.length > 0) {
      this.hasExistingNonEmptyData = true;
    }

    this.pendingData = data;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.flush();
    }, this.delayMs);
  }

  public flush = () => {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.pendingData !== null) {
      const dataToSave = this.pendingData;
      this.pendingData = null;
      const success = saveCanvasData(this.key, dataToSave);
      if (this.onSaveCallback) {
        this.onSaveCallback(success);
      }
    }
  };

  public destroy() {
    this.flush();
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.flush);
      window.removeEventListener('pagehide', this.flush);
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }
}

/**
 * Fast comparison to check if canvas elements have actually changed
 * (avoids spurious autosaves on cursor movement, selection, zoom, pan, or initial mount).
 */
export function areElementsEqual(prev: readonly any[] | undefined, next: readonly any[] | undefined): boolean {
  if (prev === next) return true;
  if (!prev && !next) return true;
  if (!prev || !next) return false;
  if (prev.length !== next.length) return false;
  if (prev.length === 0 && next.length === 0) return true;

  for (let i = 0; i < prev.length; i++) {
    const p = prev[i];
    const n = next[i];
    if (!p || !n) return false;
    if (p.id !== n.id || p.version !== n.version || p.isDeleted !== n.isDeleted) {
      return false;
    }
  }
  return true;
}

