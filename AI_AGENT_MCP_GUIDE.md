# VS Code Compare Folders Extension - AI Agent MCP Guide

This guide explains how AI agents can use the VS Code Compare Folders extension as a Model Context Protocol (MCP) tool to compare folders and analyze file differences.

## Overview

The Compare Folders extension allows AI agents to:
- Compare two local folders by their paths
- Compare a folder against the current workspace
- View differences in tree or list format
- Analyze file content differences
- Manage file operations (copy, delete, take files)

## Core Commands for AI Agents

### 1. Compare Two Local Folders
**Command ID**: `foldersCompare.compareFoldersAgainstEachOther`
**Purpose**: Compare two specific folder paths
**Parameters**:
- `args[0]`: Absolute path to first folder (string)
- `args[1]`: Absolute path to second folder (string)
**Usage**:
```typescript
run_vscode_command({
  commandId: "foldersCompare.compareFoldersAgainstEachOther",
  name: "Compare Two Local Folders",
  args: ["/path/to/folder1", "/path/to/folder2"]
})
```

### 2. Compare Folder Against Workspace
**Command ID**: `foldersCompare.compareFoldersAgainstWorkspace`
**Purpose**: Compare a specific folder against the current workspace
**Parameters**:
- `args[0]`: Absolute path to folder to compare against workspace (string)
**Usage**:
```typescript
run_vscode_command({
  commandId: "foldersCompare.compareFoldersAgainstWorkspace",
  name: "Compare Folder Against Workspace",
  args: ["/path/to/folder"]
})
```

### 3. Compare Selected Folders (Explorer Context)
**Command ID**: `foldersCompare.compareSelectedFolders`
**Purpose**: Compare two folders selected in the VS Code file explorer
**Parameters**: None (uses currently selected folders in explorer)
**Prerequisites**: Two folders must be selected in VS Code file explorer
**Context**: Triggered from explorer context menu when two folders are selected
**Usage**:
```typescript
run_vscode_command({
  commandId: "foldersCompare.compareSelectedFolders",
  name: "Compare Selected Folders"
})
```

### 4. Interactive Folder Selection
**Command ID**: `foldersCompare.chooseFoldersAndCompare`
**Purpose**: Opens folder picker for manual selection (less suitable for AI automation)
**Parameters**: None (opens OS folder picker dialogs)
**Usage**:
```typescript
run_vscode_command({
  commandId: "foldersCompare.chooseFoldersAndCompare",
  name: "Choose Folders and Compare"
})
```

## View Management Commands

### Toggle View Mode
- **List View**: `foldersCompare.viewAsList` (Parameters: None)
- **Tree View**: `foldersCompare.viewAsTree` (Parameters: None)

### Refresh and Navigation
- **Refresh Comparison**: `foldersCompare.refresh` (Parameters: None)
- **Swap Sides**: `foldersCompare.swap` (Parameters: None)

## Parameter Requirements Summary

| Command | Required Parameters | Optional Parameters | Prerequisites |
|---------|-------------------|-------------------|---------------|
| `compareFoldersAgainstEachOther` | `args[0]`: folder1 path, `args[1]`: folder2 path | None | Both folders must exist |
| `compareFoldersAgainstWorkspace` | `args[0]`: folder path | None | Folder must exist, workspace must be open |
| `compareSelectedFolders` | None | None | Two folders selected in VS Code explorer |
| `chooseFoldersAndCompare` | None | None | None (interactive) |
| All view/file commands | None | None | Active comparison view |

## File Operation Commands

### Copy Operations
- **Copy to Compared Folder**: `foldersCompare.copyToCompared`
- **Copy to My Folder**: `foldersCompare.copyToMy`

### File Resolution
- **Take My File**: `foldersCompare.takeMyFile`
- **Take Compared File**: `foldersCompare.takeComparedFile`
- **Delete File**: `foldersCompare.deleteFile`
- **Dismiss Difference**: `foldersCompare.dismissDifference`

### History Management
- **Pick from Recent Compares**: `foldersCompare.pickFromRecentCompares`
- **Clear Recent Compares**: `foldersCompare.clearRecentCompares`

## Best Practices for AI Agents

### 1. Use Absolute Paths
Always provide absolute paths when comparing folders:
```typescript
// ✅ Good - Absolute paths
args: ["/Users/username/project/src", "/Users/username/project/dist"]

// ❌ Avoid - Relative paths (may not resolve correctly)
args: ["./src", "./dist"]

// ❌ Avoid - Missing paths
args: [] // Will cause command to fail
```

### 2. Parameter Validation
Before calling commands, ensure:
```typescript
// Validate paths exist
const fs = require('fs');
const folder1 = "/path/to/folder1";
const folder2 = "/path/to/folder2";

if (fs.existsSync(folder1) && fs.existsSync(folder2)) {
  await run_vscode_command({
    commandId: "foldersCompare.compareFoldersAgainstEachOther",
    args: [folder1, folder2]
  });
} else {
  console.error("One or both folders do not exist");
}
```

### 3. Command Selection by Use Case

**For Direct Path Comparison**: Use `foldersCompare.compareFoldersAgainstEachOther`
- Best for when you know exact folder paths
- Fully programmatic, no user interaction required

**For Explorer Integration**: Use `foldersCompare.compareSelectedFolders`
- Works with VS Code's file explorer selection
- Requires folders to be selected in explorer first
- Good for workflows that involve explorer interactions

**For Workspace Comparison**: Use `foldersCompare.compareFoldersAgainstWorkspace`
- Compare any folder against the current workspace
- Ideal for backup/restore scenarios

### 4. Error Handling
If a command fails, try alternative approaches:
```typescript
// Try primary command first
try {
  await run_vscode_command({
    commandId: "foldersCompare.compareFoldersAgainstEachOther",
    args: [folder1, folder2]
  });
} catch (error) {
  // Fallback to interactive mode
  await run_vscode_command({
    commandId: "foldersCompare.chooseFoldersAndCompare"
  });
}
```

## Configuration Options

The extension respects these VS Code settings that affect comparison behavior:

- `compareFolders.excludeFilter`: Glob patterns to exclude files
- `compareFolders.includeFilter`: Glob patterns to include files
- `compareFolders.compareContent`: Compare files by content (boolean)
- `compareFolders.ignoreFileNameCase`: Ignore filename case differences
- `compareFolders.showIdentical`: Show identical files panel
- `compareFolders.respectGitIgnore`: Respect .gitignore files
- `compareFolders.defaultDiffViewMode`: Default view mode ("tree" or "list")

## Example AI Agent Workflows

### Basic Folder Comparison
```typescript
// Compare source and build directories
await run_vscode_command({
  commandId: "foldersCompare.compareFoldersAgainstEachOther",
  name: "Compare src and build folders",
  args: ["/project/src", "/project/build"]
});
```

### Workspace Comparison
```typescript
// Compare external folder against current workspace
await run_vscode_command({
  commandId: "foldersCompare.compareFoldersAgainstWorkspace",
  name: "Compare backup against workspace",
  args: ["/backup/project"]
});
```

### Explorer-Based Comparison
```typescript
// Works with folders selected in VS Code file explorer
await run_vscode_command({
  commandId: "foldersCompare.compareSelectedFolders",
  name: "Compare folders selected in explorer"
});
```### Managing Comparison View
```typescript
// Switch to tree view for better structure visualization
await run_vscode_command({
  commandId: "foldersCompare.viewAsTree",
  name: "Switch to tree view"
});

// Refresh if files have changed
await run_vscode_command({
  commandId: "foldersCompare.refresh",
  name: "Refresh comparison"
});
```

## Command Line Integration

For automated workflows, the extension supports CLI activation:
```bash
COMPARE_FOLDERS=DIFF code /path/to/folder1 /path/to/folder2
```

## Limitations for AI Agents

1. **SSH/Remote Folders**: Currently has known issues with remote folders over SSH
2. **Interactive Commands**: Some commands require user interaction and are less suitable for automation
3. **Explorer Selection**: `foldersCompare.compareSelectedFolders` requires folders to be pre-selected in the file explorer
4. **File Selection**: Commands that operate on specific files require the comparison view to be active

## Troubleshooting

### Common Issues
1. **Command not found**: Ensure the extension is installed and activated
2. **Path errors**: Use absolute paths and ensure folders exist
3. **Permission errors**: Check folder read permissions

### Verification
To verify the extension is working:
```typescript
// This should succeed if extension is properly loaded
await run_vscode_command({
  commandId: "foldersCompare.chooseFoldersAndCompare",
  name: "Test extension availability"
});
```

## Integration with Other Tools

The extension works well with:
- **Diff & Merge extension**: For enhanced diff viewing
- **Git**: Respects .gitignore files when configured
- **File explorers**: Can be triggered from VS Code file explorer context menu

This guide enables AI agents to effectively use the Compare Folders extension for automated folder comparison and analysis tasks within VS Code workspaces.
