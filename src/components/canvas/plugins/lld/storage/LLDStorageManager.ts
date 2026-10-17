import { 
  STORAGE_KEYS, 
  saveCanvasData, 
  loadCanvasData, 
  clearCanvasData, 
  sanitizeAppState 
} from '@/lib/storage/canvasPersistence';
import { SavedDiagramManager, SavedDiagramItem } from '@/lib/storage/savedDiagramManager';

export class LLDStorageManager {
  private static AUTOSAVE_KEY = STORAGE_KEYS.LLD_AUTOSAVE;

  static saveDiagram(
    id: string,
    projectName: string,
    diagramType: any,
    linkedQuestionId: string | null,
    elements: any[],
    appState: any,
    previewImage?: string
  ): SavedDiagramItem {
    // Synchronous write helper or delegate to SavedDiagramManager
    const diagrams = SavedDiagramManager.getAllDiagrams('lld');
    const existing = diagrams[id];
    const now = Date.now();

    const record: SavedDiagramItem = {
      id,
      name: projectName,
      workspaceType: 'lld',
      diagramType: diagramType || 'Class Diagram',
      linkedQuestionId,
      elements,
      appState: sanitizeAppState(appState),
      previewImage: previewImage || existing?.previewImage,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
      version: existing ? existing.version + 1 : 1,
    };

    diagrams[id] = record;
    saveCanvasData(STORAGE_KEYS.LLD_DIAGRAMS, diagrams);
    return record;
  }

  static getAllDiagrams(): Record<string, SavedDiagramItem> {
    return SavedDiagramManager.getAllDiagrams('lld');
  }

  static deleteDiagram(id: string) {
    return SavedDiagramManager.deleteDiagram('lld', id);
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

