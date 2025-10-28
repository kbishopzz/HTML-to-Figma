# HTML Whisperer: HTML to Figma Converter

A Figma plugin that converts HTML/CSS structures (in JSON format) to editable Figma designs, preserving styles, layout, and component hierarchy.

## 🚀 Features

- Convert HTML/CSS structures to Figma frames, text, and shapes
- Preserve styling including colors, text styles, borders, and more
- Automatically convert flexbox layouts to Figma Auto Layout
- Support for common HTML elements (text, images, inputs, etc.)
- Configurable conversion options

## 🔧 How It Works

1. **Input JSON**: Paste JSON data representing HTML/CSS structure
2. **Configure Options**: Customize the conversion settings:
   - Preserve colors and text styles
   - Use Auto Layout
   - Flatten empty divs
   - Extract repeated elements as components
   - Set default font family and viewport dimensions
3. **Convert**: One-click conversion to Figma elements
4. **Edit**: Work with the generated Figma elements just like native ones

## 🔍 Usage Guide

1. Run the plugin in Figma
2. Paste JSON data (from your HTML parser) into the JSON tab
3. Adjust conversion options as needed
4. Click "Convert to Figma"
5. Edit and refine the generated design

## 🛠️ Development Setup

To work on this plugin, you'll need:

1. **Node.js and npm**: For dependency management
2. **Figma Desktop App**: For testing the plugin

### Getting Started

1. Clone this repository
2. Run `npm install` to install dependencies
3. Make your changes to the code
4. Load the plugin in Figma: Plugins > Development > Import plugin from manifest...

## 📝 Notes

- This plugin requires properly formatted JSON input describing HTML/CSS structure
- For best results, ensure your HTML structure is well-formatted and uses standard CSS properties
- The plugin works best with modern HTML that uses flexbox for layout

## 🔮 Future Plans

- Add AI integration for generating layouts from text prompts
- Support for more complex CSS properties
- Improved component extraction

## 🧭 Developer: Build & install (Figma Desktop)

1. Install dependencies and build the plugin bundle:

```bash
npm install
npm run build
```

2. Import into Figma Desktop:

- Open Figma Desktop (the web app cannot import local dev plugins).
- Menu: Plugins → Development → Import plugin from manifest...
- Select this repo's `manifest.json` (project root).

3. Run the plugin:

- Plugins → Development → HTML to Figma Converter (or the `name` in `manifest.json`).
- The UI will open and (by default) pre-fill the bundled sample JSON. If "Auto-run on open" is enabled in Options, it will auto-convert the sample. Otherwise click "Convert to Figma" or use the new "Run now" button.

4. Troubleshooting:

- Open the plugin console: Plugins → Development → Open Console — useful for font loading or JSON parse errors.
- If you change code, re-run `npm run build` and re-open the plugin (no need to re-import the manifest).

## 📥 How to convert any site into JSON for this plugin

This plugin accepts either the repository's Figma-style JSON (see `sample-figma-design.json`) or a simple HTML-derived JSON shape as described in `src/types.ts`.

Quick way (browser): open the target site in a browser and run a small snippet in the DevTools console to extract a basic JSON snapshot of visible elements. Paste the resulting JSON into the plugin textarea and click Convert (or Run now).

Example minimal DOM-to-JSON snippet (paste into the page's console):

```js
// Minimal DOM snapshot -> JSON (visual bounding boxes + text)
function pageToSimpleJson() {
  const frames = [];
  document.querySelectorAll("body > *").forEach((el, i) => {
    const r = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    const node = {
      id: el.id || `el-${i}`,
      name: el.tagName.toLowerCase(),
      type: "FRAME",
      x: Math.round(r.left),
      y: Math.round(r.top),
      width: Math.round(r.width),
      height: Math.round(r.height),
      backgroundColor: style.backgroundColor || undefined,
      children: [],
    };

    // collect direct text children
    const text = el.innerText && el.innerText.trim();
    if (text) {
      node.children.push({
        id: `${node.id}-text`,
        name: "text",
        type: "TEXT",
        x: 0,
        y: 0,
        width: node.width,
        height: Math.round(node.height / 3),
        text: text,
        style: {
          fontSize: parseInt(style.fontSize) || 16,
          fontFamily: style.fontFamily,
        },
      });
    }

    frames.push(node);
  });
  return { frames };
}

// Run and copy the JSON to clipboard:
copy(JSON.stringify(pageToSimpleJson(), null, 2));
```

Notes:

- This snippet produces a basic frame/text snapshot and is intended as a starting point. For more accurate conversions (styles, nested DOM, images, flex layouts), use a dedicated DOM-to-JSON exporter or adapt the snippet to capture the properties you need.
- After copying, paste into the plugin JSON textarea and Convert.

If you'd like, I can add a small `scripts/export-dom.js` helper that runs in a Puppeteer headless session to generate improved JSON for sites (useful for batch processing).
