import { 
  STORAGE_KEYS, 
  saveCanvasData, 
  loadCanvasData, 
  clearCanvasData, 
  sanitizeAppState 
} from '@/lib/storage/canvasPersistence';
import { SavedDiagramManager, SavedDiagramItem } from '@/lib/storage/savedDiagramManager';

export class HLDStorageManager {
  private static AUTOSAVE_KEY = STORAGE_KEYS.HLD_AUTOSAVE;

  static saveDiagram(
    id: string,
    projectName: string,
    diagramType: any,
    linkedQuestionId: string | null,
    elements: any[],
    appState: any,
    previewImage?: string
  ): SavedDiagramItem {
    const diagrams = SavedDiagramManager.getAllDiagrams('hld');
    const existing = diagrams[id];
    const now = Date.now();

    const record: SavedDiagramItem = {
      id,
      name: projectName,
      workspaceType: 'hld',
      diagramType: diagramType || 'System Architecture',
      linkedQuestionId,
      elements,
      appState: sanitizeAppState(appState),
      previewImage: previewImage || existing?.previewImage,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
      version: existing ? existing.version + 1 : 1,
    };

    diagrams[id] = record;
    saveCanvasData(STORAGE_KEYS.HLD_DIAGRAMS, diagrams);
    return record;
  }

  static getAllDiagrams(): Record<string, SavedDiagramItem> {
    return SavedDiagramManager.getAllDiagrams('hld');
  }

  static deleteDiagram(id: string) {
    return SavedDiagramManager.deleteDiagram('hld', id);
  }

  static autoSave(elements: any[], appState: any, metadata: any = {}) {
    saveCanvasData(this.AUTOSAVE_KEY, { 
      elements, 
      appState: sanitizeAppState(appState), 
      metadata, 
      timestamp: Date.now() 
    });
  }

  static loadAutoSave() {
    return loadCanvasData<{
      elements: any[];
      appState: any;
      metadata: any;
      timestamp: number;
    }>(this.AUTOSAVE_KEY);
  }

  static clearAutoSave() {
    clearCanvasData(this.AUTOSAVE_KEY);
  }
}

