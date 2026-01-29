# Automated Testing System

## Overview

The plugin now includes a comprehensive automated testing system that uses the Figma Plugin API to programmatically test JSON-to-Figma conversion **without manual console inspection**.

---

## Three Ways to Test

### 1. **Menu Command: Run Automated Test**

**Fastest way to test without any JSON**

1. In Figma: **Plugins → HTML to Figma Converter → Run Automated Test**
2. Plugin runs with built-in sample JSON
3. Creates two frames on canvas:
   - **Test Report** (top): Visual test results with stats
   - **Converted Content** (below): The actual conversion output
4. Auto-closes after 3 seconds
5. Shows notification with results

**What it tests:**

- ✅ Basic frame creation
- ✅ Text node rendering
- ✅ Nested structure
- ✅ Colors and styling
- ✅ Position and sizing

---

### 2. **UI Button: 🤖 Run Automated Test**

**Test with your own JSON**

1. Open plugin: **Plugins → HTML to Figma Converter → Convert HTML/JSON**
2. Paste your JSON in the textarea
3. Click green **"🤖 Run Automated Test"** button
4. View results in status area:
   ```
   ✅ TEST PASSED
   Nodes Created: 5
   Time: 123ms
   Node Types: {"FRAME":2,"TEXT":3}
   ⚠️ Warnings: ...
   ```
5. Check canvas for:
   - **Test Report frame** (visual summary)
   - **Converted nodes** (your JSON as Figma)

---

### 3. **Programmatic API** (for developers)

Add to your plugin code:

```typescript
import { runAutomatedTest, createTestReport } from "./automated-test";

const result = await runAutomatedTest(yourJsonData, options);
console.log("Test result:", result);

// Create visual report
const reportFrame = createTestReport(result);
```

---

## Test Results Structure

```typescript
{
  success: boolean;          // Overall pass/fail
  nodesCreated: number;       // Root nodes count
  errors: string[];           // Critical errors
  warnings: string[];         // Non-critical issues
  nodeTypes: {                // Count by type
    FRAME: 5,
    TEXT: 10,
    RECTANGLE: 2
  };
  timeTaken: number;          // Milliseconds
  details: {
    bounds: {                 // Root node dimensions
      x: 0,
      y: 0,
      width: 400,
      height: 300
    },
    layerStructure: string[]; // Node tree
  }
}
```

---

## Automatic Validations

The test system checks for common issues:

### ⚠️ Warnings Detected:

- **All nodes are frames** → May indicate conversion issue
- **No text nodes created** → Expected text missing
- **100×100 default size** → Position/sizing not applied
- **No bounds on root node** → Node invisible/off-screen

### ❌ Errors Detected:

- **No nodes created** → Conversion completely failed
- **JSON parse errors** → Invalid JSON format
- **Type mismatches** → Unexpected node types
- **API errors** → Figma API call failures

---

## Visual Test Report

The report frame shows:

```
🤖 Automated Test Report

✅ PASSED  (or ❌ FAILED)

Nodes Created: 5
Time Taken: 123ms
Errors: 0
Warnings: 1

Node Types:
  FRAME: 2
  TEXT: 3

⚠️ Warnings:
  No bounds on root node

❌ Errors:
  (none)
```

---

## Example: Test Your Extracted JSON

```bash
# 1. Extract page in browser
npm test  # Opens browser, extracts JSON, copies to clipboard

# 2. In Figma:
Plugins → HTML to Figma Converter → Convert HTML/JSON

# 3. Paste JSON in textarea

# 4. Click "🤖 Run Automated Test"

# 5. Check results:
- Status area shows test summary
- Canvas shows test report + converted nodes
- Console shows detailed logs
```

---

## Benefits Over Manual Testing

### Before (Manual):

1. ❌ Paste JSON → Click Convert
2. ❌ Inspect layers manually
3. ❌ Check console for errors
4. ❌ Verify positions/sizes by eye
5. ❌ No clear pass/fail

### Now (Automated):

1. ✅ Click one button
2. ✅ Get instant pass/fail
3. ✅ See exact node counts
4. ✅ Visual report on canvas
5. ✅ Automatic issue detection
6. ✅ Performance metrics

---

## Sample Test JSON

Built-in test uses:

```json
{
  "type": "CANVAS",
  "children": [
    {
      "type": "div",
      "position": {
        "absolute": { "x": 0, "y": 0, "width": 400, "height": 300 }
      },
      "styles": { "backgroundColor": "rgb(240, 240, 240)" },
      "children": [
        {
          "type": "text",
          "text": "Test Text",
          "position": {
            "absolute": { "x": 20, "y": 20, "width": 200, "height": 30 }
          },
          "styles": { "fontSize": "24px", "color": "rgb(0, 0, 0)" }
        }
      ]
    }
  ]
}
```

---

## Debugging Failed Tests

If test fails:

1. **Check test report frame** on canvas
2. **Read errors/warnings** in status area
3. **Open Plugin Console** for detailed logs:
   - `🤖 AUTOMATED TEST START`
   - `📊 Input JSON type: ...`
   - `✅ Conversion completed: ...`
   - `📐 Root bounds: ...`
   - `⚠️ Warnings: ...`

4. **Common issues:**
   - Invalid JSON → Fix JSON format
   - No text nodes → Check text property in JSON
   - 100×100 block → Check position.absolute values
   - All frames → Check node type detection

---

## Current Build

- ✅ **Automated test system**: 45.8 KB (code.js)
- ✅ **Enhanced UI**: 23.3 KB (ui.html)
- ✅ **Menu commands**: Convert + Test
- ✅ **API integration**: Full Figma Plugin API usage
- ✅ **Performance metrics**: Timing + node counts
- ✅ **Visual reports**: On-canvas test results

---

## Next Steps

1. **Run menu test**: Plugins → Run Automated Test
2. **Verify**: Look for test report frame on canvas
3. **Test with real JSON**: Use UI button with your data
4. **Review results**: Check warnings/errors
5. **Fix issues**: Based on automated feedback

The 100×100 block issue should now be **clearly identified** in the test report warnings!
