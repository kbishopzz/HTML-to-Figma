import { JsonNode, ConversionOptions } from '../types';
import { parseDimension, parseColor, isTransparentColor } from '../utils/color-utils';
import { sanitizeFontFamily, mapFontWeightToStyle, loadFontWithFallback } from '../utils/font-utils';
import { applyBorderStyles, applyShadowStyles, applyAutoLayout } from '../utils/style-utils';
import { generateNodeName, shouldNodeBeVisible } from '../utils/node-utils';

/**
 * Create a text node from HTML JSON
 */
export async function createHtmlTextNode(
  node: JsonNode,
  _options?: ConversionOptions
): Promise<TextNode> {
  const textNode = figma.createText();
  const textContent = (node.text ?? '').trim();

  // Load font
  const fontFamily = node.styles?.fontFamily
    ? sanitizeFontFamily(node.styles.fontFamily)
    : 'Inter';
  const fontWeight = node.styles?.fontWeight;
  const fontStyle = mapFontWeightToStyle(fontWeight);
  const appliedFont = await loadFontWithFallback(fontFamily, fontStyle);
  
  textNode.fontName = appliedFont;
  textNode.characters = textContent || ' ';

  // Set auto-resize BEFORE applying size
  textNode.textAutoResize = 'WIDTH_AND_HEIGHT';

  // Apply text styles
  if (node.styles) {
    const fontSize = parseDimension(node.styles.fontSize, 16);
    textNode.fontSize = fontSize;

    if (node.styles.color) {
      textNode.fills = [
        {
          type: 'SOLID',
          color: parseColor(node.styles.color),
        },
      ];
    }

    // Text alignment
    const align = node.styles.textAlign;
    if (align === 'center') {
      textNode.textAlignHorizontal = 'CENTER';
    } else if (align === 'right') {
      textNode.textAlignHorizontal = 'RIGHT';
    } else if (align === 'justify') {
      textNode.textAlignHorizontal = 'JUSTIFIED';
    }

    // Line height
    if (node.styles.lineHeight) {
      const lineHeight = parseDimension(node.styles.lineHeight);
      textNode.lineHeight = { value: lineHeight, unit: 'PIXELS' };
    }

    // Letter spacing
    if (node.styles.letterSpacing) {
      const letterSpacing = parseDimension(node.styles.letterSpacing, 0);
      textNode.letterSpacing = { value: letterSpacing, unit: 'PIXELS' };
    }
  }

  // Handle explicit width
  if (node.position?.absolute?.width) {
    const width = parseDimension(node.position.absolute.width, 200);
    if (width > 0 && width < 10000) {
      textNode.textAutoResize = 'HEIGHT';
      textNode.resize(width, 100);
    }
  }

  return textNode;
}

/**
 * Create an image node from HTML JSON
 */
export function createHtmlImageNode(
  node: JsonNode,
  _options?: ConversionOptions
): RectangleNode {
  const rect = figma.createRectangle();
  rect.name = node.alt ? `img (${node.alt})` : 'img';

  // Visible placeholder
  rect.fills = [
    {
      type: 'SOLID',
      color: { r: 0.9, g: 0.9, b: 0.9 },
    },
  ];
  rect.strokes = [
    {
      type: 'SOLID',
      color: { r: 0.6, g: 0.6, b: 0.6 },
    },
  ];
  rect.strokeWeight = 2;

  // Apply border radius
  if (node.styles?.borderRadius) {
    const radius = parseDimension(node.styles.borderRadius, 0);
    if (radius > 0) {
      rect.cornerRadius = radius;
    }
  }

  return rect;
}

/**
 * Create a frame node from HTML JSON (div, section, etc.)
 */
export function createHtmlFrameNode(
  node: JsonNode,
  _options?: ConversionOptions
): FrameNode {
  const frame = figma.createFrame();
  frame.name = generateNodeName(node);
  
  console.log(`🎨 Creating frame: ${frame.name}`);
  console.log(`🎨 Styles:`, node.styles ? JSON.stringify(node.styles).substring(0, 200) : 'none');

  // Apply background color
  if (node.styles?.backgroundColor) {
    const bgColor = node.styles.backgroundColor;
    console.log(`🎨 Background color: ${bgColor}`);
    if (!isTransparentColor(bgColor)) {
      const parsedColor = parseColor(bgColor);
      console.log(`🎨 Parsed color:`, parsedColor);
      frame.fills = [
        {
          type: 'SOLID',
          color: parsedColor,
        },
      ];
    } else {
      frame.fills = [];
    }
  } else {
    console.log('🎨 No background color');
    frame.fills = [];
  }

  // Apply borders and shadows
  if (node.styles) {
    applyBorderStyles(frame, node.styles);
    applyShadowStyles(frame, node.styles);
    applyAutoLayout(frame, node.styles);
  }

  return frame;
}

/**
 * Main converter for HTML-derived JSON nodes
 */
export async function convertHtmlNode(
  node: JsonNode,
  options: ConversionOptions = {}
): Promise<SceneNode | null> {
  // Check visibility
  if (!shouldNodeBeVisible(node)) {
    console.log('❌ Node not visible:', node.type);
    return null;
  }

  const nodeType = (node.type ?? '').toLowerCase();
  console.log(`✅ Creating node: type="${nodeType}", text="${node.text ? node.text.substring(0, 20) : 'none'}", hasChildren=${!!node.children}, childCount=${node.children?.length || 0}`);
  
  let figmaNode: SceneNode;

  // Create appropriate node type based on text content and type
  // Only create text nodes if there's text AND no children (leaf nodes only)
  const hasText = !!(node.text?.trim());
  const hasNoChildren = !node.children || node.children.length === 0;
  console.log(`  → hasText=${hasText}, hasNoChildren=${hasNoChildren}`);
  
  if (hasText && hasNoChildren) {
    console.log('📝 Creating TEXT node for:', node.text?.substring(0, 30));
    figmaNode = await createHtmlTextNode(node, options);
    console.log('📝 TEXT node created:', figmaNode.type);
  } else if (nodeType === 'img') {
    console.log('🖼️ Creating IMG node');
    figmaNode = createHtmlImageNode(node, options);
  } else {
    // Default to frame for all containers (including nodes with both text and children)
    console.log('📦 Creating FRAME node (nodeType:', nodeType, ')');
    figmaNode = createHtmlFrameNode(node, options);
  }

  // Apply position and size FIRST before adding children
  if (node.position?.absolute) {
    const pos = node.position.absolute;
    const x = parseDimension(pos.x, 0);
    const y = parseDimension(pos.y, 0);
    const width = parseDimension(pos.width, 100);
    const height = parseDimension(pos.height, 100);
    
    console.log(`📐 Position: x=${x}, y=${y}, width=${width}, height=${height}`);
    
    figmaNode.x = x;
    figmaNode.y = y;
    
    // For frames and rectangles, set size
    if ('resize' in figmaNode && figmaNode.type !== 'TEXT') {
      if (width > 0 && height > 0) {
        figmaNode.resize(width, height);
        console.log(`✅ Resized to ${width}x${height}`);
      }
    }
  } else {
    console.log('⚠️ No position data!');
  }

  // Process children recursively
  if (node.children?.length && 'appendChild' in figmaNode) {
    console.log(`👶 Processing ${node.children.length} children`);
    for (const child of node.children) {
      const childNode = await convertHtmlNode(child, options);
      if (childNode) {
        figmaNode.appendChild(childNode);
      }
    }
  }

  return figmaNode;
}
