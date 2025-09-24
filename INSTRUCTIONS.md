# Compare Folders VSCode Extension - Complete Instructions

## Table of Contents

1. [Project Overview](#project-overview)
2. [Installation & Setup](#installation--setup)
3. [Development Environment](#development-environment)
4. [Architecture & Code Structure](#architecture--code-structure)
5. [Building & Testing](#building--testing)
6. [Usage Instructions](#usage-instructions)
7. [Configuration](#configuration)
8. [Contributing](#contributing)
9. [Publishing & Deployment](#publishing--deployment)
10. [Troubleshooting](#troubleshooting)

## Project Overview

**Compare Folders** is a Visual Studio Code extension that allows users to compare two folders, identify differences, and manage files between them. The extension provides a comprehensive UI for folder comparison with features like:

- Side-by-side folder comparison
- File content comparison
- File copying, deletion, and replacement operations
- Tree and list view modes
- Filtering capabilities (include/exclude patterns)
- Git ignore support
- CLI integration

### Key Features
- **Visual Comparison**: Shows differences in a tree/list view in the sidebar
- **File Operations**: Copy, delete, take, and dismiss files with single clicks
- **Advanced Filtering**: Support for glob patterns and gitignore files
- **Multiple Access Methods**: Command palette, file explorer, and activity bar panel
- **History**: Recent comparison pairs are saved for quick access
- **Customizable**: Extensive configuration options for comparison behavior

## Installation & Setup

### Prerequisites

- **Node.js**: Version 20.0.0 or higher (check `.nvmrc` file)
- **npm** or **yarn**: Package manager
- **VS Code**: Version 1.38.0 or higher
- **TypeScript**: Included in devDependencies

### Development Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/moshfeu/vscode-compare-folders.git
   cd vscode-compare-folders
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Compile the TypeScript code:**
   ```bash
   npm run compile
   # or
   yarn compile
   ```

### Extension Installation (End Users)

1. **From VS Code Marketplace:**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Compare Folders"
   - Click Install

2. **From VSIX file:**
   ```bash
   code --install-extension compare-folders-x.x.x.vsix
   ```

## Development Environment

### VS Code Setup

The project includes pre-configured VS Code settings in `.vscode/`:

- **Launch Configuration** (`launch.json`): Debug the extension
- **Tasks** (`tasks.json`): Build and watch tasks
- **Settings** (`settings.json`): Project-specific settings
- **Extensions** (`extensions.json`): Recommended extensions

### Running in Development Mode

1. **Open in VS Code:**
   ```bash
   code .
   ```

2. **Start development server:**
   ```bash
   npm run watch
   ```

3. **Run the extension:**
   - Press `F5` or use "Run Extension" from the debug panel
   - This opens a new Extension Development Host window

### Debugging

1. **Set breakpoints** in TypeScript files
2. **Use F5** to start debugging
3. **Extension logs** appear in the Debug Console
4. **Use Developer Tools** (Help > Toggle Developer Tools) in the Extension Development Host

## Architecture & Code Structure

### Directory Structure

```
├── .vscode/              # VS Code configuration
├── .github/              # GitHub workflows and templates  
├── resources/            # Icons, fonts, and assets
├── scripts/              # Build and deployment scripts
├── src/                  # TypeScript source code
│   ├── constants/        # Application constants
│   ├── context/          # Context providers
│   ├── models/           # Data models and interfaces
│   ├── providers/        # Tree data providers
│   ├── services/         # Business logic services
│   ├── test/            # Test files
│   ├── types.ts         # Type definitions
│   ├── utils/           # Utility functions
│   └── extension.ts     # Extension entry point
├── package.json         # Extension manifest
├── tsconfig.json        # TypeScript configuration
└── tslint.json          # TSLint rules
```

### Key Components

#### 1. Extension Entry Point (`extension.ts`)
- **activate()**: Extension activation logic
- **Command registration**: All VS Code commands
- **Provider registration**: Tree data providers
- **Configuration loading**: Default folder settings

#### 2. Providers (`providers/`)
- **CompareFoldersProvider**: Main comparison tree view
- **ViewOnlyProvider**: Read-only views for "only in folder" sections

#### 3. Services (`services/`)
- **compareFolders**: Core comparison logic using `dir-compare`
- **configuration**: Settings management
- **globalState**: Extension state persistence
- **pickFromRecentCompares**: History management

#### 4. Models (`models/`)
- **CompareItem**: Represents files/folders in comparison
- **FileType**: File comparison states (equal, left, right, etc.)

#### 5. Utils (`utils/`)
- **diffPatch**: File diff operations
- **ui**: User interface helpers
- **path**: Path manipulation utilities

### Data Flow

1. **User initiates comparison** → Command execution
2. **Folder selection** → Path validation
3. **Comparison execution** → `dir-compare` library
4. **Result processing** → Tree structure creation
5. **UI rendering** → VS Code tree view display
6. **User actions** → File operations (copy/delete/take)

## Building & Testing

### Build Commands

```bash
# Compile TypeScript
npm run compile

# Watch mode (auto-compile on changes)
npm run watch

# Pre-publish build
npm run vscode:prepublish
```

### Testing

```bash
# Run tests (requires network access)
npm test

# Run pre-test compilation
npm run pretest
```

**Note**: Tests require downloading VS Code binary and may fail in restricted networks.

### Linting

```bash
# TSLint is configured in tslint.json
# Run via VS Code or extensions
```

### Package Creation

```bash
# Create VSIX package
npm run package

# Test package installation
npm run package:test
```

## Usage Instructions

### Basic Usage

#### Method 1: Command Palette
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "Compare Folders"
3. Choose:
   - **"Compare a folder against workspace"**: Compare any folder with current workspace
   - **"Choose 2 folders and compare"**: Select two arbitrary folders

#### Method 2: Activity Bar Panel
1. Click the **Compare Folders** icon in the Activity Bar (left sidebar)
2. Use the panel buttons:
   - **"Click to select a folder"**: Compare against workspace
   - **"Click to select folders"**: Choose two folders

#### Method 3: File Explorer
1. Select **two folders** in the Explorer
2. Right-click and select **"Compare selected folders"**

#### Method 4: Recent History
1. Use **"Pick from recent compares"** command
2. Select from previously compared folder pairs

### Advanced Usage

#### CLI Integration
```bash
# Set environment variable and open VS Code
COMPARE_FOLDERS=DIFF code /path/to/folder1 /path/to/folder2
```

#### File Operations
- **Take My File** (→): Replace compared file with local version
- **Take Compared File** (←): Replace local file with compared version
- **Copy to [Folder]**: Copy file to the other folder
- **Delete**: Permanently remove file
- **Dismiss**: Hide file from comparison results

#### View Modes
- **Tree View**: Hierarchical folder structure
- **List View**: Flat file listing (like Source Control)
- Toggle using toolbar buttons or default setting

## Configuration

### Settings Location
Add settings to VS Code `settings.json`:

```json
{
  "compareFolders.settingName": "value"
}
```

### Available Settings

#### Core Comparison
```json
{
  "compareFolders.compareContent": true,
  "compareFolders.ignoreFileNameCase": true,
  "compareFolders.ignoreLineEnding": false,
  "compareFolders.ignoreWhiteSpaces": false,
  "compareFolders.ignoreAllWhiteSpaces": false,
  "compareFolders.ignoreEmptyLines": false
}
```

#### Filtering
```json
{
  "compareFolders.excludeFilter": [
    "**/node_modules",
    "**/.git",
    "**/.svn"
  ],
  "compareFolders.includeFilter": [
    "**/*.js",
    "**/*.ts"
  ],
  "compareFolders.respectGitIgnore": false
}
```

#### Extension Groups
```json
{
  "compareFolders.ignoreExtension": [
    ["js", "ts"],
    ["php", "cs"]
  ]
}
```

#### UI Behavior
```json
{
  "compareFolders.diffViewTitle": "name only",
  "compareFolders.diffLayout": "local <> compared", 
  "compareFolders.defaultDiffViewMode": "tree",
  "compareFolders.showIdentical": false,
  "compareFolders.useDiffMerge": false,
  "compareFolders.warnBeforeDelete": true,
  "compareFolders.warnBeforeTake": true
}
```

#### Auto-Compare
```json
{
  "compareFolders.folderLeft": "/path/to/folder1",
  "compareFolders.folderRight": "/path/to/folder2"
}
```

### Setting Descriptions

| Setting | Type | Description |
|---------|------|-------------|
| `compareContent` | boolean | Compare files by content, not just timestamps |
| `excludeFilter` | string[] | Glob patterns for files to exclude |
| `includeFilter` | string[] | Glob patterns for files to include |
| `respectGitIgnore` | boolean | Honor .gitignore files |
| `ignoreFileNameCase` | boolean | Treat files with different case as same |
| `ignoreExtension` | string[][] | Groups of extensions to treat as equivalent |
| `diffViewTitle` | enum | How diff view titles are displayed |
| `diffLayout` | enum | Which file goes on left/right in diff view |
| `showIdentical` | boolean | Show panel for identical files |
| `useDiffMerge` | boolean | Use Diff & Merge extension for diffs |
| `warnBeforeDelete` | boolean | Confirm before deleting files |
| `warnBeforeTake` | boolean | Confirm before replacing files |

## Contributing

### Prerequisites for Contributors
1. Fork the repository
2. Set up development environment (see above)
3. Create a feature branch
4. Make changes with proper testing
5. Submit a pull request

### Code Style Guidelines
- **TypeScript**: Use strict typing
- **Linting**: Follow TSLint configuration
- **Formatting**: Use Prettier (`.prettierrc`)
- **File naming**: camelCase for files, PascalCase for classes
- **Import organization**: Group and sort imports logically

### Commit Guidelines
- Use conventional commit messages
- Include relevant issue numbers
- Keep commits focused and atomic
- Write descriptive commit messages

### Testing Guidelines
- Write unit tests for new features
- Test extension in development host
- Verify backwards compatibility
- Test with different folder structures and file types

### Pull Request Process
1. Update CHANGELOG.md with changes
2. Ensure all tests pass
3. Update documentation if needed
4. Request review from maintainers
5. Address feedback and comments

## Publishing & Deployment

### Automated Deployment
The project uses Azure Pipelines and GitHub Actions for CI/CD:
- **Azure Pipelines** (`azure-pipelines.yml`): Main build pipeline
- **GitHub Workflows** (`.github/workflows/`): Additional automation

### Manual Publishing

#### VS Code Marketplace
```bash
# Install VSCE (Visual Studio Code Extensions)
npm install -g vsce

# Package extension
npm run package

# Publish to marketplace
npm run deploy
```

#### Open VSX Registry
```bash
# Publish to Open VSX (alternative marketplace)
npm run deploy:openvsx
```

#### Insider Builds
```bash
# Deploy insider/preview version
npm run deploy:insider
```

### Version Management
1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag
4. Push changes and tags
5. Run deployment scripts

### Requirements for Publishing
- **Microsoft Account**: For VS Code Marketplace
- **Personal Access Token**: With marketplace permissions
- **Extension Manifest**: Valid `package.json`
- **Icon and Assets**: Required resources
- **Testing**: Thorough validation

## Troubleshooting

### Common Issues

#### 1. Extension Not Loading
- **Check VS Code version**: Ensure ≥ 1.38.0
- **Check console**: Look for errors in Developer Tools
- **Reinstall**: Remove and reinstall extension
- **Settings**: Verify no conflicting extensions

#### 2. Comparison Not Working
- **File permissions**: Ensure read access to folders
- **Path format**: Use absolute paths on Windows
- **Large folders**: May timeout on very large directories
- **Network paths**: SSH/remote folders may have issues

#### 3. Build Problems
- **Node version**: Use version specified in `.nvmrc`
- **Dependencies**: Run `npm install` to update
- **TypeScript errors**: Check `tsconfig.json` configuration
- **Clean build**: Delete `out/` directory and rebuild

#### 4. Test Failures
- **Network access**: Tests require internet connection
- **VS Code binary**: May need to be downloaded
- **Permissions**: Ensure write access for temp files

### Performance Optimization
- Use exclude filters for large directories
- Avoid comparing very deep folder structures
- Consider `compareContent: false` for faster comparison
- Use include filters to limit scope

### Debugging Tips
1. **Enable logging**: Check VS Code output panel
2. **Use debugger**: Set breakpoints in TypeScript
3. **Extension Host**: Monitor the Extension Development Host
4. **Settings**: Verify configuration values
5. **File access**: Test folder permissions manually

### Getting Help
- **GitHub Issues**: Report bugs and feature requests
- **Discussions**: Ask questions in GitHub Discussions
- **Documentation**: Check existing docs and changelog
- **Community**: Engage with other users and contributors

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## Credits

- **Main Library**: [`dir-compare`](https://github.com/gliviu/dir-compare) by [Liviu Grigorescu](https://github.com/gliviu)
- **Icons**: Various sources credited in README.md
- **Contributors**: Listed in README.md and GitHub

---

*This documentation is maintained alongside the Compare Folders extension. For the latest information, please refer to the GitHub repository.*