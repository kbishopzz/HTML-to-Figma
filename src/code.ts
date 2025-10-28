import { convertJsonToFigma } from "./converter";
import { JsonNode, ConversionOptions } from "./types";
// Import UI HTML (raw-loader will inline this as a string)
import uiHtml from "./ui.html";
// Bundle the sample Figma-style JSON so the UI can be pre-filled in dev
import sampleFigma from "../sample-figma-design.json";

// Show the UI
figma.showUI(uiHtml, { width: 450, height: 650 });

// Load sample JSON for development
setTimeout(() => {
  figma.ui.postMessage({
    type: "load-sample",
    jsonData: sampleFigma,
  });
}, 100);

// Listen for messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === "convert-json") {
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

      // Convert JSON to Figma layout
      const rootNode = await convertJsonToFigma(
        msg.jsonData as JsonNode,
        options
      );

      // Append the root node to the current page
      figma.currentPage.appendChild(rootNode);

      // Focus on the created layout
      figma.currentPage.selection = [rootNode];
      figma.viewport.scrollAndZoomIntoView([rootNode]);

      // Count nodes created (for debugging) — recursive traversal
      const countNodes = (node: SceneNode | undefined): number => {
        if (!node) return 0;
        let count = 1; // include this node
        // @ts-ignore - SceneNode may not have children on all types
        if ((node as any).children && (node as any).children.length) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const child of (node as any).children as SceneNode[]) {
            count += countNodes(child);
          }
        }
        return count;
      };

      const createdCount = countNodes(rootNode);

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
      console.error("Conversion error:", error);

      // Send error back to UI
      figma.ui.postMessage({
        type: "conversion-error",
        error: (error as Error).message || "Unknown error occurred",
      });
    }
  } else if (msg.type === "cancel") {
    // User canceled, close the plugin
    figma.closePlugin();
  }
};
