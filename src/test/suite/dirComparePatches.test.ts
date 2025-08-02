import * as assert from 'assert';
import { applyDirComparePatches, removeDirComparePatches } from '../../utils/dirComparePatches';

suite('DirCompare Patches Test Suite', () => {
  test('readBufferedLines patch handles null match result', () => {
    // Apply the patch
    applyDirComparePatches();
    
    try {
      // Get the patched function
      const readBufferedLinesModule = require('dir-compare/build/src/FileCompareHandler/lines/lineReader/readBufferedLines');
      const readBufferedLines = readBufferedLinesModule.readBufferedLines;
      
      // Test with content that could produce null match (empty buffer)
      const buf = Buffer.from('');
      const size = 0;
      const allocatedBufferSize = 1024;
      const rest = '';
      const restLines: string[] = [];
      
      // This should not throw a stack overflow error
      const result = readBufferedLines(buf, size, allocatedBufferSize, rest, restLines);
      
      // Should return proper structure
      assert.strictEqual(typeof result, 'object');
      assert.strictEqual(Array.isArray(result.lines), true);
      assert.strictEqual(typeof result.rest, 'string');
      assert.strictEqual(typeof result.reachedEof, 'boolean');
      
      // Test with normal content
      const buf2 = Buffer.from('line1\nline2\n');
      const result2 = readBufferedLines(buf2, buf2.length, 1024, '', []);
      
      // Should handle normal content correctly
      assert.strictEqual(Array.isArray(result2.lines), true);
      assert.strictEqual(result2.lines.length, 2);
      
    } finally {
      // Clean up
      removeDirComparePatches();
    }
  });
  
  test('patch can be applied and removed safely', () => {
    // This should not throw
    applyDirComparePatches();
    applyDirComparePatches(); // Should handle multiple applications
    
    removeDirComparePatches();
    removeDirComparePatches(); // Should handle multiple removals
    
    // Should succeed without error
    assert.ok(true);
  });
});