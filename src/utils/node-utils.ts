import { FigmaJsonNode, JsonNode } from '../types';

/**
 * Type guard to check if a node is HTML-derived JSON
 */
export function isHtmlNode(node: FigmaJsonNode | JsonNode): boolean {
  const nodeType = (node.type ?? '').toUpperCase();
  const figmaTypes = ['FRAME', 'RECTANGLE', 'TEXT', 'IMAGE', 'GROUP', 'COMPONENT', 'CANVAS'];
  return !figmaTypes.includes(nodeType);
}

/**
 * Type guard to check if input is Figma-style JSON
 */
export function isFigmaStyleJson(json: unknown): json is FigmaJsonNode {
  if (!json || typeof json !== 'object') return false;
  
  const obj = json as Record<string, unknown>;
  
  // Check for 'frames' property (Figma export format)
  if ('frames' in obj) return true;
  
  // If it's a CANVAS, check children to determine format
  if (obj.type === 'CANVAS' && Array.isArray(obj.children) && obj.children.length > 0) {
    const firstChild = obj.children[0] as Record<string, unknown>;
    const childType = String(firstChild.type ?? '').toUpperCase();
    const figmaTypes = ['FRAME', 'RECTANGLE', 'TEXT', 'IMAGE', 'GROUP', 'COMPONENT'];
    
    // If child has Figma-native type AND has properties like 'absoluteBoundingBox', it's Figma format
    if (figmaTypes.includes(childType) && 'absoluteBoundingBox' in firstChild) {
      return true;
    }
    
    // If child has HTML types (div, span, etc.) or has 'styles' property, it's HTML format
    if (!figmaTypes.includes(childType) || 'styles' in firstChild) {
      return false;
    }
  }
  
  // For non-CANVAS nodes, check if it's a Figma-native type with Figma properties
  return (
    (obj.type === 'FRAME' || 
     obj.type === 'RECTANGLE' || 
     obj.type === 'TEXT' || 
     obj.type === 'IMAGE') &&
    'absoluteBoundingBox' in obj
  );
}

/**
 * Type guard to check if a node can have children
 */
export function isParentNode(
  node: SceneNode
): node is FrameNode | GroupNode | ComponentNode {
  return (
    node.type === "FRAME" || node.type === "GROUP" || node.type === "COMPONENT"
  );
}

/**
 * Generate a readable name for an HTML node
 */
export function generateNodeName(node: JsonNode): string {
  const idPart = node.id ? `#${node.id}` : '';
  const classPart =
    node.classes && node.classes.length > 0
      ? `.${node.classes.join('.')}`
      : '';
  return `${node.type ?? 'div'}${idPart}${classPart}`;
}

/**
 * Check if a node should be visible
 */
export function shouldNodeBeVisible(node: JsonNode): boolean {
  const styles = node.styles;
  if (!styles) return true;

  return (
    styles.display !== 'none' &&
    styles.visibility !== 'hidden' &&
    styles.opacity !== '0'
  );
}
