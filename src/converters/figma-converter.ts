import type { FigmaJsonNode, ConversionOptions, ColorObject } from '../types';
import { parseColor } from '../utils/color-utils';
import { loadFontWithFallback } from '../utils/font-utils';
import { isParentNode } from '../utils/node-utils';

/**
 * Convert a Figma-style JSON node to actual Figma node
 */
export async function convertFigmaNode(
  node: FigmaJsonNode,
  _options: ConversionOptions = {}
): Promise<SceneNode> {
  let figmaNode: SceneNode;

  switch (node.type) {
    case 'FRAME':
      figmaNode = createFigmaFrame(node);
      break;
    case 'RECTANGLE':
      figmaNode = createFigmaRectangle(node);
      break;
    case 'TEXT':
      figmaNode = await createFigmaText(node);
      break;
    case 'IMAGE':
      figmaNode = createFigmaImage(node);
      break;
    default:
      figmaNode = figma.createFrame();
  }

  // Set common properties
  if (node.name) {
    figmaNode.name = node.name;
  }

  // Set position and size
  if (node.absoluteBoundingBox) {
    const bounds = node.absoluteBoundingBox;
    figmaNode.x = bounds.x;
    figmaNode.y = bounds.y;
    if ('resize' in figmaNode) {
      figmaNode.resize(bounds.width, bounds.height);
    }
  }

  // Process children
  if (node.children && Array.isArray(node.children) && isParentNode(figmaNode)) {
    for (const child of node.children) {
      const childNode = await convertFigmaNode(child);
      figmaNode.appendChild(childNode);
    }
  }

  return figmaNode;
}

/**
 * Create Figma frame node
 */
function createFigmaFrame(node: FigmaJsonNode): FrameNode {
  const frame = figma.createFrame();

  // Apply fills
  if (node.fills && Array.isArray(node.fills)) {
    const fills: Paint[] = [];
    for (const fill of node.fills) {
      if (fill.type === 'SOLID' && fill.color) {
        fills.push({
          type: 'SOLID',
          color: parseColor(fill.color),
        });
      }
    }
    if (fills.length > 0) {
      frame.fills = fills;
    } else {
      frame.fills = [];
    }
  } else {
    frame.fills = [];
  }

  // Apply strokes
  if (node.strokes && Array.isArray(node.strokes)) {
    const strokes: Paint[] = [];
    for (const stroke of node.strokes) {
      const s = stroke as { type?: string; color?: string | ColorObject };
      if (s.type === 'SOLID' && s.color) {
        strokes.push({
          type: 'SOLID',
          color: parseColor(s.color) as RGB,
        });
      }
    }
    if (strokes.length > 0) {
      frame.strokes = strokes;
    }
  }

  // Apply corner radius
  if (node.cornerRadius !== undefined) {
    frame.cornerRadius = node.cornerRadius;
  }

  return frame;
}

/**
 * Create Figma rectangle node
 */
function createFigmaRectangle(node: FigmaJsonNode): RectangleNode {
  const rect = figma.createRectangle();

  // Apply corner radius
  if (node.cornerRadius !== undefined) {
    rect.cornerRadius = node.cornerRadius;
  }

  // Apply fills
  if (node.fills && Array.isArray(node.fills)) {
    const fills: Paint[] = [];
    for (const fill of node.fills) {
      if (fill.type === 'SOLID' && fill.color) {
        fills.push({
          type: 'SOLID',
          color: parseColor(fill.color),
        });
      }
    }
    if (fills.length > 0) {
      rect.fills = fills;
    }
  }

  return rect;
}

/**
 * Create Figma text node
 */
async function createFigmaText(node: FigmaJsonNode): Promise<TextNode> {
  const textNode = figma.createText();

  // Get text content
  const textContent = node.characters ?? node.text ?? ' ';

  // Determine font family and style
  const fontFamily = node.style?.fontFamily ?? 'Inter';
  const fontWeight = node.style?.fontWeight;
  
  let fontStyle = 'Regular';
  if (fontWeight) {
    const weight = typeof fontWeight === 'string' ? parseInt(fontWeight, 10) : Number(fontWeight);
    if (!isNaN(weight)) {
      fontStyle = weight >= 700 ? 'Bold' : weight >= 500 ? 'Medium' : 'Regular';
    }
  }

  // Load font
  const appliedFont = await loadFontWithFallback(fontFamily, fontStyle);
  textNode.fontName = appliedFont;
  textNode.characters = String(textContent);

  // Apply font size
  const fontSize = node.style?.fontSize ? Number(node.style.fontSize) : 16;
  if (!isNaN(fontSize) && fontSize > 0) {
    textNode.fontSize = fontSize;
  }

  // Apply text color from style fills
  if (node.style?.fills && Array.isArray(node.style.fills) && node.style.fills.length > 0) {
    const fill = node.style.fills[0];
    if (fill.type === 'SOLID' && fill.color) {
      textNode.fills = [{
        type: 'SOLID',
        color: parseColor(fill.color)
      }];
    }
  }

  // Apply fills directly if present
  if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === 'SOLID' && fill.color) {
      textNode.fills = [{
        type: 'SOLID',
        color: parseColor(fill.color)
      }];
    }
  }

  return textNode;
}

/**
 * Create Figma image node (placeholder rectangle)
 */
function createFigmaImage(_node: FigmaJsonNode): RectangleNode {
  const rect = figma.createRectangle();
  rect.name = 'Image';

  // Gray placeholder
  rect.fills = [
    {
      type: 'SOLID',
      color: { r: 0.85, g: 0.85, b: 0.85 },
    },
  ];

  return rect;
}
