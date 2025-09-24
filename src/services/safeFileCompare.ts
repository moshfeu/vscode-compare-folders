import { fileCompareHandlers } from 'dir-compare';
import { log } from './logger';

/**
 * Safe file comparison that falls back to binary comparison if line-based comparison fails
 * This prevents crashes due to problematic file content that causes stack overflow in dir-compare
 */
export async function safeFileCompareAsync(
  path1: string,
  stat1: any,
  path2: string,
  stat2: any,
  options: any
): Promise<boolean> {
  try {
    // Try line-based comparison first
    return await fileCompareHandlers.lineBasedFileCompare.compareAsync(path1, stat1, path2, stat2, options);
  } catch (error: any) {
    // Check if this is the specific stack overflow error we're trying to fix
    if (error.message && error.message.includes('Maximum call stack size exceeded')) {
      log(`Line-based comparison failed for ${path1} vs ${path2} due to stack overflow. Falling back to binary comparison.`);
      
      try {
        // Fall back to binary comparison which is more robust
        return await fileCompareHandlers.defaultFileCompare.compareAsync(path1, stat1, path2, stat2, options);
      } catch (fallbackError: any) {
        log(`Binary comparison also failed for ${path1} vs ${path2}:`, fallbackError);
        // If both comparisons fail, consider files as different
        return false;
      }
    } else {
      // For other errors, re-throw to maintain existing error handling
      throw error;
    }
  }
}