import { generateNKeysBetween } from 'fractional-indexing';
import { reconcileCanvasElements } from './elementReconciliation';

/**
 * Assigns clean, monotonically increasing fractional indices to all elements.
 * This guarantees that Excalidraw's fractional indexing invariant
 * (predecessor.index < element.index < successor.index) is always strictly satisfied.
 */
export function normalizeFractionalIndices<T extends Record<string, any>>(
  elements: readonly T[]
): T[] {
  if (!elements || !Array.isArray(elements) || elements.length === 0) {
    return [];
  }

  try {
    const keys = generateNKeysBetween(null, null, elements.length);
    return elements.map((el, idx) => {
      if (!el || typeof el !== 'object') return el;
      return {
        ...el,
        index: keys[idx] || `a${idx}`,
      };
    });
  } catch {
    // Fallback in case of unexpected errors
    return elements.map((el, idx) => {
      if (!el || typeof el !== 'object') return el;
      return {
        ...el,
        index: `a${String(idx).padStart(4, '0')}`,
      };
    });
  }
}

/**
 * Strips corrupted/duplicate indices before restoring with Excalidraw's restoreElements,
 * then enforces normalized fractional indices and composite element reconciliation.
 */
export async function safeRestoreElements(
  elements: readonly any[],
  localElements?: readonly any[] | null
): Promise<any[]> {
  if (!elements || !Array.isArray(elements) || elements.length === 0) {
    return [];
  }

  try {
    const { restoreElements } = await import('@excalidraw/excalidraw');
    
    // Strip index from incoming elements so restoreElements doesn't fail on collisions
    const stripped = elements.map(el => {
      if (!el || typeof el !== 'object') return el;
      const { index, ...rest } = el;
      return rest;
    });

    const restored = restoreElements(stripped, localElements, { repairBindings: true });
    const { elements: reconciled } = reconcileCanvasElements(restored);
    return normalizeFractionalIndices(reconciled);
  } catch (err) {
    console.warn('[DesignDojo] Safe restore fallback used:', err);
    const { elements: reconciled } = reconcileCanvasElements(elements);
    return normalizeFractionalIndices(reconciled);
  }
}

/**
 * Merges current canvas elements with newly created elements (e.g. from toolbar / AI)
 * ensuring all elements have distinct and valid sequential fractional indices and reconciled geometry.
 */
export async function safeMergeElements(
  currentElements: readonly any[],
  newElements: readonly any[]
): Promise<any[]> {
  const currentList = Array.isArray(currentElements) ? currentElements : [];
  const newList = Array.isArray(newElements) ? newElements : [];
  
  if (newList.length === 0) return normalizeFractionalIndices(currentList);

  try {
    const { restoreElements, convertToExcalidrawElements } = await import('@excalidraw/excalidraw');
    
    // Convert new elements to proper Excalidraw elements
    const validNew = convertToExcalidrawElements(newList);
    
    // Combine and strip indices to recalculate full sequence
    const combined = [...currentList, ...validNew].map(el => {
      if (!el || typeof el !== 'object') return el;
      const { index, ...rest } = el;
      return rest;
    });

    const restored = restoreElements(combined, null, { repairBindings: true });
    const { elements: reconciled } = reconcileCanvasElements(restored);
    return normalizeFractionalIndices(reconciled);
  } catch (err) {
    console.warn('[DesignDojo] Safe merge fallback used:', err);
    const combined = [...currentList, ...newList];
    const { elements: reconciled } = reconcileCanvasElements(combined);
    return normalizeFractionalIndices(reconciled);
  }
}
