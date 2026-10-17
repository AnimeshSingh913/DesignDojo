import { UMLNode } from '../types';
import { ASTEngine } from '../ast/ASTEngine';
import { generateId } from '../utils/elementGenerator';

export class ClassNodeGenerator {
  /**
   * Generates a group of Excalidraw elements representing a UML Class.
   * It also binds the structured data model to the visual elements.
   * 
   * @param nodeData - The structured UML Class data
   * @param x - Canvas X position
   * @param y - Canvas Y position
   */
  public static generate(nodeData: UMLNode, x: number, y: number): any[] {
    const groupId = generateId();
    
    // In a real implementation, we would construct specific Excalidraw Element objects:
    // 1. A Rectangle for the outer border
    // 2. A Text element for the Class Name (centered)
    // 3. A Line element separating Name and Attributes
    // 4. Text elements for each Attribute
    // 5. A Line element separating Attributes and Methods
    // 6. Text elements for each Method
    
    // Stub implementation of what the Excalidraw shapes would look like:
    const elements = [
      {
        type: 'rectangle',
        id: generateId(),
        x, y,
        width: 200,
        height: 150,
        groupIds: [groupId],
        strokeColor: '#1e293b',
        backgroundColor: '#ffffff',
      },
      {
        type: 'text',
        id: generateId(),
        text: nodeData.name,
        x: x + 10, y: y + 10,
        groupIds: [groupId],
      }
      // ... other elements
    ];

    // CRITICAL: Bind the structured AST data to the visual elements
    // so the ASTEngine can parse it later without relying on text parsing.
    ASTEngine.bindDataToElements(elements, nodeData);

    return elements;
  }
}
