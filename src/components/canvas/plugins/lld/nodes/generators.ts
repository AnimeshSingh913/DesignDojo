import { 
  generateId, 
  createRectangle, 
  createText, 
  createContainerWithBoundText, 
  createLine, 
  createEllipse, 
  createDiamond,
  estimateTextDimensions
} from '../utils/elementGenerator';

// --- CLASS DIAGRAM ---

export function generateClassNode(
  x: number, 
  y: number, 
  name: string = "ClassName",
  attributes: string[] = ["+ attribute: type"],
  methods: string[] = ["+ method(): returnType"],
  stereotype: string | null = null, 
  isAbstract: boolean = false
) {
  const groupId = generateId();
  
  const hasAttributes = attributes && attributes.length > 0;
  const hasMethods = methods && methods.length > 0;

  const headerTitle = stereotype ? `<<${stereotype}>>\n${name}` : name;
  const attrContent = hasAttributes ? attributes.join("\n") : "+ attribute: type";
  const methodContent = hasMethods ? methods.join("\n") : "+ method(): returnType";

  const estHeader = estimateTextDimensions(headerTitle, 16);
  const estAttr = estimateTextDimensions(attrContent, 14);
  const estMethod = estimateTextDimensions(methodContent, 14);

  const minWidth = Math.max(200, estHeader.width + 32, estAttr.width + 32, estMethod.width + 32);
  const width = minWidth;

  const headerHeight = Math.max(stereotype ? 56 : 38, estHeader.height + 16);
  const attrHeight = Math.max(38, estAttr.height + 16);
  const methodHeight = Math.max(38, estMethod.height + 16);

  const totalHeight = (hasAttributes || (!stereotype || stereotype === 'abstract'))
    ? headerHeight + attrHeight + methodHeight
    : headerHeight + methodHeight;

  const customData = { diagramType: 'Class Diagram', nodeType: stereotype || 'Class' };
  const strokeWidth = isAbstract ? 1.5 : 2;

  // Single outer card with 4 outer corners rounded
  const card = createRectangle(x, y, width, totalHeight, {
    groupIds: [groupId],
    backgroundColor: "#ffffff",
    strokeColor: "#1e293b",
    strokeWidth,
    roundness: { type: 3 },
    boundElements: [],
    customData,
  });

  const headerText = createText(
    Math.round(x + (width - estHeader.width) / 2),
    Math.round(y + (headerHeight - estHeader.height) / 2),
    headerTitle,
    {
      groupIds: [groupId],
      fontSize: 16,
      textAlign: "center",
      verticalAlign: "middle",
      containerId: null,
      customData: { role: 'header' },
    }
  );

  const divider1 = createLine(x, y + headerHeight, width, 0, {
    groupIds: [groupId],
    strokeColor: "#1e293b",
    strokeWidth: 1.5,
  });

  if (hasAttributes || (!stereotype || stereotype === 'abstract')) {
    const attrText = createText(
      Math.round(x + 12),
      Math.round(y + headerHeight + (attrHeight - estAttr.height) / 2),
      attrContent,
      {
        groupIds: [groupId],
        fontSize: 14,
        textAlign: "left",
        verticalAlign: "middle",
        containerId: null,
        customData: { role: 'attributes' },
      }
    );

    const divider2 = createLine(x, y + headerHeight + attrHeight, width, 0, {
      groupIds: [groupId],
      strokeColor: "#1e293b",
      strokeWidth: 1.5,
    });

    const methodText = createText(
      Math.round(x + 12),
      Math.round(y + headerHeight + attrHeight + (methodHeight - estMethod.height) / 2),
      methodContent,
      {
        groupIds: [groupId],
        fontSize: 14,
        textAlign: "left",
        verticalAlign: "middle",
        containerId: null,
        customData: { role: 'methods' },
      }
    );

    return [card, headerText, divider1, attrText, divider2, methodText];
  } else {
    // 2 rows (Interface): Header + Methods
    const methodText = createText(
      Math.round(x + 12),
      Math.round(y + headerHeight + (methodHeight - estMethod.height) / 2),
      methodContent,
      {
        groupIds: [groupId],
        fontSize: 14,
        textAlign: "left",
        verticalAlign: "middle",
        containerId: null,
        customData: { role: 'methods' },
      }
    );

    return [card, headerText, divider1, methodText];
  }
}

export function generateInterfaceNode(x: number, y: number, name: string = "Interface", methods: string[] = ["+ method(): returnType"]) {
  return generateClassNode(x, y, name, [], methods, "interface");
}

export function generateAbstractClassNode(x: number, y: number, name: string = "AbstractClass", attributes: string[] = ["+ attribute: type"], methods: string[] = ["+ abstractMethod(): void", "+ method(): returnType"]) {
  return generateClassNode(x, y, name, attributes, methods, "abstract", true);
}

export function generateEnumNode(x: number, y: number) {
  const groupId = generateId();
  const width = 180;
  const headerHeight = 56;
  const bodyHeight = 80;
  const totalHeight = headerHeight + bodyHeight;
  const customData = { diagramType: 'Class Diagram', nodeType: 'Enum' };

  const card = createRectangle(x, y, width, totalHeight, {
    groupIds: [groupId],
    backgroundColor: "#ffffff",
    strokeColor: "#1e293b",
    strokeWidth: 2,
    roundness: { type: 3 },
    boundElements: [],
    customData,
  });

  const headerText = createText(
    Math.round(x + (width - 120) / 2),
    Math.round(y + 10),
    "<<enum>>\nEnumName",
    {
      groupIds: [groupId],
      fontSize: 16,
      textAlign: "center",
      verticalAlign: "middle",
      containerId: null,
      customData: { role: 'header' },
    }
  );

  const divider = createLine(x, y + headerHeight, width, 0, {
    groupIds: [groupId],
    strokeColor: "#1e293b",
    strokeWidth: 1.5,
  });

  const bodyText = createText(
    Math.round(x + 12),
    Math.round(y + headerHeight + 12),
    "VALUE_1\nVALUE_2\nVALUE_3",
    {
      groupIds: [groupId],
      fontSize: 14,
      textAlign: "left",
      verticalAlign: "middle",
      containerId: null,
      customData: { role: 'values' },
    }
  );

  return [card, headerText, divider, bodyText];
}

export function generatePackageNode(x: number, y: number) {
  const groupId = generateId();
  const elements = [];
  
  const tabWidth = 60;
  const tabHeight = 20;
  const bodyWidth = 160;
  const bodyHeight = 100;
  
  const customData = { diagramType: 'Package Diagram', nodeType: 'Package' };

  elements.push(createRectangle(x, y, tabWidth, tabHeight, { groupIds: [groupId], customData }));
  
  const body = createContainerWithBoundText('rectangle', x, y + tabHeight, bodyWidth, bodyHeight, "PackageName", {
    groupIds: [groupId],
    fontSize: 16,
    textAlign: "center",
    verticalAlign: "middle",
  });
  elements.push(body.container, body.textElement);

  return elements;
}

export function generateNoteNode(x: number, y: number, text: string = "This is\na note...") {
  const groupId = generateId();
  const lines = text.split('\n');
  const width = Math.max(160, Math.max(...lines.map(l => l.length)) * 10);
  const height = Math.max(100, lines.length * 24 + 40);
  const elements = [];
  
  const customData = { diagramType: 'Generic', nodeType: 'Note' };

  const note = createContainerWithBoundText('rectangle', x, y, width, height, text, {
    groupIds: [groupId],
    backgroundColor: "#fef08a",
    roughness: 1,
    customData,
    fontSize: 16,
    textAlign: "left",
    verticalAlign: "top",
  });
  elements.push(note.container, note.textElement);

  return elements;
}

// --- OBJECT DIAGRAM ---

export function generateObjectNode(x: number, y: number, name: string = "object1 : ClassName", attributes: string[] = ["attribute1 = value1", "attribute2 = value2"]) {
  const groupId = generateId();
  const attrContent = attributes.join("\n") || "attribute1 = value1";
  const estHeader = estimateTextDimensions(name, 16);
  const estAttr = estimateTextDimensions(attrContent, 14);

  const width = Math.max(180, estHeader.width + 32, estAttr.width + 32);
  const headerHeight = 38;
  const attrHeight = Math.max(38, estAttr.height + 16);
  const totalHeight = headerHeight + attrHeight;

  const customData = { diagramType: 'Object Diagram', nodeType: 'Object' };

  const card = createRectangle(x, y, width, totalHeight, {
    groupIds: [groupId],
    backgroundColor: "#ffffff",
    strokeColor: "#1e293b",
    strokeWidth: 2,
    roundness: { type: 3 },
    boundElements: [],
    customData,
  });

  const headerText = createText(
    Math.round(x + (width - estHeader.width) / 2),
    Math.round(y + (headerHeight - estHeader.height) / 2),
    name,
    {
      groupIds: [groupId],
      fontSize: 16,
      textAlign: "center",
      verticalAlign: "middle",
      containerId: null,
      customData: { role: 'header' },
    }
  );

  const divider = createLine(x, y + headerHeight, width, 0, {
    groupIds: [groupId],
    strokeColor: "#1e293b",
    strokeWidth: 1.5,
  });

  const bodyText = createText(
    Math.round(x + 12),
    Math.round(y + headerHeight + (attrHeight - estAttr.height) / 2),
    attrContent,
    {
      groupIds: [groupId],
      fontSize: 14,
      textAlign: "left",
      verticalAlign: "middle",
      containerId: null,
      customData: { role: 'attributes' },
    }
  );

  return [card, headerText, divider, bodyText];
}

// --- SEQUENCE & USE CASE DIAGRAM ---

export function generateActorNode(x: number, y: number, name: string = "Actor") {
  const groupId = generateId();
  const elements = [];
  const customData = { diagramType: 'Sequence/UseCase Diagram', nodeType: 'Actor' };

  // Stick figure dimensions
  const headSize = 30;
  const bodyLen = 40;
  const armSpan = 40;
  const legSpan = 40;

  // Head
  elements.push(createEllipse(x, y, headSize, headSize, { groupIds: [groupId], customData, backgroundColor: "transparent" }));
  
  // Body
  const bodyTop = y + headSize;
  const bodyBottom = bodyTop + bodyLen;
  const centerX = x + headSize / 2;
  elements.push(createLine(centerX, bodyTop, 0, bodyLen, { groupIds: [groupId] }));
  
  // Arms
  const armY = bodyTop + 10;
  elements.push(createLine(centerX - armSpan / 2, armY, armSpan, 0, { groupIds: [groupId] }));
  
  // Legs
  elements.push(createLine(centerX, bodyBottom, -legSpan / 2, legSpan, { groupIds: [groupId] }));
  elements.push(createLine(centerX, bodyBottom, legSpan / 2, legSpan, { groupIds: [groupId] }));

  // Label
  elements.push(createText(centerX, bodyBottom + legSpan + 15, name, {
    groupIds: [groupId],
    fontSize: 16,
    fontFamily: 1,
    textAlign: "center"
  }));

  return elements;
}

export function generateLifelineNode(x: number, y: number) {
  const groupId = generateId();
  const elements = [];
  const width = 100;
  const height = 40;
  const lineLength = 300;
  const customData = { diagramType: 'Sequence Diagram', nodeType: 'Lifeline' };

  const head = createContainerWithBoundText('rectangle', x, y, width, height, ":Boundary", {
    groupIds: [groupId],
    customData,
    fontSize: 16,
    textAlign: "center",
    verticalAlign: "middle",
  });
  elements.push(head.container, head.textElement);

  // Dashed line down
  elements.push(createLine(x + width / 2, y + height, 0, lineLength, { 
    groupIds: [groupId], 
    strokeStyle: "dashed" 
  }));

  return elements;
}

export function generateActivationNode(x: number, y: number) {
  const groupId = generateId();
  const width = 16;
  const height = 100;
  const customData = { diagramType: 'Sequence Diagram', nodeType: 'Activation' };

  return [createRectangle(x, y, width, height, { groupIds: [groupId], customData })];
}

// --- ACTIVITY & STATE DIAGRAM ---

export function generateInitialNode(x: number, y: number) {
  const groupId = generateId();
  const size = 24;
  const customData = { diagramType: 'Activity/State Diagram', nodeType: 'InitialNode' };

  return [
    createEllipse(x, y, size, size, { 
      groupIds: [groupId], 
      backgroundColor: "#000000", 
      fillStyle: "solid",
      customData 
    })
  ];
}

export function generateFinalNode(x: number, y: number) {
  const groupId = generateId();
  const outerSize = 32;
  const innerSize = 20;
  const customData = { diagramType: 'Activity/State Diagram', nodeType: 'FinalNode' };

  const elements = [];
  elements.push(createEllipse(x, y, outerSize, outerSize, { groupIds: [groupId], customData }));
  const offset = (outerSize - innerSize) / 2;
  elements.push(createEllipse(x + offset, y + offset, innerSize, innerSize, { 
    groupIds: [groupId], 
    backgroundColor: "#000000", 
    fillStyle: "solid" 
  }));

  return elements;
}

export function generateActionNode(x: number, y: number, name: string = "Action") {
  const groupId = generateId();
  const width = Math.max(120, name.length * 10 + 40);
  const height = 40;
  const customData = { diagramType: 'Activity/State Diagram', nodeType: 'Action/State' };

  const elements = [];
  const action = createContainerWithBoundText('rectangle', x, y, width, height, name, {
    groupIds: [groupId],
    roundness: { type: 3 },
    customData,
    fontSize: 16,
    textAlign: "center",
    verticalAlign: "middle",
  });
  elements.push(action.container, action.textElement);

  return elements;
}

export function generateDecisionNode(x: number, y: number, label: string = "Decision") {
  const groupId = generateId();
  const width = 80;
  const height = 50;
  const customData = { diagramType: 'Activity Diagram', nodeType: 'Decision' };

  const elements = [];
  const decision = createContainerWithBoundText('diamond', x, y, width, height, label, {
    groupIds: [groupId],
    customData,
    fontSize: 14,
    textAlign: "center",
    verticalAlign: "middle",
  });
  elements.push(decision.container, decision.textElement);

  return elements;
}

export function generateMergeNode(x: number, y: number) {
  const groupId = generateId();
  const width = 80;
  const height = 50;
  const customData = { diagramType: 'Activity Diagram', nodeType: 'Merge' };
  return [createDiamond(x, y, width, height, { groupIds: [groupId], customData })];
}

export function generateForkNode(x: number, y: number) {
  const groupId = generateId();
  const width = 120;
  const height = 8;
  const customData = { diagramType: 'Activity Diagram', nodeType: 'Fork/Join' };

  return [createRectangle(x, y, width, height, { 
    groupIds: [groupId], 
    backgroundColor: "#000000", 
    fillStyle: "solid",
    customData 
  })];
}

export function generateJoinNode(x: number, y: number) {
  return generateForkNode(x, y);
}

// --- USE CASE DIAGRAM ---

export function generateUseCaseNode(x: number, y: number, name: string = "Use Case") {
  const groupId = generateId();
  const width = Math.max(140, name.length * 10 + 40);
  const height = 60;
  const customData = { diagramType: 'Use Case Diagram', nodeType: 'UseCase' };

  const elements = [];
  const uc = createContainerWithBoundText('ellipse', x, y, width, height, name, {
    groupIds: [groupId],
    customData,
    fontSize: 16,
    textAlign: "center",
    verticalAlign: "middle",
  });
  elements.push(uc.container, uc.textElement);

  return elements;
}

// --- COMPONENT DIAGRAM ---

export function generateComponentNode(x: number, y: number, name: string = "Component") {
  const groupId = generateId();
  const width = Math.max(160, name.length * 10 + 40);
  const height = 80;
  const customData = { diagramType: 'Component Diagram', nodeType: 'Component' };
  
  const elements = [];
  
  // Main body + Bound Text
  const main = createContainerWithBoundText('rectangle', x, y, width, height, `<<component>>\n${name}`, {
    groupIds: [groupId],
    customData,
    fontSize: 16,
    textAlign: "center",
    verticalAlign: "middle",
  });
  elements.push(main.container, main.textElement);
  
  // 2 small rectangles on the left border
  const boxWidth = 20;
  const boxHeight = 12;
  const boxX = x - boxWidth / 2;
  
  elements.push(createRectangle(boxX, y + height / 3 - boxHeight / 2, boxWidth, boxHeight, { groupIds: [groupId] }));
  elements.push(createRectangle(boxX, y + 2 * height / 3 - boxHeight / 2, boxWidth, boxHeight, { groupIds: [groupId] }));

  return elements;
}

// --- DEPLOYMENT DIAGRAM ---

export function generateDeviceNode(x: number, y: number, name: string = "Device") {
  const groupId = generateId();
  const width = Math.max(200, name.length * 10 + 60);
  const height = 160;
  const customData = { diagramType: 'Deployment Diagram', nodeType: 'Device' };
  
  const elements = [];
  
  // Front face + Bound Text
  const front = createContainerWithBoundText('rectangle', x, y, width, height, `<<device>>\n${name}`, {
    groupIds: [groupId],
    customData,
    fontSize: 16,
    textAlign: "center",
    verticalAlign: "middle",
  });
  elements.push(front.container, front.textElement);
  
  // Depth offset for 3D effect
  const dx = 20;
  const dy = -20;
  
  // 3D Perspective lines
  elements.push(createLine(x, y, dx, dy, { groupIds: [groupId] }));
  elements.push(createLine(x + dx, y + dy, width, 0, { groupIds: [groupId] }));
  elements.push(createLine(x + width, y, dx, dy, { groupIds: [groupId] }));
  elements.push(createLine(x + width + dx, y + dy, 0, height, { groupIds: [groupId] }));
  elements.push(createLine(x + width, y + height, dx, dy, { groupIds: [groupId] }));

  return elements;
}

export function generateArtifactNode(x: number, y: number, name: string = "Artifact") {
  const groupId = generateId();
  const width = Math.max(140, name.length * 10 + 40);
  const height = 60;
  const customData = { diagramType: 'Deployment Diagram', nodeType: 'Artifact' };

  const elements = [];
  const artifact = createContainerWithBoundText('rectangle', x, y, width, height, `<<artifact>>\n${name}`, {
    groupIds: [groupId],
    customData,
    fontSize: 16,
    textAlign: "center",
    verticalAlign: "middle",
  });
  elements.push(artifact.container, artifact.textElement);

  return elements;
}
