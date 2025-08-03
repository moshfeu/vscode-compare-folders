import * as assert from 'assert';
import { safeFileCompareAsync } from '../../services/safeFileCompare';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

suite('Safe File Compare Test Suite', () => {
  const testDir = '/tmp/safe-file-compare-test';
  const file1 = path.join(testDir, 'file1.txt');
  const file2 = path.join(testDir, 'file2.txt');

  setup(async () => {
    await fs.promises.mkdir(testDir, { recursive: true });
  });

  teardown(async () => {
    try {
      execSync(`rm -rf ${testDir}`);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  test('handles normal files correctly', async () => {
    await fs.promises.writeFile(file1, 'Hello world\n');
    await fs.promises.writeFile(file2, 'Hello world\n');
    
    const stat1 = await fs.promises.stat(file1);
    const stat2 = await fs.promises.stat(file2);
    
    const result = await safeFileCompareAsync(file1, stat1, file2, stat2, {});
    assert.strictEqual(result, true, 'Identical files should be equal');
  });

  test('handles different files correctly', async () => {
    await fs.promises.writeFile(file1, 'Hello world\n');
    await fs.promises.writeFile(file2, 'Different content\n');
    
    const stat1 = await fs.promises.stat(file1);
    const stat2 = await fs.promises.stat(file2);
    
    const result = await safeFileCompareAsync(file1, stat1, file2, stat2, {});
    assert.strictEqual(result, false, 'Different files should not be equal');
  });

  test('handles empty files correctly', async () => {
    await fs.promises.writeFile(file1, '');
    await fs.promises.writeFile(file2, '');
    
    const stat1 = await fs.promises.stat(file1);
    const stat2 = await fs.promises.stat(file2);
    
    const result = await safeFileCompareAsync(file1, stat1, file2, stat2, {});
    assert.strictEqual(result, true, 'Empty files should be equal');
  });

  test('handles binary files correctly', async () => {
    const binaryContent = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x00, 0x00]);
    await fs.promises.writeFile(file1, binaryContent);
    await fs.promises.writeFile(file2, binaryContent);
    
    const stat1 = await fs.promises.stat(file1);
    const stat2 = await fs.promises.stat(file2);
    
    const result = await safeFileCompareAsync(file1, stat1, file2, stat2, {});
    assert.strictEqual(result, true, 'Identical binary files should be equal');
  });

  test('handles files with null bytes correctly', async () => {
    const nullContent = Buffer.from([0x00, 0x00, 0x00, 0x00]);
    await fs.promises.writeFile(file1, nullContent);
    await fs.promises.writeFile(file2, nullContent);
    
    const stat1 = await fs.promises.stat(file1);
    const stat2 = await fs.promises.stat(file2);
    
    const result = await safeFileCompareAsync(file1, stat1, file2, stat2, {});
    assert.strictEqual(result, true, 'Files with null bytes should be compared correctly');
  });
});