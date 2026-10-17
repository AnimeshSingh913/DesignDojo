import { DiagramType } from './question';

export interface DiagramMetadata {
  projectName: string;
  diagramType: DiagramType;
  linkedQuestionId: string | null;
  version: number;
  createdAt: number;
  updatedAt: number;
}

export interface SavedDiagram {
  id: string;
  metadata: DiagramMetadata;
  elements: any[];
  appState: any;
}
