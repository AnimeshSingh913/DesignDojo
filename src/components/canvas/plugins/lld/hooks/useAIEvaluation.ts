import { useState, useEffect, useRef } from 'react';
import { ASTEngine } from '../ast/ASTEngine';
import { preprocessAST } from '@/services/ai/utils/astPreprocessor';
import { AIEvaluationResponse } from '@/services/ai/types';
import { useLLDWorkspace } from '../context/LLDWorkspaceContext';

export function useAIEvaluation(excalidrawAPI: any, diagramType: string, questionId?: string) {
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<AIEvaluationResponse | null>(null);
  
  const { loadedHistory } = useLLDWorkspace();

  const abortControllerRef = useRef<AbortController | null>(null);

  const storageKey = questionId 
    ? `designdojo_evaluation_${questionId}_${diagramType}` 
    : `designdojo_latest_evaluation_${diagramType}`;

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
    // Removed localStorage auto-loading to prevent showing old evaluations on a refreshed blank canvas
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
      setError("Please draw your diagram first. You haven't drawn anything yet.");
      setLoading(false);
      return;
    }

    // 2. Extract AST
    const rawAST = ASTEngine.parseFromCanvas(elements);

    // 3. Preprocess and optimize AST
    const optimizedAST = preprocessAST(rawAST, diagramType);

    while (attempt <= maxRetries) {
      try {
        if (attempt > 0) {
          setRetryCount(attempt);
          // Exponential backoff: 2s, 4s
          const backoff = attempt === 1 ? 2000 : 4000;
          await new Promise(resolve => setTimeout(resolve, backoff));
          
          if (signal.aborted) return;
        }

        // 4. Send to backend API
        const response = await fetch('/api/ai/lld-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ast: optimizedAST, diagramType }),
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

        // Removed localStorage.setItem(storageKey, JSON.stringify(evalData));
        
        // Success
        setLoading(false);
        setRetryCount(0);
        return;

      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }

        console.error(`Attempt ${attempt + 1} failed:`, err);
        
        // If not retriable, or max retries reached
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
