/**
 * Unified Diagram Storage Manager for DesignDojo
 * Manages named diagrams across Blank Canvas, LLD, and HLD workspaces
 * with thumbnail generation, versioning, search, and local persistence.
 */

import { 
  STORAGE_KEYS, 
  saveCanvasData, 
  loadCanvasData, 
  sanitizeAppState 
} from './canvasPersistence';
import { normalizeFractionalIndices } from '@/lib/canvas/elementOrdering';

export type WorkspaceType = 'canvas' | 'lld' | 'hld';

export interface SavedDiagramItem {
  id: string;
  name: string;
  workspaceType: WorkspaceType;
  diagramType: string;
  linkedQuestionId?: string | null;
  elements: any[];
  appState: any;
  previewImage?: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  version: number;
}

export interface SaveDiagramParams {
  id?: string;
  name: string;
  workspaceType: WorkspaceType;
  diagramType?: string;
  linkedQuestionId?: string | null;
  elements: any[];
  appState?: any;
  previewImage?: string;
  description?: string;
}

type StorageChangeListener = () => void;

export class SavedDiagramManager {
  private static listeners: Set<StorageChangeListener> = new Set();

  public static subscribe(listener: StorageChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error('[SavedDiagramManager] Listener error:', e);
      }
    });
  }

  public static getStorageKey(workspace: WorkspaceType): string {
    switch (workspace) {
      case 'canvas':
        return STORAGE_KEYS.BLANK_CANVAS_DIAGRAMS;
      case 'lld':
        return STORAGE_KEYS.LLD_DIAGRAMS;
      case 'hld':
        return STORAGE_KEYS.HLD_DIAGRAMS;
      default:
        return STORAGE_KEYS.BLANK_CANVAS_DIAGRAMS;
    }
  }

  /**
   * Returns a map of all saved diagrams for the specified workspace.
   * Handles backwards compatibility with legacy record structures and arrays.
   */
  public static getAllDiagrams(workspace: WorkspaceType): Record<string, SavedDiagramItem> {
    if (typeof window === 'undefined') return {};
    const key = this.getStorageKey(workspace);
    const rawData = loadCanvasData<any>(key);
    if (!rawData) return {};

    const normalizedMap: Record<string, SavedDiagramItem> = {};
    const items = Array.isArray(rawData)
      ? rawData
      : typeof rawData === 'object'
      ? Object.entries(rawData).map(([k, v]) => ({ ...(v && typeof v === 'object' ? v : {}), id: (v as any)?.id || k }))
      : [];

    let hasGhost = false;
    items.forEach((item: any) => {
      if (!item) return;

      const rawElements = Array.isArray(item.elements) ? item.elements : [];
      const hasElements = rawElements.length > 0;
      const isUntitledEmpty = (!item.name || item.name === 'Untitled Diagram') && !hasElements && !item.previewImage;

      // Filter out empty accidental ghost records
      if (isUntitledEmpty) {
        hasGhost = true;
        return;
      }

      const id = String(item.id || `diag_${workspace}_${Date.now()}`);
      const name = item.name || item.metadata?.projectName || 'Untitled Diagram';
      const diagramType = item.diagramType || item.metadata?.diagramType || (workspace === 'lld' ? 'Class Diagram' : workspace === 'hld' ? 'System Architecture' : 'Freeform Architecture');
      const linkedQuestionId = item.linkedQuestionId !== undefined ? item.linkedQuestionId : (item.metadata?.linkedQuestionId || null);
      const createdAt = item.createdAt || item.metadata?.createdAt || Date.now();
      const updatedAt = item.updatedAt || item.metadata?.updatedAt || Date.now();
      const version = typeof item.version === 'number' ? item.version : (item.metadata?.version || 1);

      normalizedMap[id] = {
        id,
        name,
        workspaceType: workspace,
        diagramType,
        linkedQuestionId,
        elements: normalizeFractionalIndices(rawElements),
        appState: sanitizeAppState(item.appState),
        previewImage: item.previewImage,
        description: item.description,
        createdAt,
        updatedAt,
        version,
      };
    });

    if (hasGhost) {
      saveCanvasData(key, normalizedMap);
    }

    return normalizedMap;
  }

  /**
   * Returns a sorted list of saved diagrams (most recently updated first).
   */
  public static getDiagramsList(workspace?: WorkspaceType | 'all'): SavedDiagramItem[] {
    if (typeof window === 'undefined') return [];

    let all: SavedDiagramItem[] = [];

    if (!workspace || workspace === 'all') {
      const canvasDiags = Object.values(this.getAllDiagrams('canvas'));
      const lldDiags = Object.values(this.getAllDiagrams('lld'));
      const hldDiags = Object.values(this.getAllDiagrams('hld'));
      all = [...canvasDiags, ...lldDiags, ...hldDiags];
    } else {
      all = Object.values(this.getAllDiagrams(workspace));
    }

    return all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  /**
   * Retrieves a single saved diagram by ID from a specific workspace.
   */
  public static getDiagramById(workspace: WorkspaceType, id: string): SavedDiagramItem | null {
    const map = this.getAllDiagrams(workspace);
    return map[id] || null;
  }

  /**
   * Saves or updates a diagram in the specified workspace.
   */
  public static async saveDiagram(params: SaveDiagramParams): Promise<SavedDiagramItem> {
    const {
      workspaceType,
      name,
      elements,
      appState,
      diagramType,
      linkedQuestionId,
      description,
      previewImage: propPreviewImage
    } = params;

    const key = this.getStorageKey(workspaceType);
    const diagrams = this.getAllDiagrams(workspaceType);

    const id = params.id || `diag_${workspaceType}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const existing = diagrams[id];

    // Generate thumbnail preview if not already provided
    let previewImage = propPreviewImage;
    if (!previewImage && elements && elements.length > 0) {
      try {
        previewImage = await this.generatePreviewThumbnail(elements, appState);
      } catch (err) {
        console.warn('[SavedDiagramManager] Could not generate preview thumbnail:', err);
      }
    } else if (!previewImage && existing?.previewImage) {
      previewImage = existing.previewImage;
    }

    const defaultDiagramType = workspaceType === 'lld' 
      ? 'Class Diagram' 
      : workspaceType === 'hld' 
      ? 'System Architecture' 
      : 'Freeform Architecture';

    const cleanName = name.trim() || 'Untitled Diagram';
    const now = Date.now();

    const record: SavedDiagramItem = {
      id,
      name: cleanName,
      workspaceType,
      diagramType: diagramType || existing?.diagramType || defaultDiagramType,
      linkedQuestionId: linkedQuestionId !== undefined ? linkedQuestionId : (existing?.linkedQuestionId || null),
      elements: Array.isArray(elements) ? normalizeFractionalIndices(elements) : [],
      appState: sanitizeAppState(appState),
      previewImage: previewImage || existing?.previewImage,
      description: description !== undefined ? description : existing?.description,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      version: existing ? existing.version + 1 : 1,
    };

    diagrams[id] = record;
    saveCanvasData(key, diagrams);
    this.notifyListeners();

    return record;
  }

  /**
   * Deletes a saved diagram by ID from the specified workspace and cleans up all storage keys.
   */
  public static deleteDiagram(workspace: WorkspaceType, id: string): boolean {
    if (typeof window === 'undefined') return false;

    let deleted = false;
    const allKeys = [
      STORAGE_KEYS.BLANK_CANVAS_DIAGRAMS,
      STORAGE_KEYS.LLD_DIAGRAMS,
      STORAGE_KEYS.HLD_DIAGRAMS,
      'designdojo_saved_diagrams',
      'designdojo_diagrams',
    ];

    allKeys.forEach((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const initialLen = parsed.length;
          const filtered = parsed.filter((item: any) => item && item.id !== id && String(item.id) !== String(id));
          if (filtered.length !== initialLen) {
            localStorage.setItem(key, JSON.stringify(filtered));
            deleted = true;
          }
        } else if (parsed && typeof parsed === 'object') {
          let modified = false;
          Object.keys(parsed).forEach((k) => {
            if (k === id || parsed[k]?.id === id || String(parsed[k]?.id) === String(id)) {
              delete parsed[k];
              modified = true;
              deleted = true;
            }
          });
          if (modified) {
            localStorage.setItem(key, JSON.stringify(parsed));
          }
        }
      } catch (e) {
        console.error('[SavedDiagramManager] Delete error:', e);
      }
    });

    this.notifyListeners();
    return deleted;
  }

  /**
   * Renames a saved diagram.
   */
  public static renameDiagram(workspace: WorkspaceType, id: string, newName: string): boolean {
    const key = this.getStorageKey(workspace);
    const diagrams = this.getAllDiagrams(workspace);
    if (!diagrams[id]) return false;

    const trimmed = newName.trim();
    if (!trimmed) return false;

    diagrams[id].name = trimmed;
    diagrams[id].updatedAt = Date.now();
    saveCanvasData(key, diagrams);
    this.notifyListeners();
    return true;
  }

  /**
   * Duplicates a saved diagram, appending " (Copy)" to the name.
   */
  public static duplicateDiagram(workspace: WorkspaceType, id: string): SavedDiagramItem | null {
    const original = this.getDiagramById(workspace, id);
    if (!original) return null;

    const newId = `diag_${workspace}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const copy: SavedDiagramItem = {
      ...original,
      id: newId,
      name: `${original.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    };

    const key = this.getStorageKey(workspace);
    const diagrams = this.getAllDiagrams(workspace);
    diagrams[newId] = copy;
    saveCanvasData(key, diagrams);
    this.notifyListeners();

    return copy;
  }

  /**
   * Generates a lightweight PNG thumbnail data URL from canvas elements.
   */
  public static async generatePreviewThumbnail(elements: any[], appState?: any): Promise<string> {
    if (typeof window === 'undefined' || !elements || elements.length === 0) return '';
    try {
      const { exportToBlob } = await import('@excalidraw/excalidraw');
      const activeElements = elements.filter((el: any) => el && !el.isDeleted);
      if (activeElements.length === 0) return '';

      const blob = await exportToBlob({
        elements: activeElements,
        mimeType: 'image/png',
        appState: {
          ...(appState || {}),
          exportBackground: true,
          viewBackgroundColor: '#ffffff',
          exportScale: 1,
          exportWithDarkMode: false,
        },
      });

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn('[SavedDiagramManager] Thumbnail generation error:', e);
      return '';
    }
  }
}
