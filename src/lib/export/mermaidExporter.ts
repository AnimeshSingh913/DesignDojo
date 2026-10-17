import { UMLAST, UMLNode, UMLEdge } from '@/components/canvas/plugins/lld/types';
import { HLDAST, HLDNode, HLDEdge } from '@/components/canvas/plugins/hld/ast/HLDASTEngine';
import { AIGeneratedArchitecture } from '@/services/ai/types';

/**
 * Sanitizes strings for Mermaid node IDs (only alphanumeric and underscores)
 */
export function sanitizeMermaidId(id: string): string {
  if (!id) return 'node_' + Math.random().toString(36).substring(2, 7);
  const clean = id.replace(/[^a-zA-Z0-9_]/g, '_');
  return clean.match(/^[a-zA-Z]/) ? clean : `node_${clean}`;
}

/**
 * Sanitizes labels by escaping quotes and special characters
 */
export function sanitizeMermaidLabel(text: string): string {
  if (!text) return '';
  return text
    .replace(/"/g, '#quot;')
    .replace(/\n/g, '<br/>')
    .replace(/[\[\]\(\)\{\}]/g, (m) => `\\${m}`);
}

/**
 * Downloads arbitrary text as a file in the browser
 */
export function downloadTextFile(content: string, filename: string, mimeType: string = 'text/plain') {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads Mermaid code as a .mmd file
 */
export function downloadMermaidFile(mermaidCode: string, filename: string = 'diagram') {
  const cleanName = filename.endsWith('.mmd') ? filename : `${filename.replace(/\.[^/.]+$/, '')}.mmd`;
  downloadTextFile(mermaidCode, cleanName, 'text/vnd.mermaid');
}

/**
 * Downloads a GitHub-ready Markdown file containing the Mermaid diagram and documentation
 */
export function downloadMarkdownFile(markdownContent: string, filename: string = 'ARCHITECTURE.md') {
  const cleanName = filename.endsWith('.md') ? filename : `${filename.replace(/\.[^/.]+$/, '')}.md`;
  downloadTextFile(markdownContent, cleanName, 'text/markdown');
}

/**
 * Formats Mermaid code inside a standard GitHub Markdown code block
 */
export function formatAsGitHubMarkdown(
  mermaidCode: string,
  title: string = 'Architecture Diagram',
  description?: string
): string {
  return `# ${title}

${description ? `${description}\n\n` : ''}## Diagram (Mermaid)

\`\`\`mermaid
${mermaidCode.trim()}
\`\`\`

> [!NOTE]
> This diagram renders automatically on GitHub. You can paste this snippet into your \`README.md\`, GitHub Pull Requests, or GitHub Wiki pages.
`;
}

// ---------------------------------------------------------------------------
// 1. LLD (UML) to Mermaid Converter
// ---------------------------------------------------------------------------

export function generateMermaidFromLLDAST(ast: UMLAST, diagramType: string = 'Class Diagram'): string {
  if (!ast || !ast.nodes || ast.nodes.length === 0) {
    return `classDiagram\n    %% Empty diagram or no classes detected\n    class ArchitectureClass {\n        +String id\n        +execute()\n    }`;
  }

  const normalizedType = diagramType.toLowerCase();

  // Handle Sequence Diagram
  if (normalizedType.includes('sequence')) {
    const lines: string[] = ['sequenceDiagram', '    autonumber'];
    
    // Add participants
    ast.nodes.forEach(node => {
      const pId = sanitizeMermaidId(node.name || node.id);
      lines.push(`    participant ${pId} as ${node.name || 'Component'}`);
    });

    if (ast.edges && ast.edges.length > 0) {
      ast.edges.forEach((edge, idx) => {
        const sourceNode = ast.nodes.find(n => n.id === edge.sourceId);
        const targetNode = ast.nodes.find(n => n.id === edge.targetId);
        const sId = sanitizeMermaidId(sourceNode?.name || edge.sourceId || 'Sender');
        const tId = sanitizeMermaidId(targetNode?.name || edge.targetId || 'Receiver');
        const label = edge.label || `callMethod${idx + 1}()`;
        lines.push(`    ${sId}->>${tId}: ${label}`);
      });
    } else {
      // Default sample interaction if no edges
      if (ast.nodes.length >= 2) {
        const s = sanitizeMermaidId(ast.nodes[0].name);
        const t = sanitizeMermaidId(ast.nodes[1].name);
        lines.push(`    ${s}->>${t}: invokeAction()`);
        lines.push(`    ${t}-->>${s}: returnResult`);
      }
    }
    return lines.join('\n');
  }

  // Handle State Diagram
  if (normalizedType.includes('state')) {
    const lines: string[] = ['stateDiagram-v2', '    [*] --> ' + sanitizeMermaidId(ast.nodes[0]?.name || 'State1')];
    ast.nodes.forEach(node => {
      const sId = sanitizeMermaidId(node.name);
      lines.push(`    state "${node.name}" as ${sId}`);
    });

    if (ast.edges && ast.edges.length > 0) {
      ast.edges.forEach(edge => {
        const sourceNode = ast.nodes.find(n => n.id === edge.sourceId);
        const targetNode = ast.nodes.find(n => n.id === edge.targetId);
        const sId = sanitizeMermaidId(sourceNode?.name || 'State1');
        const tId = sanitizeMermaidId(targetNode?.name || 'State2');
        const label = edge.label ? ` : ${edge.label}` : '';
        lines.push(`    ${sId} --> ${tId}${label}`);
      });
    }
    return lines.join('\n');
  }

  // Handle Class Diagram (Default)
  const lines: string[] = ['classDiagram'];

  // 1. Process Class Nodes
  ast.nodes.forEach(node => {
    const className = sanitizeMermaidId(node.name || 'UnnamedClass');
    lines.push(`    class ${className} {`);

    if (node.type === 'Interface') {
      lines.push(`        <<interface>>`);
    } else if (node.type === 'AbstractClass') {
      lines.push(`        <<abstract>>`);
    } else if (node.type === 'Enum') {
      lines.push(`        <<enumeration>>`);
    }

    // Attributes
    if (node.attributes && node.attributes.length > 0) {
      node.attributes.forEach(attr => {
        if (typeof attr === 'string') {
          lines.push(`        ${attr}`);
        } else if (attr && typeof attr === 'object') {
          const vis = attr.visibility === 'private' ? '-' : attr.visibility === 'protected' ? '#' : attr.visibility === 'package' ? '~' : '+';
          const staticMod = attr.isStatic ? '$' : '';
          lines.push(`        ${vis}${attr.type ? `${attr.type} ` : ''}${attr.name}${staticMod}`);
        }
      });
    }

    // Methods
    if (node.methods && node.methods.length > 0) {
      node.methods.forEach(method => {
        if (typeof method === 'string') {
          lines.push(`        ${method}`);
        } else if (method && typeof method === 'object') {
          const vis = method.visibility === 'private' ? '-' : method.visibility === 'protected' ? '#' : method.visibility === 'package' ? '~' : '+';
          const staticMod = method.isStatic ? '$' : '';
          const abstractMod = method.isAbstract ? '*' : '';
          const params = (method.parameters || []).map(p => `${p.name}: ${p.type}`).join(', ');
          lines.push(`        ${vis}${method.name}(${params}) ${method.returnType || 'void'}${staticMod}${abstractMod}`);
        }
      });
    }

    lines.push(`    }`);
  });

  // 2. Process Relationships / Edges
  if (ast.edges && ast.edges.length > 0) {
    ast.edges.forEach(edge => {
      const sourceNode = ast.nodes.find(n => n.id === edge.sourceId);
      const targetNode = ast.nodes.find(n => n.id === edge.targetId);

      if (sourceNode && targetNode && sourceNode.id !== targetNode.id) {
        const src = sanitizeMermaidId(sourceNode.name);
        const tgt = sanitizeMermaidId(targetNode.name);
        let arrow = '-->';

        switch (edge.type) {
          case 'Inheritance':
            arrow = '--|>';
            break;
          case 'Realization':
            arrow = '..|>';
            break;
          case 'Composition':
            arrow = '--*';
            break;
          case 'Aggregation':
            arrow = '--o';
            break;
          case 'Dependency':
            arrow = '..>';
            break;
          case 'Association':
          default:
            arrow = '-->';
            break;
        }

        const label = edge.label ? ` : ${edge.label}` : '';
        lines.push(`    ${src} ${arrow} ${tgt}${label}`);
      }
    });
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// 2. HLD (Architecture) to Mermaid Converter
// ---------------------------------------------------------------------------

export function generateMermaidFromHLDAST(ast: HLDAST, diagramType: string = 'System Architecture'): string {
  if (!ast || !ast.nodes || ast.nodes.length === 0) {
    return `flowchart TD\n    Client["Client App"] --> API["API Gateway"]\n    API --> Service["Microservice"]\n    Service --> DB[("Database")]`;
  }

  const lines: string[] = ['flowchart TD'];

  // Map nodes to semantic Mermaid shapes
  const nodeShapeMap = new Map<string, string>();

  ast.nodes.forEach(node => {
    const id = sanitizeMermaidId(node.id || node.label);
    const label = sanitizeMermaidLabel(node.label || node.type || 'Component');
    const type = (node.type || '').toLowerCase();

    let nodeDecl = `${id}["${label}"]`;

    if (type.includes('database') || type.includes('db') || type.includes('sql') || type.includes('mongo') || type.includes('storage')) {
      nodeDecl = `${id}[("${label}")]`;
    } else if (type.includes('queue') || type.includes('kafka') || type.includes('rabbitmq') || type.includes('sqs')) {
      nodeDecl = `${id}{{"${label}"}}`;
    } else if (type.includes('balancer') || type.includes('gateway') || type.includes('router') || type.includes('cdn')) {
      nodeDecl = `${id}(["${label}"])`;
    } else if (type.includes('client') || type.includes('user') || type.includes('browser') || type.includes('mobile')) {
      nodeDecl = `${id}(["${label}"])`;
    } else if (type.includes('cache') || type.includes('redis') || type.includes('memcached')) {
      nodeDecl = `${id}[("${label}")]`;
    } else {
      nodeDecl = `${id}["${label}"]`;
    }

    nodeShapeMap.set(node.id, id);
    lines.push(`    ${nodeDecl}`);
  });

  // Process Edges
  if (ast.edges && ast.edges.length > 0) {
    lines.push('');
    ast.edges.forEach((edge, idx) => {
      const srcId = nodeShapeMap.get(edge.sourceId) || sanitizeMermaidId(edge.sourceId);
      const tgtId = nodeShapeMap.get(edge.targetId) || sanitizeMermaidId(edge.targetId);

      if (srcId && tgtId && srcId !== tgtId && srcId !== 'unbound' && tgtId !== 'unbound') {
        const arrow = edge.type === 'AsyncConnection' ? '-.->' : '-->';
        lines.push(`    ${srcId} ${arrow} ${tgtId}`);
      }
    });
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// 3. AI Generated Architecture to Mermaid Converter
// ---------------------------------------------------------------------------

export function generateMermaidFromAIGeneratedArchitecture(arch: AIGeneratedArchitecture): string {
  if (!arch || !arch.nodes || arch.nodes.length === 0) {
    return `flowchart TD\n    Client["Client Application"] --> LB(["Load Balancer"])\n    LB --> App["Core Application Service"]\n    App --> DB[("Primary Database")]`;
  }

  const lines: string[] = ['flowchart TD'];

  // Categorize nodes into tiers for subgraphs
  const clients: any[] = [];
  const ingress: any[] = [];
  const services: any[] = [];
  const dataStores: any[] = [];
  const others: any[] = [];

  arch.nodes.forEach(node => {
    const type = (node.type || '').toLowerCase();
    if (type === 'client') clients.push(node);
    else if (type === 'api_gateway' || type === 'load_balancer' || type === 'external') ingress.push(node);
    else if (type === 'service') services.push(node);
    else if (type === 'database' || type === 'cache' || type === 'queue' || type === 'storage') dataStores.push(node);
    else others.push(node);
  });

  const renderNode = (node: any) => {
    const id = sanitizeMermaidId(node.id || node.label);
    const techStr = node.technologies && node.technologies.length > 0 ? `<br/><small>(${node.technologies.join(', ')})</small>` : '';
    const label = `${sanitizeMermaidLabel(node.label)}${techStr}`;
    const type = (node.type || '').toLowerCase();

    if (type === 'database' || type === 'storage' || type === 'cache') {
      return `        ${id}[("${label}")]`;
    } else if (type === 'queue') {
      return `        ${id}{{"${label}"}}`;
    } else if (type === 'client' || type === 'load_balancer' || type === 'api_gateway') {
      return `        ${id}(["${label}"])`;
    }
    return `        ${id}["${label}"]`;
  };

  if (clients.length > 0) {
    lines.push('    subgraph Clients ["Clients & Users"]');
    clients.forEach(n => lines.push(renderNode(n)));
    lines.push('    end\n');
  }

  if (ingress.length > 0) {
    lines.push('    subgraph Ingress ["API Gateway & Traffic Routing"]');
    ingress.forEach(n => lines.push(renderNode(n)));
    lines.push('    end\n');
  }

  if (services.length > 0) {
    lines.push('    subgraph Services ["Application & Microservices"]');
    services.forEach(n => lines.push(renderNode(n)));
    lines.push('    end\n');
  }

  if (dataStores.length > 0) {
    lines.push('    subgraph Persistence ["Databases, Cache & Queues"]');
    dataStores.forEach(n => lines.push(renderNode(n)));
    lines.push('    end\n');
  }

  if (others.length > 0) {
    others.forEach(n => lines.push(renderNode(n).substring(4)));
  }

  // Edges
  if (arch.edges && arch.edges.length > 0) {
    lines.push('');
    arch.edges.forEach(edge => {
      const srcId = sanitizeMermaidId(edge.source);
      const tgtId = sanitizeMermaidId(edge.target);
      const label = edge.label ? `|"${sanitizeMermaidLabel(edge.label)}"|` : '';
      lines.push(`    ${srcId} -->${label} ${tgtId}`);
    });
  }

  return lines.join('\n');
}

/**
 * Creates a comprehensive GitHub-ready Markdown architecture document from AI Generated Architecture
 */
export function generateGitHubArchitectureMarkdown(arch: AIGeneratedArchitecture, title: string = 'System Architecture Design'): string {
  const mermaidCode = generateMermaidFromAIGeneratedArchitecture(arch);
  const exp = arch.explanation || ({} as any);

  let md = `# ${title}\n\n`;
  
  if (exp.overview) {
    md += `## System Overview\n\n${exp.overview}\n\n`;
  }

  md += `## Architecture Diagram\n\n\`\`\`mermaid\n${mermaidCode}\n\`\`\`\n\n`;

  if (exp.functionalRequirements && exp.functionalRequirements.length > 0) {
    md += `### Functional Requirements\n\n` + exp.functionalRequirements.map((r: string) => `- ${r}`).join('\n') + `\n\n`;
  }

  if (exp.nonFunctionalRequirements && exp.nonFunctionalRequirements.length > 0) {
    md += `### Non-Functional Requirements\n\n` + exp.nonFunctionalRequirements.map((r: string) => `- ${r}`).join('\n') + `\n\n`;
  }

  if (exp.components && exp.components.length > 0) {
    md += `### Component Specifications\n\n| Component | Technology | Description |\n| :--- | :--- | :--- |\n`;
    exp.components.forEach((c: any) => {
      md += `| **${c.name}** | \`${c.technology || 'N/A'}\` | ${c.description || ''} |\n`;
    });
    md += `\n`;
  }

  if (exp.requestFlow && exp.requestFlow.length > 0) {
    md += `### Request Flow\n\n` + exp.requestFlow.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n') + `\n\n`;
  }

  if (exp.databaseStrategy || exp.cacheStrategy || exp.queueStrategy) {
    md += `### Data & Storage Strategies\n\n`;
    if (exp.databaseStrategy) md += `- **Database Strategy**: ${exp.databaseStrategy}\n`;
    if (exp.cacheStrategy) md += `- **Cache Strategy**: ${exp.cacheStrategy}\n`;
    if (exp.queueStrategy) md += `- **Queue Strategy**: ${exp.queueStrategy}\n`;
    md += `\n`;
  }

  if (exp.scalability || exp.faultTolerance) {
    md += `### Scalability & Reliability\n\n`;
    if (exp.scalability) md += `- **Scalability**: ${exp.scalability}\n`;
    if (exp.faultTolerance) md += `- **Fault Tolerance**: ${exp.faultTolerance}\n`;
    md += `\n`;
  }

  return md;
}

// ---------------------------------------------------------------------------
// 4. Generic Excalidraw Elements to Mermaid Converter
// ---------------------------------------------------------------------------

export function generateMermaidFromExcalidraw(elements: readonly any[]): string {
  const activeElements = (elements || []).filter(el => el && !el.isDeleted);
  if (activeElements.length === 0) {
    return `flowchart TD\n    Node1["Architecture Component"]`;
  }

  const nodes: { id: string; label: string; shape: string; x: number; y: number; width: number; height: number }[] = [];
  const edges: { sourceId?: string; targetId?: string; label?: string }[] = [];
  const processedGroups = new Set<string>();

  // 1. Extract grouped elements or single containers
  activeElements.forEach(el => {
    if (el.groupIds && el.groupIds.length > 0) {
      const topGroupId = el.groupIds[el.groupIds.length - 1];
      if (!processedGroups.has(topGroupId)) {
        processedGroups.add(topGroupId);
        const groupEls = activeElements.filter(e => e.groupIds?.includes(topGroupId));
        const textEl = groupEls.find(e => e.type === 'text');
        const shapeEl = groupEls.find(e => e.type === 'rectangle' || e.type === 'ellipse' || e.type === 'diamond');

        const label = textEl?.text || textEl?.originalText || 'Component';
        const shapeType = shapeEl?.type || 'rectangle';

        const minX = Math.min(...groupEls.map(e => e.x));
        const minY = Math.min(...groupEls.map(e => e.y));
        const maxX = Math.max(...groupEls.map(e => e.x + e.width));
        const maxY = Math.max(...groupEls.map(e => e.y + e.height));

        nodes.push({
          id: topGroupId,
          label,
          shape: shapeType,
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
        });
      }
    } else if (el.type === 'rectangle' || el.type === 'ellipse' || el.type === 'diamond') {
      // Standalone shape without group
      const boundText = activeElements.find(e => e.type === 'text' && (e.containerId === el.id || (e.x >= el.x && e.x <= el.x + el.width && e.y >= el.y && e.y <= el.y + el.height)));
      const label = boundText?.text || boundText?.originalText || 'Component';
      nodes.push({
        id: el.id,
        label,
        shape: el.type,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
      });
    }
  });

  // Spatial closest node finder for unbound arrows
  const getClosestNodeId = (x: number, y: number) => {
    let closestId = null;
    let minArea = Infinity;
    for (const node of nodes) {
      if (x >= node.x - 30 && x <= node.x + node.width + 30 &&
          y >= node.y - 30 && y <= node.y + node.height + 30) {
        const area = node.width * node.height;
        if (area < minArea) {
          minArea = area;
          closestId = node.id;
        }
      }
    }
    return closestId;
  };

  // 2. Extract arrows
  activeElements.forEach(el => {
    if (el.type === 'arrow' || el.type === 'line') {
      let sourceId = el.startBinding?.elementId;
      let targetId = el.endBinding?.elementId;

      if (sourceId) {
        const bound = activeElements.find(e => e.id === sourceId);
        if (bound?.groupIds?.length > 0) sourceId = bound.groupIds[bound.groupIds.length - 1];
      }
      if (targetId) {
        const bound = activeElements.find(e => e.id === targetId);
        if (bound?.groupIds?.length > 0) targetId = bound.groupIds[bound.groupIds.length - 1];
      }

      if (!sourceId) sourceId = getClosestNodeId(el.x, el.y);
      if (!targetId && el.points && el.points.length > 0) {
        const lastPt = el.points[el.points.length - 1];
        targetId = getClosestNodeId(el.x + lastPt[0], el.y + lastPt[1]);
      }

      // Check for arrow label text
      const boundText = activeElements.find(e => e.type === 'text' && e.containerId === el.id);

      if (sourceId && targetId) {
        edges.push({
          sourceId,
          targetId,
          label: boundText?.text || boundText?.originalText,
        });
      }
    }
  });

  if (nodes.length === 0) {
    return `flowchart TD\n    Canvas["Empty DesignDojo Canvas"]`;
  }

  const lines: string[] = ['flowchart TD'];
  const idMap = new Map<string, string>();

  nodes.forEach((n, i) => {
    const cleanId = `N${i + 1}_${sanitizeMermaidId(n.label.substring(0, 12))}`;
    idMap.set(n.id, cleanId);
    const label = sanitizeMermaidLabel(n.label);

    let decl = `${cleanId}["${label}"]`;
    if (n.shape === 'ellipse') {
      decl = `${cleanId}(["${label}"])`;
    } else if (n.shape === 'diamond') {
      decl = `${cleanId}{"${label}"}`;
    }
    lines.push(`    ${decl}`);
  });

  if (edges.length > 0) {
    lines.push('');
    edges.forEach(e => {
      const src = idMap.get(e.sourceId || '');
      const tgt = idMap.get(e.targetId || '');
      if (src && tgt && src !== tgt) {
        const label = e.label ? `|"${sanitizeMermaidLabel(e.label)}"|` : '';
        lines.push(`    ${src} -->${label} ${tgt}`);
      }
    });
  }

  return lines.join('\n');
}
