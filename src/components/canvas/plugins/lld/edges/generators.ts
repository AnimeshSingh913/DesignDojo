import { generateId, createArrow } from '../utils/elementGenerator';

function generateBaseEdge(x: number, y: number, length: number = 150) {
  return createArrow(x, y, [[0, 0], [length, 0]]);
}

export function generateAssociationEdge(x: number, y: number) {
  const edge = generateBaseEdge(x, y);
  edge.endArrowhead = "arrow";
  return [edge];
}

export function generateDependencyEdge(x: number, y: number) {
  const edge = generateBaseEdge(x, y);
  edge.endArrowhead = "arrow";
  edge.strokeStyle = "dashed";
  return [edge];
}

export function generateInheritanceEdge(x: number, y: number) {
  const edge = generateBaseEdge(x, y);
  edge.endArrowhead = "triangle_outline"; // unfilled triangle
  return [edge];
}

export function generateRealizationEdge(x: number, y: number) {
  const edge = generateBaseEdge(x, y);
  edge.endArrowhead = "triangle_outline";
  edge.strokeStyle = "dashed";
  return [edge];
}

export function generateAggregationEdge(x: number, y: number) {
  const edge = generateBaseEdge(x, y);
  edge.startArrowhead = "diamond_outline"; // Unfilled diamond at the start (the aggregate side)
  edge.endArrowhead = null;
  return [edge];
}

export function generateCompositionEdge(x: number, y: number) {
  const edge = generateBaseEdge(x, y);
  edge.startArrowhead = "diamond"; // Filled diamond at the start
  edge.endArrowhead = null;
  return [edge];
}
