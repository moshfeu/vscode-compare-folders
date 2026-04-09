#!/usr/bin/env node

/**
 * Localization Validation Script
 * 
 * Uses @vscode/l10n-dev to extract all l10n.t() strings and validate that:
 * 1. All user-facing strings use l10n.t()
 * 2. All translations are up-to-date
 * 3. No missing strings in translation bundles
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const TEMP_DIR = path.join(os.tmpdir(), `vscode-compare-folders-l10n-${process.pid}`);
const L10N_DIR = path.join(__dirname, '../l10n');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function cleanupTempDir() {
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
}

function extractStrings() {
  console.log('📦 Extracting localization strings from source code...\n');
  
  try {
    // Run l10n-dev export to extract all l10n.t() strings
    execSync(
      `npx @vscode/l10n-dev export --outDir "${TEMP_DIR}" "./src/**/*.ts"`,
      { stdio: 'inherit' }
    );
    
    return true;
  } catch (error) {
    console.error('❌ Failed to extract strings:', error.message);
    return false;
  }
}

function loadJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return null;
  }
}

function compareBundle(extractedPath, existingPath, locale) {
  const extracted = loadJsonFile(extractedPath);
  const existing = loadJsonFile(existingPath);
  
  if (!extracted) {
    console.error(`❌ Could not load extracted bundle: ${extractedPath}`);
    return { missingInExisting: [], extraInExisting: [], hasIssues: true };
  }
  
  if (!existing) {
    console.warn(`⚠️  No existing bundle found: ${existingPath}`);
    return { missingInExisting: [], extraInExisting: [], hasIssues: false };
  }
  
  const extractedKeys = Object.keys(extracted);
  const existingKeys = Object.keys(existing);
  
  // Find strings in source but not in existing bundle (missing translations)
  const missingInExisting = extractedKeys.filter(key => !existingKeys.includes(key));
  
  // Find strings in existing bundle but not in source (obsolete translations)
  const extraInExisting = existingKeys.filter(key => !extractedKeys.includes(key));
  
  return {
    missingInExisting,
    extraInExisting,
    hasIssues: missingInExisting.length > 0 || extraInExisting.length > 0
  };
}

function validateBundles() {
  console.log('🔍 Validating localization bundles...\n');
  
  const extractedBundlePath = path.join(TEMP_DIR, 'bundle.l10n.json');
  
  if (!fs.existsSync(extractedBundlePath)) {
    console.error('❌ No strings found! Make sure you are using l10n.t() for user-facing strings.\n');
    return false;
  }
  
  let hasIssues = false;
  
  // Check all existing translation bundles (skip base English bundle since it's auto-generated)
  const bundleFiles = fs.readdirSync(L10N_DIR)
    .filter(f => f.startsWith('bundle.l10n.') && f.endsWith('.json'))
    .filter(f => f !== 'bundle.l10n.json'); // Skip English base bundle
  
  bundleFiles.forEach(bundleFile => {
    const locale = bundleFile.replace('bundle.l10n.', '').replace('.json', '');
    const existingPath = path.join(L10N_DIR, bundleFile);
    
    console.log(`📋 Checking ${locale} translations...`);
    
    const result = compareBundle(extractedBundlePath, existingPath, locale);
    
    if (result.missingInExisting.length > 0) {
      console.log(`\n  ⚠️  Missing ${result.missingInExisting.length} translation(s) in ${bundleFile}:`);
      result.missingInExisting.forEach(key => {
        console.log(`    - "${key}"`);
      });
      hasIssues = true;
    }
    
    if (result.extraInExisting.length > 0) {
      console.log(`\n  📝 Found ${result.extraInExisting.length} obsolete translation(s) in ${bundleFile}:`);
      result.extraInExisting.forEach(key => {
        console.log(`    - "${key}"`);
      });
      hasIssues = true;
    }
    
    if (!result.hasIssues) {
      console.log(`  ✅ All strings are translated!\n`);
    } else {
      console.log('');
    }
  });
  
  return !hasIssues;
}

function showExtractedStrings() {
  const extractedBundlePath = path.join(TEMP_DIR, 'bundle.l10n.json');
  const extracted = loadJsonFile(extractedBundlePath);
  
  if (!extracted) {
    return;
  }
  
  const count = Object.keys(extracted).length;
  console.log(`\n📊 Total strings extracted from source: ${count}`);
  
  // Show first few strings as examples
  const keys = Object.keys(extracted).slice(0, 5);
  if (keys.length > 0) {
    console.log('\n📝 Sample strings:');
    keys.forEach(key => {
      const preview = key.length > 60 ? key.substring(0, 57) + '...' : key;
      console.log(`  - "${preview}"`);
    });
  }
  
  if (Object.keys(extracted).length > 5) {
    console.log(`  ... and ${Object.keys(extracted).length - 5} more`);
  }
  console.log('');
}

function checkHardcodedStrings() {
  console.log('🔎 Checking for hardcoded user-facing strings...\n');
  
  const glob = require('glob');
  const files = glob.sync('./src/**/*.ts', {
    ignore: ['**/test/**', '**/**.test.ts']
  });
  
  const suspiciousPatterns = [
    // UI message functions with string literals (not using l10n.t)
    /(?<!l10n\.t\()showInfoMessage(?:WithTimeout)?\s*\(\s*(['"][^'"]+['"])/g,
    /(?<!l10n\.t\()showWarningMessage\s*\(\s*(['"][^'"]+['"])/g,
    /(?<!l10n\.t\()showErrorMessage\s*\(\s*(['"][^'"]+['"])/g,
    // QuickPick and InputBox options with string literals
    /placeHolder:\s*(['"][^'"]+['"])(?!\s*\))/g,
    /prompt:\s*(['"][^'"]+['"])(?!\s*\))/g,
  ];
  
  const issues = [];
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Skip if line already uses l10n.t()
      if (line.includes('l10n.t(')) {
        return;
      }
      
      suspiciousPatterns.forEach(pattern => {
        const matches = [...line.matchAll(pattern)];
        matches.forEach(match => {
          const stringValue = match[1];
          // Skip if it looks like a variable or constant (all caps, camelCase without spaces)
          if (stringValue.match(/^['"][A-Z_]+['"]$/) || stringValue.match(/^['"][a-z][a-zA-Z]*['"]$/)) {
            return;
          }
          // Skip if it's a common non-translatable value
          if (stringValue.match(/^['"](yes|no|ok|cancel)['"]$/i)) {
            return;
          }
          
          issues.push({
            file: file.replace('./', ''),
            line: index + 1,
            text: line.trim(),
            string: stringValue
          });
        });
      });
    });
  });
  
  if (issues.length > 0) {
    console.log(`  ⚠️  Found ${issues.length} potential hardcoded string(s):\n`);
    issues.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    ${issue.text}`);
      console.log(`    Should use: l10n.t(${issue.string})\n`);
    });
    return false;
  }
  
  console.log('  ✅ No hardcoded strings detected!\n');
  return true;
}

function main() {
  console.log('🌍 VS Code Localization Validator\n');
  console.log('Using @vscode/l10n-dev to extract and validate strings\n');
  console.log('═'.repeat(60) + '\n');
  
  // Cleanup any previous temp directory
  cleanupTempDir();
  ensureDir(TEMP_DIR);
  
  // Step 1: Extract all l10n.t() strings from source
  if (!extractStrings()) {
    cleanupTempDir();
    process.exit(1);
  }
  
  // Step 2: Show extracted strings summary
  showExtractedStrings();
  
  // Step 3: Check for hardcoded strings that should use l10n.t()
  const noHardcodedStrings = checkHardcodedStrings();
  
  // Step 4: Validate all translation bundles
  const isValid = validateBundles();
  
  // Cleanup
  cleanupTempDir();
  
  if (isValid && noHardcodedStrings) {
    console.log('═'.repeat(60));
    console.log('✅ All localization bundles are up-to-date!\n');
    process.exit(0);
  } else {
    console.log('═'.repeat(60));
    if (!noHardcodedStrings) {
      console.log('⚠️  Found hardcoded strings that should use l10n.t()\n');
    }
    if (!isValid) {
      console.log('⚠️  Some localization bundles need updates.');
      console.log('💡 To update bundles, run:');
      console.log('   npm run l10n:extract\n');
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
