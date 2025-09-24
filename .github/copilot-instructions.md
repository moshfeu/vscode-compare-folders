# Copilot Instructions for vscode-compare-folders

## Project Overview
- This is a VS Code extension for comparing folders, showing file differences, and presenting diffs side by side.
- Main logic is in `src/`, with entry point at `src/extension.ts`.
- Core comparison logic is in `src/services/comparer.ts` (uses `dir-compare`), with UI managed by providers in `src/providers/`.
- Tree and list views are built via `src/services/treeBuilder.ts` and controlled by context in `src/context/ui.ts`.

## Architecture & Data Flow
- **Providers**: `CompareFoldersProvider` (main), `ViewOnlyProvider` (for left/right/identical files) implement VS Code's `TreeDataProvider` for UI panels.
- **Context**: `src/context/path.ts` and `src/context/ui.ts` manage folder paths and view mode (tree/list).
- **Commands**: Registered in `src/extension.ts` and listed in `src/constants/commands.ts`. Most UI actions are triggered via commands.
- **Global State**: Recent compares and extension version tracked in `src/services/globalState.ts`.
- **Configuration**: User options (filters, layout, etc.) accessed via `src/services/configuration.ts` and defined in `package.json` under `contributes.configuration`.
- **File Operations**: Copy/delete/take actions use `fs-extra` and are handled in `CompareFoldersProvider`.
- **Diff Logic**: Comparison options (ignore extension, whitespace, etc.) are set from configuration and passed to `dir-compare`.
- **Error Handling**: User-facing errors use `src/utils/ui.ts` for notifications and reporting.

## Developer Workflows
- **Build**: Use `yarn compile` or run the default background task (`npm: watch`).
- **Test**: Run `yarn test` (executes integration tests via Mocha in `src/test/`).
- **Debug**: Launch configs in `.vscode/launch.json`:
  - "Run Extension" for development
  - "Extension Tests" for running tests
- **Package/Deploy**: Use `yarn package` or scripts in `scripts/` for packaging and publishing. See `scripts/package-test.sh` and `scripts/deploy-openvsx.sh`.
- **CI/CD**: Azure Pipelines (`azure-pipelines.yml`) and GitHub Actions (`.github/workflows/deploy.yml`) for automated builds and releases.

## Project-Specific Conventions
- **Extension Settings**: All user options are under the `compareFolders` namespace. See `package.json` and README for details and examples.
- **Ignore Extension**: `ignoreExtension` is a list of extension pairs; each extension must appear only once.
- **View Modes**: Tree/list toggling is managed by context key `foldersCompare.diffViewMode`.
- **Recent Compares**: Tracked in global state, accessible via "Pick from recent compares" command.
- **Error Reporting**: Errors prompt user to report via GitHub issues, including system info.
- **Diff & Merge Integration**: If `useDiffMerge` is enabled, integrates with the `moshfeu.diff-merge` extension.

## Integration Points
- **dir-compare**: Used for folder/file comparison logic.
- **@cjs-exporter/globby**: Used for .gitignore support in filtering files.
- **VS Code API**: Tree views, commands, global state, notifications, and context keys are heavily used.

## Key Files & Directories
- `src/extension.ts`: Entry point, command registration, activation logic
- `src/providers/`: TreeDataProvider implementations for UI panels
- `src/services/comparer.ts`: Main comparison logic
- `src/services/treeBuilder.ts`: Builds tree/list data structures
- `src/services/configuration.ts`: Reads extension settings
- `src/context/`: Manages UI and path context
- `src/models/file.ts`: Tree item model for UI
- `src/utils/`: Shared helpers for UI notifications (`ui.ts`), path manipulation (`path.ts`), constants, and error handling. Use these for consistent messaging and utility logic across the extension.
- `src/test/`: Mocha-based integration tests
- `package.json`: Extension manifest, configuration, scripts
- `README.md`: User documentation and usage examples

## Examples
- To compare two folders on startup, set `compareFolders.folderLeft` and `compareFolders.folderRight` in settings.
- To run tests: `yarn test` or use the "Extension Tests" launch config.
- To package: `yarn package` or run `scripts/package-test.sh`.

---
For more details, see the [README.md](../README.md) and comments in key source files.

## Code Conventions
- No comments unless strictly necessary (see `general.instructions.md`).
- Use TypeScript strict mode; follow types and interfaces defined in `src/types.ts`.
- Prefer utility functions from `src/utils/` for UI, error, and path handling.
- Extension settings and context keys use the `compareFolders` namespace.
- Keep logic modular: UI in providers, business logic in services, state/context in `src/context/`.
