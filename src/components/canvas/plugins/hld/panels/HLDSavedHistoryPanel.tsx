import React, { useEffect, useState } from 'react';
import { History, Loader2, Calendar } from 'lucide-react';
import { useHLDWorkspace } from '../context/HLDWorkspaceContext';

export function HLDSavedHistoryPanel() {
  const { setLoadedHistory } = useHLDWorkspace();
  const [histories, setHistories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchHistories() {
      try {
        const res = await fetch('/api/ai/hld-history');
        const json = await res.json();
        if (res.ok) {
          setHistories(json.data || []);
        } else {
          setError(json.message || 'Failed to fetch history');
        }
      } catch (e) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }
    fetchHistories();
  }, []);

  return (
    <div className="w-full h-full bg-surface flex flex-col overflow-hidden">
      <div className="p-4 border-b border-primary/10 flex flex-col gap-4 bg-surface shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-heading font-bold text-lg text-primary-ink flex items-center gap-2">
              <History size={20} className="text-blue-500" />
              Saved History
            </h2>
            <p className="text-xs text-primary/60 mt-1">Past architectures</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex flex-col items-center justify-center h-40 text-primary/50 text-sm gap-3">
            <Loader2 className="animate-spin" size={24} />
            Loading history...
          </div>
        )}

        {!loading && error && (
          <div className="text-red-500 text-sm text-center mt-10">
            {error}
          </div>
        )}

        {!loading && !error && histories.length === 0 && (
          <div className="text-primary/50 text-sm text-center mt-10">
            No saved history found. Use the Assistant panel to save a design.
          </div>
        )}

        {!loading && !error && histories.map((history) => (
          <div 
            key={history._id} 
            className="mb-3 p-3 bg-white border border-primary/10 rounded-xl hover:shadow-md hover:border-primary/20 transition-all cursor-pointer flex flex-col gap-2"
            onClick={() => setLoadedHistory(history)}
          >
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-primary-ink">{history.diagramType}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                history.evaluation?.overallScore >= 80 ? 'bg-green-100 text-green-700' :
                history.evaluation?.overallScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {history.evaluation?.overallScore || 0}/100
              </span>
            </div>
            
            {history.previewImage && (
              <div className="w-full h-32 rounded-lg border border-primary/10 overflow-hidden bg-primary/5 flex items-center justify-center my-1 relative group">
                 <img 
                    src={history.previewImage} 
                    alt="Diagram Preview" 
                    className="w-full h-full object-contain p-1"
                 />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
            )}
            
            <div className="flex items-center gap-1.5 text-[10px] text-primary/50 mt-1">
              <Calendar size={10} />
              {new Date(history.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
