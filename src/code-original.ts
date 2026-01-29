import { convertJsonToFigma } from "./converter-new";
import { ConversionOptions } from "./types";
import { runAutomatedTest, createTestReport, runSampleTest } from "./automated-test";
// Import UI HTML (raw-loader will inline this as a string)
import uiHtml from "./ui.html";

// Check if command is 'automated-test'
if (figma.command === 'automated-test') {
  console.log('🤖 Running automated test mode...');
  
  runSampleTest()
    .then(async (result) => {
      console.log('📊 Test result:', result);
      
      // Create visual report
      const reportFrame = await createTestReport(result);
      figma.viewport.scrollAndZoomIntoView([reportFrame]);
      
      // Show notification
      if (result.success) {
        figma.notify(
          `✅ Test passed! Created ${result.nodesCreated} nodes in ${result.timeTaken}ms`,
          { timeout: 5000 }
        );
      } else {
        figma.notify(`❌ Test failed: ${result.errors[0] || 'Unknown error'}`, {
          error: true,
          timeout: 10000,
        });
      }
      
      // Keep plugin open to show results
      setTimeout(() => {
        figma.closePlugin();
      }, 3000);
    })
    .catch((error) => {
      console.error('❌ Test execution failed:', error);
      figma.notify(`❌ Test execution failed: ${error.message}`, {
        error: true,
        timeout: 10000,
      });
      figma.closePlugin();
    });
} else {
  // Normal UI mode
  // Show the UI
  figma.showUI(uiHtml, { width: 450, height: 650 });
}

// Note: Sample JSON loading removed for production use
// Users should paste their own extracted JSON from browser-extract.js

// ADD IMMEDIATE LOGGING
console.log('🚀 Plugin code.ts loaded and running');
console.log('📡 Setting up message listener...');

// Listen for messages from the UI
figma.ui.onmessage = async (msg) => {
  console.log('📨 Message received from UI:', msg.type);
  console.log('📦 Full message:', JSON.stringify(msg).substring(0, 200));
  
  if (msg.type === "convert-json") {
    console.log('✅ convert-json message detected');
    try {
      // Notify UI we've received the request (helps debugging)
      figma.ui.postMessage({
        type: "conversion-status",
        message: "Received convert request",
      });

      // Default options, merged with any options from the UI message
      const defaultOptions: ConversionOptions = {
        preserveColors: true,
        preserveTextStyles: true,
        useAutoLayout: true,
        flattenDivs: false,
        extractComponents: false,
      };

      const options: ConversionOptions = {
        ...defaultOptions,
        ...(msg.options || {}),
      };

      // Ensure JSON data is valid
      if (!msg.jsonData) {
        throw new Error("No JSON data provided");
      }

      // Debug: Log the JSON structure
      console.log('🔍 JSON Data received:', JSON.stringify(msg.jsonData).substring(0, 500));
      console.log('🔍 JSON type:', msg.jsonData.type);
      console.log('🔍 Has children:', !!msg.jsonData.children);
      if (msg.jsonData.children) {
        console.log('🔍 Children count:', msg.jsonData.children.length);
        console.log('🔍 First child:', JSON.stringify(msg.jsonData.children[0]).substring(0, 300));
      }

      // Convert JSON to Figma layout
      const nodes = await convertJsonToFigma(
        msg.jsonData,
        options
      );

      if (nodes.length === 0) {
        throw new Error('No nodes were created from the JSON data');
      }

      // Append nodes to the current page
      for (const node of nodes) {
        figma.currentPage.appendChild(node);
      }

      // Focus on the created layout
      figma.currentPage.selection = nodes;
      figma.viewport.scrollAndZoomIntoView(nodes);

      // Count nodes created (for debugging) — recursive traversal
      const countNodes = (node: SceneNode): number => {
        let count = 1;
        if ('children' in node && Array.isArray(node.children)) {
          for (const child of node.children) {
            count += countNodes(child);
          }
        }
        return count;
      };

      const createdCount = nodes.reduce((sum, node) => sum + countNodes(node), 0);
      const rootNode = nodes[0];

      // Notify successful conversion and include count for visibility
      figma.ui.postMessage({
        type: "conversion-complete",
        created: createdCount,
        rootId: rootNode.id,
        rootName: rootNode.name,
        bounds: rootNode.absoluteBoundingBox
          ? {
              x: rootNode.absoluteBoundingBox.x,
              y: rootNode.absoluteBoundingBox.y,
              width: rootNode.absoluteBoundingBox.width,
              height: rootNode.absoluteBoundingBox.height,
            }
          : null,
      });
    } catch (error) {
      console.error("❌ Conversion error:", error);
      console.error("❌ Error stack:", (error as Error).stack);

      // Send error back to UI
      figma.ui.postMessage({
        type: "conversion-error",
        error: (error as Error).message || "Unknown error occurred",
      });
    }
  } else if (msg.type === "cancel") {
    console.log('🚫 Cancel message received - closing plugin');
    // User canceled, close the plugin
    figma.closePlugin();
  } else if (msg.type === "run-automated-test") {
    console.log('🤖 Running automated test from UI...');
    
    try {
      const result = await runAutomatedTest(msg.jsonData, msg.options);
      
      // Create visual report
      const reportFrame = await createTestReport(result);
      figma.viewport.scrollAndZoomIntoView([reportFrame]);
      
      // Send results back to UI
      figma.ui.postMessage({
        type: "test-complete",
        result: result,
      });
      
      // Show notification
      if (result.success) {
        figma.notify(
          `✅ Test passed! Created ${result.nodesCreated} nodes in ${result.timeTaken}ms`,
          { timeout: 5000 }
        );
      } else {
        figma.notify(`❌ Test failed: ${result.errors[0] || 'Unknown error'}`, {
          error: true,
          timeout: 10000,
        });
      }
    } catch (error) {
      console.error('❌ Automated test failed:', error);
      figma.ui.postMessage({
        type: "test-error",
        error: (error as Error).message,
      });
    }
  } else {
    console.log('⚠️ Unknown message type:', msg.type);
  }
};
