import {
  JsonNode,
  ConversionOptions,
  ColorObject,
  NodeCreators,
  FigmaJsonNode,
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
      const textContent = (node as any).characters || node.text || "";

      if (textContent) {
        // Determine font family and style
        const fontFamily =
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

        // Load font
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
        }

        // Set text content FIRST
        (figmaNode as TextNode).characters = textContent;

        // Set font name
        (figmaNode as TextNode).fontName = {
          family: fontFamily,
          style: finalFontStyle,
        };

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

  // Common properties
  if (node.name) figmaNode.name = node.name;

  // Position - always set, fallback to 0 if missing
  figmaNode.x = node.x !== undefined ? node.x : 0;
  figmaNode.y = node.y !== undefined ? node.y : 0;

  // Size - always set, fallback to 100x100 if missing
  if (figmaNode.type === "TEXT") {
    // For text nodes, set characters first, then resize
    const w = node.width !== undefined ? node.width : 200;
    const h = node.height !== undefined ? node.height : 32;
    (figmaNode as TextNode).resize(w, h);
  } else {
    const w = node.width !== undefined ? node.width : 100;
    const h = node.height !== undefined ? node.height : 100;
    figmaNode.resize(w, h);
  }

  // Background color
  if (node.backgroundColor && figmaNode.type !== "TEXT") {
    (figmaNode as FrameNode | RectangleNode).fills = [
      {
        type: "SOLID",
        color: parseColor(node.backgroundColor),
      },
    ];
  }

  // Fills
  if (node.fills && figmaNode.type !== "TEXT") {
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
    const cleanValue = value.replace(/px$/, "").trim();
    const parsedValue = parseFloat(cleanValue);
    return !isNaN(parsedValue) ? parsedValue : defaultValue;
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
        return nodeCreators.createInputNode;
      default:
        return nodeCreators.createFrameNode;
    }
  })();

  figmaNode = await (typeof createNode === "function"
    ? createNode(node, options)
    : nodeCreators.createFrameNode(node, options));

  const { x, y } = extractAbsolutePosition(node);
  if ("x" in figmaNode && typeof figmaNode.x === "number") {
    figmaNode.x = x;
  }
  if ("y" in figmaNode && typeof figmaNode.y === "number") {
    figmaNode.y = y;
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
        if (!isNaN(size)) {
          textNode.fontSize = size;
        }
      }

      if (node.styles.lineHeight) {
        const lh = parseFloat(node.styles.lineHeight);
        if (!isNaN(lh)) {
          textNode.lineHeight = { value: lh, unit: "PIXELS" };
        }
      }

      if (node.styles.letterSpacing) {
        const ls = parseFloat(node.styles.letterSpacing);
        if (!isNaN(ls)) {
          textNode.letterSpacing = { value: ls, unit: "PIXELS" };
        }
      }

      if (options.preserveColors && node.styles.color) {
        textNode.fills = [
          {
            type: "SOLID",
            color: parseColor(node.styles.color),
          },
        ];
      }
    }

    const width = parseDimension(node?.position?.absolute?.width, 200);
    const height = parseDimension(node?.position?.absolute?.height, 32);

    textNode.textAutoResize = "WIDTH_AND_HEIGHT";
    textNode.resize(width, height);
    textNode.characters = node.text || node.placeholder || "";

    return textNode;
  },

  createImageNode(node: JsonNode, options: ConversionOptions): RectangleNode {
    const rect = figma.createRectangle();
    rect.name = `img${node.alt ? ` (${node.alt})` : ""}`;

    const width = parseDimension(node?.position?.absolute?.width);
    const height = parseDimension(node?.position?.absolute?.height);
    rect.resize(width, height);

    rect.fills = [
      {
        type: "SOLID",
        color: { r: 0.9, g: 0.9, b: 0.9 },
      },
    ];

    return rect;
  },

  async createInputNode(
    node: JsonNode,
    options: ConversionOptions
  ): Promise<FrameNode> {
    const frame = figma.createFrame();
    frame.name = `input[type=${node.type || "text"}]`;

    const width = parseDimension(node?.position?.absolute?.width);
    const height = parseDimension(node?.position?.absolute?.height);
    frame.resize(width, height);

    frame.fills = [
      {
        type: "SOLID",
        color: { r: 1, g: 1, b: 1 },
      },
    ];

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

    if (
      options.preserveColors &&
      node.styles?.backgroundColor &&
      node.styles.backgroundColor !== "transparent"
    ) {
      frame.fills = [
        {
          type: "SOLID",
          color: parseColor(node.styles.backgroundColor),
        },
      ];
    }

    return frame;
  },
};
