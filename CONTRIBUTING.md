# Contributing to Compare Folders Extension

Thank you for your interest in contributing to the Compare Folders VS Code extension! This guide will help you get started with contributing to the project.

## 🤝 How to Contribute

### Types of Contributions Welcome
- 🐛 **Bug fixes**
- ✨ **New features**
- 📚 **Documentation improvements**
- 🧪 **Tests**
- 🌐 **Translations**
- 🎨 **UI/UX improvements**

## 🚀 Getting Started

### 1. Fork & Clone
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/vscode-compare-folders.git
cd vscode-compare-folders
```

### 2. Set Up Development Environment
```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Open in VS Code
code .
```

### 3. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

## 🏗️ Development Guidelines

### Code Style
- **Language**: TypeScript with strict typing
- **Formatting**: Use Prettier (configured in `.prettierrc`)
- **Linting**: Follow TSLint rules in `tslint.json`
- **Naming**: 
  - Files: `camelCase.ts`
  - Classes: `PascalCase`
  - Functions/variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`

### Project Structure
- **Services** (`src/services/`): Business logic
- **Providers** (`src/providers/`): VS Code tree data providers
- **Models** (`src/models/`): Data structures and interfaces
- **Utils** (`src/utils/`): Helper functions
- **Constants** (`src/constants/`): Application constants

### Writing Code

#### Adding New Commands
1. Add command constant to `src/constants/commands.ts`:
   ```typescript
   export const MY_NEW_COMMAND = 'foldersCompare.myNewCommand';
   ```

2. Register in `src/extension.ts`:
   ```typescript
   commands.registerCommand(MY_NEW_COMMAND, handler)
   ```

3. Add to `package.json` manifest:
   ```json
   {
     "command": "foldersCompare.myNewCommand",
     "title": "My New Command",
     "category": "CompareFolders"
   }
   ```

#### Adding New Settings
1. Add to `package.json` configuration:
   ```json
   "compareFolders.myNewSetting": {
     "type": "boolean",
     "default": false,
     "description": "Description of my setting"
   }
   ```

2. Use in code via configuration service:
   ```typescript
   import { getConfiguration } from './services/configuration';
   const { myNewSetting } = getConfiguration('myNewSetting');
   ```

### Testing Your Changes

#### Manual Testing
1. Press `F5` in VS Code to launch Extension Development Host
2. Test your changes in the new window
3. Check console for errors (Help → Toggle Developer Tools)

#### Automated Testing
```bash
# Run existing tests (requires network access)
npm test

# Add new tests in src/test/ directory
# Follow existing test patterns
```

#### Testing Checklist
- [ ] Feature works as expected
- [ ] No errors in console
- [ ] Existing functionality not broken
- [ ] Works with different folder structures
- [ ] Settings are properly applied
- [ ] UI is responsive and intuitive

## 📝 Commit Guidelines

### Commit Message Format
```
type(scope): description

Body (optional)

Closes #issue_number
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```
feat(comparison): add ignore empty lines option

Add new setting to ignore empty lines during file comparison,
similar to diff -B command.

Closes #123
```

```
fix(ui): resolve tree view refresh issue

Tree view now properly refreshes when folders are swapped.
```

## 🔍 Pull Request Process

### Before Submitting
1. **Test thoroughly**: Manual and automated testing
2. **Update documentation**: If adding features or changing behavior
3. **Update changelog**: Add entry to `CHANGELOG.md`
4. **Lint code**: Ensure no linting errors
5. **Commit properly**: Follow commit message guidelines

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Other: ___

## Testing
- [ ] Manual testing completed
- [ ] Automated tests pass
- [ ] Extension loads without errors
- [ ] Existing features still work

## Screenshots (if applicable)
Add screenshots of UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Changelog updated
```

### Review Process
1. Automated checks will run
2. Maintainers will review your code
3. Address any feedback
4. Once approved, changes will be merged

## 📋 Issue Guidelines

### Reporting Bugs
Use the bug report template with:
- **Environment**: VS Code version, OS, extension version
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots/logs** if applicable

### Feature Requests  
- Describe the problem you're solving
- Explain your proposed solution
- Consider alternatives
- Provide use cases

### Issue Labels
- `bug`: Something isn't working
- `enhancement`: New feature request
- `documentation`: Documentation needs
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed

## 🌟 Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributor graphs

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion
- **Code Comments**: For implementation questions

### Resources
- [VS Code Extension API](https://code.visualstudio.com/api)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [dir-compare library](https://github.com/gliviu/dir-compare) (used for comparison)

## 📄 Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms:

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and contribute
- Maintain professionalism

## 🙏 Thank You

Your contributions help make Compare Folders better for everyone. Whether it's a small bug fix or a major feature, every contribution is valued and appreciated!

---

*For technical questions about implementation, don't hesitate to open an issue or discussion. We're here to help!*