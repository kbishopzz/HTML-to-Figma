// Types for JSON conversion
export interface Position {
  absolute: {
    x?: string | number;
    y?: string | number;
    width: string | number;
    height: string | number;
  };
}

export interface Styles {
  [key: string]: string | undefined;
  // Common CSS properties
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: string;
  textDecoration?: string;
  textTransform?: string;
  textShadow?: string;
  borderWidth?: string;
  border?: string;
  borderColor?: string;
  borderRadius?: string;
  boxShadow?: string;
  padding?: string;
  margin?: string;
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  gridGap?: string;
  position?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  width?: string;
  height?: string;
  opacity?: string;
  visibility?: string;
  overflow?: string;
  whiteSpace?: string;
  objectFit?: string;
  zIndex?: string;
}

export interface JsonNode {
  type: string;
  id?: string;
  classes?: Array<string>;
  styles?: Styles;
  position?: Position;
  children?: Array<JsonNode>;
  text?: string;
  placeholder?: string;
  alt?: string;
  src?: string;
  href?: string;
  name?: string;
  url?: string;
  extractedAt?: string;
  viewport?: { width: number; height: number };
}

// Figma-style JSON types
export interface FigmaJsonNode {
  id?: string;
  name?: string;
  type: 'FRAME' | 'RECTANGLE' | 'TEXT' | 'IMAGE' | 'GROUP' | 'COMPONENT' | 'CANVAS';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  backgroundColor?: ColorObject | string;
  cornerRadius?: number;
  fills?: Array<FigmaPaint>;
  strokes?: Array<FigmaPaint>;
  children?: Array<FigmaJsonNode>;
  frames?: Array<FigmaJsonNode>;
  characters?: string;
  text?: string;
  style?: TextStyle;
}

export interface TextStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | string;
  lineHeightPx?: number;
  fills?: Array<FigmaPaint>;
}

export interface FigmaPaint {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND' | 'IMAGE' | 'EMOJI';
  color?: ColorObject | string;
  scaleMode?: 'FILL' | 'FIT' | 'TILE' | 'STRETCH';
  imageHash?: string;
}

export interface ColorObject {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface ConversionOptions {
  preserveColors?: boolean;
  preserveTextStyles?: boolean;
  useAutoLayout?: boolean;
  flattenDivs?: boolean;
  extractComponents?: boolean;
  defaultFontFamily?: string;
}

// Node creation function types
export interface NodeCreationOptions extends ConversionOptions {
  // Additional options specific to node creation if needed
}

export type NodeCreationFunction = (
  node: JsonNode, 
  options: NodeCreationOptions
) => Promise<SceneNode> | SceneNode;

export interface NodeCreators {
  createTextNode: NodeCreationFunction;
  createImageNode: NodeCreationFunction;
  createInputNode: NodeCreationFunction;
  createFrameNode: NodeCreationFunction;
}
