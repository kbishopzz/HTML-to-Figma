# HTML to Figma Converter Plugin

Convert HTML pages to Figma designs instantly! Extract any webpage to JSON and import it into Figma with proper layouts, text, colors, and styling.

## ✨ Features

- 🎨 **Accurate Extraction** - Captures positions, sizes, colors, and text from any webpage
- 📐 **Layout Preservation** - Maintains positioning and nested structures
- 🎯 **Smart Detection** - Auto-detects HTML vs Figma JSON formats
- 🖋️ **Text Styling** - Preserves fonts, sizes, weights, and colors
- 🎭 **Visual Effects** - Imports shadows, borders, and border radius
- ⚡ **Auto-Layout** - Converts flexbox to Figma auto-layout
- 🚀 **Fast Testing** - Built-in automation for quick iteration

---

## 🚀 Quick Start

### 1. Install the Plugin

1. Clone this repo
2. Run `npm install`
3. Run `npm run build`
4. In Figma: Plugins → Development → Import plugin from manifest
5. Select the `manifest.json` file

### 2. Extract a Page

**Option A: Use Test Automation (Easiest)**

```bash
npm test
```

This opens a test page, auto-extracts it, and copies JSON to clipboard!

**Option B: Use Sample JSON**

```bash
npm run test:sample
```

Copies pre-made sample JSON to clipboard.

**Option C: Extract Any Website**

1. Open any website
2. Open DevTools Console (F12)
3. Paste contents of `browser-extract.js`
4. Press Enter
5. JSON auto-copied to clipboard!

### 3. Import to Figma

1. Open Figma
2. Run: **Plugins → Development → HTML to Figma Converter**
3. Paste the JSON
4. Click **"Convert to Figma"**
5. Done! 🎉

---

## 📖 Documentation

- **[Testing Guide](TESTING_GUIDE.md)** - Fast testing workflow and debugging
- **[Documents/](Documents/)** - Detailed technical documentation

---

## 🛠️ Development

```bash
# Build plugin
npm run build

# Watch for changes
npm run watch

# Lint code
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Run tests
npm test

# Quick sample test
npm run test:sample
```

---

## 📁 Project Structure

```
figma-html-push/
├── src/
│   ├── code.ts                    # Main plugin entry
│   ├── converter-new.ts           # Conversion orchestrator
│   ├── types.ts                   # TypeScript definitions
│   ├── converters/
│   │   ├── html-converter.ts      # HTML → Figma
│   │   └── figma-converter.ts     # Figma JSON → Figma
│   └── utils/
│       ├── color-utils.ts         # Color parsing
│       ├── font-utils.ts          # Font loading
│       ├── style-utils.ts         # Style application
│       └── node-utils.ts          # Node helpers
├── browser-extract.js             # Browser extraction script
├── test-automation.js             # Auto-testing tool
├── test-sample.json               # Sample test data
├── TESTING_GUIDE.md               # Testing documentation
└── manifest.json                  # Figma plugin manifest
```

---

## 🎯 What's Supported

### Elements

- ✅ Text nodes
- ✅ Frames (divs, sections, etc.)
- ✅ Images (as placeholders)
- ✅ Nested layouts

### Styling

- ✅ Colors (RGB, hex, named)
- ✅ Fonts (family, size, weight)
- ✅ Borders and border radius
- ✅ Shadows (box-shadow)
- ✅ Spacing (padding, margin)
- ✅ Opacity

### Layouts

- ✅ Absolute positioning
- ✅ Flexbox → Auto-layout
- ✅ Nested children
- ✅ Multi-column layouts

---

## 🐛 Troubleshooting

See **[TESTING_GUIDE.md](TESTING_GUIDE.md)** for detailed debugging tips.

### Quick Fixes

**Import shows blank frames?**

- Run `npm run test:sample` and try with sample JSON first

**Text not showing?**

- Check JSON has `text` property and `fontSize` in styles

**Plugin crashes?**

- Check Figma DevTools console for errors
- Verify JSON structure matches expected format

---

## 📊 JSON Format

The plugin accepts two formats:

### HTML-style (from browser-extract.js)

```json
{
  "type": "CANVAS",
  "children": [
    {
      "type": "div",
      "text": "Hello World",
      "styles": { "fontSize": "16px" },
      "position": {
        "absolute": { "x": 0, "y": 0, "width": 100, "height": 50 }
      }
    }
  ]
}
```

### Figma-style (from Figma exports)

```json
{
  "type": "FRAME",
  "name": "My Frame",
  "absoluteBoundingBox": { "x": 0, "y": 0, "width": 100, "height": 100 },
  "fills": [{ "type": "SOLID", "color": { "r": 1, "g": 1, "b": 1 } }]
}
```

---

## 🔄 Development Cycle

1. Make changes in `src/`
2. Run `npm run build`
3. Test with `npm test` or `npm run test:sample`
4. Paste into Figma plugin
5. Verify and iterate

---

## ✅ Build Status

- ✅ Lint: 0 errors
- ✅ Build: Successful (34.6 KiB)
- ✅ TypeScript: Compiles correctly

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Run `npm run lint && npm run build`
5. Submit a pull request

---

## 📝 License

MIT License - feel free to use this in your own projects!

---

## 🎨 Example Workflow

```bash
# Terminal 1: Start watching for changes
npm run watch

# Terminal 2: Run auto-test
npm test

# Opens test page → Extracts JSON → Copies to clipboard
# Then paste into Figma plugin and test!
```

---

## 💡 Tips

- Use `npm test` for rapid testing iterations
- `test-sample.json` has a known-good structure
- Check TESTING_GUIDE.md for debugging strategies
- Browser console shows extraction progress
- Figma DevTools shows plugin errors

---

**Built with ❤️ for designers who code and developers who design**

Happy importing! 🚀
