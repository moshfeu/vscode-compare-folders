/**
 * Patches for dir-compare library to fix known issues
 */

// Store original function
let originalReadBufferedLines: any = null;

export function applyDirComparePatches() {
  try {
    // Fix for Maximum call stack size exceeded in readBufferedLines
    // Issue: fileContent.match() can return null, but code tries to spread it
    const readBufferedLinesModule = require('dir-compare/build/src/FileCompareHandler/lines/lineReader/readBufferedLines');
    
    if (readBufferedLinesModule && typeof readBufferedLinesModule.readBufferedLines === 'function') {
      // Store original function
      originalReadBufferedLines = readBufferedLinesModule.readBufferedLines;
      
      // Create safe wrapper
      readBufferedLinesModule.readBufferedLines = function(buf: Buffer, size: number, allocatedBufferSize: number, rest: string, restLines: string[]) {
        if (size === 0 && rest.length === 0) {
          return { lines: [...restLines], rest: '', reachedEof: true };
        }
        if (size === 0) {
          return { lines: [...restLines, rest], rest: '', reachedEof: true };
        }

        const fileContent = rest + buf.toString('utf8', 0, size);
        const LINE_TOKENIZER_REGEXP = /[^\n]+\n?|\n/g;
        
        // Fix: Handle null return from match()
        const matchResult = fileContent.match(LINE_TOKENIZER_REGEXP);
        const lines = [...restLines, ...(matchResult || [])];

        const reachedEof = size < allocatedBufferSize;
        if (reachedEof) {
          return {
            lines, rest: '', reachedEof: true
          };
        }

        // removeLastLine logic inline
        const lastLine = lines[lines.length - 1];
        return {
          lines: lines.slice(0, lines.length - 1),
          rest: lastLine,
          reachedEof: false
        };
      };
    }
  } catch (error) {
    console.warn('Failed to apply dir-compare patches:', error);
  }
}

export function removeDirComparePatches() {
  try {
    if (originalReadBufferedLines) {
      const readBufferedLinesModule = require('dir-compare/build/src/FileCompareHandler/lines/lineReader/readBufferedLines');
      if (readBufferedLinesModule) {
        readBufferedLinesModule.readBufferedLines = originalReadBufferedLines;
        originalReadBufferedLines = null;
      }
    }
  } catch (error) {
    console.warn('Failed to remove dir-compare patches:', error);
  }
}