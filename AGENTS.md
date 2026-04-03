# AGENTS.md

## Build & Test

- **Build**: `yarn compile`
- **Test**: `yarn test`

## Code Conventions

- No comments unless strictly necessary
- Keep logic modular: UI in providers, business logic in services, state/context in `src/context/`
- Prefer utility functions from `src/utils/` for UI, error, and path handling
- Extension settings and context keys use the `compareFolders` namespace

## Service Design

- Services own business logic only — no VS Code UI calls inside service functions
- Extract generic utilities (e.g. buffer inspection, path helpers) to `src/utils/` so they are reusable across services
- Exported functions and types must have explicit TypeScript return types
- Use named `interface` or `type` aliases instead of long inline return type annotations
- Avoid redundant runtime guards (e.g. `Array.isArray`) on values that are already typed
- Prefer `async`/`await` with `fs.promises.*` in async functions — never call synchronous `fs.*` inside an async code path

## DRY & Clean Code

- Extract shared logic into a named helper before duplicating it between sync and async variants of the same operation
- One-liner wrapper functions that add no abstraction should be inlined at the call site
- Shared path-generation or ID-generation logic used by multiple functions must be extracted into a single helper
- `filter(Boolean)` is redundant when a downstream function already filters empty/falsy values

## Normalization

- When sanitizing user-provided string arrays, strip problematic characters (e.g. `\r\n`) rather than discarding the whole entry — silent data loss is worse than a partial sanitization

## Testing

- Every exported function with meaningful logic must have unit tests
- Async code paths must have at least one async test — do not rely on sync tests to cover async variants
- Test names must describe the behaviour being verified, not the implementation mechanism
- Do not write tests that bypass the code under test (e.g. using `lineBasedFileCompare` directly when the test claims to verify a custom handler guard)

## Test Infrastructure

### Shared Mocks (`src/test/suite/mocks/`)

Reusable VS Code test doubles. Always use these instead of creating inline mocks with `as` casts.

- `MockTreeView` — implements `TreeView<File>`
- `mockConfiguration(values)` — stubs `workspace.getConfiguration`, returns a `restore` function

## Multi-Agent Review Workflow

When declaring a feature ready to merge, run three parallel sub-agents instead of a single sequential review. This surfaces issues that a single pass misses.

### Launch all three in parallel:

**1. Code quality agent** (`code-review` type)
> Check for bugs, type safety gaps, TypeScript strict violations, naming inconsistencies, and whether `AGENTS.md` practices are reflected in the implementation. Verify all imports resolve, no orphaned references.

**2. Test coverage agent** (`explore` type)
> For each exported function, identify untested code paths and missing edge cases. Specifically check: special characters in user input, error/fallback paths, async vs sync parity, duplicate/empty input, and boundary conditions.

**3. Integration agent** (`explore` type)
> Verify the feature doesn't conflict with existing features. Check that new config fields match their TypeScript types and `package.json` schema. Confirm no old naming references remain. Verify handler wiring doesn't accidentally override unrelated options.

### After agents complete:

Make a report of all identified issues, categorized by type (e.g. code quality, test coverage, integration). For each issue, specify the file and line number, a description of the problem, and a recommended fix.

### Once the report is addressed:
- Implement every real issue found before declaring ready
- Add tests for every coverage gap identified
- Add fallback safety (`|| []`, null guards) for any config values that could be nullish at runtime
- Add `log(...)` to silent catch blocks so fallback behaviour is observable
