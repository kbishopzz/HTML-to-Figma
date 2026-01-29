/**
 * Figma Plugin Console Test Script
 * 
 * PURPOSE: Test if the plugin is receiving and processing JSON
 * 
 * USAGE:
 * 1. Open Figma plugin
 * 2. Open Figma Plugin Console: Plugins → Development → Show/Hide Console
 * 3. In the plugin UI textarea, paste the test JSON below
 * 4. Click Convert
 * 5. Check the console output
 * 
 * EXPECTED OUTPUT:
 * 🚀 Plugin code.ts loaded and running
 * 📡 Setting up message listener...
 * 📨 Message received from UI: convert-json
 * 📦 Full message: {...}
 * ✅ convert-json message detected
 * 🔍 JSON Data received: {"type":"CANVAS"...
 * 🔍 JSON type: CANVAS
 * 🔍 Has children: true
 * 🔍 Children count: 1
 * ✅ Creating node: body
 * 📐 Position: x=0, y=0, width=100, height=100
 */

// Minimal test JSON for debugging
const testJson = {
  "type": "CANVAS",
  "name": "Debug Test",
  "children": [
    {
      "type": "body",
      "text": "Hello World",
      "styles": {
        "backgroundColor": "rgb(255, 255, 255)",
        "fontSize": "16px",
        "color": "rgb(0, 0, 0)"
      },
      "position": {
        "absolute": {
          "x": 0,
          "y": 0,
          "width": 200,
          "height": 100
        }
      }
    }
  ]
};

console.log('📋 TEST JSON - Copy this into the plugin:');
console.log(JSON.stringify(testJson, null, 2));
console.log('\n✅ Test JSON ready - paste into Figma plugin textarea and click Convert');
console.log('📡 Watch the Figma Plugin Console for logs starting with 🚀 and 📨');
