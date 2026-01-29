# Figma Plugin Console Testing Guide

## Critical Issue: No Console Logs = Plugin Not Running

If you see **no logs at all** in the Figma Plugin Console, the conversion code isn't executing.

---

## Step-by-Step Testing Process

### 1. **Open Figma Plugin Console (NOT Browser Console!)**

- In Figma: **Plugins → Development → Show/Hide Console**
- This opens a **separate DevTools window** for plugin code
- This is DIFFERENT from the browser's DevTools (F12)

### 2. **Verify Plugin Loaded**

- In the Figma Plugin Console, you should see immediately:
  ```
  🚀 Plugin code.ts loaded and running
  📡 Setting up message listener...
  ```
- If you DON'T see these, the plugin didn't load at all

### 3. **Load the Plugin**

- In Figma: **Plugins → Development → figma-html-push**
- The plugin UI window should open

### 4. **Run with Test JSON**

**PASTE THIS INTO THE TEXTAREA:**

```json
{
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
}
```

### 5. **Click Convert Button**

### 6. **Check Console Output**

**Expected logs in Plugin Console:**

```
📨 Message received from UI: convert-json
📦 Full message: {"type":"convert-json"...
✅ convert-json message detected
🔍 JSON Data received: {"type":"CANVAS"...
🔍 JSON type: CANVAS
🔍 Has children: true
🔍 Children count: 1
✅ Creating node: body
📐 Position: x=0, y=0, width=200, height=100
✅ Resized to 200x100
```

---

## Troubleshooting No Logs

### If you see NO logs at all:

1. **Wrong console**: You're looking at browser console, not plugin console
2. **Plugin not loaded**: Try closing and reopening the plugin
3. **Build not updated**: Run `npm run build` again

### If you see 🚀 but NO 📨:

- UI is not sending the message
- Check: Did you click the "Convert" button?
- Check: Is there JSON in the textarea?

### If you see 📨 but NO 🔍:

- Message received but JSON validation failed
- Check console for error messages starting with ❌

### If you see 🔍 but NO ✅:

- JSON received but conversion failed
- The converter should show which nodes are created
- Check for ❌ error logs

---

## Quick Test Commands

Run in **Figma Plugin Console** (not browser):

```javascript
// Test if console works
console.log("✅ Figma Plugin Console is working");

// Check if plugin API is available
console.log(
  "Figma API:",
  typeof figma !== "undefined" ? "✅ Available" : "❌ Not available",
);
```

---

## Current Build Status

- **Built**: ✅ 35.8 KB
- **Logging**: ✅ Comprehensive debug logs added
- **Test JSON**: ✅ Created (test-figma-console.js)

---

## Next Steps Based on Console Output

1. **See all logs but still 100×100 block**: Position logic issue (next fix)
2. **See 🔍 logs but no ✅ logs**: Converter not creating nodes (check node-utils)
3. **See nothing**: Follow "Troubleshooting No Logs" above
