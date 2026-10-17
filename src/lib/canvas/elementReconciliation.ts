/**
 * DesignDojo Canvas Element Reconciliation Engine
 * 
 * Ensures robust synchronization, contiguous zero-gap attachment, locked container text binding,
 * accurate text centering, and dynamic auto-expansion of canvas elements across LLD, HLD, and AI generator diagrams.
 */

import { createText, createLine } from '@/components/canvas/plugins/lld/utils/elementGenerator';

export interface ReconciliationResult {
  elements: any[];
  changed: boolean;
}

/**
 * Calculates estimated text rendering dimensions based on font size and line count.
 */
export function estimateTextDimensions(
  text: string,
  fontSize: number = 14
): { width: number; height: number; lineCount: number } {
  if (!text || text === '') {
    return { width: 30, height: Math.round(fontSize * 1.3), lineCount: 1 };
  }
  const lines = text.split('\n');
  const lineCount = Math.max(1, lines.length);
  const maxLineLength = Math.max(...lines.map(l => l.length), 1);
  
  // Approximate character width in Virgil / Helvetica fonts
  const charWidth = fontSize * 0.55;
  const lineHeight = fontSize * 1.32;
  
  return {
    width: Math.round(maxLineLength * charWidth + 16),
    height: Math.round(lineCount * lineHeight),
    lineCount,
  };
}

/**
 * Reconciles and synchronizes canvas elements in real-time.
 * 
 * Guarantees:
 * 1. All sections of multi-box composites (UML Class, Enum, Object) have identical width and X position.
 * 2. When any section is resized horizontally, all sibling sections immediately sync to that width and X.
 * 3. Stacked sections are strictly contiguous without gaps or overlaps (section[i].y = section[i-1].y + height).
 * 4. Containers dynamically expand in height when user enters multi-line text (pressing Enter / adding lines).
 * 5. Text elements are firmly bound to their containers (`containerId` and `boundElements`) and centered/aligned properly.
 * 6. Attached accessory elements (Component ports, 3D device lines, HLD shadows/icons) stay perfectly positioned.
 */
export function reconcileCanvasElements(
  elements: readonly any[],
  activeEditingTextId?: string | null
): ReconciliationResult {
  if (!elements || !Array.isArray(elements) || elements.length === 0) {
    return { elements: [], changed: false };
  }

  let hasChanged = false;
  // Clone element array so we can mutate safely
  const elementMap = new Map<string, any>();
  const clonedElements: any[] = elements.map(el => {
    if (!el || typeof el !== 'object') return el;
    const cloned = { ...el };
    elementMap.set(cloned.id, cloned);
    return cloned;
  });

  // Group elements by cardId or top-level groupId
  const groupToElements = new Map<string, any[]>();
  const ungroupedElements: any[] = [];

  clonedElements.forEach(el => {
    if (el.isDeleted) return;
    const cardId = el.customData?.cardId;
    const mainGroupId = el.groupIds && Array.isArray(el.groupIds) && el.groupIds.length > 0 ? el.groupIds[0] : null;
    const groupingKey = cardId || mainGroupId;

    if (groupingKey) {
      if (!groupToElements.has(groupingKey)) {
        groupToElements.set(groupingKey, []);
      }
      groupToElements.get(groupingKey)!.push(el);
    } else {
      ungroupedElements.push(el);
    }
  });

  // Process grouped elements (LLD / HLD composite nodes)
  groupToElements.forEach((groupEls) => {
    if (groupEls.length === 0) return;

    // Detect node type from customData or visual structure
    const customDataEl = groupEls.find(e => e.customData?.diagramType || e.customData?.nodeType || e.customData?.type);
    const nodeType = customDataEl?.customData?.nodeType || customDataEl?.customData?.id || '';

    const rectangles = groupEls.filter(e => e.type === 'rectangle');
    const texts = groupEls.filter(e => e.type === 'text');
    const lines = groupEls.filter(e => e.type === 'line');
    const images = groupEls.filter(e => e.type === 'image');

    // -------------------------------------------------------------
    // 1. UNIFIED 4-CORNER ROUNDED UML CARD (Class, Interface, AbstractClass, Enum, Object)
    // -------------------------------------------------------------
    const isUMLNodeType = (
      nodeType === 'Class' ||
      nodeType === 'Interface' ||
      nodeType === 'AbstractClass' ||
      nodeType === 'abstract' ||
      nodeType === 'interface' ||
      nodeType === 'Enum' ||
      nodeType === 'Object' ||
      customDataEl?.customData?.diagramType === 'Class Diagram' ||
      customDataEl?.customData?.diagramType === 'Object Diagram'
    );

    if (rectangles.length === 1 && (lines.length >= 1 || texts.length >= 1 || isUMLNodeType)) {
      const card = rectangles[0];

      // Enforce 4 standard rounded outer borders (adaptive radius type: 3)
      if (card.roundness?.type !== 3) {
        card.roundness = { type: 3 };
        hasChanged = true;
      }

      // Ensure no containerId binding on container itself
      if (card.boundElements && card.boundElements.length > 0) {
        card.boundElements = [];
        hasChanged = true;
      }

      const isInterface = nodeType === 'Interface' || nodeType === 'interface';
      const isAbstract = nodeType === 'AbstractClass' || nodeType === 'abstract';
      const isEnum = nodeType === 'Enum';
      const isObj = nodeType === 'Object';

      // 1. Clean up rogue empty text elements (e.g. from accidental double clicks)
      const expectedCount = isInterface || isEnum || isObj || (lines.length === 1 && !isAbstract && nodeType !== 'Class') ? 2 : 3;
      if (texts.length > expectedCount) {
        for (let i = texts.length - 1; i >= 0 && texts.length > expectedCount; i--) {
          const t = texts[i];
          const isEmpty = (!t.text || !t.text.trim()) && (!t.originalText || !t.originalText.trim());
          if (isEmpty && t.id !== activeEditingTextId) {
            t.isDeleted = true;
            texts.splice(i, 1);
            hasChanged = true;
          }
        }
      }

      // 2. Identify Compartment Texts by Permanent Role or Structure
      let headerText = texts.find(t => t.customData?.role === 'header');
      let attrText = texts.find(t => t.customData?.role === 'attributes' || t.customData?.role === 'values');
      let methodText = texts.find(t => t.customData?.role === 'methods');

      if (!headerText) {
        headerText = texts.find(t => (t.text || t.originalText || '').includes('<<')) ||
                     texts.find(t => t !== attrText && t !== methodText && !(t.text || t.originalText || '').includes('(') && !(t.text || t.originalText || '').startsWith('+')) ||
                     texts[0];
      }
      if (headerText) {
        if (!headerText.customData) headerText.customData = {};
        headerText.customData.role = 'header';
      }

      if (expectedCount === 3) {
        if (!methodText) {
          methodText = texts.find(t => t !== headerText && t !== attrText && (t.text || t.originalText || '').includes('(') && (t.text || t.originalText || '').includes(')')) ||
                       texts.find(t => t !== headerText && t !== attrText && t.y > (card.y + 70));
        }
        if (methodText) {
          if (!methodText.customData) methodText.customData = {};
          methodText.customData.role = 'methods';
        }

        if (!attrText) {
          attrText = texts.find(t => t !== headerText && t !== methodText);
        }
        if (attrText) {
          if (!attrText.customData) attrText.customData = {};
          attrText.customData.role = 'attributes';
        }
      } else {
        if (!methodText && !attrText) {
          const secondText = texts.find(t => t !== headerText);
          if (secondText) {
            if (!secondText.customData) secondText.customData = {};
            secondText.customData.role = isInterface ? 'methods' : (isEnum ? 'values' : 'attributes');
            if (isInterface) methodText = secondText;
            else attrText = secondText;
          }
        }
      }

      // 3. Recreate or fill any missing/empty compartment texts with default content
      const defaultHeader = isInterface ? '<<interface>>\nInterface' : (isAbstract ? '<<abstract>>\nAbstractClass' : (isEnum ? '<<enum>>\nEnumName' : (isObj ? 'object1 : ClassName' : 'ClassName')));
      if (!headerText) {
        headerText = createText(card.x + 12, card.y + 10, defaultHeader, {
          groupIds: card.groupIds ? [...card.groupIds] : [],
          containerId: null,
          fontSize: 16,
          textAlign: 'center',
          customData: { role: 'header' },
        });
        clonedElements.push(headerText);
        texts.push(headerText);
        groupEls.push(headerText);
        hasChanged = true;
      } else if ((!headerText.text?.trim()) && (!headerText.originalText?.trim()) && headerText.id !== activeEditingTextId) {
        headerText.text = defaultHeader;
        headerText.originalText = defaultHeader;
        hasChanged = true;
      }

      if (expectedCount === 3 && !attrText) {
        attrText = createText(card.x + 12, card.y + 50, '+ attribute: type', {
          groupIds: card.groupIds ? [...card.groupIds] : [],
          containerId: null,
          fontSize: 14,
          textAlign: 'left',
          customData: { role: 'attributes' },
        });
        clonedElements.push(attrText);
        texts.push(attrText);
        groupEls.push(attrText);
        hasChanged = true;
      } else if (attrText && (!attrText.text?.trim()) && (!attrText.originalText?.trim()) && attrText.id !== activeEditingTextId) {
        attrText.text = '+ attribute: type';
        attrText.originalText = '+ attribute: type';
        hasChanged = true;
      }

      if (expectedCount === 3 && !methodText) {
        const defaultMethod = isAbstract ? '+ abstractMethod(): void\n+ method(): returnType' : '+ method(): returnType';
        methodText = createText(card.x + 12, card.y + 90, defaultMethod, {
          groupIds: card.groupIds ? [...card.groupIds] : [],
          containerId: null,
          fontSize: 14,
          textAlign: 'left',
          customData: { role: 'methods' },
        });
        clonedElements.push(methodText);
        texts.push(methodText);
        groupEls.push(methodText);
        hasChanged = true;
      } else if (methodText && (!methodText.text?.trim()) && (!methodText.originalText?.trim()) && methodText.id !== activeEditingTextId) {
        const defaultMethod = isAbstract ? '+ abstractMethod(): void\n+ method(): returnType' : '+ method(): returnType';
        methodText.text = defaultMethod;
        methodText.originalText = defaultMethod;
        hasChanged = true;
      } else if (expectedCount === 2 && !methodText && !attrText) {
        const defaultBody = isInterface ? '+ method(): returnType' : (isEnum ? 'VALUE_1\nVALUE_2\nVALUE_3' : 'attribute1 = value1');
        const role = isInterface ? 'methods' : (isEnum ? 'values' : 'attributes');
        const newBody = createText(card.x + 12, card.y + 50, defaultBody, {
          groupIds: card.groupIds ? [...card.groupIds] : [],
          containerId: null,
          fontSize: 14,
          textAlign: 'left',
          customData: { role },
        });
        if (isInterface) methodText = newBody;
        else attrText = newBody;
        clonedElements.push(newBody);
        texts.push(newBody);
        groupEls.push(newBody);
        hasChanged = true;
      }

      // Ordered list of compartments:
      const compartmentTexts: any[] = expectedCount === 3
        ? [headerText, attrText, methodText]
        : [headerText, methodText || attrText];

      // 4. Calculate compartment heights & min required width
      let minRequiredWidth = 180;
      const sectionHeights: number[] = [];

      compartmentTexts.forEach((t, idx) => {
        if (!t) return;
        if (t.containerId !== null) {
          t.containerId = null;
          hasChanged = true;
        }
        if (!t.text && t.originalText) {
          t.text = t.originalText;
          hasChanged = true;
        }

        const isHeader = (idx === 0);
        const expectedFontSize = isHeader ? 16 : 14;

        // Lock typography to prevent Excalidraw group-scale from distorting font size
        if (t.fontSize !== expectedFontSize) {
          t.fontSize = expectedFontSize;
          hasChanged = true;
        }
        if (t.scale && (t.scale[0] !== 1 || t.scale[1] !== 1)) {
          t.scale = [1, 1];
          hasChanged = true;
        }

        const textContent = t.text || t.originalText || '';
        const est = estimateTextDimensions(textContent, expectedFontSize);
        minRequiredWidth = Math.max(minRequiredWidth, est.width + 32);

        const hasStereotype = isHeader && textContent.includes('<<');
        const minBaseHeight = isHeader ? (hasStereotype ? 56 : 38) : 38;
        const effectiveH = est.height;
        const reqHeight = Math.max(minBaseHeight, effectiveH + 16);
        sectionHeights.push(reqHeight);
      });

      const targetWidth = Math.max(card.width, minRequiredWidth);
      if (Math.abs(card.width - targetWidth) > 1) {
        card.width = targetWidth;
        hasChanged = true;
      }

      const totalMinHeight = sectionHeights.reduce((sum, h) => sum + h, 0);
      const targetHeight = Math.max(card.height, totalMinHeight);
      if (Math.abs(card.height - targetHeight) > 1) {
        card.height = targetHeight;
        hasChanged = true;
      }

      // Distribute extra height across body compartments so user can freely resize height!
      const extraHeight = Math.max(0, card.height - totalMinHeight);
      const bodyCount = compartmentTexts.length - 1;
      const extraPerBody = bodyCount > 0 ? extraHeight / bodyCount : extraHeight;

      const finalSectionHeights = sectionHeights.map((h, idx) => {
        if (idx === 0) return h;
        return h + extraPerBody;
      });

      // 5. Ensure required number of divider lines exist (expectedCount - 1)
      const expectedLines = expectedCount - 1;
      while (lines.length < expectedLines) {
        const newLine = createLine(card.x, card.y + 50, card.width, 0, {
          groupIds: card.groupIds ? [...card.groupIds] : [],
          strokeColor: card.strokeColor || '#1e293b',
          strokeWidth: 1.5,
        });
        clonedElements.push(newLine);
        lines.push(newLine);
        groupEls.push(newLine);
        hasChanged = true;
      }

      if (lines.length > expectedLines) {
        for (let i = expectedLines; i < lines.length; i++) {
          if (!lines[i].isDeleted) {
            lines[i].isDeleted = true;
            hasChanged = true;
          }
        }
      }

      lines.sort((a, b) => a.y - b.y);

      // 6. Position divider lines and compartment texts cleanly
      let currentY = card.y;

      compartmentTexts.forEach((t, idx) => {
        if (!t) return;
        const isHeader = (idx === 0);
        const isCurrentlyEditingThis = !!(activeEditingTextId && t.id === activeEditingTextId);
        const secH = finalSectionHeights[idx];

        // Divider line above this section
        if (idx > 0 && lines[idx - 1]) {
          const line = lines[idx - 1];
          if (
            Math.abs(line.x - card.x) > 1 ||
            Math.abs(line.y - currentY) > 1 ||
            Math.abs(line.width - card.width) > 1 ||
            !line.points ||
            line.points[1]?.[0] !== card.width
          ) {
            line.x = card.x;
            line.y = currentY;
            line.points = [[0, 0], [card.width, 0]];
            line.width = card.width;
            line.height = 0;
            line.strokeColor = card.strokeColor || '#1e293b';
            line.strokeWidth = 1.5;
            hasChanged = true;
          }
        }

        if (!isCurrentlyEditingThis) {
          const expectedFontSize = isHeader ? 16 : 14;
          const est = estimateTextDimensions(t.text || t.originalText || '', expectedFontSize);
          if (t.width !== est.width) {
            t.width = est.width;
            hasChanged = true;
          }
          if (t.height !== est.height) {
            t.height = est.height;
            hasChanged = true;
          }

          t.autoResize = true;
          t.textAlign = isHeader ? 'center' : 'left';
          t.verticalAlign = 'middle';

          const expX = isHeader
            ? Math.round(card.x + (card.width - est.width) / 2)
            : Math.round(card.x + 12);
          const expY = Math.round(currentY + (secH - est.height) / 2);

          if (Math.abs(t.x - expX) > 2) {
            t.x = expX;
            hasChanged = true;
          }
          if (Math.abs(t.y - expY) > 2) {
            t.y = expY;
            hasChanged = true;
          }
        }

        currentY += secH;
      });

      return;
    }

    // -------------------------------------------------------------
    // 2. CONVERT MULTI-RECTANGLE UML TO 4-CORNER ROUNDED CARD (Class, Interface, AbstractClass, Enum, Object)
    // -------------------------------------------------------------
    const isStackedUML = (
      nodeType === 'Class' ||
      nodeType === 'Interface' ||
      nodeType === 'AbstractClass' ||
      nodeType === 'abstract' ||
      nodeType === 'interface' ||
      nodeType === 'Enum' ||
      nodeType === 'Object' ||
      customDataEl?.customData?.diagramType === 'Class Diagram' ||
      customDataEl?.customData?.diagramType === 'Object Diagram'
    );

    if (isStackedUML && rectangles.length >= 2) {
      rectangles.sort((a, b) => a.y - b.y);
      const card = rectangles[0];
      card.roundness = { type: 3 };

      const extraRects = rectangles.slice(1);
      extraRects.forEach(r => {
        if (!r.isDeleted) {
          r.isDeleted = true;
          hasChanged = true;
        }
      });
      return;
    }

    // -------------------------------------------------------------
    // 2. PACKAGE NODE (Tab + Body)
    // -------------------------------------------------------------
    if (nodeType === 'Package' || (rectangles.length === 2 && nodeType.includes('Package'))) {
      rectangles.sort((a, b) => a.y - b.y);
      const tab = rectangles[0];
      const body = rectangles[1];

      if (tab.roundness !== null) { tab.roundness = null; hasChanged = true; }
      if (body.roundness !== null) { body.roundness = null; hasChanged = true; }

      const bodyText = texts.find(t => t.containerId === body.id) || texts[0];
      if (bodyText) {
        if (bodyText.containerId !== body.id) {
          bodyText.containerId = body.id;
          hasChanged = true;
        }
        if (!body.boundElements || !body.boundElements.some((b: any) => b.id === bodyText.id)) {
          body.boundElements = [{ type: 'text', id: bodyText.id }];
          hasChanged = true;
        }

        if (bodyText.scale && (bodyText.scale[0] !== 1 || bodyText.scale[1] !== 1)) {
          bodyText.scale = [1, 1];
          hasChanged = true;
        }

        const isCurrentlyEditingThis = !!(activeEditingTextId && bodyText.id === activeEditingTextId);
        const est = estimateTextDimensions(bodyText.text || bodyText.originalText || '', bodyText.fontSize || 16);
        const effectiveH = Math.max(bodyText.height || 0, est.height);

        const reqHeight = Math.max(80, effectiveH + 24);
        if (body.height < reqHeight - 2) {
          body.height = reqHeight;
          hasChanged = true;
        }

        if (!isCurrentlyEditingThis) {
          if (!bodyText.width || bodyText.width <= 0 || bodyText.width > body.width - 10) {
            bodyText.width = est.width;
            hasChanged = true;
          }
          if (!bodyText.height || bodyText.height <= 0) {
            bodyText.height = est.height;
            hasChanged = true;
          }

          const textW = bodyText.width;
          const textH = bodyText.height;
          const expX = Math.round(body.x + (body.width - textW) / 2);
          const expY = Math.round(body.y + (body.height - textH) / 2);
          if (Math.abs(bodyText.x - expX) > 2) { bodyText.x = expX; hasChanged = true; }
          if (Math.abs(bodyText.y - expY) > 2) { bodyText.y = expY; hasChanged = true; }
        }
      }

      // Ensure Tab stays attached to top-left of Body
      const expectedTabY = body.y - tab.height;
      if (Math.abs(tab.x - body.x) > 1 || Math.abs(tab.y - expectedTabY) > 1) {
        tab.x = body.x;
        tab.y = expectedTabY;
        hasChanged = true;
      }

      return;
    }

    // -------------------------------------------------------------
    // 3. COMPONENT NODE (Main Body + Left Ports)
    // -------------------------------------------------------------
    if (nodeType === 'Component' && rectangles.length >= 3) {
      rectangles.sort((a, b) => (b.width * b.height) - (a.width * a.height));
      const mainBody = rectangles[0];
      const ports = rectangles.slice(1);

      if (mainBody.roundness !== null) { mainBody.roundness = null; hasChanged = true; }

      const mainText = texts.find(t => t.containerId === mainBody.id) || texts[0];
      if (mainText) {
        if (mainText.containerId !== mainBody.id) {
          mainText.containerId = mainBody.id;
          hasChanged = true;
        }
        if (!mainBody.boundElements || !mainBody.boundElements.some((b: any) => b.id === mainText.id)) {
          mainBody.boundElements = [{ type: 'text', id: mainText.id }];
          hasChanged = true;
        }

        if (mainText.scale && (mainText.scale[0] !== 1 || mainText.scale[1] !== 1)) {
          mainText.scale = [1, 1];
          hasChanged = true;
        }

        const isCurrentlyEditingThis = !!(activeEditingTextId && mainText.id === activeEditingTextId);
        const est = estimateTextDimensions(mainText.text || mainText.originalText || '', mainText.fontSize || 16);
        const effectiveH = Math.max(mainText.height || 0, est.height);

        const reqHeight = Math.max(80, effectiveH + 24);
        if (mainBody.height < reqHeight - 2) {
          mainBody.height = reqHeight;
          hasChanged = true;
        }

        if (!isCurrentlyEditingThis) {
          if (!mainText.width || mainText.width <= 0 || mainText.width > mainBody.width - 10) {
            mainText.width = est.width;
            hasChanged = true;
          }
          if (!mainText.height || mainText.height <= 0) {
            mainText.height = est.height;
            hasChanged = true;
          }

          const textW = mainText.width;
          const textH = mainText.height;
          const expX = Math.round(mainBody.x + (mainBody.width - textW) / 2);
          const expY = Math.round(mainBody.y + (mainBody.height - textH) / 2);
          if (Math.abs(mainText.x - expX) > 2) { mainText.x = expX; hasChanged = true; }
          if (Math.abs(mainText.y - expY) > 2) { mainText.y = expY; hasChanged = true; }
        }
      }

      // Keep ports on left border
      const portWidth = ports[0]?.width || 20;
      const portHeight = ports[0]?.height || 12;
      const expectedPortX = mainBody.x - portWidth / 2;

      if (ports[0]) {
        const expectedY1 = mainBody.y + mainBody.height / 3 - portHeight / 2;
        if (Math.abs(ports[0].x - expectedPortX) > 1 || Math.abs(ports[0].y - expectedY1) > 1) {
          ports[0].x = expectedPortX;
          ports[0].y = expectedY1;
          hasChanged = true;
        }
      }

      if (ports[1]) {
        const expectedY2 = mainBody.y + (2 * mainBody.height) / 3 - portHeight / 2;
        if (Math.abs(ports[1].x - expectedPortX) > 1 || Math.abs(ports[1].y - expectedY2) > 1) {
          ports[1].x = expectedPortX;
          ports[1].y = expectedY2;
          hasChanged = true;
        }
      }

      return;
    }

    // -------------------------------------------------------------
    // 4. DEPLOYMENT DIAGRAM (Device Node with 3D lines)
    // -------------------------------------------------------------
    if (nodeType === 'Device' && rectangles.length >= 1 && lines.length >= 5) {
      const front = rectangles[0];
      const text = texts.find(t => t.containerId === front.id) || texts[0];
      
      if (text) {
        if (text.containerId !== front.id) {
          text.containerId = front.id;
          hasChanged = true;
        }
        if (!front.boundElements || !front.boundElements.some((b: any) => b.id === text.id)) {
          front.boundElements = [{ type: 'text', id: text.id }];
          hasChanged = true;
        }

        if (text.scale && (text.scale[0] !== 1 || text.scale[1] !== 1)) {
          text.scale = [1, 1];
          hasChanged = true;
        }

        const isCurrentlyEditingThis = !!(activeEditingTextId && text.id === activeEditingTextId);
        const est = estimateTextDimensions(text.text || text.originalText || '', text.fontSize || 16);
        const effectiveH = Math.max(text.height || 0, est.height);

        const reqHeight = Math.max(70, effectiveH + 32);
        if (front.height < reqHeight - 2) {
          front.height = reqHeight;
          hasChanged = true;
        }

        if (!isCurrentlyEditingThis) {
          if (!text.width || text.width <= 0 || text.width > front.width - 10) {
            text.width = est.width;
            hasChanged = true;
          }
          if (!text.height || text.height <= 0) {
            text.height = est.height;
            hasChanged = true;
          }

          const textW = text.width;
          const expX = Math.round(front.x + (front.width - textW) / 2);
          const expY = Math.round(front.y + 24);
          if (Math.abs(text.x - expX) > 2) { text.x = expX; hasChanged = true; }
          if (Math.abs(text.y - expY) > 2) { text.y = expY; hasChanged = true; }
        }
      }

      const dx = 20;
      const dy = -20;

      // Line 0: Top-Left to Back-Top-Left
      if (lines[0]) {
        lines[0].x = front.x;
        lines[0].y = front.y;
        lines[0].points = [[0, 0], [dx, dy]];
        lines[0].width = dx;
        lines[0].height = Math.abs(dy);
      }
      // Line 1: Back-Top-Left to Back-Top-Right
      if (lines[1]) {
        lines[1].x = front.x + dx;
        lines[1].y = front.y + dy;
        lines[1].points = [[0, 0], [front.width, 0]];
        lines[1].width = front.width;
        lines[1].height = 0;
      }
      // Line 2: Top-Right to Back-Top-Right
      if (lines[2]) {
        lines[2].x = front.x + front.width;
        lines[2].y = front.y;
        lines[2].points = [[0, 0], [dx, dy]];
        lines[2].width = dx;
        lines[2].height = Math.abs(dy);
      }
      // Line 3: Back-Top-Right to Back-Bottom-Right
      if (lines[3]) {
        lines[3].x = front.x + front.width + dx;
        lines[3].y = front.y + dy;
        lines[3].points = [[0, 0], [0, front.height]];
        lines[3].width = 0;
        lines[3].height = front.height;
      }
      // Line 4: Bottom-Right to Back-Bottom-Right
      if (lines[4]) {
        lines[4].x = front.x + front.width;
        lines[4].y = front.y + front.height;
        lines[4].points = [[0, 0], [dx, dy]];
        lines[4].width = dx;
        lines[4].height = Math.abs(dy);
      }

      return;
    }

    // -------------------------------------------------------------
    // 5. HLD NODE (Shadow + Main Box + Icon + Text)
    // -------------------------------------------------------------
    if (customDataEl?.customData?.type === 'node' && rectangles.length >= 1) {
      rectangles.sort((a, b) => a.y - b.y);
      const isShadow = (r: any) => r.backgroundColor === '#0f172a15' || r.strokeColor === 'transparent';
      const shadow = rectangles.find(isShadow);
      const mainBox = rectangles.find(r => !isShadow(r)) || rectangles[0];

      if (mainBox) {
        if (mainBox.roundness?.type === 3) { mainBox.roundness = { type: 2 }; hasChanged = true; }
        if (shadow && shadow.roundness?.type === 3) { shadow.roundness = { type: 2 }; hasChanged = true; }
        const text = texts.find(t => t.containerId === mainBox.id) || texts[0];
        const icon = images[0];

        if (text) {
          if (text.containerId !== mainBox.id) {
            text.containerId = mainBox.id;
            hasChanged = true;
          }
          if (!mainBox.boundElements || !mainBox.boundElements.some((b: any) => b.id === text.id)) {
            mainBox.boundElements = [{ type: 'text', id: text.id }];
            hasChanged = true;
          }

          if (text.scale && (text.scale[0] !== 1 || text.scale[1] !== 1)) {
            text.scale = [1, 1];
            hasChanged = true;
          }

          const isCurrentlyEditingThis = !!(activeEditingTextId && text.id === activeEditingTextId);
          const est = estimateTextDimensions(text.text || text.originalText || '', text.fontSize || 16);
          const effectiveH = Math.max(text.height || 0, est.height);

          const reqHeight = Math.max(50, effectiveH + 20);
          if (mainBox.height < reqHeight - 2) {
            mainBox.height = reqHeight;
            hasChanged = true;
          }

          if (!isCurrentlyEditingThis) {
            if (!text.width || text.width <= 0 || text.width > mainBox.width - 10) {
              text.width = est.width;
              hasChanged = true;
            }
            if (!text.height || text.height <= 0) {
              text.height = est.height;
              hasChanged = true;
            }

            const textH = text.height;
            const hasIcon = !!icon;
            const textX = hasIcon ? mainBox.x + 60 : mainBox.x + 20;
            const textY = Math.round(mainBox.y + (mainBox.height - textH) / 2);

            if (Math.abs(text.x - textX) > 2) { text.x = textX; hasChanged = true; }
            if (Math.abs(text.y - textY) > 2) { text.y = textY; hasChanged = true; }
          }
        }

        if (icon) {
          const iconSize = 32;
          const iconX = mainBox.x + 16;
          const iconY = Math.round(mainBox.y + (mainBox.height - iconSize) / 2);
          if (Math.abs(icon.x - iconX) > 2) { icon.x = iconX; hasChanged = true; }
          if (Math.abs(icon.y - iconY) > 2) { icon.y = iconY; hasChanged = true; }
        }

        if (shadow) {
          if (Math.abs(shadow.x - mainBox.x) > 1) { shadow.x = mainBox.x; hasChanged = true; }
          if (Math.abs(shadow.y - (mainBox.y + 4)) > 1) { shadow.y = mainBox.y + 4; hasChanged = true; }
          if (Math.abs(shadow.width - mainBox.width) > 1) { shadow.width = mainBox.width; hasChanged = true; }
          if (Math.abs(shadow.height - mainBox.height) > 1) { shadow.height = mainBox.height; hasChanged = true; }
        }
      }

      return;
    }

    // -------------------------------------------------------------
    // 6. SINGLE-CONTAINER SHAPES (Note, UseCase, Action, Decision, Artifact)
    // -------------------------------------------------------------
    const primaryContainer = rectangles[0] || groupEls.find(e => e.type === 'ellipse' || e.type === 'diamond');
    const primaryText = texts[0];

    if (primaryContainer && primaryText) {
      if (primaryText.containerId !== primaryContainer.id) {
        primaryText.containerId = primaryContainer.id;
        hasChanged = true;
      }
      if (!primaryContainer.boundElements || !primaryContainer.boundElements.some((b: any) => b.id === primaryText.id)) {
        primaryContainer.boundElements = [{ type: 'text', id: primaryText.id }];
        hasChanged = true;
      }

      if (primaryText.scale && (primaryText.scale[0] !== 1 || primaryText.scale[1] !== 1)) {
        primaryText.scale = [1, 1];
        hasChanged = true;
      }

      const isCurrentlyEditingThis = !!(activeEditingTextId && primaryText.id === activeEditingTextId);
      const est = estimateTextDimensions(primaryText.text || primaryText.originalText || '', primaryText.fontSize || 16);
      const effectiveH = Math.max(primaryText.height || 0, est.height);

      // Auto-expand container height if needed
      const minPadding = primaryContainer.type === 'ellipse' ? 32 : 20;
      const reqHeight = effectiveH + minPadding;
      if (primaryContainer.height < reqHeight - 2) {
        primaryContainer.height = reqHeight;
        hasChanged = true;
      }

      if (!isCurrentlyEditingThis) {
        if (!primaryText.width || primaryText.width <= 0 || primaryText.width > primaryContainer.width - 10) {
          primaryText.width = est.width;
          hasChanged = true;
        }
        if (!primaryText.height || primaryText.height <= 0) {
          primaryText.height = est.height;
          hasChanged = true;
        }

        const textW = primaryText.width;
        const textH = primaryText.height;

        const reqWidth = textW + minPadding;
        if (primaryContainer.width < reqWidth - 2) {
          primaryContainer.width = reqWidth;
          hasChanged = true;
        }

        // Position text centered inside container
        const isLeft = (primaryText.textAlign === 'left');
        const expX = isLeft
          ? Math.round(primaryContainer.x + 12)
          : Math.round(primaryContainer.x + (primaryContainer.width - textW) / 2);
        
        const isTop = (primaryText.verticalAlign === 'top');
        const expY = isTop
          ? Math.round(primaryContainer.y + 10)
          : Math.round(primaryContainer.y + (primaryContainer.height - textH) / 2);

        if (Math.abs(primaryText.x - expX) > 2) { primaryText.x = expX; hasChanged = true; }
        if (Math.abs(primaryText.y - expY) > 2) { primaryText.y = expY; hasChanged = true; }
      }
    }
  });

  // Also enforce containerId <-> boundElements for any ungrouped bound pairs
  ungroupedElements.forEach(el => {
    if (el.type === 'text' && el.containerId) {
      const container = elementMap.get(el.containerId);
      if (container) {
        if (!container.boundElements || !container.boundElements.some((b: any) => b.id === el.id)) {
          container.boundElements = [{ type: 'text', id: el.id }];
          hasChanged = true;
        }
      }
    }
  });

  return {
    elements: clonedElements,
    changed: hasChanged,
  };
}
