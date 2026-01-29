# Figma HTML Push - Quick Testing Guide

## 🚀 Fast Testing Workflow

### Method 1: Auto Test (Easiest!)

```bash
npm test
```

This will:

1. Create a test HTML page with styled content
2. Open it in your browser
3. Auto-extract the page to JSON
4. Copy JSON to your clipboard

Then just:

1. Open Figma
2. Run: Plugins → Development → HTML to Figma Converter
3. Paste and click "Convert to Figma"

### Method 2: Use Sample JSON

```bash
npm run test:sample
```

Copies the pre-made `test-sample.json` to your clipboard. Great for quick tests!

### Method 3: Extract from Any Website

1. Open any website in your browser
2. Open DevTools Console (F12 or Cmd+Option+I)
3. Paste the contents of `browser-extract.js`
4. Press Enter
5. JSON is auto-copied to clipboard
6. Paste into Figma plugin

---

## 📁 Key Files

- **`browser-extract.js`** - Run in browser console to extract page
- **`test-automation.js`** - Auto-generates test page and opens browser
- **`test-sample.json`** - Pre-made sample for quick testing
- **`src/code.ts`** - Main plugin entry point
- **`src/converter-new.ts`** - Orchestrates conversion
- **`src/converters/html-converter.ts`** - HTML → Figma conversion
- **`src/converters/figma-converter.ts`** - Figma JSON → Figma conversion

---

## ⚡ Development Commands

```bash
# Build the plugin
npm run build

# Watch for changes and rebuild automatically
npm run watch

# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Run auto-test
npm test

# Copy sample JSON to clipboard
npm run test:sample
```

---

## 🔄 Typical Development Cycle

1. **Make code changes** in `src/`
2. **Build**: `npm run build`
3. **Test in Figma**:
   - Run `npm test` to generate test page
   - OR run `npm run test:sample` for quick test
   - Paste JSON into plugin
4. **Verify** the import looks correct
5. **Iterate** as needed

---

## 🐛 Debugging Tips

### Import shows only blank frames?

- Check browser console for extraction errors
- Verify the JSON has `position.absolute.width/height` for all nodes
- Check that `styles` object exists

### Text not showing?

- Verify the JSON node has a `text` property
- Check that `fontSize` is present in styles
- Make sure fonts are available (defaults to Inter)

### Wrong sizes?

- Check the `position.absolute` coordinates
- Verify width/height are numbers not "0px"
- Look at browser console during extraction

### Plugin crashes?

- Check Figma DevTools console
- Verify JSON structure matches expected format
- Test with `test-sample.json` first

---

## 📊 Expected JSON Format

### HTML-style (from browser-extract.js)

```json
{
  "type": "CANVAS",
  "name": "Page Name",
  "children": [
    {
      "type": "div",
      "text": "Optional text content",
      "styles": {
        "backgroundColor": "rgb(255, 255, 255)",
        "fontSize": "16px",
        "fontFamily": "Inter, sans-serif",
        "color": "rgb(0, 0, 0)"
      },
      "position": {
        "absolute": {
          "x": 0,
          "y": 0,
          "width": 100,
          "height": 50
        }
      },
      "children": []
    }
  ]
}
```

### Figma-style (from Figma exports)

```json
{
  "type": "FRAME",
  "name": "My Frame",
  "absoluteBoundingBox": {
    "x": 0,
    "y": 0,
    "width": 100,
    "height": 100
  },
  "fills": [
    {
      "type": "SOLID",
      "color": { "r": 1, "g": 1, "b": 1 }
    }
  ],
  "children": []
}
```

---

## ✅ Build Status

- ✅ Lint: 0 errors
- ✅ Build: Successful (34.6 KiB)
- ✅ TypeScript: Compiles correctly
- ⚠️ 2 VS Code display warnings (false positives - code works fine)

---

## 🎯 What's Working

- ✅ HTML-style JSON import
- ✅ Figma-style JSON import
- ✅ Text nodes with fonts and styling
- ✅ Frames with backgrounds and borders
- ✅ Image placeholders
- ✅ Nested layouts
- ✅ Position and sizing
- ✅ Colors (RGB and hex)
- ✅ Shadows and effects
- ✅ Auto-layout (flexbox)

---

## 📝 Notes

- Default font is **Inter** (built into Figma)
- Images create placeholder rectangles (can't load external images in plugin)
- Browser-extract auto-copies JSON to clipboard
- Test page auto-extracts after 1 second
- VS Code may show 2 type errors - these don't affect compilation

---

## 🆘 Getting Help

1. Check the JSON structure matches expected format
2. Test with `test-sample.json` first
3. Look at Figma plugin console for errors
4. Verify build succeeded: `npm run build`
5. Check that all required properties are present

---

**Happy Testing! 🎨**
