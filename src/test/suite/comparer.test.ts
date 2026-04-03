import * as assert from 'assert';
import { compareSync, compare, fileCompareHandlers } from 'dir-compare';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { createIgnoreStringsHandlers, normalizeIgnoreStrings } from '../../services/ignoreStringsCompare';

suite('Comparer - Whitespace Handling', () => {
  let testDir: string;
  let folder1: string;
  let folder2: string;

  setup(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-test-'));
    folder1 = path.join(testDir, 'folder1');
    folder2 = path.join(testDir, 'folder2');
    fs.mkdirSync(folder1);
    fs.mkdirSync(folder2);
  });

  teardown(() => {
    if (testDir && fs.existsSync(testDir)) {
      fs.removeSync(testDir);
    }
  });

  test('should detect differences when ignoreAllWhiteSpaces is false', () => {
    const file1 = path.join(folder1, 'test.txt');
    const file2 = path.join(folder2, 'test.txt');

    fs.writeFileSync(file1, 'Permissions = TableData 271=rimd;');
    fs.writeFileSync(file2, 'Permissions = TableData 271 = rimd;');

    const result = compareSync(folder1, folder2, {
      compareContent: true,
      compareFileSync: fileCompareHandlers.lineBasedFileCompare.compareSync,
      compareFileAsync: fileCompareHandlers.lineBasedFileCompare.compareAsync,
      ignoreAllWhiteSpaces: false
    });

    assert.strictEqual(result.same, false, 'Files should be detected as different when ignoreAllWhiteSpaces is false');
    assert.strictEqual(result.differences, 1, 'Should have 1 difference');
    assert.strictEqual(result.diffSet?.[0]?.state, 'distinct', 'Files should be marked as distinct');
  });

  test('should ignore whitespace differences when ignoreAllWhiteSpaces is true', () => {
    const file1 = path.join(folder1, 'test.txt');
    const file2 = path.join(folder2, 'test.txt');

    fs.writeFileSync(file1, 'Permissions = TableData 271=rimd;');
    fs.writeFileSync(file2, 'Permissions = TableData 271 = rimd;');

    const result = compareSync(folder1, folder2, {
      compareContent: true,
      compareFileSync: fileCompareHandlers.lineBasedFileCompare.compareSync,
      compareFileAsync: fileCompareHandlers.lineBasedFileCompare.compareAsync,
      ignoreAllWhiteSpaces: true
    });

    assert.strictEqual(result.same, true, 'Files should be detected as same when ignoreAllWhiteSpaces is true');
    assert.strictEqual(result.differences, 0, 'Should have no differences');
    assert.strictEqual(result.diffSet?.[0]?.state, 'equal', 'Files should be marked as equal');
  });

  test('should fail to ignore whitespace when compareFileSync is missing', () => {
    const file1 = path.join(folder1, 'test.txt');
    const file2 = path.join(folder2, 'test.txt');

    fs.writeFileSync(file1, 'Permissions = TableData 271=rimd;');
    fs.writeFileSync(file2, 'Permissions = TableData 271 = rimd;');

    const result = compareSync(folder1, folder2, {
      compareContent: true,
      // Only compareFileAsync, missing compareFileSync (this was the bug)
      compareFileAsync: fileCompareHandlers.lineBasedFileCompare.compareAsync,
      ignoreAllWhiteSpaces: true
    });

    assert.strictEqual(result.same, false, 'Files should be detected as different when compareFileSync is missing (bug behavior)');
    assert.strictEqual(result.differences, 1, 'Should have 1 difference when handler is incomplete');
  });

  test('should ignore leading and trailing whitespace when ignoreWhiteSpaces is true', () => {
    const file1 = path.join(folder1, 'test.txt');
    const file2 = path.join(folder2, 'test.txt');

    fs.writeFileSync(file1, '  line with leading spaces');
    fs.writeFileSync(file2, 'line with leading spaces  ');

    const result = compareSync(folder1, folder2, {
      compareContent: true,
      compareFileSync: fileCompareHandlers.lineBasedFileCompare.compareSync,
      compareFileAsync: fileCompareHandlers.lineBasedFileCompare.compareAsync,
      ignoreWhiteSpaces: true
    });

    assert.strictEqual(result.same, true, 'Files should be same when ignoring leading/trailing whitespace');
    assert.strictEqual(result.differences, 0, 'Should have no differences');
  });

  test('should ignore empty lines when ignoreEmptyLines is true', () => {
    const file1 = path.join(folder1, 'test.txt');
    const file2 = path.join(folder2, 'test.txt');

    fs.writeFileSync(file1, 'line1\n\nline2');
    fs.writeFileSync(file2, 'line1\nline2');

    const result = compareSync(folder1, folder2, {
      compareContent: true,
      compareFileSync: fileCompareHandlers.lineBasedFileCompare.compareSync,
      compareFileAsync: fileCompareHandlers.lineBasedFileCompare.compareAsync,
      ignoreEmptyLines: true
    });

    assert.strictEqual(result.same, true, 'Files should be same when ignoring empty lines');
    assert.strictEqual(result.differences, 0, 'Should have no differences');
  });

  test('should ignore line ending differences when ignoreLineEnding is true', () => {
    const file1 = path.join(folder1, 'test.txt');
    const file2 = path.join(folder2, 'test.txt');

    fs.writeFileSync(file1, 'line1\nline2\n');
    fs.writeFileSync(file2, 'line1\r\nline2\r\n');

    const result = compareSync(folder1, folder2, {
      compareContent: true,
      compareFileSync: fileCompareHandlers.lineBasedFileCompare.compareSync,
      compareFileAsync: fileCompareHandlers.lineBasedFileCompare.compareAsync,
      ignoreLineEnding: true
    });

    assert.strictEqual(result.same, true, 'Files should be same when ignoring line endings');
    assert.strictEqual(result.differences, 0, 'Should have no differences');
  });

  test('should detect differences in actual content even with ignoreAllWhiteSpaces enabled', () => {
    const file1 = path.join(folder1, 'test.txt');
    const file2 = path.join(folder2, 'test.txt');

    fs.writeFileSync(file1, 'Permissions = TableData 271=rimd;');
    fs.writeFileSync(file2, 'Permissions = TableData 272=rimd;');

    const result = compareSync(folder1, folder2, {
      compareContent: true,
      compareFileSync: fileCompareHandlers.lineBasedFileCompare.compareSync,
      compareFileAsync: fileCompareHandlers.lineBasedFileCompare.compareAsync,
      ignoreAllWhiteSpaces: true
    });

    assert.strictEqual(result.same, false, 'Files with actual content differences should be detected as different');
    assert.strictEqual(result.differences, 1, 'Should have 1 difference');
    assert.strictEqual(result.diffSet?.[0]?.state, 'distinct', 'Files should be marked as distinct');
  });
});

suite('Comparer - Ignore List', () => {
  let testDir: string;
  let folder1: string;
  let folder2: string;

  setup(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-ignoreStrings-test-'));
    folder1 = path.join(testDir, 'folder1');
    folder2 = path.join(testDir, 'folder2');
    fs.mkdirSync(folder1);
    fs.mkdirSync(folder2);
  });

  teardown(() => {
    if (testDir && fs.existsSync(testDir)) {
      fs.removeSync(testDir);
    }
  });

  test('should treat files as identical when the only differences are ignored strings', () => {
    const file1 = path.join(folder1, 'config.txt');
    const file2 = path.join(folder2, 'config.txt');
    fs.writeFileSync(file1, 'host=dev.example.com\nport=8080');
    fs.writeFileSync(file2, 'host=prod.example.com\nport=8080');

    const handlers = createIgnoreStringsHandlers(['dev', 'prod']);
    const result = compareSync(folder1, folder2, {
      compareContent: true,
      compareFileSync: handlers.compareSync,
      compareFileAsync: handlers.compareAsync,
    });

    assert.strictEqual(result.same, true, 'Files should be identical when only ignored strings differ');
    assert.strictEqual(result.differences, 0, 'Should have no differences');
  });

  test('should detect differences beyond the ignored strings', () => {
    const file1 = path.join(folder1, 'config.txt');
    const file2 = path.join(folder2, 'config.txt');
    fs.writeFileSync(file1, 'host=dev.example.com\nport=8080');
    fs.writeFileSync(file2, 'host=prod.example.com\nport=9090');

    const handlers = createIgnoreStringsHandlers(['dev', 'prod']);
    const result = compareSync(folder1, folder2, {
      compareContent: true,
      compareFileSync: handlers.compareSync,
      compareFileAsync: handlers.compareAsync,
    });

    assert.strictEqual(result.same, false, 'Files should be different when non-ignored content differs');
    assert.strictEqual(result.differences, 1, 'Should have 1 difference');
  });

  test('should support multiple ignored strings', () => {
    const file1 = path.join(folder1, 'config.txt');
    const file2 = path.join(folder2, 'config.txt');
    fs.writeFileSync(file1, 'env=dev\nregion=us-east');
    fs.writeFileSync(file2, 'env=staging\nregion=eu-west');

    const handlers = createIgnoreStringsHandlers(['dev', 'staging', 'us-east', 'eu-west']);
    const result = compareSync(folder1, folder2, {
      compareContent: true,
      compareFileSync: handlers.compareSync,
      compareFileAsync: handlers.compareAsync,
    });

    assert.strictEqual(result.same, true, 'Files should be identical when all differences are ignored strings');
    assert.strictEqual(result.differences, 0, 'Should have no differences');
  });

  test('should work alongside ignoreAllWhiteSpaces option', () => {
    const file1 = path.join(folder1, 'config.txt');
    const file2 = path.join(folder2, 'config.txt');
    fs.writeFileSync(file1, 'host = dev.example.com\nport=8080');
    fs.writeFileSync(file2, 'host=prod.example.com\nport = 8080');

    const handlers = createIgnoreStringsHandlers(['dev', 'prod']);
    const result = compareSync(folder1, folder2, {
      compareContent: true,
      compareFileSync: handlers.compareSync,
      compareFileAsync: handlers.compareAsync,
      ignoreAllWhiteSpaces: true,
    });

    assert.strictEqual(result.same, true, 'Files should be identical with combined ignoreStrings and ignoreAllWhiteSpaces');
    assert.strictEqual(result.differences, 0, 'Should have no differences');
  });

  test('should behave like lineBasedFileCompare when ignoreStrings is empty', () => {
    const file1 = path.join(folder1, 'config.txt');
    const file2 = path.join(folder2, 'config.txt');
    fs.writeFileSync(file1, 'same content');
    fs.writeFileSync(file2, 'same content');

    const handlers = createIgnoreStringsHandlers([]);
    const result = compareSync(folder1, folder2, {
      compareContent: true,
      compareFileSync: handlers.compareSync,
      compareFileAsync: handlers.compareAsync,
    });

    assert.strictEqual(result.same, true, 'Identical files should remain identical with empty ignoreStrings');
    assert.strictEqual(result.differences, 0, 'Should have no differences');
  });

  test('longer overlapping entries should win (development stripped before dev)', () => {
    const normalized = normalizeIgnoreStrings(['dev', 'development']);
    assert.strictEqual(normalized[0], 'development', 'development should come before dev after length-desc sort');
    assert.strictEqual(normalized[1], 'dev');

    const file1 = path.join(folder1, 'config.txt');
    const file2 = path.join(folder2, 'config.txt');
    fs.writeFileSync(file1, 'mode=development');
    fs.writeFileSync(file2, 'mode=dev');

    const handlers = createIgnoreStringsHandlers(['dev', 'development']);
    const result = compareSync(folder1, folder2, {
      compareContent: true,
      compareFileSync: handlers.compareSync,
      compareFileAsync: handlers.compareAsync,
    });

    assert.strictEqual(result.same, true, 'development and dev should both be stripped leaving identical files');
  });

  test('should not activate ignoreStrings when compareContent is false (guard in getOptions)', () => {
    const file1 = path.join(folder1, 'config.txt');
    const file2 = path.join(folder2, 'config.txt');
    fs.writeFileSync(file1, 'host=dev.example.com\nport=8080');
    fs.writeFileSync(file2, 'host=prod.example.com\nport=8080');

    const handlers = createIgnoreStringsHandlers(['dev', 'prod']);
    const result = compareSync(folder1, folder2, {
      compareContent: true,
      compareFileSync: handlers.compareSync,
      compareFileAsync: handlers.compareAsync,
    });

    assert.strictEqual(result.same, true, 'Files differing only by ignored strings should be treated as identical');
    assert.strictEqual(result.differences, 0, 'Should have no differences when ignored strings are the only diff');
  });

  test('should strip newline characters from entries and drop whitespace-only entries', () => {
    const normalized = normalizeIgnoreStrings(['dev', '   ', '\nfoo', 'prod\r\n', '', 'staging']);
    assert.ok(!normalized.includes('   '), 'whitespace-only entry should be dropped');
    assert.ok(!normalized.includes('\nfoo'), 'original newline entry should not appear as-is');
    assert.ok(!normalized.includes('prod\r\n'), 'original CR+LF entry should not appear as-is');
    assert.ok(!normalized.includes(''), 'empty entry should be dropped');
    assert.ok(normalized.includes('foo'), 'newline-prefixed entry should be kept with newline stripped');
    assert.ok(normalized.includes('prod'), 'CR+LF-suffixed entry should be kept with whitespace stripped');
    assert.ok(normalized.includes('dev'), 'valid entry "dev" should be kept');
    assert.ok(normalized.includes('staging'), 'valid entry "staging" should be kept');
  });

  test('should fall back safely for binary files without throwing', () => {
    const file1 = path.join(folder1, 'data.bin');
    const file2 = path.join(folder2, 'data.bin');
    const binaryBuf = Buffer.from([0x00, 0x01, 0x02, 0x50, 0x4b, 0x03, 0x04]);
    fs.writeFileSync(file1, binaryBuf);
    fs.writeFileSync(file2, binaryBuf);

    const handlers = createIgnoreStringsHandlers(['dev', 'prod']);
    let threw = false;
    let result;
    try {
      result = compareSync(folder1, folder2, {
        compareContent: true,
        compareFileSync: handlers.compareSync,
        compareFileAsync: handlers.compareAsync,
      });
    } catch {
      threw = true;
    }

    assert.strictEqual(threw, false, 'Should not throw for binary files');
    assert.strictEqual(result?.same, true, 'Identical binary files should be equal');
    assert.strictEqual(result?.differences, 0, 'Should have no differences');
  });

  test('binary files that differ should be detected as distinct', () => {
    const file1 = path.join(folder1, 'data.bin');
    const file2 = path.join(folder2, 'data.bin');
    fs.writeFileSync(file1, Buffer.from([0x00, 0x01, 0x02]));
    fs.writeFileSync(file2, Buffer.from([0x00, 0x01, 0x03]));

    const handlers = createIgnoreStringsHandlers(['dev', 'prod']);
    const result = compareSync(folder1, folder2, {
      compareContent: true,
      compareFileSync: handlers.compareSync,
      compareFileAsync: handlers.compareAsync,
    });

    assert.strictEqual(result.same, false, 'Different binary files should be detected as distinct');
    assert.strictEqual(result.differences, 1, 'Should have 1 difference');
  });

  test('should correctly escape special regex characters in ignore strings', () => {
    const file1 = path.join(folder1, 'config.txt');
    const file2 = path.join(folder2, 'config.txt');
    fs.writeFileSync(file1, 'host=dev.example.com\npath=/api/v1');
    fs.writeFileSync(file2, 'host=prod.example.com\npath=/api/v1');

    const handlers = createIgnoreStringsHandlers(['dev.example', 'prod.example']);
    const result = compareSync(folder1, folder2, {
      compareContent: true,
      compareFileSync: handlers.compareSync,
      compareFileAsync: handlers.compareAsync,
    });

    assert.strictEqual(result.same, true, 'Dot in ignore string should be treated as literal, not regex wildcard');
  });

  test('should handle regex special characters: brackets, parens, dollar', () => {
    const file1 = path.join(folder1, 'config.txt');
    const file2 = path.join(folder2, 'config.txt');
    fs.writeFileSync(file1, 'value=${DEV_VALUE}\nother=same');
    fs.writeFileSync(file2, 'value=${PROD_VALUE}\nother=same');

    const handlers = createIgnoreStringsHandlers(['${DEV_VALUE}', '${PROD_VALUE}']);
    const result = compareSync(folder1, folder2, {
      compareContent: true,
      compareFileSync: handlers.compareSync,
      compareFileAsync: handlers.compareAsync,
    });

    assert.strictEqual(result.same, true, 'Special regex chars like $, {, } should be escaped and treated literally');
  });

  test('should deduplicate entries in ignoreStrings', () => {
    const normalized = normalizeIgnoreStrings(['dev', 'dev', 'staging', 'dev', 'staging']);
    assert.strictEqual(normalized.length, 2, 'Duplicate entries should be deduplicated');
    assert.ok(normalized.includes('dev'), '"dev" should be present once');
    assert.ok(normalized.includes('staging'), '"staging" should be present once');
  });

  test('should fall back safely when one file is binary and the other is text', () => {
    const file1 = path.join(folder1, 'data.bin');
    const file2 = path.join(folder2, 'data.bin');
    fs.writeFileSync(file1, Buffer.from([0x00, 0x01, 0x02]));
    fs.writeFileSync(file2, 'plain text content');

    const handlers = createIgnoreStringsHandlers(['dev', 'prod']);
    let threw = false;
    try {
      compareSync(folder1, folder2, {
        compareContent: true,
        compareFileSync: handlers.compareSync,
        compareFileAsync: handlers.compareAsync,
      });
    } catch {
      threw = true;
    }

    assert.strictEqual(threw, false, 'Should not throw when one file is binary and the other is text');
  });
});

suite('Comparer - Ignore Strings (async)', () => {
  let testDir: string;
  let folder1: string;
  let folder2: string;

  setup(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-ignoreStrings-async-test-'));
    folder1 = path.join(testDir, 'folder1');
    folder2 = path.join(testDir, 'folder2');
    fs.mkdirSync(folder1);
    fs.mkdirSync(folder2);
  });

  teardown(() => {
    if (testDir && fs.existsSync(testDir)) {
      fs.removeSync(testDir);
    }
  });

  test('async: should treat files as identical when the only differences are ignored strings', async () => {
    const file1 = path.join(folder1, 'config.txt');
    const file2 = path.join(folder2, 'config.txt');
    fs.writeFileSync(file1, 'host=dev.example.com\nport=8080');
    fs.writeFileSync(file2, 'host=prod.example.com\nport=8080');

    const handlers = createIgnoreStringsHandlers(['dev', 'prod']);
    const result = await compare(folder1, folder2, {
      compareContent: true,
      compareFileSync: handlers.compareSync,
      compareFileAsync: handlers.compareAsync,
    });

    assert.strictEqual(result.same, true, 'Files should be identical when only ignored strings differ');
    assert.strictEqual(result.differences, 0, 'Should have no differences');
  });

  test('async: should detect differences beyond the ignored strings', async () => {
    const file1 = path.join(folder1, 'config.txt');
    const file2 = path.join(folder2, 'config.txt');
    fs.writeFileSync(file1, 'host=dev.example.com\nport=8080');
    fs.writeFileSync(file2, 'host=prod.example.com\nport=9090');

    const handlers = createIgnoreStringsHandlers(['dev', 'prod']);
    const result = await compare(folder1, folder2, {
      compareContent: true,
      compareFileSync: handlers.compareSync,
      compareFileAsync: handlers.compareAsync,
    });

    assert.strictEqual(result.same, false, 'Files should be different when non-ignored content differs');
    assert.strictEqual(result.differences, 1, 'Should have 1 difference');
  });

  test('async: binary files that differ should be detected as distinct', async () => {
    const file1 = path.join(folder1, 'data.bin');
    const file2 = path.join(folder2, 'data.bin');
    fs.writeFileSync(file1, Buffer.from([0x00, 0x01, 0x02]));
    fs.writeFileSync(file2, Buffer.from([0x00, 0x01, 0x03]));

    const handlers = createIgnoreStringsHandlers(['dev', 'prod']);
    const result = await compare(folder1, folder2, {
      compareContent: true,
      compareFileSync: handlers.compareSync,
      compareFileAsync: handlers.compareAsync,
    });

    assert.strictEqual(result.same, false, 'Different binary files should be detected as distinct');
    assert.strictEqual(result.differences, 1, 'Should have 1 difference');
  });

  test('async: should behave like lineBasedFileCompare when ignoreStrings is empty', async () => {
    const file1 = path.join(folder1, 'config.txt');
    const file2 = path.join(folder2, 'config.txt');
    fs.writeFileSync(file1, 'same content');
    fs.writeFileSync(file2, 'same content');

    const handlers = createIgnoreStringsHandlers([]);
    const result = await compare(folder1, folder2, {
      compareContent: true,
      compareFileSync: handlers.compareSync,
      compareFileAsync: handlers.compareAsync,
    });

    assert.strictEqual(result.same, true, 'Identical files should remain identical with empty ignoreStrings');
    assert.strictEqual(result.differences, 0, 'Should have no differences');
  });
});
