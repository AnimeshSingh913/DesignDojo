import { DiagramMetadata } from '../types';

export class LLDExporter {
  
  static async exportToJSON(
    elements: any[],
    appState: any,
    metadata: DiagramMetadata
  ) {
    const payload = {
      type: "designdojo_lld_export",
      version: 1,
      source: "DesignDojo",
      elements,
      appState: {
        viewBackgroundColor: appState.viewBackgroundColor,
        theme: appState.theme
      },
      metadata
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${metadata.projectName.replace(/\s+/g, '_')}_${metadata.diagramType.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async exportToPNG(excalidrawAPI: any, projectName: string) {
    if (!excalidrawAPI) return;
    try {
      const { exportToBlob } = await import('@excalidraw/excalidraw');
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      
      const blob = await exportToBlob({
        elements,
        mimeType: "image/png",
        appState,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to export PNG", e);
    }
  }

  static async exportToSVG(excalidrawAPI: any, projectName: string) {
    if (!excalidrawAPI) return;
    try {
      const { exportToSvg } = await import('@excalidraw/excalidraw');
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      
      const svg = await exportToSvg({
        elements,
        appState,
      });

      const svgString = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgString], { type: "image/svg+xml" });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName.replace(/\s+/g, '_')}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to export SVG", e);
    }
  }

  static async exportToMermaid(excalidrawAPI: any, projectName: string, diagramType: string = 'Class Diagram') {
    if (!excalidrawAPI) return;
    try {
      const { ASTEngine } = await import('../ast/ASTEngine');
      const { generateMermaidFromLLDAST, downloadMermaidFile } = await import('@/lib/export/mermaidExporter');
      const elements = excalidrawAPI.getSceneElements();
      const ast = ASTEngine.parseFromCanvas(elements);
      const mermaidCode = generateMermaidFromLLDAST(ast, diagramType);
      const filename = `${projectName.replace(/\s+/g, '_')}_${diagramType.replace(/\s+/g, '_')}.mmd`;
      downloadMermaidFile(mermaidCode, filename);
    } catch (e) {
      console.error("Failed to export Mermaid", e);
    }
  }

  static async exportToMarkdown(excalidrawAPI: any, projectName: string, diagramType: string = 'Class Diagram') {
    if (!excalidrawAPI) return;
    try {
      const { ASTEngine } = await import('../ast/ASTEngine');
      const { generateMermaidFromLLDAST, formatAsGitHubMarkdown, downloadMarkdownFile } = await import('@/lib/export/mermaidExporter');
      const elements = excalidrawAPI.getSceneElements();
      const ast = ASTEngine.parseFromCanvas(elements);
      const mermaidCode = generateMermaidFromLLDAST(ast, diagramType);
      const markdown = formatAsGitHubMarkdown(mermaidCode, `${projectName} - ${diagramType}`);
      const filename = `${projectName.replace(/\s+/g, '_')}_${diagramType.replace(/\s+/g, '_')}.md`;
      downloadMarkdownFile(markdown, filename);
    } catch (e) {
      console.error("Failed to export Markdown", e);
    }
  }
}
