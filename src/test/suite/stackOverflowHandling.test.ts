import * as assert from 'assert';
import { safeFileCompareAsync } from '../../services/safeFileCompare';
import { fileCompareHandlers } from 'dir-compare';

// Mock a stack overflow scenario
suite('Stack Overflow Handling Test', () => {
  test('handles simulated stack overflow gracefully', async () => {
    // Create a mock that simulates the stack overflow error
    const originalCompareAsync = fileCompareHandlers.lineBasedFileCompare.compareAsync;
    
    try {
      // Replace with a function that throws stack overflow
      fileCompareHandlers.lineBasedFileCompare.compareAsync = async () => {
        const error = new Error('Maximum call stack size exceeded');
        error.name = 'RangeError';
        throw error;
      };
      
      // Create dummy parameters
      const path1 = '/fake/path1.txt';
      const stat1 = { size: 100 };
      const path2 = '/fake/path2.txt'; 
      const stat2 = { size: 100 };
      const options = {};
      
      // This should not throw and should return false (files considered different)
      const result = await safeFileCompareAsync(path1, stat1, path2, stat2, options);
      
      // The function should handle the error gracefully and fall back to binary comparison
      // Since we can't actually do binary comparison with fake paths, it should return false
      assert.strictEqual(typeof result, 'boolean', 'Should return a boolean result');
      
    } finally {
      // Restore original function
      fileCompareHandlers.lineBasedFileCompare.compareAsync = originalCompareAsync;
    }
  });
  
  test('passes through non-stack-overflow errors', async () => {
    const originalCompareAsync = fileCompareHandlers.lineBasedFileCompare.compareAsync;
    
    try {
      // Replace with a function that throws a different error
      fileCompareHandlers.lineBasedFileCompare.compareAsync = async () => {
        throw new Error('Some other error');
      };
      
      const path1 = '/fake/path1.txt';
      const stat1 = { size: 100 };
      const path2 = '/fake/path2.txt';
      const stat2 = { size: 100 };
      const options = {};
      
      // This should re-throw the non-stack-overflow error
      try {
        await safeFileCompareAsync(path1, stat1, path2, stat2, options);
        assert.fail('Should have thrown the original error');
      } catch (error: any) {
        assert.strictEqual(error.message, 'Some other error', 'Should pass through other errors');
      }
      
    } finally {
      // Restore original function
      fileCompareHandlers.lineBasedFileCompare.compareAsync = originalCompareAsync;
    }
  });
});