# 🎮 MDR Debug Guide - Super Simple!

## Easy Development Setup

### Method 1: Start Metro Server (Easiest)
1. **Press F5** in VS Code
2. Select **"🔥 Start Metro Server"**
3. Metro server starts in VS Code terminal
4. Your app automatically gets hot reload!

### Method 2: Manual Command
1. Open VS Code terminal (`Ctrl+``)
2. Run: `npm run dev`
3. ADB connect: `adb reverse tcp:8081 tcp:8081`

## What You Get
✅ **Hot Reload** - Save any file = instant update on device
✅ **Console Logs** - All `console.log()` appears in VS Code terminal
✅ **Metro Commands** - Press `r` to reload, `d` for dev menu
✅ **Code Intelligence** - VS Code autocomplete, errors, TypeScript support

## Quick Workflow
1. **Press F5** → Metro starts
2. **Edit any file** → Save → See changes instantly on device
3. **Add `console.log()`** → See output in VS Code terminal
4. **Press `r` in terminal** → Force reload app
5. **Press `d` in terminal** → Open dev menu on device

## Pro Tips
- **Set breakpoints** by clicking left margin (line numbers)
- **Use `console.log()`** for quick debugging
- **Press `r`** in Metro terminal to reload app
- **Press `d`** to open React Native dev menu
- **Use TypeScript errors** in VS Code to catch bugs early

## Troubleshooting
- **Device not updating?** → Check ADB connection: `adb devices`
- **Metro won't start?** → Kill existing: `pkill -f "react-native start"`
- **App crashes?** → Check VS Code terminal for errors

That's it! Press F5 and start coding! 🚀