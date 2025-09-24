# Compare Folders Extension - User Guide

## 📦 Installation

### Method 1: VS Code Marketplace (Recommended)
1. Open Visual Studio Code
2. Click on the Extensions icon in the Activity Bar (or press `Ctrl+Shift+X`)
3. Search for "Compare Folders"
4. Click **Install** on the extension by **moshfeu**

### Method 2: Command Line
```bash
code --install-extension moshfeu.compare-folders
```

### Method 3: VSIX File
If you have a `.vsix` file:
1. Open VS Code
2. Press `Ctrl+Shift+P` to open Command Palette
3. Type "Extensions: Install from VSIX"
4. Select the downloaded `.vsix` file

## 🚀 Getting Started

After installation, you'll see a new **Compare Folders** icon in the Activity Bar (left sidebar).

### First Time Usage

1. **Click** the Compare Folders icon in Activity Bar
2. **Choose one of these options**:
   - "Click to select a folder" - Compare any folder with your workspace
   - "Click to select folders" - Choose two arbitrary folders to compare

## 📖 How to Use

### 🎯 Starting a Comparison

#### Option 1: Activity Bar Panel
1. Click the **Compare Folders** icon in Activity Bar
2. Use the buttons in the panel:
   - **"Click to select a folder"**: Compare against current workspace
   - **"Click to select folders"**: Choose two folders

#### Option 2: Command Palette
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "Compare Folders"
3. Choose:
   - **"Compare a folder against workspace"**
   - **"Choose 2 folders and compare"**

#### Option 3: File Explorer
1. **Select exactly 2 folders** in the Explorer panel
2. **Right-click** on one of them
3. Select **"Compare selected folders"**

#### Option 4: Command Line
Set environment variable and open VS Code:
```bash
COMPARE_FOLDERS=DIFF code /path/to/folder1 /path/to/folder2
```

### 📊 Understanding the Results

After comparison, you'll see up to 4 panels in the Compare Folders view:

#### 1. **Differences** 📋
Files that exist in both folders but have different content or timestamps.
- **Actions available:**
  - **Take My File** (→): Replace compared file with your file
  - **Take Compared File** (←): Replace your file with compared file  
  - **Dismiss**: Hide this difference from the list

#### 2. **Only in My Folder** 📁
Files that exist only in your folder (left side).
- **Actions available:**
  - **Copy to Compared Folder**: Copy file to the other folder
  - **Delete**: Permanently remove the file

#### 3. **Only in Compared Folder** 📁
Files that exist only in the compared folder (right side).
- **Actions available:**
  - **Copy to My Folder**: Copy file to your folder
  - **Delete**: Permanently remove the file

#### 4. **Identical Files** ✅ (Optional)
Files that are exactly the same in both folders.
- Only shown if `showIdentical` setting is enabled
- No actions available (files are identical)

### 🔧 Toolbar Actions

At the top of the Differences panel:

- **📜 Pick from History**: Choose from recently compared folder pairs
- **↔️ Swap Sides**: Switch left and right folders
- **🔄 Refresh**: Re-compare folders (useful if files changed)
- **📋/🌲 View Toggle**: Switch between List and Tree view modes

### 👁️ View Modes

#### Tree View (Default)
- Shows files organized by folder structure
- Hierarchical display like File Explorer
- Good for understanding file organization

#### List View  
- Shows all files in a flat list
- Similar to Source Control view
- Good for seeing all differences at once

Switch between views using the toolbar button or set default in settings.

## ⚙️ Configuration

Access settings via File → Preferences → Settings → Search "Compare Folders"

### 🔍 Basic Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **Compare Content** | Compare file contents, not just size/date | `true` |
| **Ignore File Name Case** | Treat "File.txt" and "file.txt" as same | `true` |
| **Show Identical Files** | Display panel for identical files | `false` |

### 🎯 Filtering Options

#### Exclude Patterns
Ignore certain files or folders:
```json
"compareFolders.excludeFilter": [
  "**/node_modules",
  "**/.git", 
  "**/.svn",
  "**/dist",
  "**/*.log"
]
```

#### Include Patterns
Only compare specific files:
```json
"compareFolders.includeFilter": [
  "**/*.js",
  "**/*.ts",
  "**/*.json"
]
```

#### Respect .gitignore
```json
"compareFolders.respectGitIgnore": true
```

### 🔤 Advanced Comparison Options

#### Ignore Line Endings
```json
"compareFolders.ignoreLineEnding": true
```

#### Ignore Whitespace
```json
"compareFolders.ignoreWhiteSpaces": true,     // Beginning/end of lines
"compareFolders.ignoreAllWhiteSpaces": true,  // All whitespace
"compareFolders.ignoreEmptyLines": true       // Empty lines
```

#### Extension Groups
Treat different extensions as same file:
```json
"compareFolders.ignoreExtension": [
  ["js", "ts"],           // index.js ↔ index.ts
  ["jpg", "jpeg"],        // photo.jpg ↔ photo.jpeg  
  ["yml", "yaml"]         // config.yml ↔ config.yaml
]
```

### 🖥️ Display Settings

#### Diff View Title Format
```json
"compareFolders.diffViewTitle": "name only"    // Options:
// "name only" → file.txt
// "compared path" → file.txt ↔ path/to/file.txt  
// "full path" → C:/full/path/file.txt ↔ C:/other/path/file.txt
```

#### Default View Mode
```json
"compareFolders.defaultDiffViewMode": "tree"   // or "list"
```

#### Safety Warnings
```json
"compareFolders.warnBeforeDelete": true,       // Confirm deletions
"compareFolders.warnBeforeTake": true          // Confirm file replacements
```

### 🚀 Auto-Compare on Startup
Set default folders to compare when VS Code opens:
```json
"compareFolders.folderLeft": "/path/to/folder1",
"compareFolders.folderRight": "/path/to/folder2"
```

## 💡 Tips & Tricks

### ⚡ Performance
- Use **exclude filters** for large directories (like `node_modules`)
- Set `compareContent: false` for faster comparison of large files
- Use **include filters** to limit comparison scope

### 🎯 Workflow Optimization
- **Recent History**: Use "Pick from History" for frequently compared folders
- **Keyboard Shortcuts**: Set custom shortcuts for comparison commands
- **Workspace Integration**: Compare branches, builds, or deployment folders

### 🔍 Advanced Use Cases
- **Code Review**: Compare local changes with repository
- **Deployment Verification**: Compare local build with server files  
- **Backup Validation**: Verify backup completeness
- **Migration Assistance**: Track file moves and changes

## ❗ Troubleshooting

### Common Issues

#### Extension Not Appearing
- **Solution**: Restart VS Code, check Extensions panel for errors

#### No Differences Showing
- **Check**: File permissions, folder paths are correct
- **Try**: Disable filters, enable content comparison

#### Performance Issues
- **Solution**: Add exclude patterns for large directories
- **Alternative**: Use include patterns to limit scope

#### Files Not Comparing Correctly
- **Check**: Line ending settings, whitespace settings
- **Try**: Different comparison options in settings

### Known Limitations
- **Remote Folders**: SSH/remote folders may have issues
- **Large Folders**: Very large directories may be slow
- **Network Drives**: May have permission or performance issues

## 🆘 Getting Help

- **GitHub Issues**: [Report bugs](https://github.com/moshfeu/vscode-compare-folders/issues)
- **Discussions**: [Ask questions](https://github.com/moshfeu/vscode-compare-folders/discussions)
- **Marketplace**: [Rate and review](https://marketplace.visualstudio.com/items?itemName=moshfeu.compare-folders)

## ⭐ Show Your Support

If you find this extension helpful:
- ⭐ [Star the repository](https://github.com/moshfeu/vscode-compare-folders)
- ⭐ [Rate on Marketplace](https://marketplace.visualstudio.com/items?itemName=moshfeu.compare-folders&ssr=false#review-details)
- 🐦 [Share on social media](https://twitter.com/moshfeu)

---

**Happy comparing! 🚀**