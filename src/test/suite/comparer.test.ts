import * as assert from 'assert';
import { compareSync, fileCompareHandlers } from 'dir-compare';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { createIgnoreListHandlers } from '../../services/ignoreListCompare';

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
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-ignorelist-test-'));
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

    const handlers = createIgnoreListHandlers(['dev', 'prod']);
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

    const handlers = createIgnoreListHandlers(['dev', 'prod']);
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

    const handlers = createIgnoreListHandlers(['dev', 'staging', 'us-east', 'eu-west']);
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

    const handlers = createIgnoreListHandlers(['dev', 'prod']);
    const result = compareSync(folder1, folder2, {
      compareContent: true,
      compareFileSync: handlers.compareSync,
      compareFileAsync: handlers.compareAsync,
      ignoreAllWhiteSpaces: true,
    });

    assert.strictEqual(result.same, true, 'Files should be identical with combined ignoreList and ignoreAllWhiteSpaces');
    assert.strictEqual(result.differences, 0, 'Should have no differences');
  });

  test('should behave like lineBasedFileCompare when ignoreList is empty', () => {
    const file1 = path.join(folder1, 'config.txt');
    const file2 = path.join(folder2, 'config.txt');

    fs.writeFileSync(file1, 'same content');
    fs.writeFileSync(file2, 'same content');

    const handlers = createIgnoreListHandlers([]);
    const result = compareSync(folder1, folder2, {
      compareContent: true,
      compareFileSync: handlers.compareSync,
      compareFileAsync: handlers.compareAsync,
    });

    assert.strictEqual(result.same, true, 'Identical files should remain identical with empty ignoreList');
    assert.strictEqual(result.differences, 0, 'Should have no differences');
  });
});
