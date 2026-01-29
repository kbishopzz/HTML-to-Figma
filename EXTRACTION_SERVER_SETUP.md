# Automatic URL Extraction Setup

## Quick Start

### 1. Install Dependencies

```bash
npm install express puppeteer cors
```

### 2. Start the Extraction Server

```bash
node extraction-server.js
```

You should see:

```
🚀 Figma HTML Extraction Server Started!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server running at: http://localhost:3000
```

### 3. Use the Plugin

1. Open the Figma plugin
2. Go to the "🌐 Extract URL" tab
3. Enter any URL (e.g., `https://example.com`)
4. Click **"🚀 Open URL & Extract"**
5. ✨ **JSON automatically appears in the JSON tab!**
6. Click **"🚀 Convert to Figma"**

## How It Works

The extraction server:

- Runs a headless Chrome browser locally
- Loads the target webpage
- Executes the extraction script
- Sends JSON directly to the plugin
- **No manual copying needed!**

## Manual Fallback

If the server isn't running, the plugin automatically falls back to the manual method:

1. Opens the URL in a new tab
2. You paste the script in the browser console
3. You manually copy/paste the JSON

## Server Commands

**Start server:**

```bash
node extraction-server.js
```

**Keep server running in background:**

```bash
nohup node extraction-server.js > extraction-server.log 2>&1 &
```

**Stop server:**

```bash
# Find the process
ps aux | grep extraction-server

# Kill it
kill <PID>
```

## Troubleshooting

**"Automatic extraction unavailable"**

- Make sure the server is running (`node extraction-server.js`)
- Check that it's on port 3000
- Verify no firewall is blocking localhost

**"Extraction timeout"**

- Some pages take longer to load
- Server will timeout after 30 seconds
- Try again or use manual method

**Server won't start**

- Make sure dependencies are installed: `npm install express puppeteer cors`
- Check if port 3000 is already in use
- Try a different port (edit `extraction-server.js`)

## Benefits

✅ **Fully Automatic** - No console, no copy/paste  
✅ **Fast** - Extracts in 2-5 seconds  
✅ **Reliable** - Headless browser handles JavaScript  
✅ **Local** - Your data never leaves your machine  
✅ **Fallback** - Manual method always works

## Optional: Run as Background Service

### macOS/Linux

Create `~/Library/LaunchAgents/com.figma.extraction-server.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.figma.extraction-server</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/PATH/TO/YOUR/extraction-server.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Load it:

```bash
launchctl load ~/Library/LaunchAgents/com.figma.extraction-server.plist
```

### Windows

Use Task Scheduler or install as Windows Service using `node-windows`.
