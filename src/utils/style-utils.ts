import { Styles } from '../types';
import { parseColor, parseDimension } from './color-utils';

/**
 * Apply border styles to a Figma node
 */
export function applyBorderStyles(
  node: FrameNode | RectangleNode,
  styles: Styles
): void {
  if (!styles) return;

  const borderWidth = parseDimension(
    styles.borderWidth ?? styles.border,
    0
  );
  const borderColor = styles.borderColor ?? styles.border;

  if (borderWidth > 0 && borderColor) {
    node.strokes = [
      {
        type: "SOLID",
        color: parseColor(borderColor) as RGB,
      },
    ];
    node.strokeWeight = borderWidth;
  }

  // Border radius
  const borderRadius = parseDimension(styles.borderRadius, 0);
  if (borderRadius > 0) {
    if (node.type === "RECTANGLE") {
      node.cornerRadius = borderRadius;
    } else if (node.type === "FRAME") {
      node.cornerRadius = borderRadius;
    }
  }
}

/**
 * Apply shadow styles to a Figma node
 */
export function applyShadowStyles(
  node: FrameNode | RectangleNode | TextNode,
  styles: Styles
): void {
  if (!styles?.boxShadow) return;

  // Parse box-shadow: offsetX offsetY blur spread color
  const shadowMatch =
    /(-?\d+(?:\.\d+)?px)\s+(-?\d+(?:\.\d+)?px)\s+(-?\d+(?:\.\d+)?px)(?:\s+(-?\d+(?:\.\d+)?px))?\s+(.+)/.exec(
      styles.boxShadow
    );

  if (!shadowMatch) return;

  const offsetX = parseDimension(shadowMatch[1], 0);
  const offsetY = parseDimension(shadowMatch[2], 0);
  const blurRadius = parseDimension(shadowMatch[3], 0);
  const color = shadowMatch[5];

  if (!("effects" in node)) return;

  const effects: Effect[] = node.effects ? [...node.effects] : [];

  effects.push({
    type: "DROP_SHADOW",
    visible: true,
    radius: blurRadius,
    color: { ...parseColor(color), a: 0.25 } as RGBA,
    offset: { x: offsetX, y: offsetY },
    spread: 0,
    blendMode: "NORMAL",
  });

  node.effects = effects;
}

/**
 * Apply auto-layout properties to a frame
 */
export function applyAutoLayout(
  frame: FrameNode,
  styles: Styles
): void {
  if (!styles) return;

  const display = styles.display;
  if (display !== 'flex' && display !== 'inline-flex') return;

  frame.layoutMode =
    styles.flexDirection === 'column' ? 'VERTICAL' : 'HORIZONTAL';

  // Gap/spacing
  const gap = parseDimension(styles.gap ?? styles.gridGap, 0);
  if (gap > 0) {
    frame.itemSpacing = gap;
  }

  // Justify content (primary axis)
  const justifyContent = styles.justifyContent;
  if (justifyContent === 'center') {
    frame.primaryAxisAlignItems = 'CENTER';
  } else if (justifyContent === 'flex-end' || justifyContent === 'end') {
    frame.primaryAxisAlignItems = 'MAX';
  } else if (justifyContent === 'space-between') {
    frame.primaryAxisAlignItems = 'SPACE_BETWEEN';
  }

  // Align items (counter axis)
  const alignItems = styles.alignItems;
  if (alignItems === 'center') {
    frame.counterAxisAlignItems = 'CENTER';
  } else if (alignItems === 'flex-end' || alignItems === 'end') {
    frame.counterAxisAlignItems = 'MAX';
  }

  // Padding
  const padding = parseDimension(styles.padding, 0);
  if (padding > 0) {
    frame.paddingLeft = padding;
    frame.paddingRight = padding;
    frame.paddingTop = padding;
    frame.paddingBottom = padding;
  }
}

/**
 * Apply positioning from HTML position data
 */
export function applyPosition(
  node: SceneNode,
  position: { absolute?: { x?: string | number; y?: string | number; width?: string | number; height?: string | number } } | undefined
): void {
  if (!position?.absolute) return;

  // Set position
  node.x = parseDimension(position.absolute.x, 0);
  node.y = parseDimension(position.absolute.y, 0);

  // Set size for non-text nodes (text handles its own sizing)
  if (node.type !== "TEXT" && "resize" in node) {
    const width = parseDimension(position.absolute.width, 100);
    const height = parseDimension(position.absolute.height, 100);
    if (width > 0 && height > 0) {
      node.resize(width, height);
    }
  }
}
