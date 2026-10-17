export type UMLNodeType = 'Class' | 'Interface' | 'AbstractClass' | 'Enum' | 'Package' | 'Note';

export type UMLEdgeType = 'Association' | 'Aggregation' | 'Composition' | 'Dependency' | 'Inheritance' | 'Realization';

export type Visibility = 'public' | 'private' | 'protected' | 'package';

export interface UMLAttribute {
  id: string;
  name: string;
  type: string;
  visibility: Visibility;
  isStatic?: boolean;
}

export interface UMLMethod {
  id: string;
  name: string;
  returnType: string;
  parameters: UMLAttribute[];
  visibility: Visibility;
  isStatic?: boolean;
  isAbstract?: boolean;
}

export interface UMLNode {
  id: string;
  type: UMLNodeType;
  name: string;
  attributes: UMLAttribute[];
  methods: UMLMethod[];
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UMLEdge {
  id: string;
  type: UMLEdgeType;
  sourceId: string;
  targetId: string;
  sourceMultiplicity?: string;
  targetMultiplicity?: string;
  label?: string;
}

export interface UMLAST {
  nodes: UMLNode[];
  edges: UMLEdge[];
}

export * from './question';
export * from './storage';
