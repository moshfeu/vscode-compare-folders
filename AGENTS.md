# AGENTS.md

## Build & Test

- **Build**: `yarn compile`
- **Test**: `yarn test`

## Code Conventions

- No comments unless strictly necessary
- Keep logic modular: UI in providers, business logic in services, state/context in `src/context/`
- Prefer utility functions from `src/utils/` for UI, error, and path handling
- Extension settings and context keys use the `compareFolders` namespace

## Test Infrastructure

### Shared Mocks (`src/test/suite/mocks/`)

Reusable VS Code test doubles. Always use these instead of creating inline mocks with `as` casts.

- `MockTreeView` — implements `TreeView<File>`
- `mockConfiguration(values)` — stubs `workspace.getConfiguration`, returns a `restore` function
