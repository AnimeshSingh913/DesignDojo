import { DiagramType } from '../types';

export interface ToolDefinition {
  id: string;
  label: string;
  type: 'node' | 'edge';
  icon?: string; // Optional icon identifier
}

export const DIAGRAM_TOOLS_MAP: Record<DiagramType, { nodes: ToolDefinition[], edges: ToolDefinition[] }> = {
  'Class Diagram': {
    nodes: [
      { id: 'Class', label: 'Class', type: 'node' },
      { id: 'Interface', label: 'Interface', type: 'node' },
      { id: 'AbstractClass', label: 'Abstract Class', type: 'node' },
      { id: 'Enum', label: 'Enum', type: 'node' },
      { id: 'Package', label: 'Package', type: 'node' },
      { id: 'Note', label: 'Note', type: 'node' }
    ],
    edges: [
      { id: 'Association', label: 'Association', type: 'edge' },
      { id: 'Aggregation', label: 'Aggregation', type: 'edge' },
      { id: 'Composition', label: 'Composition', type: 'edge' },
      { id: 'Dependency', label: 'Dependency', type: 'edge' },
      { id: 'Inheritance', label: 'Inheritance', type: 'edge' },
      { id: 'Realization', label: 'Realization', type: 'edge' }
    ]
  },
  'Object Diagram': {
    nodes: [
      { id: 'Object', label: 'Object', type: 'node' },
      { id: 'Note', label: 'Note', type: 'node' }
    ],
    edges: [
      { id: 'Association', label: 'Link (Association)', type: 'edge' }
    ]
  },
  'Package Diagram': {
    nodes: [
      { id: 'Package', label: 'Package', type: 'node' }
    ],
    edges: [
      { id: 'Dependency', label: 'Dependency', type: 'edge' }
    ]
  },
  'Sequence Diagram': {
    nodes: [
      { id: 'Actor', label: 'Actor', type: 'node' },
      { id: 'Lifeline', label: 'Lifeline', type: 'node' },
      { id: 'Activation', label: 'Activation', type: 'node' }
    ],
    edges: [
      { id: 'Message', label: 'Message', type: 'edge' },
      { id: 'ReturnMessage', label: 'Return Message', type: 'edge' },
      { id: 'SelfMessage', label: 'Self Message', type: 'edge' }
    ]
  },
  'Activity Diagram': {
    nodes: [
      { id: 'InitialNode', label: 'Initial Node', type: 'node' },
      { id: 'Action', label: 'Action', type: 'node' },
      { id: 'Decision', label: 'Decision', type: 'node' },
      { id: 'Merge', label: 'Merge', type: 'node' },
      { id: 'Fork', label: 'Fork', type: 'node' },
      { id: 'Join', label: 'Join', type: 'node' },
      { id: 'FinalNode', label: 'Final Node', type: 'node' }
    ],
    edges: [
      { id: 'ControlFlow', label: 'Control Flow', type: 'edge' }
    ]
  },
  'State Diagram': {
    nodes: [
      { id: 'InitialState', label: 'Initial State', type: 'node' },
      { id: 'State', label: 'State', type: 'node' },
      { id: 'FinalState', label: 'Final State', type: 'node' }
    ],
    edges: [
      { id: 'Transition', label: 'Transition', type: 'edge' }
    ]
  },
  'Use Case Diagram': {
    nodes: [
      { id: 'Actor', label: 'Actor', type: 'node' },
      { id: 'UseCase', label: 'Use Case', type: 'node' }
    ],
    edges: [
      { id: 'Association', label: 'Association', type: 'edge' },
      { id: 'Include', label: '«include»', type: 'edge' },
      { id: 'Extend', label: '«extend»', type: 'edge' }
    ]
  },
  'Component Diagram': {
    nodes: [
      { id: 'Component', label: 'Component', type: 'node' }
    ],
    edges: [
      { id: 'Dependency', label: '«use»', type: 'edge' }
    ]
  },
  'Deployment Diagram': {
    nodes: [
      { id: 'Device', label: 'Device', type: 'node' },
      { id: 'Artifact', label: 'Artifact', type: 'node' }
    ],
    edges: [
      { id: 'CommunicationPath', label: 'Communication Path', type: 'edge' }
    ]
  }
};
