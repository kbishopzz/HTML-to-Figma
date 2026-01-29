/**
 * Local Extraction Server for Figma Plugin
 * 
 * Run this server locally to enable automatic extraction:
 * 1. npm install express puppeteer cors
 * 2. node extraction-server.js
 * 3. Use the plugin's "Extract URL" feature
 * 
 * The plugin will communicate with this server at http://localhost:3000
 */

const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Enable CORS for Figma plugin
app.use(cors());
app.use(express.json());

// Read the extraction script
const extractionScript = fs.readFileSync(
  path.join(__dirname, 'browser-extract.js'),
  'utf8'
);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'running',
    message: 'Figma HTML Extraction Server is running!',
    endpoints: {
      extract: 'POST /extract - Extract a webpage to JSON',
      health: 'GET / - Health check'
    }
  });
});

// Extract endpoint
app.post('/extract', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  console.log(`📦 Extracting: ${url}`);
  
  let browser;
  try {
    // Launch headless browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to URL
    console.log('🌐 Loading page...');
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Inject and run extraction script
    console.log('🎨 Extracting content...');
    const result = await page.evaluate(extractionScript);
    
    // The script returns the pageJson object
    const pageJson = await page.evaluate(() => window.figmaJson);
    
    if (!pageJson) {
      throw new Error('Extraction failed - no data returned');
    }
    
    console.log('✅ Extraction successful!');
    console.log(`📊 Extracted ${countNodes(pageJson)} nodes`);
    
    // Send JSON back to plugin
    res.json({
      success: true,
      data: pageJson,
      stats: {
        totalNodes: countNodes(pageJson),
        url: pageJson.url,
        extractedAt: pageJson.extractedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Extraction error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// Helper function to count nodes
function countNodes(node) {
  let count = 1;
  if (node.children) {
    for (let child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Figma HTML Extraction Server Started!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Server running at: http://localhost:${PORT}`);
  console.log('');
  console.log('📋 Usage:');
  console.log('1. Keep this server running');
  console.log('2. Open Figma plugin');
  console.log('3. Enter URL and click "Extract URL"');
  console.log('4. JSON will automatically appear in the plugin!');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});
