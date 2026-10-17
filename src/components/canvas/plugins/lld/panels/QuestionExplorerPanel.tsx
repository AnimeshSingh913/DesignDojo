import React, { useState } from 'react';
import { useLLDWorkspace } from '../context/LLDWorkspaceContext';
import { Question, Difficulty } from '../types';
import { mockQuestions } from '../data/mockQuestions';
import { ChevronRight, ChevronDown, CheckCircle2, ArrowLeft, PlayCircle } from 'lucide-react';

export function QuestionExplorerPanel() {
  const { 
    activeQuestionId, 
    setActiveQuestionId, 
    progressMap, 
    setPendingQuestionId, 
    setIsStartModalOpen 
  } = useLLDWorkspace();
  
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Easy': true,
    'Medium': true,
    'Hard': true,
  });

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'Easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const activeQuestion = mockQuestions.find(q => q.id === activeQuestionId);

  const handleSelectQuestion = (id: string) => {
    if (activeQuestionId === id) return; // already active
    setPendingQuestionId(id);
    setIsStartModalOpen(true);
  };

  return (
    <div className="w-96 h-full bg-white border-r border-gray-200 flex flex-col shrink-0 shadow-lg">
      {!activeQuestion ? (
        <>
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-heading font-extrabold text-xl text-gray-800">Question Explorer</h2>
            <p className="text-sm text-gray-500 mt-1">Select an architecture question to practice.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-gray-50/30">
            {['Easy', 'Medium', 'Hard'].map(difficulty => {
              const catQuestions = mockQuestions.filter(q => q.difficulty === difficulty);
              if (catQuestions.length === 0) return null;
              
              const isExpanded = expandedCategories[difficulty];
              
              return (
                <div key={difficulty} className="border-b border-gray-100 last:border-b-0">
                  <button 
                    onClick={() => toggleCategory(difficulty)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors bg-white cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                      <span className="font-bold text-gray-800">{difficulty}</span>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getDifficultyColor(difficulty as Difficulty)}`}>
                      {catQuestions.length}
                    </span>
                  </button>
                  
                  {isExpanded && (
                    <div className="pb-3 bg-gray-50/50">
                      {catQuestions.map(q => {
                        const progress = progressMap[q.id]?.status || 'Not Started';
                        return (
                          <button
                            key={q.id}
                            onClick={() => handleSelectQuestion(q.id)}
                            className="w-full text-left px-10 py-3 text-sm transition-all flex items-center justify-between group hover:bg-blue-50/50 border-l-2 border-transparent hover:border-blue-500 cursor-pointer"
                          >
                            <span className="font-medium text-gray-700 group-hover:text-blue-700 truncate pr-2">{q.title}</span>
                            {progress === 'Completed' && <CheckCircle2 size={16} className="text-green-500 shrink-0" />}
                            {progress === 'In Progress' && <PlayCircle size={16} className="text-yellow-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white sticky top-0 z-10 shadow-sm">
            <button 
              onClick={() => setActiveQuestionId(null)}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              title="Back to List"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-heading font-bold text-lg text-gray-800 truncate">Question Details</h2>
          </div>
          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-6 bg-white">
            <div>
              <h3 className="font-extrabold text-gray-900 text-xl leading-tight mb-3">{activeQuestion.title}</h3>
              <div className="flex flex-wrap items-center gap-2">
                 <span className={`text-xs px-2.5 py-1 rounded-md font-bold border ${getDifficultyColor(activeQuestion.difficulty)}`}>
                    {activeQuestion.difficulty}
                  </span>
                  <span className="text-xs font-semibold text-purple-700 px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-md">
                    {activeQuestion.recommendedDiagramType}
                  </span>
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Description</h4>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                {activeQuestion.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Functional Reqs</h4>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1.5 marker:text-gray-300">
                {activeQuestion.functionalRequirements.map((req, i) => (
                  <li key={i} className="pl-1">{req}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Non-Functional Reqs</h4>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1.5 marker:text-gray-300">
                {activeQuestion.nonFunctionalRequirements.map((req, i) => (
                  <li key={i} className="pl-1">{req}</li>
                ))}
              </ul>
            </div>

            {activeQuestion.constraints && activeQuestion.constraints.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Constraints</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1.5 marker:text-gray-300">
                  {activeQuestion.constraints.map((req, i) => (
                    <li key={i} className="pl-1">{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeQuestion.hints && activeQuestion.hints.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Hints</h4>
                <ul className="list-disc pl-5 text-sm text-amber-700 space-y-1.5 bg-amber-50 p-4 rounded-xl border border-amber-100 marker:text-amber-300">
                  {activeQuestion.hints.map((req, i) => (
                    <li key={i} className="pl-1">{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeQuestion.expectedConcepts && activeQuestion.expectedConcepts.length > 0 && (
              <div className="pb-4">
                <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Expected Concepts</h4>
                <div className="flex flex-wrap gap-2">
                  {activeQuestion.expectedConcepts.map((concept, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 font-medium rounded-lg border border-blue-100">
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
