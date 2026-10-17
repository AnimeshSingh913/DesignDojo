export type HLDNodeType = 'Class' | 'Interface' | 'AbstractClass' | 'Enum' | 'Package' | 'Note';

export type HLDEdgeType = 'Association' | 'Aggregation' | 'Composition' | 'Dependency' | 'Inheritance' | 'Realization';

export type Visibility = 'public' | 'private' | 'protected' | 'package';

export interface HLDAttribute {
  id: string;
  name: string;
  type: string;
  visibility: Visibility;
  isStatic?: boolean;
}

export interface HLDMethod {
  id: string;
  name: string;
  returnType: string;
  parameters: HLDAttribute[];
  visibility: Visibility;
  isStatic?: boolean;
  isAbstract?: boolean;
}

export interface HLDNode {
  id: string;
  type: HLDNodeType;
  name: string;
  attributes: HLDAttribute[];
  methods: HLDMethod[];
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HLDEdge {
  id: string;
  type: HLDEdgeType;
  sourceId: string;
  targetId: string;
  sourceMultiplicity?: string;
  targetMultiplicity?: string;
  label?: string;
}

export interface HLDAST {
  nodes: HLDNode[];
  edges: HLDEdge[];
}

export * from './question';
export * from './storage';
