/**
 * Automated Testing Module for Figma Plugin
 * 
 * This module uses the Figma Plugin API to programmatically test
 * the JSON-to-Figma conversion without manual UI interaction.
 */

import { convertJsonToFigma } from './converter-new';
import { ConversionOptions, JsonNode } from './types';

export interface TestResult {
  success: boolean;
  nodesCreated: number;
  errors: string[];
  warnings: string[];
  nodeTypes: Record<string, number>;
  timeTaken: number;
  details: {
    rootNode?: SceneNode;
    bounds?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    layerStructure: string[];
  };
}

/**
 * Run automated test with the provided JSON
 */
export async function runAutomatedTest(
  jsonData: JsonNode,
  options?: ConversionOptions
): Promise<TestResult> {
  const startTime = Date.now();
  const result: TestResult = {
    success: false,
    nodesCreated: 0,
    errors: [],
    warnings: [],
    nodeTypes: {},
    timeTaken: 0,
    details: {
      layerStructure: [],
    },
  };

  try {
    console.log('🤖 AUTOMATED TEST START');
    console.log('📊 Input JSON type:', jsonData.type);
    console.log('📊 Has children:', !!jsonData.children);
    if (jsonData.children) {
      console.log('📊 Children count:', jsonData.children.length);
    }

    // Run conversion
    const nodes = await convertJsonToFigma(jsonData, options);

    if (!nodes || nodes.length === 0) {
      result.errors.push('Conversion returned no nodes');
      return result;
    }

    result.nodesCreated = nodes.length;
    console.log('✅ Conversion completed:', nodes.length, 'root nodes created');

    // Analyze nodes
    const rootNode = nodes[0];
    result.details.rootNode = rootNode;
    
    // Count ALL nodes recursively
    const totalNodeCount = countTotalNodes(rootNode);
    console.log('📊 Total nodes (recursive):', totalNodeCount);

    // Get bounds
    if ('absoluteBoundingBox' in rootNode && rootNode.absoluteBoundingBox) {
      result.details.bounds = {
        x: rootNode.absoluteBoundingBox.x,
        y: rootNode.absoluteBoundingBox.y,
        width: rootNode.absoluteBoundingBox.width,
        height: rootNode.absoluteBoundingBox.height,
      };
      console.log('📐 Root bounds:', result.details.bounds);
    } else {
      result.warnings.push('Root node has no bounds');
    }

    // Count node types recursively
    function countNodeTypes(node: BaseNode) {
      const nodeType = node.type;
      result.nodeTypes[nodeType] = (result.nodeTypes[nodeType] || 0) + 1;
      result.details.layerStructure.push(`${nodeType}: ${node.name}`);

      if ('children' in node) {
        for (const child of node.children) {
          countNodeTypes(child);
        }
      }
    }

    countNodeTypes(rootNode);
    console.log('📊 Node types:', result.nodeTypes);
    
    // Update nodesCreated to reflect total count
    result.nodesCreated = totalNodeCount;

    // Validation checks
    if (result.nodeTypes['FRAME'] === totalNodeCount && !result.nodeTypes['TEXT']) {
      result.warnings.push('All nodes are frames - may indicate conversion issue');
    }

    if (!result.nodeTypes['TEXT']) {
      result.warnings.push('No text nodes created - expected text from JSON');
    }

    if (
      result.details.bounds &&
      result.details.bounds.width === 100 &&
      result.details.bounds.height === 100
    ) {
      result.warnings.push('Root node is 100×100 - may indicate default sizing issue');
    }

    // Add to canvas for visual inspection
    figma.currentPage.appendChild(rootNode);
    figma.viewport.scrollAndZoomIntoView([rootNode]);

    result.success = true;
    result.timeTaken = Date.now() - startTime;

    console.log('✅ AUTOMATED TEST COMPLETE');
    console.log('⏱️  Time taken:', result.timeTaken, 'ms');
    console.log('📊 Total nodes:', countTotalNodes(rootNode));
    console.log('⚠️  Warnings:', result.warnings.length);

    return result;
  } catch (error) {
    result.errors.push((error as Error).message || 'Unknown error');
    result.errors.push((error as Error).stack || 'No stack trace');
    result.timeTaken = Date.now() - startTime;
    console.error('❌ AUTOMATED TEST FAILED');
    console.error('❌ Error:', error);
    return result;
  }
}

/**
 * Count total nodes recursively
 */
function countTotalNodes(node: BaseNode): number {
  let count = 1;
  if ('children' in node) {
    for (const child of node.children) {
      count += countTotalNodes(child);
    }
  }
  return count;
}

/**
 * Create a test report frame with the results
 */
export async function createTestReport(result: TestResult): Promise<FrameNode> {
  // Load default font first
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  
  const reportFrame = figma.createFrame();
  reportFrame.name = 'Test Report';
  reportFrame.x = 0;
  reportFrame.y = -400;
  reportFrame.resize(600, 350);
  reportFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

  let yOffset = 20;

  // Title
  const title = figma.createText();
  title.name = 'Title';
  title.characters = '🤖 Automated Test Report';
  title.fontSize = 24;
  title.x = 20;
  title.y = yOffset;
  reportFrame.appendChild(title);
  yOffset += 40;

  // Status
  const status = figma.createText();
  status.name = 'Status';
  status.characters = result.success ? '✅ PASSED' : '❌ FAILED';
  status.fontSize = 18;
  status.fills = [
    {
      type: 'SOLID',
      color: result.success ? { r: 0, g: 0.8, b: 0 } : { r: 1, g: 0, b: 0 },
    },
  ];
  status.x = 20;
  status.y = yOffset;
  reportFrame.appendChild(status);
  yOffset += 35;

  // Stats
  const stats = figma.createText();
  stats.name = 'Stats';
  stats.characters = [
    `Nodes Created: ${result.nodesCreated}`,
    `Time Taken: ${result.timeTaken}ms`,
    `Errors: ${result.errors.length}`,
    `Warnings: ${result.warnings.length}`,
    '',
    'Node Types:',
    ...Object.entries(result.nodeTypes).map(([type, count]) => `  ${type}: ${count}`),
  ].join('\n');
  stats.fontSize = 14;
  stats.x = 20;
  stats.y = yOffset;
  reportFrame.appendChild(stats);
  yOffset += 150;

  // Errors/Warnings
  if (result.errors.length > 0 || result.warnings.length > 0) {
    const issues = figma.createText();
    issues.name = 'Issues';
    issues.characters = [
      result.errors.length > 0 ? '❌ Errors:' : '',
      ...result.errors.map((e) => `  ${e}`),
      result.warnings.length > 0 ? '⚠️  Warnings:' : '',
      ...result.warnings.map((w) => `  ${w}`),
    ]
      .filter(Boolean)
      .join('\n');
    issues.fontSize = 12;
    issues.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0, b: 0 } }];
    issues.x = 20;
    issues.y = yOffset;
    reportFrame.appendChild(issues);
  }

  figma.currentPage.appendChild(reportFrame);
  return reportFrame;
}

/**
 * Run test with sample data
 */
export function runSampleTest(): Promise<TestResult> {
  const sampleJson: JsonNode = {
    type: 'CANVAS',
    name: 'Automated Test',
    children: [
      {
        type: 'div',
        text: 'Test Frame',
        styles: {
          backgroundColor: 'rgb(240, 240, 240)',
          padding: '20px',
        },
        position: {
          absolute: {
            x: 0,
            y: 0,
            width: 400,
            height: 300,
          },
        },
        children: [
          {
            type: 'text',
            text: 'Test Text Node',
            styles: {
              fontSize: '24px',
              color: 'rgb(0, 0, 0)',
              fontWeight: '600',
            },
            position: {
              absolute: {
                x: 20,
                y: 20,
                width: 200,
                height: 30,
              },
            },
          },
          {
            type: 'div',
            styles: {
              backgroundColor: 'rgb(0, 120, 255)',
              borderRadius: '8px',
            },
            position: {
              absolute: {
                x: 20,
                y: 70,
                width: 360,
                height: 100,
              },
            },
            children: [
              {
                type: 'text',
                text: 'Nested Text',
                styles: {
                  fontSize: '16px',
                  color: 'rgb(255, 255, 255)',
                },
                position: {
                  absolute: {
                    x: 20,
                    y: 40,
                    width: 100,
                    height: 20,
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  };

  return runAutomatedTest(sampleJson, {
    preserveColors: true,
    preserveTextStyles: true,
    useAutoLayout: false,
  });
}
