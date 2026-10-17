/**
 * HLDASTEngine parses raw Excalidraw elements in the HLD workspace
 * into a structured JSON graph (nodes and edges) for AI analysis.
 */
export interface HLDNode {
  id: string; // The group ID
  type: string; // The component ID (e.g., 'LoadBalancer')
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  size?: 'small' | 'medium' | 'large';
}

export interface HLDEdge {
  id: string;
  type: 'Connection' | 'AsyncConnection';
  sourceId: string;
  targetId: string;
}

export interface HLDAST {
  nodes: HLDNode[];
  edges: HLDEdge[];
}

export class HLDASTEngine {
  public static parseFromCanvas(elements: readonly any[]): HLDAST {
    const nodes: HLDNode[] = [];
    const edges: HLDEdge[] = [];
    const processedGroups = new Set<string>();

    // 1. First Pass: Extract Nodes from groups based on customData
    elements.forEach(el => {
      if (el.groupIds && el.groupIds.length > 0) {
        const topLevelGroupId = el.groupIds[el.groupIds.length - 1];
        
        if (!processedGroups.has(topLevelGroupId)) {
          processedGroups.add(topLevelGroupId);
          
          const groupElements = elements.filter(e => e.groupIds?.includes(topLevelGroupId));
          
          // Find the main element that holds customData
          const dataElement = groupElements.find(e => e.customData?.type === 'node');
          
          if (dataElement) {
            const textElement = groupElements.find(e => e.type === 'text');
            const label = textElement?.text || textElement?.originalText || dataElement.customData.label;
            const minX = Math.min(...groupElements.map(e => e.x));
            const minY = Math.min(...groupElements.map(e => e.y));
            const maxX = Math.max(...groupElements.map(e => e.x + e.width));
            const maxY = Math.max(...groupElements.map(e => e.y + e.height));

            nodes.push({
              id: topLevelGroupId,
              type: dataElement.customData.id,
              label: label,
              x: minX,
              y: minY,
              width: maxX - minX,
              height: maxY - minY,
              size: dataElement.customData.size || 'small',
            });
          }
        }
      }
    });

    // Spatial heuristic for unbound arrows
    const getClosestNodeId = (x: number, y: number) => {
      let closestId = null;
      let minArea = Infinity;

      for (const node of nodes) {
        if (x >= node.x - 20 && x <= node.x + node.width + 20 &&
            y >= node.y - 20 && y <= node.y + node.height + 20) {
          const area = node.width * node.height;
          if (area < minArea) {
            minArea = area;
            closestId = node.id;
          }
        }
      }
      return closestId;
    };

    // 2. Second Pass: Extract Edges
    elements.forEach(el => {
      if (el.type === 'arrow' || el.type === 'line') {
        const isAsync = el.strokeStyle === 'dashed' || el.endArrowhead === 'triangle';
        const edgeType = isAsync ? 'AsyncConnection' : 'Connection';

        const startBinding = el.startBinding?.elementId;
        const endBinding = el.endBinding?.elementId;

        let sourceId = startBinding;
        let targetId = endBinding;

        // Resolve binding to the group ID
        if (startBinding) {
          const boundEl = elements.find(e => e.id === startBinding);
          if (boundEl?.groupIds?.length > 0) sourceId = boundEl.groupIds[boundEl.groupIds.length - 1];
        }
        if (endBinding) {
          const boundEl = elements.find(e => e.id === endBinding);
          if (boundEl?.groupIds?.length > 0) targetId = boundEl.groupIds[boundEl.groupIds.length - 1];
        }

        // Fallback to spatial heuristics
        if (!sourceId) {
          sourceId = getClosestNodeId(el.x, el.y);
        }
        if (!targetId && el.points && el.points.length > 0) {
          const lastPoint = el.points[el.points.length - 1];
          const targetX = el.x + lastPoint[0];
          const targetY = el.y + lastPoint[1];
          targetId = getClosestNodeId(targetX, targetY);
        }

        edges.push({
          id: el.id,
          type: edgeType,
          sourceId: sourceId || 'unbound',
          targetId: targetId || 'unbound',
        });
      }
    });

    return { nodes, edges };
  }
}
