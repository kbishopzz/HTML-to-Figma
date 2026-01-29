/**
 * Sanitize font family name by extracting first valid font
 */
export function sanitizeFontFamily(fontFamily: string | undefined): string {
  if (!fontFamily) return "Inter";
  // Extract first font from comma-separated list, remove quotes
  const firstFont = fontFamily.split(",")[0].trim().replace(/['"]/g, "");
  return firstFont || "Inter";
}

/**
 * Map font weight to Figma font style
 */
export function mapFontWeightToStyle(
  weight: string | number | undefined
): string {
  if (!weight) return "Regular";

  const numWeight = typeof weight === "string" ? parseInt(weight, 10) : weight;

  if (isNaN(numWeight)) return "Regular";

  if (numWeight >= 700) return "Bold";
  if (numWeight >= 600) return "SemiBold";
  if (numWeight >= 500) return "Medium";
  if (numWeight >= 300) return "Light";
  if (numWeight >= 100) return "Thin";

  return "Regular";
}

/**
 * Load font with fallback to Inter Regular
 */
export async function loadFontWithFallback(
  family: string,
  style: string
): Promise<FontName> {
  try {
    const fontName = { family, style };
    await figma.loadFontAsync(fontName);
    return fontName;
  } catch {
    console.warn(
      `Failed to load font ${family} ${style}, falling back to Inter Regular`
    );
    const fallback = { family: "Inter", style: "Regular" };
    await figma.loadFontAsync(fallback);
    return fallback;
  }
}

/**
 * Check if font family is available
 */
export async function isFontAvailable(
  family: string,
  style = "Regular"
): Promise<boolean> {
  try {
    await figma.loadFontAsync({ family, style });
    return true;
  } catch {
    return false;
  }
}
