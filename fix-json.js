#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Read the broken JSON
const inputFile = process.argv[2] || "figma-design copy.json";
const outputFile = process.argv[3] || "figma-design-fixed.json";

console.log(`Reading ${inputFile}...`);
const data = JSON.parse(fs.readFileSync(inputFile, "utf8"));

// Recursive fix function
function fixNode(node, depth = 0) {
  if (!node || typeof node !== "object") return node;

  // Fix font family (remove CSS variables)
  if (node.fontName) {
    if (node.fontName.family && node.fontName.family.startsWith("var(")) {
      node.fontName.family = "Inter";
    }
  }
  if (node.style?.fontFamily && node.style.fontFamily.startsWith("var(")) {
    node.style.fontFamily = "Inter";
  }

  // Fix font size (convert REM to pixels, assume 16px base)
  if (node.fontSize !== undefined) {
    if (node.fontSize < 10) {
      // Likely REM value
      node.fontSize = Math.round(node.fontSize * 16);
    }
  }
  if (node.style?.fontSize !== undefined) {
    if (node.style.fontSize < 10) {
      node.style.fontSize = Math.round(node.style.fontSize * 16);
    }
  }

  // Add missing dimensions for auto-layout frames
  if (node.type === "FRAME" && node.layoutMode) {
    // If no explicit size, estimate based on children/padding
    if (node.width === undefined || node.height === undefined) {
      // Use a reasonable default based on nesting level
      const defaultWidth = Math.max(800 - depth * 50, 200);
      const defaultHeight = Math.max(600 - depth * 40, 100);

      if (node.width === undefined) node.width = defaultWidth;
      if (node.height === undefined) node.height = defaultHeight;
    }
  }

  // Ensure all nodes have x,y
  if (node.x === undefined && node.type !== "CANVAS") node.x = 0;
  if (node.y === undefined && node.type !== "CANVAS") node.y = 0;

  // Ensure non-auto-layout nodes have dimensions
  if (!node.layoutMode && node.type !== "CANVAS" && node.type !== "TEXT") {
    if (node.width === undefined) node.width = 100;
    if (node.height === undefined) node.height = 100;
  }

  // Fix text nodes specifically
  if (node.type === "TEXT") {
    if (!node.characters && node.name) {
      // Use name as characters if empty
      node.characters = node.name;
    }
    if (node.width === undefined) node.width = 200;
    if (node.height === undefined) node.height = 32;

    // Fix black text - make it dark gray instead
    if (node.fills && Array.isArray(node.fills)) {
      node.fills = node.fills.map((fill) => {
        if (fill.type === "SOLID" && fill.color) {
          const { r, g, b } = fill.color;
          // If completely black, make it readable dark gray
          if (r === 0 && g === 0 && b === 0) {
            return {
              ...fill,
              color: { r: 0.2, g: 0.2, b: 0.2 }, // Dark gray
            };
          }
        }
        return fill;
      });
    }
  }

  // Fix frame fills - remove pure black backgrounds or make them light
  if (node.type === "FRAME" && node.fills && Array.isArray(node.fills)) {
    node.fills = node.fills.map((fill) => {
      if (fill.type === "SOLID" && fill.color) {
        const { r, g, b } = fill.color;
        // If completely black, make it light gray background
        if (r === 0 && g === 0 && b === 0) {
          return {
            ...fill,
            color: { r: 0.95, g: 0.95, b: 0.97 }, // Light gray background
          };
        }
      }
      return fill;
    });
  }

  // Recursively fix children
  if (Array.isArray(node.children)) {
    node.children = node.children.map((child) => fixNode(child, depth + 1));
  }

  return node;
}

console.log("Fixing JSON structure...");
const fixed = fixNode(data);

console.log(`Writing ${outputFile}...`);
fs.writeFileSync(outputFile, JSON.stringify(fixed, null, 2));

console.log("✅ Done! Fixed JSON written to:", outputFile);
console.log("\nKey fixes applied:");
console.log('  - Replaced var(--font-*) with "Inter"');
console.log("  - Converted REM font sizes to pixels");
console.log("  - Added missing x, y, width, height properties");
console.log("\nNow upload", outputFile, "to your Figma plugin!");
