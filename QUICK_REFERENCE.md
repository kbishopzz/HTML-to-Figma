# 🚀 Quick Reference Card

## Test in 10 Seconds

```bash
npm test
```

Opens test page → Extracts JSON → Copies to clipboard → Paste in Figma!

---

## Common Commands

| Command               | What It Does                     |
| --------------------- | -------------------------------- |
| `npm run build`       | Build plugin for Figma           |
| `npm run watch`       | Auto-rebuild on changes          |
| `npm test`            | Open test page with auto-extract |
| `npm run test:sample` | Copy sample JSON to clipboard    |
| `npm run lint`        | Check code quality               |
| `npm run lint:fix`    | Auto-fix lint issues             |

---

## File Guide

| File                                | Purpose                                      |
| ----------------------------------- | -------------------------------------------- |
| `browser-extract.js`                | Paste in browser console to extract any page |
| `test-automation.js`                | Auto-testing script                          |
| `test-sample.json`                  | Pre-made sample for quick tests              |
| `src/code.ts`                       | Plugin entry point                           |
| `src/converter-new.ts`              | Conversion orchestrator                      |
| `src/converters/html-converter.ts`  | HTML → Figma                                 |
| `src/converters/figma-converter.ts` | Figma JSON → Figma                           |

---

## JSON Format (Browser Extract)

```json
{
  "type": "CANVAS",
  "children": [
    {
      "type": "div",
      "text": "Hello",
      "styles": {
        "fontSize": "16px",
        "color": "rgb(0,0,0)"
      },
      "position": {
        "absolute": {
          "x": 0,
          "y": 0,
          "width": 100,
          "height": 50
        }
      }
    }
  ]
}
```

---

## Debugging Checklist

| Issue          | Fix                                        |
| -------------- | ------------------------------------------ |
| Blank frames   | Check `position.absolute` has width/height |
| No text        | Verify `text` property exists              |
| Wrong sizes    | Check extraction has numeric values        |
| Plugin crashes | Open Figma DevTools console                |
| Build fails    | Run `npm run lint && npm run build`        |

---

## Development Cycle

1. Edit code in `src/`
2. `npm run build`
3. `npm test` → Opens test page
4. Paste in Figma plugin
5. Check result
6. Repeat

**Cycle time: ~30 seconds!** ⚡

---

## Extract Any Website

1. Open website
2. F12 (DevTools)
3. Paste `browser-extract.js` contents
4. Press Enter
5. JSON copied!
6. Paste in plugin

---

## Build Status

✅ **0** lint errors
✅ **34.6 KB** output
✅ **~1.1s** build time
⚠️ **2** VS Code warnings (false positives)

---

## What Works

✅ Text with fonts
✅ Colors and backgrounds
✅ Borders and shadows
✅ Images (placeholders)
✅ Nested layouts
✅ Auto-layout (flexbox)
✅ Accurate positioning

---

## Quick Fixes

**Import broken?**

```bash
npm run test:sample
```

Tests with known-good JSON

**Can't build?**

```bash
npm install
npm run build
```

**Weird errors?**

```bash
npm run lint:fix
npm run build
```

---

See **TESTING_GUIDE.md** for details!
