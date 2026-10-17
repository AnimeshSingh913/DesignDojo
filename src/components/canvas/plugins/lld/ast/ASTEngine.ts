import { UMLAST, UMLNode, UMLEdge } from '../types';

/**
 * The ASTEngine is responsible for converting raw canvas visual elements
 * into the DesignDojo UML AST, which is the structured data model consumed by
 * all AI features, Code Generators, and Interview modules.
 */
export class ASTEngine {
  
  /**
   * Parses raw Excalidraw elements and extracts the semantic UML AST.
   * It looks for `customData` embedded in grouped Excalidraw elements.
   * 
   * @param elements - The raw Excalidraw scene elements
   * @returns UMLAST - The structured UML representation
   */
  public static parseFromCanvas(elements: readonly any[]): UMLAST {
    const nodes: UMLNode[] = [];
    const edges: UMLEdge[] = [];
    const processedGroups = new Set<string>();

    // 1. First Pass: Extract Nodes from groups
    elements.forEach(el => {
      if (el.groupIds && el.groupIds.length > 0) {
        const topLevelGroupId = el.groupIds[el.groupIds.length - 1];
        
        if (!processedGroups.has(topLevelGroupId)) {
          processedGroups.add(topLevelGroupId);
          
          const groupElements = elements.filter(e => e.groupIds?.includes(topLevelGroupId));
          const dataElement = groupElements.find(e => e.customData?.nodeType);
          
          if (dataElement || groupElements.some(e => e.type === 'text')) {
            const textElements = groupElements
              .filter(e => e.type === 'text')
              .sort((a, b) => a.y - b.y);
            const texts = textElements.map(e => e.text || e.originalText || '');
            
            let name = "Unknown";
            let stereotype = "";
            let attributes: string[] = [];
            let methods: string[] = [];
            
            if (texts.length > 0) {
              const header = texts[0].split('\n');
              if (header[0].startsWith('<<') && header.length > 1) {
                stereotype = header[0];
                name = header[1];
              } else {
                name = header[0];
              }
            }

            if (texts.length > 1) {
              attributes = (texts[1] as string).split('\n').filter((t: string) => t.trim() !== '');
            }
            if (texts.length > 2) {
              methods = (texts[2] as string).split('\n').filter((t: string) => t.trim() !== '');
            }

            const minX = Math.min(...groupElements.map(e => e.x));
            const minY = Math.min(...groupElements.map(e => e.y));
            const maxX = Math.max(...groupElements.map(e => e.x + e.width));
            const maxY = Math.max(...groupElements.map(e => e.y + e.height));

            const nodeType = dataElement?.customData?.nodeType || stereotype.replace(/[<>]/g, '') || 'Class';

            nodes.push({
              id: topLevelGroupId,
              type: nodeType as any,
              name: name,
              attributes: attributes as any,
              methods: methods as any,
              x: minX,
              y: minY,
              width: maxX - minX,
              height: maxY - minY,
            });
          }
        }
      }
    });

    // Spatial heuristic for unbound arrows, prioritizing the tightest bounding box (for nested nodes)
    const getClosestNodeId = (x: number, y: number) => {
      let closestId = null;
      let minArea = Infinity;

      for (const node of nodes) {
        // Reduced tolerance to 15px to prevent false positives in dense diagrams
        if (x >= node.x - 15 && x <= node.x + node.width + 15 &&
            y >= node.y - 15 && y <= node.y + node.height + 15) {
          const area = node.width * node.height;
          if (area < minArea) {
            minArea = area;
            closestId = node.id;
          }
        }
      }
      return closestId;
    };

    // 2. Second Pass: Extract Edges from arrows
    elements.forEach(el => {
      if (el.type === 'arrow' || el.type === 'line') {
        let edgeType: string = 'Association';
        
        if (el.strokeStyle === 'dashed') {
          if (el.endArrowhead === 'triangle_outline' || el.endArrowhead === 'triangle') edgeType = 'Realization';
          else edgeType = 'Dependency';
        } else {
          if (el.startArrowhead === 'diamond') edgeType = 'Composition';
          else if (el.startArrowhead === 'diamond_outline') edgeType = 'Aggregation';
          else if (el.endArrowhead === 'triangle_outline' || el.endArrowhead === 'triangle') edgeType = 'Inheritance';
          else edgeType = 'Association';
        }

        const startBinding = el.startBinding?.elementId;
        const endBinding = el.endBinding?.elementId;

        let sourceId = startBinding;
        let targetId = endBinding;

        if (startBinding) {
          const boundEl = elements.find(e => e.id === startBinding);
          if (boundEl?.groupIds?.length > 0) sourceId = boundEl.groupIds[boundEl.groupIds.length - 1];
        }
        if (endBinding) {
          const boundEl = elements.find(e => e.id === endBinding);
          if (boundEl?.groupIds?.length > 0) targetId = boundEl.groupIds[boundEl.groupIds.length - 1];
        }

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
          type: edgeType as any,
          sourceId: sourceId || 'unbound',
          targetId: targetId || 'unbound',
        });
      }
    });

    return { nodes, edges };
  }

  /**
   * Helper function to inject structured data into a set of Excalidraw elements
   * that make up a UML node.
   */
  public static bindDataToElements(elements: any[], nodeData: UMLNode) {
    elements.forEach(el => {
      if (!el.customData) el.customData = {};
      el.customData.umlNode = nodeData;
    });
  }

  /**
   * Helper function to inject structured data into an Excalidraw edge element.
   */
  public static bindDataToEdge(element: any, edgeData: UMLEdge) {
    if (!element.customData) element.customData = {};
    element.customData.umlEdge = edgeData;
  }
}
