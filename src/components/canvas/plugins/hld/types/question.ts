export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ProgressStatus = 'Not Started' | 'In Progress' | 'Completed';

export type DiagramType = 
  | 'System Architecture' 
  | 'Microservices' 
  | 'Data Pipeline';

export interface Question {
  id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  constraints: string[];
  hints: string[];
  expectedConcepts: string[];
  recommendedDiagramType: DiagramType;
}

export interface QuestionProgress {
  questionId: string;
  status: ProgressStatus;
  lastUpdated: number;
}
