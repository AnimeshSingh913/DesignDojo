import { useState, useEffect, useRef } from 'react';
import { HLDASTEngine } from '../ast/HLDASTEngine';
import { AIEvaluationResponse } from '@/services/ai/types';
import { useHLDWorkspace } from '../context/HLDWorkspaceContext';
import { normalizeFractionalIndices } from '@/lib/canvas/elementOrdering';

export function useHLDAIEvaluation(excalidrawAPI: any, diagramType: string, questionId?: string) {
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<AIEvaluationResponse | null>(null);
  
  const { loadedHistory } = useHLDWorkspace();

  const abortControllerRef = useRef<AbortController | null>(null);

  const storageKey = questionId 
    ? `designdojo_hld_evaluation_${questionId}_${diagramType}` 
    : `designdojo_hld_latest_evaluation_${diagramType}`;

  // Restore from loadedHistory
  useEffect(() => {
    if (loadedHistory && loadedHistory.evaluation) {
      setEvaluation(loadedHistory.evaluation);
      setError(null);
    }
  }, [loadedHistory]);

  // Reset evaluation when question or diagram type changes
  useEffect(() => {
    if (!loadedHistory) {
      setEvaluation(null);
    }
  }, [storageKey, loadedHistory]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const evaluateDesign = async () => {
    if (!excalidrawAPI) {
      setError('Canvas API not available.');
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    setRetryCount(0);
    setError(null);

    const maxRetries = 2;
    let attempt = 0;
    
    // 1. Get elements from Excalidraw
    const elements = excalidrawAPI.getSceneElements();
    const activeElements = elements.filter((el: any) => !el.isDeleted);
    
    if (activeElements.length === 0) {
      setError("Please draw your architecture first. You haven't drawn anything yet.");
      setLoading(false);
      return;
    }

    // 2. Extract AST specifically for HLD
    const hldAST = HLDASTEngine.parseFromCanvas(elements);
    
    if (hldAST.nodes.length === 0) {
      setError("No valid HLD components found. Please drag and drop components from the HLD palette.");
      setLoading(false);
      return;
    }

    while (attempt <= maxRetries) {
      try {
        if (attempt > 0) {
          setRetryCount(attempt);
          // Exponential backoff: 2s, 4s
          const backoff = attempt === 1 ? 2000 : 4000;
          await new Promise(resolve => setTimeout(resolve, backoff));
          
          if (signal.aborted) return;
        }

        // 3. Send to backend API (hld-review)
        const response = await fetch('/api/ai/hld-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ast: hldAST, diagramType }),
          signal
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
          if (response.status === 403) {
            setError(result?.message || 'Usage limit reached for this feature. Please contact Admin.');
            setLoading(false);
            setRetryCount(0);
            return;
          }
          const isRetriable = response.status === 429 || response.status >= 500;
          if (isRetriable && attempt < maxRetries) {
            throw new Error(`Retriable Error: ${response.status}`);
          }
          throw new Error(result?.message || `Evaluation failed with status ${response.status}.`);
        }

        if (!result || !result.data) {
           throw new Error('Invalid JSON response received from server.');
        }

        const evalData = result.data as AIEvaluationResponse;
        setEvaluation(evalData);
        
        // Highlight bottlenecks if any are returned
        if (evalData.bottleneckNodeIds && evalData.bottleneckNodeIds.length > 0) {
          const updatedElements = elements.map((el: any) => {
            if (el.groupIds && el.groupIds.length > 0) {
              const topLevelGroupId = el.groupIds[el.groupIds.length - 1];
              if (evalData.bottleneckNodeIds?.includes(topLevelGroupId)) {
                // Update styling for the main box container
                if (el.type === 'rectangle') {
                  return {
                    ...el,
                    strokeColor: '#ef4444', // Red
                    strokeWidth: 3,
                    backgroundColor: '#fee2e2', // Light red fill
                    version: el.version + 1
                  };
                }
              }
            }
            return el;
          });
          
          excalidrawAPI.updateScene({ elements: normalizeFractionalIndices(updatedElements) });
        }
        
        // Success
        setLoading(false);
        setRetryCount(0);
        return;

      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }

        console.error(`Attempt ${attempt + 1} failed:`, err);
        
        if (!err.message.startsWith('Retriable Error') && !err.message.includes('fetch')) {
           setError(err.message || 'An unexpected error occurred during evaluation.');
           setLoading(false);
           setRetryCount(0);
           return;
        }

        if (attempt === maxRetries) {
          setError('Network or server error. Retries exhausted. Please try again later.');
          setLoading(false);
          setRetryCount(0);
          return;
        }
      }
      attempt++;
    }
  };

  return { loading, retryCount, error, evaluation, evaluateDesign };
}
