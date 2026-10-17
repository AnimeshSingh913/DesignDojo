import { AIGeneratedArchitecture } from '@/services/ai/types';
import { createRectangle, createText, createArrow, createEllipse } from '../../hld/utils/elementGenerator';

const TIER_MAPPING: Record<string, number> = {
  client: 0,
  api_gateway: 1,
  load_balancer: 1,
  external: 1,
  service: 2,
  other: 2,
  database: 3,
  cache: 3,
  queue: 3,
  storage: 3,
};

const TIER_X_SPACING = 350;
const TIER_Y_SPACING = 200;
const START_X = 100;
const START_Y = 100;

export function convertJSONToExcalidraw(architecture: AIGeneratedArchitecture) {
  const elements: any[] = [];
  const nodeMap = new Map<string, any>(); // id -> node layout info

  // 1. Group nodes by tier
  const tiers: Record<number, any[]> = {};
  for (const node of architecture.nodes) {
    const tier = TIER_MAPPING[node.type] ?? 2;
    if (!tiers[tier]) tiers[tier] = [];
    tiers[tier].push(node);
  }

  // 2. Layout nodes and generate Excalidraw elements
  Object.keys(tiers).forEach((tierStr) => {
    const tier = parseInt(tierStr, 10);
    const nodesInTier = tiers[tier];
    
    // Center the nodes vertically
    const totalHeight = nodesInTier.length * 100 + (nodesInTier.length - 1) * TIER_Y_SPACING;
    const currentY = START_Y; // or offset based on totalHeight to center

    nodesInTier.forEach((node, index) => {
      const x = START_X + tier * TIER_X_SPACING;
      const y = START_Y + index * TIER_Y_SPACING;
      const width = 220;
      const height = 100;

      // Draw container based on type
      let container;
      if (node.type === 'database' || node.type === 'storage' || node.type === 'cache') {
        container = createRectangle(x, y, width, height, { backgroundColor: '#e0f2fe', strokeColor: '#0369a1', strokeWidth: 2, fillStyle: 'solid' });
      } else if (node.type === 'queue') {
        container = createRectangle(x, y, width, height, { backgroundColor: '#fef9c3', strokeColor: '#a16207', strokeWidth: 2, fillStyle: 'solid' });
      } else if (node.type === 'client') {
        container = createEllipse(x, y, width, height, { backgroundColor: '#f3f4f6', strokeColor: '#374151', strokeWidth: 2, fillStyle: 'solid' });
      } else {
        // service, api_gateway, etc.
        container = createRectangle(x, y, width, height, { backgroundColor: '#f3e8ff', strokeColor: '#7e22ce', strokeWidth: 2, fillStyle: 'solid' });
      }

      // Combine text and group with container
      const techTextStr = node.technologies && node.technologies.length > 0 ? node.technologies.join(', ') : node.type;
      const combinedText = `${node.label}\n(${techTextStr})`;
      
      // Calculate centered position
      const textWidth = Math.max(node.label.length, techTextStr.length) * 10;
      const textHeight = 48; // 2 lines approx
      const textX = x + (width - textWidth) / 2;
      const textY = y + (height - textHeight) / 2;
      
      const groupId = Math.random().toString(36).substring(2, 15);
      const textId = Math.random().toString(36).substring(2, 15);
      
      container.groupIds = [groupId];
      container.boundElements = [{ type: 'text', id: textId }];

      const textElement = createText(textX, textY, combinedText, { 
        id: textId,
        strokeColor: '#111827',
        width: textWidth,
        height: textHeight,
        textAlign: 'center',
        verticalAlign: 'middle',
        containerId: container.id,
        autoResize: true,
        groupIds: [groupId]
      });

      // Add to elements
      elements.push(container, textElement);
      
      // Save node layout info for edges
      nodeMap.set(node.id, {
        id: container.id,
        x,
        y,
        width,
        height,
      });
    });
  });

  // 3. Generate Edges (Arrows)
  architecture.edges.forEach((edge) => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (sourceNode && targetNode) {
      // Basic routing: center right of source to center left of target
      const startX = sourceNode.x + sourceNode.width;
      const startY = sourceNode.y + sourceNode.height / 2;
      const endX = targetNode.x;
      const endY = targetNode.y + targetNode.height / 2;

      const arrow = createArrow(startX, startY, [[0, 0], [endX - startX, endY - startY]], {
        strokeColor: '#64748b',
        startBinding: { elementId: sourceNode.id, focus: 0, gap: 10 },
        endBinding: { elementId: targetNode.id, focus: 0, gap: 10 },
      });

      elements.push(arrow);

      if (edge.label) {
        // Find mid point for label
        const midX = startX + (endX - startX) / 2;
        const midY = startY + (endY - startY) / 2;
        
        // Add label text
        const labelText = createText(midX, midY - 15, edge.label, { strokeColor: '#334155', fontSize: 14, backgroundColor: '#ffffff' });
        elements.push(labelText);
      }
    }
  });

  return elements;
}
