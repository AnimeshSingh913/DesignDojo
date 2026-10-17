export function preprocessAST(ast: any, diagramType: string) {
  if (!ast || !ast.nodes) return { diagramType, nodes: [], relationships: [] };

  // Map node IDs to node Names for more token-efficient and semantic edges
  const idToNameMap: Record<string, string> = {};
  
  const simplifiedNodes = ast.nodes.map((node: any) => {
    idToNameMap[node.id] = node.name || node.type;
    
    // Remove positional and rendering data
    const { x, y, width, height, id, ...cleanNode } = node;
    
    // Remove empty arrays to save tokens
    if (cleanNode.attributes && cleanNode.attributes.length === 0) delete cleanNode.attributes;
    if (cleanNode.methods && cleanNode.methods.length === 0) delete cleanNode.methods;
    
    return {
      name: node.name,
      ...cleanNode
    };
  });

  const simplifiedEdges = (ast.edges || []).map((edge: any) => {
    const { id, sourceId, targetId, ...cleanEdge } = edge;
    
    return {
      ...cleanEdge,
      source: idToNameMap[sourceId] || sourceId,
      target: idToNameMap[targetId] || targetId
    };
  });

  return {
    diagramType,
    nodes: simplifiedNodes,
    relationships: simplifiedEdges
  };
}
