export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ProgressStatus = 'Not Started' | 'In Progress' | 'Completed';

export type DiagramType = 
  | 'Class Diagram' 
  | 'Object Diagram' 
  | 'Package Diagram' 
  | 'Sequence Diagram' 
  | 'Activity Diagram' 
  | 'State Diagram' 
  | 'Use Case Diagram'
  | 'Component Diagram'
  | 'Deployment Diagram';

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
