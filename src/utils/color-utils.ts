import type { ColorObject } from '../types';

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

  // Handle string colors
  if (typeof color === "string") {
    const hexMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (hexMatch) {
      return {
        r: parseInt(hexMatch[1], 16) / 255,
        g: parseInt(hexMatch[2], 16) / 255,
        b: parseInt(hexMatch[3], 16) / 255,
      };
    }

    const rgbMatch = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(color);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]) / 255,
        g: parseInt(rgbMatch[2]) / 255,
        b: parseInt(rgbMatch[3]) / 255,
      };
    }

    // Named colors
    const namedColors: Record<string, ColorObject> = {
      white: { r: 1, g: 1, b: 1 },
      black: { r: 0, g: 0, b: 0 },
      red: { r: 1, g: 0, b: 0 },
      green: { r: 0, g: 1, b: 0 },
      blue: { r: 0, g: 0, b: 1 },
      yellow: { r: 1, g: 1, b: 0 },
      cyan: { r: 0, g: 1, b: 1 },
      magenta: { r: 1, g: 0, b: 1 },
      gray: { r: 0.5, g: 0.5, b: 0.5 },
      transparent: { r: 0, g: 0, b: 0 },
    };

    return namedColors[color.toLowerCase()] ?? { r: 0, g: 0, b: 0 };
  }

  return { r: 0, g: 0, b: 0 };
}

/**
 * Parse dimension string to number
 */
export function parseDimension(
  value: string | number | undefined,
  fallback = 100
): number {
  if (value === undefined) return fallback;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    // Remove px, pt, etc and parse
    const num = parseFloat(value.replace(/[^\d.-]/g, ""));
    return isNaN(num) ? fallback : num;
  }
  return fallback;
}

/**
 * Check if color is transparent
 */
export function isTransparentColor(color: string | undefined): boolean {
  if (!color) return true;
  return (
    color === "transparent" ||
    color === "rgba(0,0,0,0)" ||
    color === "rgba(0, 0, 0, 0)"
  );
}
