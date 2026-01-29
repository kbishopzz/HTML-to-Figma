#!/usr/bin/env node

/**
 * Auto Test Script for Figma Plugin
 * 
 * This script automates the testing workflow:
 * 1. Opens a test HTML file in a browser
 * 2. Automatically extracts the page to JSON using browser-extract.js
 * 3. Saves the JSON to a file
 * 4. Can auto-paste into Figma plugin (if Figma API available)
 * 
 * Usage:
 *   node test-automation.js [test-url]
 * 
 * Examples:
 *   node test-automation.js
 *   node test-automation.js https://example.com
 *   node test-automation.js ./test-page.html
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Read browser-extract.js script
const extractScript = fs.readFileSync(
  path.join(__dirname, 'browser-extract.js'),
  'utf-8'
);

// Create a simple test HTML page
const testHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Figma Plugin Test Page</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      margin: 0;
      padding: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      padding: 48px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    h1 {
      color: #1a202c;
      font-size: 48px;
      font-weight: 800;
      margin: 0 0 16px 0;
    }
    
    .subtitle {
      color: #718096;
      font-size: 20px;
      margin-bottom: 32px;
    }
    
    .card {
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    
    .card h2 {
      color: #2d3748;
      font-size: 24px;
      margin: 0 0 12px 0;
    }
    
    .card p {
      color: #4a5568;
      font-size: 16px;
      line-height: 1.6;
      margin: 0;
    }
    
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 32px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      margin-top: 24px;
      transition: all 0.2s;
    }
    
    .button:hover {
      background: #5568d3;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    .button:active {
      transform: translateY(0);
    }
    
    .flex-row {
      display: flex;
      gap: 24px;
      margin-top: 32px;
    }
    
    .flex-col {
      flex: 1;
      background: #edf2f7;
      padding: 20px;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Test Page for Figma Import</h1>
    <p class="subtitle">This page tests text, layouts, colors, and spacing</p>
    
    <div class="card">
      <h2>Card with Text</h2>
      <p>This is a sample card component with styled text. It should import with proper colors, fonts, and spacing.</p>
    </div>
    
    <div class="card">
      <h2>Another Card</h2>
      <p>Multiple cards help test vertical layouts and consistent styling across components.</p>
    </div>
    
    <div class="flex-row">
      <div class="flex-col">
        <h3 style="margin: 0 0 8px 0; color: #2d3748;">Column 1</h3>
        <p style="margin: 0; color: #4a5568; font-size: 14px;">Flex layout test</p>
      </div>
      <div class="flex-col">
        <h3 style="margin: 0 0 8px 0; color: #2d3748;">Column 2</h3>
        <p style="margin: 0; color: #4a5568; font-size: 14px;">Multi-column layout</p>
      </div>
      <div class="flex-col">
        <h3 style="margin: 0 0 8px 0; color: #2d3748;">Column 3</h3>
        <p style="margin: 0; color: #4a5568; font-size: 14px;">Side by side</p>
      </div>
    </div>
    
    <button class="button" id="extractBtn">Click Me - Copy JSON Again</button>
  </div>
  
  <script>
    // Store the extracted JSON globally
    let currentJson = null;
    
    // Function to show feedback notification
    function showFeedback(message, color = '#10b981') {
      const feedback = document.createElement('div');
      feedback.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        background: \${color};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-family: system-ui;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
      \`;
      feedback.textContent = message;
      document.body.appendChild(feedback);
      
      setTimeout(() => {
        feedback.style.transition = 'opacity 0.3s';
        feedback.style.opacity = '0';
        setTimeout(() => feedback.remove(), 300);
      }, 3000);
    }
    
    // Auto-extract on load
    setTimeout(() => {
      ${extractScript}
      
      // Store reference
      currentJson = window.figmaJson;
      
      // Add visual feedback
      showFeedback('✅ Page extracted! Check console and clipboard.');
    }, 1000);
    
    // Make button functional
    document.getElementById('extractBtn').addEventListener('click', function(e) {
      e.preventDefault();
      
      if (currentJson) {
        // Copy to clipboard
        const jsonString = JSON.stringify(currentJson, null, 2);
        navigator.clipboard.writeText(jsonString).then(() => {
          showFeedback('📋 JSON copied to clipboard!', '#667eea');
          console.log('📋 JSON re-copied to clipboard!');
          console.log('Total nodes:', countNodes(currentJson));
        }).catch(err => {
          showFeedback('❌ Could not copy to clipboard', '#ef4444');
          console.error('Copy failed:', err);
        });
      } else {
        showFeedback('⚠️ No JSON available - refresh page', '#f59e0b');
      }
    });
    
    function countNodes(node) {
      let count = 1;
      if (node && node.children) {
        for (let child of node.children) {
          count += countNodes(child);
        }
      }
      return count;
    }
  </script>
</body>
</html>
`;

// Write test HTML file
const testFilePath = path.join(__dirname, 'test-page.html');
fs.writeFileSync(testFilePath, testHtml, 'utf-8');

log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
log('  🚀 FIGMA PLUGIN AUTO-TEST SETUP', 'bright');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
log('');

log('✅ Created test HTML file:', 'green');
log(`   ${testFilePath}`, 'blue');
log('');

log('📋 TESTING WORKFLOW:', 'yellow');
log('');
log('1. Open the test page in your browser:', 'reset');
log(`   file://${testFilePath}`, 'blue');
log('');
log('2. The page will auto-extract to JSON after 1 second', 'reset');
log('');
log('3. JSON will be copied to your clipboard automatically', 'reset');
log('');
log('4. Open Figma and run the plugin:', 'reset');
log('   • Plugins → Development → HTML to Figma Converter', 'reset');
log('');
log('5. Paste the JSON and click "Convert to Figma"', 'reset');
log('');

log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
log('');

log('💡 TIP: You can also use the sample JSON:', 'yellow');
log(`   cat ${path.join(__dirname, 'test-sample.json')} | pbcopy`, 'blue');
log('');

log('🔄 To test again, just refresh the test page!', 'green');
log('');

// Try to open the file in default browser
const { exec } = require('child_process');
const openCommand = process.platform === 'darwin' ? 'open' : 
                   process.platform === 'win32' ? 'start' : 'xdg-open';

exec(`${openCommand} "${testFilePath}"`, (error) => {
  if (!error) {
    log('🌐 Opened test page in your default browser', 'green');
  } else {
    log('⚠️  Could not auto-open browser. Please open manually:', 'yellow');
    log(`   file://${testFilePath}`, 'blue');
  }
});
