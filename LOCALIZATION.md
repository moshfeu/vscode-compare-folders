# Localization Guide

Thank you for your interest in helping translate Compare Folders into other languages! This guide will help you contribute localized content.

## Supported Languages

- **English (en)** - Default language (built-in, no bundle file needed)
- **Korean (ko)** - `l10n/bundle.l10n.ko.json`

## How Localization Works

Compare Folders uses VS Code's built-in localization system (`l10n`):

1. **Code uses English text directly**: All `l10n.t()` calls in the code use English strings
2. **Translation bundles map English → Target Language**: Each language has a JSON file mapping English text to translated text
3. **VS Code automatically loads the right bundle**: Based on the user's display language setting
4. **Automated validation**: We use `@vscode/l10n-dev` to ensure all strings are properly localized

## Quick Start for Translators

### 1. Generate Translation Template

```bash
npm run l10n:extract
```

This extracts all strings from the source code and creates `l10n/bundle.l10n.json` with all English strings that need translation.

### 2. Create Your Language File

Copy the generated bundle:

```bash
cp l10n/bundle.l10n.json l10n/bundle.l10n.YOUR_LOCALE.json
```

### 3. Translate

Open your file and translate each value (keep keys in English):

```json
{
  "Click to select a folder": "YOUR_TRANSLATION_HERE",
  "Please wait, comparing folder {0}-->{1}": "YOUR_TRANSLATION_HERE"
}
```

### 4. Validate

```bash
npm run l10n:validate
```

This checks that your translation has all required strings.

## Automated Validation Tools

We use Microsoft's official `@vscode/l10n-dev` tool to ensure quality:

### Available Commands

```bash
# Extract all localizable strings from source code
npm run l10n:extract

# Validate all translation bundles are complete
npm run l10n:validate
```

### What Gets Validated

The validation script performs two key checks:

**1. Hardcoded String Detection**
- ✅ Scans all source files for user-facing strings that should use `l10n.t()`
- ✅ Detects common patterns: `showInfoMessage('...')`, `placeHolder: '...'`, etc.
- ✅ Reports file and line number for each issue

**2. Translation Completeness**
- ✅ All `l10n.t()` strings are extracted
- ✅ Translation bundles have all required strings
- ✅ No missing translations
- ✅ Identifies obsolete translations (strings removed from source)

> **Note**: The English bundle (`bundle.l10n.json`) is auto-generated and not tracked in git. Only translation bundles (e.g., `bundle.l10n.ko.json`) need to be maintained.

### Example Output

```
🌍 VS Code Localization Validator

📊 Total strings extracted from source: 29

📋 Checking ko translations...
  ✅ All strings are translated!

✅ All localization bundles are up-to-date!
```

### CI/CD Integration

Localization validation runs automatically on every PR via GitHub Actions. The build will fail if:
- Hardcoded user-facing strings are detected
- Translation bundles are missing strings
- Translation bundles have obsolete strings

You can run the same validation locally before pushing:
```bash
npm run l10n:validate
```

## Contributing a New Language

### 1. Create Your Translation File

Create a new file: `l10n/bundle.l10n.{locale}.json`

Where `{locale}` is the language code:
- French: `bundle.l10n.fr.json`
- Spanish: `bundle.l10n.es.json`
- German: `bundle.l10n.de.json`
- Japanese: `bundle.l10n.ja.json`
- Chinese (Simplified): `bundle.l10n.zh-cn.json`

[See all VS Code language codes](https://code.visualstudio.com/docs/getstarted/locales#_available-locales)

### 2. Copy the Structure

Start with the Korean bundle as a template:

```bash
cp l10n/bundle.l10n.ko.json l10n/bundle.l10n.YOUR_LOCALE.json
```

### 3. Translate the Strings

Open your new file and translate each English key to your language. Keep:
- **Placeholders**: `{0}`, `{1}` etc. must remain in the same positions
- **Technical terms**: Keep "Diff", "Merge", "Git", etc. in English if commonly used
- **Formatting**: Preserve line breaks, punctuation context

#### Example:

```json
{
  "Click to select a folder": "Clique para selecionar uma pasta",
  "Please wait, comparing folder {0}-->{1}": "Aguarde, comparando pasta {0}-->{1}",
  "Pattern \"{0}\" is already in excludeFilter": "O padrão \"{0}\" já está no excludeFilter"
}
```

### 4. Translate the Manifest (package.nls.{locale}.json)

You also need to translate the extension manifest strings (UI labels, settings descriptions):

```bash
cp package.nls.ko.json package.nls.YOUR_LOCALE.json
```

Then translate all values in the file.

### 5. Test Your Translation

1. Install the extension in development mode (F5)
2. Change VS Code's display language to your target language:
   - Open Command Palette (Cmd/Ctrl+Shift+P)
   - Type "Configure Display Language"
   - Select your language
   - Restart VS Code
3. Test all features to ensure translations appear correctly

### 6. Submit Your Translation

1. Fork the repository
2. Create a branch: `git checkout -b localization/YOUR_LANGUAGE`
3. Add your files:
   - `l10n/bundle.l10n.{locale}.json`
   - `package.nls.{locale}.json`
4. Commit: `git commit -m "Add YOUR_LANGUAGE localization"`
5. Create a Pull Request
6. Update `LOCALIZATION.md` to add your language to the supported list

## Translation Guidelines

### Tone and Style

- **Professional and polite**: Use formal tone appropriate for software
- **Concise**: Keep translations short, especially for UI labels
- **User-focused**: Translate for end-users, not developers
- **Consistent terminology**: Use the same translation for recurring terms

### Technical Considerations

#### 1. Placeholders

Placeholders like `{0}`, `{1}` represent dynamic values injected at runtime:

```json
"Failed to open diff: {0}": "Échec de l'ouverture de diff: {0}"
```

The `{0}` will be replaced with an error message.

#### 2. Special Characters

Preserve special characters and formatting:
- Emoji: `😕`
- Arrows: `↔`, `-->`
- Brackets: `[ ]`
- Quotes: `" "`

#### 3. Context Clues

If a string's meaning is unclear, check where it's used:

```bash
# Search for the English text in source code
grep -r "Click to select a folder" src/
```

#### 4. String Keys in Manifest (package.nls.json)

The manifest file uses semantic keys that describe their purpose:

- `ext.config.*.description` - Setting descriptions
- `ext.command.*.title` - Command names in palette
- `ext.view.*.name` - View panel names

## String Categories

### Runtime Messages (`l10n/bundle.l10n.{locale}.json`)

These appear while using the extension:

- **Error messages**: Should be clear about what went wrong
- **Confirmation dialogs**: Use polite question form
- **Progress indicators**: Brief, informative
- **Instructions**: Clear, actionable

### Manifest Strings (`package.nls.{locale}.json`)

These appear in VS Code settings and command palette:

- **Configuration labels**: Should match official VS Code terminology
- **Command titles**: Action-oriented, concise
- **Description text**: Can be longer, explanatory

## Need Help?

- **Questions?** Open a [GitHub Discussion](https://github.com/moshfeu/vscode-compare-folders/discussions)
- **Issues?** Report on [GitHub Issues](https://github.com/moshfeu/vscode-compare-folders/issues)
- **Context needed?** Look at how Korean translation handled similar strings

## Thank You!

Your contribution helps make Compare Folders accessible to more users worldwide. We appreciate your effort in making this extension better for everyone! 🌍
