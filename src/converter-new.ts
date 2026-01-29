import { FigmaJsonNode, JsonNode, ConversionOptions } from './types';
import { isFigmaStyleJson, isHtmlNode } from './utils/node-utils';
import { convertHtmlNode } from './converters/html-converter';
import { convertFigmaNode } from './converters/figma-converter';

/**
 * Main entry point for converting JSON to Figma nodes
 */
export async function convertJsonToFigma(
  json: unknown,
  options: ConversionOptions = {}
): Promise<SceneNode[]> {
  if (!json) {
    throw new Error('No JSON data provided');
  }

  // Validate options
  const opts: ConversionOptions = {
    preserveColors: options.preserveColors ?? true,
    useAutoLayout: options.useAutoLayout ?? true,
  };

  // Detect format and convert
  const isFigmaFormat = isFigmaStyleJson(json);
  console.log('🔍 JSON format detection:', isFigmaFormat ? 'Figma-style' : 'HTML-style');
  
  if (isFigmaFormat) {
    console.log('📍 Using Figma converter');
    return convertFigmaStyleJson(json, opts);
  } else {
    console.log('📍 Using HTML converter');
    return convertHtmlStyleJson(json as JsonNode, opts);
  }
}

/**
 * Convert Figma-style JSON
 */
async function convertFigmaStyleJson(
  json: FigmaJsonNode,
  options: ConversionOptions
): Promise<SceneNode[]> {
  // Handle CANVAS type with children
  if (json.type === 'CANVAS' && json.children && Array.isArray(json.children)) {
    const rootFrame = figma.createFrame();
    rootFrame.name = json.name ?? 'Imported Design';
    rootFrame.fills = [];
    rootFrame.x = 0;
    rootFrame.y = 0;
    rootFrame.resize(1440, 900);

    for (const child of json.children) {
      const childNode = await convertFigmaNode(child, options);
      if (childNode) {
        rootFrame.appendChild(childNode);
      }
    }

    return [rootFrame];
  }

  // Handle top-level document with frames array
  if ('frames' in json && Array.isArray(json.frames)) {
    const nodes: SceneNode[] = [];
    for (const frameData of json.frames) {
      const node = await convertFigmaNode(frameData as FigmaJsonNode, options);
      if (node) {
        nodes.push(node);
      }
    }
    return nodes;
  }

  // Single node
  const node = await convertFigmaNode(json, options);
  return node ? [node] : [];
}

/**
 * Convert HTML-style JSON
 */
async function convertHtmlStyleJson(
  json: JsonNode,
  options: ConversionOptions
): Promise<SceneNode[]> {
  // Handle CANVAS wrapper
  if (json.type === 'CANVAS' && json.children && Array.isArray(json.children)) {
    const nodes: SceneNode[] = [];
    for (const child of json.children) {
      const node = await convertHtmlNode(child, options);
      if (node) {
        nodes.push(node);
      }
    }
    return nodes;
  }

  // Single HTML node
  if (isHtmlNode(json)) {
    const node = await convertHtmlNode(json, options);
    return node ? [node] : [];
  }

  // Unknown format
  throw new Error('Unsupported JSON format');
}

/**
 * Export for backward compatibility
 */
export { convertHtmlNode, convertFigmaNode };
