# Developer Quick Start Guide

## 🚀 Quick Setup

### Prerequisites
- Node.js 20+ (see `.nvmrc`)
- VS Code 1.38+
- Git

### Get Started in 3 Steps

1. **Clone & Install**
   ```bash
   git clone https://github.com/moshfeu/vscode-compare-folders.git
   cd vscode-compare-folders
   npm install
   ```

2. **Build & Run**
   ```bash
   npm run compile
   code .
   # Press F5 to launch Extension Development Host
   ```

3. **Test the Extension**
   - In the new VS Code window, click the Compare Folders icon in Activity Bar
   - Or use Ctrl+Shift+P → "Compare Folders"

## 📁 Project Structure

```
src/
├── extension.ts         # Entry point
├── providers/          # Tree data providers  
├── services/           # Core logic
├── models/             # Data structures
└── utils/              # Helpers

package.json            # Extension manifest
tsconfig.json          # TypeScript config
```

## ⚡ Development Workflow

| Command | Purpose |
|---------|---------|
| `npm run watch` | Auto-compile on changes |
| `npm run compile` | Build once |
| `npm test` | Run tests (needs network) |
| `npm run package` | Create .vsix file |

## 🔧 Key Files

- **`package.json`**: Extension configuration, commands, settings
- **`src/extension.ts`**: Main activation and command registration
- **`src/providers/foldersCompareProvider.ts`**: Core comparison logic
- **`src/services/compareFolders.ts`**: File comparison using dir-compare

## 🐛 Debugging

1. Set breakpoints in TypeScript files
2. Press F5 to start debugging
3. Use Extension Development Host for testing
4. Check Debug Console for logs

## 📋 Common Tasks

### Add New Command
1. Define constant in `src/constants/commands.ts`
2. Register in `src/extension.ts` activate function
3. Add to `package.json` contributes.commands
4. Implement handler in appropriate provider/service

### Add New Setting
1. Add to `package.json` contributes.configuration.properties
2. Access via `getConfiguration()` in `src/services/configuration.ts`
3. Use in relevant service/provider

### Modify UI
- Tree structure: `src/providers/foldersCompareProvider.ts`
- Icons and commands: `package.json` contributes section
- Context menus: `package.json` contributes.menus

## 🧪 Testing Changes

1. **Manual Testing**: Use F5 and test in Extension Development Host
2. **Automated Tests**: `npm test` (requires network for VS Code download)
3. **Package Testing**: `npm run package:test`

## 📦 Publishing

```bash
# Create package
npm run package

# Deploy to marketplace (requires token)
npm run deploy

# Deploy to Open VSX
npm run deploy:openvsx
```

## ❓ Need Help?

- **Architecture**: See full `INSTRUCTIONS.md`
- **Issues**: GitHub Issues tab
- **VS Code API**: [Extension API docs](https://code.visualstudio.com/api)
- **TypeScript**: Check `tsconfig.json` for project settings

---

**Quick tip**: Run `npm run watch` and keep VS Code open while developing for the best experience!