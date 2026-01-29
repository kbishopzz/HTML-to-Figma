import {
  JsonNode,
  ConversionOptions,
  ColorObject,
  NodeCreators,
  FigmaJsonNode,
  Styles,
} from "./types";

// Utility type guard to check if a node can have children
function isParentNode(
  node: SceneNode
): node is FrameNode | GroupNode | ComponentNode {
  return (
    node.type === "FRAME" || node.type === "GROUP" || node.type === "COMPONENT"
  );
}

/**
 * Check if the input is Figma-style JSON
 */
function isFigmaStyleJson(json: any): boolean {
  return (
    json &&
    (json.frames || // Top-level frames array
      json.type === "CANVAS" || // Canvas with children (our format)
      json.type === "FRAME" || // Single frame
      json.type === "RECTANGLE" || // Rectangle element
      json.type === "TEXT" || // Text element
      json.type === "IMAGE") // Image element
  );
}

/**
 * Parse color string/object to Figma color object
 */
export function parseColor(
  color: string | ColorObject | undefined
): ColorObject {
  if (!color) return { r: 0, g: 0, b: 0 };

  // If already a color object
  if (
    typeof color === "object" &&
    "r" in color &&
    "g" in color &&
    "b" in color
  ) {
    return color;
  }

  // If string, parse it
  if (typeof color === "string") {
    // Handle hex colors
    if (color.startsWith("#")) {
      return hexToRgb(color);
    }

    // Handle rgb/rgba colors
    if (color.startsWith("rgb")) {
      const values = color.match(/(\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?/);

      if (values) {
        return {
          r: parseInt(values[1], 10) / 255,
          g: parseInt(values[2], 10) / 255,
          b: parseInt(values[3], 10) / 255,
        };
      }
    }
  }

  return { r: 0, g: 0, b: 0 };
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): ColorObject {
  hex = hex.replace(/^#/, "");

  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  return { r, g, b };
}

/**
 * Extract a usable font family from a CSS font-family string.
 */
function sanitizeFontFamily(
  fontFamily: string | undefined,
  fallback = "Inter"
): string {
  if (!fontFamily) return fallback;
  const firstEntry = fontFamily
    .split(",")[0]
    ?.trim()
    .replace(/(^['"]|['"]$)/g, "");
  return firstEntry || fallback;
}

/**
 * Map numeric font-weight values to common Figma styles.
 */
function mapFontWeightToStyle(
  weight?: string | number
): "Light" | "Regular" | "Medium" | "Bold" {
  if (typeof weight === "string") {
    const parsed = parseInt(weight, 10);
    if (!isNaN(parsed)) weight = parsed;
  }

  if (typeof weight !== "number") return "Regular";
  if (weight >= 700) return "Bold";
  if (weight >= 500) return "Medium";
  if (weight <= 300) return "Light";
  return "Regular";
}

/**
 * Attempt to load a font, falling back to Inter Regular if unavailable.
 */
async function loadFontWithFallback(
  family: string,
  style: string,
  fallbackFamily = "Inter",
  fallbackStyle = "Regular"
): Promise<FontName> {
  try {
    await figma.loadFontAsync({ family, style });
    return { family, style };
  } catch (err) {
    console.warn(
      `Failed to load font ${family} ${style}. Falling back to ${fallbackFamily} ${fallbackStyle}.`,
      err
    );
    await figma.loadFontAsync({ family: fallbackFamily, style: fallbackStyle });
    return { family: fallbackFamily, style: fallbackStyle };
  }
}

/**
 * Apply border styles to a Figma node
 */
function applyBorderStyles(figmaNode: SceneNode, styles: Styles | undefined) {
  if (!styles) return;
  
  const borderWidth = parseDimension(styles.borderWidth || styles.border, 0);
  const borderColor = styles.borderColor || '#000000';
  
  if (borderWidth > 0 && (figmaNode.type === 'FRAME' || figmaNode.type === 'RECTANGLE')) {
    const node = figmaNode as FrameNode | RectangleNode;
    node.strokes = [{
      type: 'SOLID',
      color: parseColor(borderColor)
    }];
    node.strokeWeight = borderWidth;
    
    // Border radius
    const borderRadius = parseDimension(styles.borderRadius, 0);
    if (borderRadius > 0) {
      if (node.type === 'RECTANGLE') {
        node.cornerRadius = borderRadius;
      } else if (node.type === 'FRAME') {
        node.cornerRadius = borderRadius;
      }
    }
  }
}

/**
 * Apply shadow/box-shadow to a Figma node
 */
function applyShadowStyles(figmaNode: SceneNode, styles: Styles | undefined) {
  if (!styles || !styles.boxShadow) return;
  
  // Simple box-shadow parser (handles basic cases)
  const shadowStr = styles.boxShadow;
  const shadowMatch = shadowStr.match(/([\d.]+)px\s+([\d.]+)px\s+([\d.]+)px\s+([\d.]+)px\s+(.+)/);
  
  if (shadowMatch && (figmaNode.type === 'FRAME' || figmaNode.type === 'RECTANGLE' || figmaNode.type === 'TEXT')) {
    const [, offsetX, offsetY, blurRadius, spreadRadius, color] = shadowMatch;
    (figmaNode as any).effects = [{
      type: 'DROP_SHADOW',
      color: { ...parseColor(color), a: 0.25 },
      offset: { x: parseFloat(offsetX), y: parseFloat(offsetY) },
      radius: parseFloat(blurRadius),
      visible: true,
      blendMode: 'NORMAL'
    }];
  }
}

/**
 * Derive absolute positioning values for HTML-derived nodes.
 */
function extractAbsolutePosition(node: JsonNode | undefined): {
  x: number;
  y: number;
} {
  if (!node) return { x: 0, y: 0 };

  const absolute = node.position?.absolute ?? {};
  const styles = node.styles ?? {};

  const possibleX =
    (absolute as any).x ??
    (absolute as any).left ??
    (styles as any).left ??
    (styles as any).marginLeft ??
    0;
  const possibleY =
    (absolute as any).y ??
    (absolute as any).top ??
    (styles as any).top ??
    (styles as any).marginTop ??
    0;

  return {
    x: parseDimension(possibleX, 0),
    y: parseDimension(possibleY, 0),
  };
}

/**
 * Convert Figma-style JSON to Figma nodes
 */
async function convertFigmaJsonToNodes(
  json: any,
  options: ConversionOptions = {}
): Promise<SceneNode> {
  // If this is a CANVAS type with children, unwrap it
  if (json.type === "CANVAS" && json.children && Array.isArray(json.children)) {
    // Create a root frame for all children
    const rootFrame = figma.createFrame();
    rootFrame.name = json.name || "Imported Design";
    rootFrame.fills = [];
    
    // Position at origin for visibility
    rootFrame.x = 0;
    rootFrame.y = 0;

    // Set a reasonable default size
    rootFrame.resize(1440, 900);

    // Process and add children
    for (const child of json.children) {
      const childNode = await processFigmaNode(child);
      if (childNode) {
        rootFrame.appendChild(childNode);
      }
    }

    return rootFrame;
  }

  // If this is a top-level document with frames
  if (json.frames && Array.isArray(json.frames)) {
    const rootFrame = figma.createFrame();
    rootFrame.name = "Imported Design";
    rootFrame.fills = [];

    // Process each frame
    const processedFrames: SceneNode[] = [];
    for (const frameData of json.frames) {
      const frame = await processFigmaNode(frameData);
      if (frame) {
        // Remove fills from top-level frames to make content visible
        if (frame.type === "FRAME") {
          (frame as FrameNode).fills = [];
        }
        processedFrames.push(frame);
      }
    }

    // Calculate bounding box of all frames
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const frame of processedFrames) {
      const bounds = frame.absoluteBoundingBox;
      if (bounds) {
        minX = Math.min(minX, bounds.x);
        minY = Math.min(minY, bounds.y);
        maxX = Math.max(maxX, bounds.x + bounds.width);
        maxY = Math.max(maxY, bounds.y + bounds.height);
      }
    }

    // Set root frame position and size
    if (
      minX !== Infinity &&
      minY !== Infinity &&
      maxX !== -Infinity &&
      maxY !== -Infinity
    ) {
      rootFrame.x = minX;
      rootFrame.y = minY;
      rootFrame.resize(maxX - minX, maxY - minY);

      // Adjust children positions relative to root
      for (const frame of processedFrames) {
        frame.x -= minX;
        frame.y -= minY;
        rootFrame.appendChild(frame);
      }
    } else {
      // Fallback if no bounds
      rootFrame.resize(1440, 900);
      for (const frame of processedFrames) {
        rootFrame.appendChild(frame);
      }
    }

    return rootFrame;
  }

  // If this is a single node
  return await processFigmaNode(json);
}

/**
 * Process a single Figma JSON node
 */
async function processFigmaNode(node: FigmaJsonNode): Promise<SceneNode> {
  let figmaNode: SceneNode;
  
  // Handle HTML element types from browser-extract.js
  const nodeType = (node.type || '').toUpperCase();
  const isHtmlType = !['FRAME', 'RECTANGLE', 'TEXT', 'IMAGE', 'GROUP', 'COMPONENT'].includes(nodeType);
  
  if (isHtmlType) {
    // This is HTML-derived JSON, convert it properly
    const htmlNode: any = node;
    
    // Handle text nodes
    if (htmlNode.text || nodeType === 'TEXT') {
      figmaNode = figma.createText();
      const textContent = (htmlNode.text || '').trim();
      
      // Always create the text node even if empty (will be skipped later if needed)
      const fontFamily = htmlNode.styles?.fontFamily ? sanitizeFontFamily(htmlNode.styles.fontFamily) : 'Inter';
      const fontWeight = htmlNode.styles?.fontWeight;
      const fontStyle = mapFontWeightToStyle(fontWeight);
      
      const appliedFont = await loadFontWithFallback(fontFamily, fontStyle);
      (figmaNode as TextNode).fontName = appliedFont;
      
      // Set characters - use placeholder if empty
      (figmaNode as TextNode).characters = textContent || ' ';
      
      // Set auto-resize BEFORE applying size
      (figmaNode as TextNode).textAutoResize = 'WIDTH_AND_HEIGHT';
      
      // Apply text styles
      const fontSize = parseDimension(htmlNode.styles?.fontSize, 16);
      (figmaNode as TextNode).fontSize = fontSize;
      
      if (htmlNode.styles?.color) {
        (figmaNode as TextNode).fills = [{
          type: 'SOLID',
          color: parseColor(htmlNode.styles.color)
        }];
      }
      
      if (htmlNode.styles?.textAlign) {
        const align = htmlNode.styles.textAlign;
        if (align === 'center') (figmaNode as TextNode).textAlignHorizontal = 'CENTER';
        else if (align === 'right') (figmaNode as TextNode).textAlignHorizontal = 'RIGHT';
        else if (align === 'justify') (figmaNode as TextNode).textAlignHorizontal = 'JUSTIFIED';
      }
      
      // If there's an explicit width, use HEIGHT auto-resize instead
      if (htmlNode.position?.absolute?.width) {
        const width = parseDimension(htmlNode.position.absolute.width, 200);
        if (width > 0 && width < 10000) {
          (figmaNode as TextNode).textAutoResize = 'HEIGHT';
          (figmaNode as TextNode).resize(width, 100);
        }
      }
    } 
    // Handle image nodes
    else if (nodeType === 'IMG') {
      figmaNode = figma.createRectangle();
      
      // Visible gray placeholder with icon pattern
      (figmaNode as RectangleNode).fills = [{
        type: 'SOLID',
        color: { r: 0.9, g: 0.9, b: 0.9 }
      }];
      (figmaNode as RectangleNode).strokes = [{
        type: 'SOLID',
        color: { r: 0.6, g: 0.6, b: 0.6 }
      }];
      (figmaNode as RectangleNode).strokeWeight = 2;
      
      // Apply border radius if present
      if (htmlNode.styles?.borderRadius) {
        const radius = parseDimension(htmlNode.styles.borderRadius, 0);
        if (radius > 0) {
          (figmaNode as RectangleNode).cornerRadius = radius;
        }
      }
    }
    // Handle everything else as frames
    else {
      figmaNode = figma.createFrame();
      
      // Apply background color
      if (htmlNode.styles?.backgroundColor) {
        const bgColor = htmlNode.styles.backgroundColor;
        if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0,0,0,0)') {
          (figmaNode as FrameNode).fills = [{
            type: 'SOLID',
            color: parseColor(bgColor)
          }];
        } else {
          (figmaNode as FrameNode).fills = [];
        }
      } else {
        (figmaNode as FrameNode).fills = [];
      }
      
      // Apply borders
      if (htmlNode.styles) {
        applyBorderStyles(figmaNode, htmlNode.styles);
        applyShadowStyles(figmaNode, htmlNode.styles);
      }
      
      // Apply Auto Layout if flexbox
      if (htmlNode.styles?.display === 'flex' || htmlNode.styles?.display === 'inline-flex') {
        const frame = figmaNode as FrameNode;
        frame.layoutMode = htmlNode.styles.flexDirection === 'column' ? 'VERTICAL' : 'HORIZONTAL';
        
        const gap = parseDimension(htmlNode.styles.gap || htmlNode.styles.gridGap, 0);
        if (gap > 0) frame.itemSpacing = gap;
        
        const justifyContent = htmlNode.styles.justifyContent;
        if (justifyContent === 'center') frame.primaryAxisAlignItems = 'CENTER';
        else if (justifyContent === 'flex-end' || justifyContent === 'end') frame.primaryAxisAlignItems = 'MAX';
        else if (justifyContent === 'space-between') frame.primaryAxisAlignItems = 'SPACE_BETWEEN';
        
        const alignItems = htmlNode.styles.alignItems;
        if (alignItems === 'center') frame.counterAxisAlignItems = 'CENTER';
        else if (alignItems === 'flex-end' || alignItems === 'end') frame.counterAxisAlignItems = 'MAX';
      }
    }
    
    // Set name from HTML element info
    const idPart = htmlNode.id ? `#${htmlNode.id}` : '';
    const classPart = htmlNode.classes?.length > 0 ? `.${htmlNode.classes.join('.')}` : '';
    figmaNode.name = `${htmlNode.type || 'div'}${idPart}${classPart}`;
    
  } else {
    // Standard Figma node types

  switch (node.type) {
    case "FRAME":
      figmaNode = figma.createFrame();
      break;
    case "RECTANGLE":
      figmaNode = figma.createRectangle();
      if (node.cornerRadius) {
        (figmaNode as RectangleNode).cornerRadius = node.cornerRadius;
      }
      break;
    case "TEXT":
      figmaNode = figma.createText();

      // Get text content from either 'characters' or 'text' property
      const textContent = (node as any).characters || (node as any).text || "";

      if (textContent) {
        // Determine font family and style
        let fontFamily =
          (node as any).fontName?.family || node.style?.fontFamily || "Inter";
        const fontStyleFromName = (node as any).fontName?.style || "Regular";
        const fontWeightFromStyle = node.style?.fontWeight;

        // Determine final font style
        let finalFontStyle = fontStyleFromName;
        if (fontWeightFromStyle) {
          finalFontStyle =
            fontWeightFromStyle >= 700
              ? "Bold"
              : fontWeightFromStyle >= 500
              ? "Medium"
              : "Regular";
        }

        // Load font BEFORE setting characters
        try {
          await figma.loadFontAsync({
            family: fontFamily,
            style: finalFontStyle,
          });
        } catch (err) {
          console.warn(
            `Failed to load font ${fontFamily} ${finalFontStyle}, falling back to Inter Regular`,
            err
          );
          await figma.loadFontAsync({ family: "Inter", style: "Regular" });
          finalFontStyle = "Regular";
          fontFamily = "Inter";
        }

        // Set font name FIRST
        (figmaNode as TextNode).fontName = {
          family: fontFamily,
          style: finalFontStyle,
        };

        // Set text content AFTER font is loaded
        (figmaNode as TextNode).characters = textContent;

        // Apply font size
        const fontSize = (node as any).fontSize || node.style?.fontSize || 16;
        (figmaNode as TextNode).fontSize = fontSize;

        // Apply text styles
        if (node.style) {
          if (node.style.lineHeightPx) {
            (figmaNode as TextNode).lineHeight = {
              value: node.style.lineHeightPx,
              unit: "PIXELS",
            };
          }
          if (node.style.fills) {
            const fills: Paint[] = [];
            for (const fill of node.style.fills) {
              if (fill.type === "SOLID" && fill.color) {
                fills.push({
                  type: "SOLID",
                  color: parseColor(fill.color),
                });
              }
            }
            if (fills.length > 0) {
              (figmaNode as TextNode).fills = fills;
            }
          }
        }

        // Apply direct fills property if present
        if ((node as any).fills && Array.isArray((node as any).fills)) {
          const fills: Paint[] = [];
          for (const fill of (node as any).fills) {
            if (fill.type === "SOLID" && fill.color) {
              fills.push({
                type: "SOLID",
                color: parseColor(fill.color),
              });
            }
          }
          if (fills.length > 0) {
            (figmaNode as TextNode).fills = fills;
          }
        }

        // Apply text alignment
        if ((node as any).textAlignHorizontal) {
          (figmaNode as TextNode).textAlignHorizontal = (
            node as any
          ).textAlignHorizontal;
        }
        if ((node as any).textAlignVertical) {
          (figmaNode as TextNode).textAlignVertical = (
            node as any
          ).textAlignVertical;
        }
      }
      break;
    default:
      figmaNode = figma.createFrame();
  }
  
  // Common properties for standard Figma nodes
  if (node.name) figmaNode.name = node.name;
  }

  // Position and size handling (works for both HTML and Figma nodes)
  // For HTML nodes, check position.absolute first
  const htmlNode = node as any;
  if (htmlNode.position?.absolute) {
    // Set position (default to 0 if not provided, common for text-only children)
    figmaNode.x = parseDimension(htmlNode.position.absolute.x, 0);
    figmaNode.y = parseDimension(htmlNode.position.absolute.y, 0);
    
    // Size for non-text nodes (text handles its own sizing with textAutoResize)
    if (figmaNode.type !== "TEXT") {
      const w = parseDimension(htmlNode.position.absolute.width, 100);
      const h = parseDimension(htmlNode.position.absolute.height, 100);
      if (w > 0 && h > 0) {
        figmaNode.resize(w, h);
      }
    }
  } else {
    // Standard Figma node positioning
    figmaNode.x = node.x !== undefined ? node.x : 0;
    figmaNode.y = node.y !== undefined ? node.y : 0;

    // Size - always set, fallback to 100x100 if missing
    if (figmaNode.type !== "TEXT") {
      const w = node.width !== undefined ? node.width : 100;
      const h = node.height !== undefined ? node.height : 100;
      figmaNode.resize(w, h);
    }
  }

  // Background color (for standard Figma nodes only)
  if (!isHtmlType && node.backgroundColor && figmaNode.type !== "TEXT") {
    const color = parseColor(node.backgroundColor);
    // Darken the color to make it more visible
    color.r = Math.max(0, color.r - 0.3);
    color.g = Math.max(0, color.g - 0.3);
    color.b = Math.max(0, color.b - 0.3);
    (figmaNode as FrameNode | RectangleNode).fills = [
      {
        type: "SOLID",
        color: color,
      },
    ];
  }

  // Fills (for standard Figma nodes only)
  if (!isHtmlType && node.fills && figmaNode.type !== "TEXT") {
    const fills: Paint[] = [];
    for (const fill of node.fills) {
      if (fill.type === "SOLID" && fill.color) {
        fills.push({
          type: "SOLID",
          color: parseColor(fill.color),
        });
      } else if (fill.type === "IMAGE") {
        // For now, create a placeholder fill for images
        fills.push({
          type: "SOLID",
          color: { r: 0.8, g: 0.8, b: 0.8 },
        });
      }
    }
    if (fills.length > 0) {
      (figmaNode as FrameNode | RectangleNode).fills = fills;
    }
  }

  // Process children
  if (node.children && node.children.length > 0 && isParentNode(figmaNode)) {
    for (const child of node.children) {
      const childNode = await processFigmaNode(child);
      if (childNode) {
        figmaNode.appendChild(childNode);
      }
    }
  }

  return figmaNode;
}

/**
 * Safely parse a dimension value to a number
 */
export function parseDimension(
  value: string | number | undefined,
  defaultValue = 100
): number {
  if (typeof value === "number") return value;
  if (value == null) return defaultValue;
  if (typeof value === "string") {
    // Handle various CSS units
    const cleanValue = value.replace(/(px|pt|em|rem|%)$/, "").trim();
    const parsedValue = parseFloat(cleanValue);
    return !isNaN(parsedValue) && parsedValue > 0 ? parsedValue : defaultValue;
  }
  return defaultValue;
}

/**
 * Main conversion function
 */
export async function convertJsonToFigma(
  json: any,
  options: ConversionOptions = {}
): Promise<SceneNode> {
  // Check if this is Figma-style JSON
  if (isFigmaStyleJson(json)) {
    return await convertFigmaJsonToNodes(json, options);
  }

  // Otherwise, assume it's HTML-derived JSON
  return await convertHtmlJsonToFigma(json, options);
}

/**
 * Convert HTML-derived JSON to Figma nodes (legacy support)
 */
async function convertHtmlJsonToFigma(
  json: JsonNode,
  options: ConversionOptions = {}
): Promise<FrameNode> {
  const mergedOptions: ConversionOptions = {
    preserveColors: true,
    preserveTextStyles: true,
    useAutoLayout: true,
    flattenDivs: false,
    extractComponents: false,
    ...options,
  };

  const parentFrame = figma.createFrame();
  parentFrame.name = "HTML to Figma";

  const width = parseDimension(json?.position?.absolute?.width, 1440);
  const height = parseDimension(json?.position?.absolute?.height, 900);
  parentFrame.resize(width, height);

  parentFrame.fills = [
    {
      type: "SOLID",
      color: parseColor(json.styles?.backgroundColor || "#FFFFFF"),
    },
  ];

  if (json.children && json.children.length > 0) {
    for (const child of json.children) {
      await processJsonNode(child, parentFrame, mergedOptions);
    }
  }

  return parentFrame;
}

/**
 * Process a single HTML-derived JSON node
 */
export async function processJsonNode(
  node: JsonNode,
  parentNode: SceneNode,
  options: ConversionOptions
): Promise<SceneNode | null> {
  if (!node) return null;

  // Skip invisible nodes
  if (node.styles?.visibility === 'hidden' || node.styles?.display === 'none') {
    return null;
  }

  let figmaNode: SceneNode;

  const createNode = (() => {
    switch (node.type) {
      case "text":
        return nodeCreators.createTextNode;
      case "img":
        return nodeCreators.createImageNode;
      case "input":
      case "textarea":
      case "select":
      case "button":
        return nodeCreators.createInputNode;
      default:
        return nodeCreators.createFrameNode;
    }
  })();

  figmaNode = await (typeof createNode === "function"
    ? createNode(node, options)
    : nodeCreators.createFrameNode(node, options));

  // Apply positioning
  const { x, y } = extractAbsolutePosition(node);
  if ("x" in figmaNode && typeof figmaNode.x === "number") {
    figmaNode.x = x;
  }
  if ("y" in figmaNode && typeof figmaNode.y === "number") {
    figmaNode.y = y;
  }

  // Apply opacity
  if (node.styles?.opacity) {
    const opacity = parseFloat(node.styles.opacity);
    if (!isNaN(opacity) && opacity >= 0 && opacity <= 1) {
      if ('opacity' in figmaNode) {
        (figmaNode as any).opacity = opacity;
      }
    }
  }

  // Store z-index for potential reordering
  if (node.styles?.zIndex) {
    // Store as plugin data for reference
    // figmaNode.setPluginData('zIndex', node.styles.zIndex);
  }

  if (isParentNode(parentNode)) {
    parentNode.appendChild(figmaNode);
  }

  if (node.children && node.children.length > 0 && isParentNode(figmaNode)) {
    for (const child of node.children) {
      await processJsonNode(child, figmaNode, options);
    }
  }

  return figmaNode;
}

/**
 * Node creation functions for HTML-derived JSON
 */
export const nodeCreators: NodeCreators = {
  async createTextNode(
    node: JsonNode,
    options: ConversionOptions
  ): Promise<TextNode> {
    const textNode = figma.createText();

    const defaultFamily = sanitizeFontFamily(
      options.defaultFontFamily,
      "Inter"
    );
    const requestedFamily = sanitizeFontFamily(
      node.styles?.fontFamily,
      defaultFamily
    );
    const fontStyle = mapFontWeightToStyle(node.styles?.fontWeight);

    const appliedFont = await loadFontWithFallback(
      requestedFamily,
      fontStyle,
      defaultFamily,
      "Regular"
    );

    textNode.fontName = appliedFont;

    if (options.preserveTextStyles && node.styles) {
      if (node.styles.fontSize) {
        const size = parseFloat(node.styles.fontSize);
        if (!isNaN(size) && size > 0) {
          textNode.fontSize = size;
        }
      }

      if (node.styles.lineHeight) {
        const lh = parseFloat(node.styles.lineHeight);
        if (!isNaN(lh) && lh > 0) {
          textNode.lineHeight = { value: lh, unit: "PIXELS" };
        }
      }

      if (node.styles.letterSpacing) {
        const ls = parseFloat(node.styles.letterSpacing);
        if (!isNaN(ls)) {
          textNode.letterSpacing = { value: ls, unit: "PIXELS" };
        }
      }

      // Text alignment
      const textAlign = node.styles.textAlign;
      if (textAlign === 'center') {
        textNode.textAlignHorizontal = 'CENTER';
      } else if (textAlign === 'right') {
        textNode.textAlignHorizontal = 'RIGHT';
      } else if (textAlign === 'justify') {
        textNode.textAlignHorizontal = 'JUSTIFIED';
      }

      // Text decoration
      if (node.styles.textDecoration?.includes('underline')) {
        textNode.textDecoration = 'UNDERLINE';
      } else if (node.styles.textDecoration?.includes('line-through')) {
        textNode.textDecoration = 'STRIKETHROUGH';
      }

      // Text transform (approximate)
      let textContent = node.text || node.placeholder || "";
      if (node.styles.textTransform === 'uppercase') {
        textContent = textContent.toUpperCase();
      } else if (node.styles.textTransform === 'lowercase') {
        textContent = textContent.toLowerCase();
      } else if (node.styles.textTransform === 'capitalize') {
        textContent = textContent.replace(/\b\w/g, l => l.toUpperCase());
      }

      if (options.preserveColors && node.styles.color) {
        textNode.fills = [
          {
            type: "SOLID",
            color: parseColor(node.styles.color),
          },
        ];
      }

      // Set characters
      textNode.characters = textContent;

      // Text shadow
      if (node.styles.textShadow) {
        applyShadowStyles(textNode, node.styles);
      }
    } else {
      textNode.characters = node.text || node.placeholder || "";
    }

    // Size handling
    const width = parseDimension(node?.position?.absolute?.width, 200);
    const height = parseDimension(node?.position?.absolute?.height, 32);

    // Auto-resize based on content
    if (width > 800 || node.styles?.whiteSpace === 'normal') {
      textNode.textAutoResize = "HEIGHT";
      textNode.resize(width, 100);
    } else {
      textNode.textAutoResize = "WIDTH_AND_HEIGHT";
    }

    return textNode;
  },

  createImageNode(node: JsonNode, options: ConversionOptions): RectangleNode {
    const rect = figma.createRectangle();
    rect.name = `img${node.alt ? ` (${node.alt})` : ""}`;

    const width = parseDimension(node?.position?.absolute?.width);
    const height = parseDimension(node?.position?.absolute?.height);
    rect.resize(width, height);

    // Create a more visible placeholder for images
    rect.fills = [
      {
        type: "SOLID",
        color: { r: 0.85, g: 0.85, b: 0.85 },
      },
    ];

    // Add border to indicate it's an image placeholder
    rect.strokes = [
      {
        type: "SOLID",
        color: { r: 0.7, g: 0.7, b: 0.7 },
      },
    ];
    rect.strokeWeight = 1;

    // Handle border radius from styles
    if (node.styles?.borderRadius) {
      const borderRadius = parseDimension(node.styles.borderRadius, 0);
      if (borderRadius > 0) {
        rect.cornerRadius = borderRadius;
      }
    }

    // Handle object-fit styles
    if (node.styles?.objectFit) {
      // Store metadata for potential future image loading
      // rect.setPluginData('objectFit', node.styles.objectFit);
    }

    return rect;
  },

  async createInputNode(
    node: JsonNode,
    options: ConversionOptions
  ): Promise<FrameNode> {
    const frame = figma.createFrame();
    const inputType = node.styles?.type || node.type || "text";
    frame.name = `input[type=${inputType}]`;

    const width = parseDimension(node?.position?.absolute?.width);
    const height = parseDimension(node?.position?.absolute?.height, 40);
    frame.resize(width, height);

    // Default input styling
    frame.fills = [
      {
        type: "SOLID",
        color: { r: 1, g: 1, b: 1 },
      },
    ];

    // Add border
    frame.strokes = [
      {
        type: "SOLID",
        color: { r: 0.8, g: 0.8, b: 0.8 },
      },
    ];
    frame.strokeWeight = 1;

    // Apply custom borders if present
    if (node.styles) {
      applyBorderStyles(frame, node.styles);
    }

    // Add padding
    frame.paddingLeft = 12;
    frame.paddingRight = 12;
    frame.paddingTop = 8;
    frame.paddingBottom = 8;

    // Add placeholder text if present
    if (node.placeholder || node.text) {
      const textNode = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      textNode.fontName = { family: "Inter", style: "Regular" };
      textNode.characters = node.placeholder || node.text || "";
      textNode.fontSize = 14;
      textNode.fills = [
        {
          type: "SOLID",
          color: { r: 0.6, g: 0.6, b: 0.6 },
        },
      ];
      frame.appendChild(textNode);
    }

    return frame;
  },

  createFrameNode(node: JsonNode, options: ConversionOptions): FrameNode {
    const frame = figma.createFrame();

    const idPart = node.id ? `#${node.id}` : "";
    const classPart =
      node.classes && node.classes.length > 0
        ? `.${node.classes.join(".")}`
        : "";
    frame.name = `${node.type || "div"}${idPart}${classPart}`;

    const width = parseDimension(node?.position?.absolute?.width);
    const height = parseDimension(node?.position?.absolute?.height);
    frame.resize(width, height);

    // Background color with transparency support
    if (options.preserveColors && node.styles?.backgroundColor) {
      const bgColor = node.styles.backgroundColor;
      if (bgColor && bgColor !== "transparent" && bgColor !== "rgba(0,0,0,0)") {
        frame.fills = [
          {
            type: "SOLID",
            color: parseColor(bgColor),
          },
        ];
      } else {
        frame.fills = []; // Transparent
      }
    }

    // Apply borders and shadows
    if (options.preserveColors) {
      applyBorderStyles(frame, node.styles);
      applyShadowStyles(frame, node.styles);
    }

    // Padding - adjust frame clipping
    if (node.styles?.padding) {
      const padding = parseDimension(node.styles.padding, 0);
      if (padding > 0) {
        frame.paddingLeft = padding;
        frame.paddingRight = padding;
        frame.paddingTop = padding;
        frame.paddingBottom = padding;
      }
    }

    // Flexbox layout
    if (options.useAutoLayout && node.styles) {
      const display = node.styles.display;
      if (display === 'flex' || display === 'inline-flex') {
        frame.layoutMode = node.styles.flexDirection === 'column' ? 'VERTICAL' : 'HORIZONTAL';
        
        // Flex gap
        const gap = parseDimension(node.styles.gap || node.styles.gridGap, 0);
        if (gap > 0) {
          frame.itemSpacing = gap;
        }
        
        // Justify content
        const justifyContent = node.styles.justifyContent;
        if (justifyContent === 'center') {
          frame.primaryAxisAlignItems = 'CENTER';
        } else if (justifyContent === 'flex-end' || justifyContent === 'end') {
          frame.primaryAxisAlignItems = 'MAX';
        } else if (justifyContent === 'space-between') {
          frame.primaryAxisAlignItems = 'SPACE_BETWEEN';
        }
        
        // Align items
        const alignItems = node.styles.alignItems;
        if (alignItems === 'center') {
          frame.counterAxisAlignItems = 'CENTER';
        } else if (alignItems === 'flex-end' || alignItems === 'end') {
          frame.counterAxisAlignItems = 'MAX';
        }
      }
    }

    return frame;
  },
};
