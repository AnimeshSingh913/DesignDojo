export interface AIEvaluationIssue {
  severity: 'high' | 'medium' | 'low';
  confidence?: string;
  title: string;
  description: string;
  recommendation: string;
}

export interface DesignPatternEvaluation {
  name: string;
  detectedBecause: string;
  benefits: string;
}

export interface AIEvaluationResponse {
  overallScore: number;
  scoreBreakdown: {
    umlCorrectness: { score: number; max: number; label: string };
    completeness: { score: number; max: number; label: string };
    relationships: { score: number; max: number; label: string };
    naming: { score: number; max: number; label: string };
    bestPractices: { score: number; max: number; label: string };
  };
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Unknown';
  summary: string;
  strengths: string[];
  issues: AIEvaluationIssue[];
  missingElements?: string[]; // Optional for some diagrams
  bottleneckNodeIds?: string[]; // SPOF or severe bottlenecks
  
  // Specific to Class/Object diagrams
  solidReview?: {
    overall?: string;
    singleResponsibility?: string;
    openClosed?: string;
    liskovSubstitution?: string;
    interfaceSegregation?: string;
    dependencyInversion?: string;
  };
  oopReview?: {
    overall?: string;
    encapsulation?: string;
    inheritance?: string;
    polymorphism?: string;
    abstraction?: string;
  };
  designPatterns?: DesignPatternEvaluation[];

  // Specific to State Diagrams
  stateMachineValidation?: {
    reachability?: string;
    deadStates?: string;
    missingTransitions?: string;
  };

  // Specific to Sequence Diagrams
  messageFlow?: {
    missingMessages?: string;
    orderingValidation?: string;
    synchronization?: string;
  };
  
  // Specific to Activity Diagrams
  controlFlow?: {
    decisions?: string;
    forkJoinCorrectness?: string;
  };

  // Specific to Component/Deployment Diagrams
  architectureAnalysis?: {
    coupling?: string;
    cohesion?: string;
    deploymentCorrectness?: string;
  };

  improvements: {
    highPriority: string[];
    mediumPriority: string[];
    lowPriority: string[];
  };
}

export interface AIGeneratedArchitectureNode {
  id: string;
  type: 'client' | 'load_balancer' | 'api_gateway' | 'service' | 'database' | 'cache' | 'queue' | 'storage' | 'external' | 'other';
  label: string;
  description: string;
  technologies?: string[];
}

export interface AIGeneratedArchitectureEdge {
  source: string;
  target: string;
  label: string;
  description?: string;
}

export interface AIGeneratedArchitecture {
  nodes: AIGeneratedArchitectureNode[];
  edges: AIGeneratedArchitectureEdge[];
  explanation: {
    overview: string;
    functionalRequirements: string[];
    nonFunctionalRequirements: string[];
    assumptions: string[];
    components: { name: string; description: string; technology: string }[];
    requestFlow: string[];
    databaseStrategy: string;
    cacheStrategy: string;
    queueStrategy?: string;
    storageStrategy?: string;
    security: string[];
    scalability: string;
    faultTolerance: string;
    tradeOffs: string[];
    bottlenecks: string[];
    futureImprovements: string[];
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIProvider {
  evaluateDesign(ast: any, diagramType: string): Promise<AIEvaluationResponse>;
  chatWithDesign(messages: ChatMessage[], ast: any, diagramType: string): Promise<string>;
  generateResponse(messages: ChatMessage[], model?: string, temperature?: number): Promise<string>;
  generateArchitecture?(prompt: string, complexity?: string, cloudProvider?: string): Promise<AIGeneratedArchitecture>;
}

