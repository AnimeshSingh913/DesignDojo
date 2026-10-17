export const generateId = () => Math.random().toString(36).substring(2, 15);

const defaultStyles = {
  strokeColor: "#1e293b",
  backgroundColor: "transparent",
  fillStyle: "hachure",
  strokeWidth: 2,
  strokeStyle: "solid",
  roughness: 0,
  opacity: 100,
  strokeSharpness: "sharp",
  locked: false,
  isDeleted: false,
  boundElements: [],
  groupIds: [],
  link: null,
  version: 1,
  versionNonce: Math.floor(Math.random() * 1000000000),
  seed: Math.floor(Math.random() * 1000000000),
  angle: 0,
  roundness: { type: 2 }, // adaptive clean roundness
  startBinding: null,
  endBinding: null,
  frameId: null,
};

export function createRectangle(x: number, y: number, width: number, height: number, customProps: any = {}) {
  return {
    id: generateId(),
    type: "rectangle",
    x,
    y,
    width,
    height,
    ...defaultStyles,
    backgroundColor: "#ffffff",
    fillStyle: "solid",
    ...customProps,
  };
}

export function createText(x: number, y: number, text: string, customProps: any = {}) {
  return {
    id: generateId(),
    type: "text",
    x,
    y,
    width: Math.max(40, text.length * 10),
    height: 24,
    text,
    fontSize: 16,
    fontFamily: 1, // 1 = Virgil, 2 = Helvetica, 3 = Cascadia
    textAlign: "center",
    verticalAlign: "middle",
    baseline: 18,
    lineHeight: 1.25,
    autoResize: true,
    containerId: null,
    originalText: text,
    ...defaultStyles,
    strokeWidth: 1,
    ...customProps,
  };
}

export function createContainerWithBoundText(
  shapeType: 'rectangle' | 'ellipse' | 'diamond',
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  options: {
    groupIds?: string[];
    customData?: any;
    backgroundColor?: string;
    strokeColor?: string;
    fillStyle?: string;
    strokeWidth?: number;
    fontSize?: number;
    fontFamily?: number;
    textAlign?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    roundness?: any;
    roughness?: number;
    containerProps?: any;
    textProps?: any;
  } = {}
) {
  const containerId = generateId();
  const textId = generateId();
  const groupIds = options.groupIds || [];

  const fontSize = options.fontSize || 14;
  const textAlign = options.textAlign || 'center';
  const verticalAlign = options.verticalAlign || 'middle';

  // Calculate actual text dimensions
  const lines = (text || '').split('\n');
  const lineCount = Math.max(1, lines.length);
  const maxLineChars = Math.max(...lines.map(l => l.length), 1);
  const textWidth = Math.round(maxLineChars * (fontSize * 0.55) + 16);
  const textHeight = Math.round(lineCount * (fontSize * 1.32));

  // Position text strictly within container
  const textX = textAlign === 'center'
    ? Math.round(x + (width - textWidth) / 2)
    : (textAlign === 'right' ? Math.round(x + width - textWidth - 12) : Math.round(x + 12));

  const textY = verticalAlign === 'middle'
    ? Math.round(y + (height - textHeight) / 2)
    : (verticalAlign === 'bottom' ? Math.round(y + height - textHeight - 8) : Math.round(y + 8));

  const container = {
    id: containerId,
    type: shapeType,
    x,
    y,
    width,
    height,
    ...defaultStyles,
    backgroundColor: options.backgroundColor || '#ffffff',
    strokeColor: options.strokeColor || '#1e293b',
    fillStyle: options.fillStyle || 'solid',
    strokeWidth: options.strokeWidth ?? 2,
    roundness: options.roundness !== undefined ? options.roundness : (shapeType === 'rectangle' ? { type: 2 } : null),
    roughness: options.roughness ?? 0,
    boundElements: [{ type: 'text', id: textId }],
    groupIds,
    customData: options.customData,
    ...(options.containerProps || {}),
  };

  const textElement = {
    id: textId,
    type: 'text',
    x: textX,
    y: textY,
    width: textWidth,
    height: textHeight,
    text,
    originalText: text,
    fontSize: fontSize,
    fontFamily: options.fontFamily || 1,
    textAlign: textAlign,
    verticalAlign: verticalAlign,
    baseline: 18,
    lineHeight: 1.25,
    autoResize: true,
    containerId: containerId,
    ...defaultStyles,
    strokeWidth: 1,
    strokeColor: options.strokeColor || '#1e293b',
    groupIds,
    customData: options.customData,
    ...(options.textProps || {}),
  };

  return { container, textElement };
}

export function createLine(x: number, y: number, dx: number, dy: number, customProps: any = {}) {
  const points = [[0, 0], [dx, dy]];
  
  const minX = Math.min(...points.map(p => p[0]));
  const maxX = Math.max(...points.map(p => p[0]));
  const minY = Math.min(...points.map(p => p[1]));
  const maxY = Math.max(...points.map(p => p[1]));

  return {
    id: generateId(),
    type: "line",
    x: x,
    y: y,
    width: maxX - minX,
    height: maxY - minY,
    points: points,
    ...defaultStyles,
    ...customProps,
  };
}

export function createArrow(x: number, y: number, points: number[][], customProps: any = {}) {
  const startX = points[0][0];
  const startY = points[0][1];
  const normalizedPoints = points.map(p => [p[0] - startX, p[1] - startY]);
  
  const minX = Math.min(...normalizedPoints.map(p => p[0]));
  const maxX = Math.max(...normalizedPoints.map(p => p[0]));
  const minY = Math.min(...normalizedPoints.map(p => p[1]));
  const maxY = Math.max(...normalizedPoints.map(p => p[1]));

  return {
    id: generateId(),
    type: "arrow",
    x,
    y,
    width: maxX - minX,
    height: maxY - minY,
    points: normalizedPoints,
    ...defaultStyles,
    ...customProps,
  };
}

export function createEllipse(x: number, y: number, width: number, height: number, customProps: any = {}) {
  return {
    id: generateId(),
    type: "ellipse",
    x,
    y,
    width,
    height,
    ...defaultStyles,
    backgroundColor: "#ffffff",
    fillStyle: "solid",
    ...customProps,
  };
}

export function createDiamond(x: number, y: number, width: number, height: number, customProps: any = {}) {
  return {
    id: generateId(),
    type: "diamond",
    x,
    y,
    width,
    height,
    ...defaultStyles,
    backgroundColor: "#ffffff",
    fillStyle: "solid",
    ...customProps,
  };
}

export function createImage(x: number, y: number, width: number, height: number, fileId: string, customProps: any = {}) {
  return {
    id: generateId(),
    type: "image",
    x,
    y,
    width,
    height,
    fileId,
    scale: [1, 1],
    ...defaultStyles,
    ...customProps,
  };
}
