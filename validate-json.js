#!/usr/bin/env node

/**
 * Validate test-sample.json format
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating test-sample.json...\n');

const jsonPath = path.join(__dirname, 'test-sample.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

function validateNode(node, depth = 0, parentInfo = '') {
  const indent = '  '.repeat(depth);
  const nodeType = node.type || 'unknown';
  const hasText = !!node.text;
  const hasPosition = !!node.position?.absolute;
  const hasStyles = !!node.styles;
  
  console.log(`${indent}📦 ${nodeType}${hasText ? ` [text: "${node.text.substring(0, 30)}..."]` : ''}`);
  
  // Check position
  if (hasPosition) {
    const pos = node.position.absolute;
    console.log(`${indent}   📐 x:${pos.x}, y:${pos.y}, w:${pos.width}, h:${pos.height}`);
    
    // Validate position values
    if (typeof pos.width !== 'number' || typeof pos.height !== 'number') {
      console.log(`${indent}   ⚠️  Width/Height are not numbers!`);
    }
    if (pos.width === 0 || pos.height === 0) {
      console.log(`${indent}   ⚠️  Zero width or height!`);
    }
  } else {
    console.log(`${indent}   ❌ NO POSITION DATA`);
  }
  
  // Check styles
  if (hasStyles) {
    const styleCount = Object.keys(node.styles).length;
    console.log(`${indent}   🎨 ${styleCount} styles`);
    if (node.styles.backgroundColor) {
      console.log(`${indent}      bg: ${node.styles.backgroundColor}`);
    }
    if (node.styles.fontSize) {
      console.log(`${indent}      font: ${node.styles.fontSize}`);
    }
  }
  
  // Process children
  if (node.children && node.children.length > 0) {
    console.log(`${indent}   👶 ${node.children.length} children:`);
    for (const child of node.children) {
      validateNode(child, depth + 1, nodeType);
    }
  }
  
  console.log('');
}

// Validate
console.log('Root:');
console.log(`  Type: ${jsonData.type}`);
console.log(`  Name: ${jsonData.name}`);
console.log(`  Children: ${jsonData.children?.length || 0}\n`);

if (jsonData.children && jsonData.children.length > 0) {
  for (const child of jsonData.children) {
    validateNode(child, 0);
  }
}

console.log('✅ Validation complete!');
console.log('\nTo test in Figma:');
console.log('  1. npm run test:sample');
console.log('  2. Open Figma plugin');
console.log('  3. Paste JSON');
console.log('  4. Check Figma DevTools Console for logs');
