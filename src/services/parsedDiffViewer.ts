import { commands, Uri, window, workspace, extensions } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { FileParserService } from './fileParser';
import { DiffViewTitle, getConfiguration } from './configuration';
import { log } from './logger';
import { compareIgnoredExtension } from './ignoreExtensionTools';

export class ParsedDiffViewer {
  private fileParser: FileParserService;
  private tempFiles = new Set<string>();

  constructor(fileParser: FileParserService) {
    this.fileParser = fileParser;
  }

  /**
   * Show diff view with parsed content if applicable
   */
  async showDiffs([file1, file2]: [string, string], relativePath: string): Promise<void> {
    try {
      // Check if either file should be parsed
      const shouldParse1 = this.fileParser.shouldParseFile(file1);
      const shouldParse2 = this.fileParser.shouldParseFile(file2);

      if (!shouldParse1 && !shouldParse2) {
        // No parsing needed, use original files
        await this.showOriginalDiff(file1, file2, relativePath);
        return;
      }

      // Parse files and create temporary files for diff view
      const [parsed1, parsed2] = await Promise.all([
        shouldParse1 ? this.fileParser.parseFile(file1) : null,
        shouldParse2 ? this.fileParser.parseFile(file2) : null
      ]);

      // Create temporary files for diff view
      const tempFile1 = await this.createTempFile(file1, parsed1);
      const tempFile2 = await this.createTempFile(file2, parsed2);

      // Show diff with temporary files
      await this.showTempDiff(tempFile1, tempFile2, relativePath, {
        original1: file1,
        original2: file2,
        parsed1: !!parsed1,
        parsed2: !!parsed2
      });

    } catch (error) {
      log(`Error in parsed diff viewer: ${error}`);
      // Fall back to original diff on error
      await this.showOriginalDiff(file1, file2, relativePath);
    }
  }

  /**
   * Show diff between two files using either DiffMerge or default VSCode diff
   */
  private async showDiff(file1: string, file2: string, title: string): Promise<void> {
    if (getConfiguration('useDiffMerge')) {
      const diffMergeExtension = extensions.getExtension('moshfeu.diff-merge');
      if (diffMergeExtension) {
        commands.executeCommand('diffMerge.compareSelected', Uri.file(file1), [
          Uri.file(file1),
          Uri.file(file2),
        ]);
      } else {
        window.showErrorMessage(
          'In order to use "Diff & Merge" extension you should install / enable it'
        );
      }
      return;
    } else {
      commands.executeCommand(
        'vscode.diff',
        Uri.file(file1),
        Uri.file(file2),
        title
      );
    }
  }

  private async showOriginalDiff(file1: string, file2: string, relativePath: string): Promise<void> {
    const title = this.getTitle(file1, relativePath, compareIgnoredExtension(file1, file2) ? 'full path' : undefined)
    await this.showDiff(file1, file2, title);
  }

  /**
   * Show diff with temporary files
   */
  private async showTempDiff(tempFile1: string, tempFile2: string, relativePath: string, metadata: any): Promise<void> {
    const title = this.getParsedTitle(relativePath, metadata);
    await this.showDiff(tempFile1, tempFile2, title);
  }

  /**
   * Create temporary file with parsed content
   */
  private async createTempFile(originalPath: string, parsedResult: any): Promise<string> {
    const tempDir = os.tmpdir();
    const fileName = path.basename(originalPath);
    const tempFile = path.join(tempDir, `compare-folders-${Date.now()}-${fileName}`);
    
    let content: string;
    if (parsedResult && !parsedResult.error) {
      content = parsedResult.parsedContent;
    } else {
      // Fall back to original content
      content = await fs.promises.readFile(originalPath, 'utf8');
    }

    await fs.promises.writeFile(tempFile, content, 'utf8');
    this.tempFiles.add(tempFile);
    
    return tempFile;
  }

  /**
   * Get title for parsed diff view
   */
  private getParsedTitle(relativePath: string, metadata: any): string {
    const { original1, original2, parsed1, parsed2 } = metadata;
    
    if (parsed1 && parsed2) {
      return `${relativePath} (parsed)`;
    } else if (parsed1 || parsed2) {
      return `${relativePath} (mixed: ${parsed1 ? 'left parsed' : 'right parsed'})`;
    }
    
    return relativePath;
  }

  /**
   * Get title for original diff view
   */
  private getTitle(path: string,
    relativePath: string,
    titleFormat: DiffViewTitle = getConfiguration('diffViewTitle')
  ): string {
    switch (titleFormat) {
      case 'name only':
        return relativePath;
      case 'compared path':
        return `${path} ↔ ${relativePath}`;
      default:
        return '';
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanup(): Promise<void> {
    for (const tempFile of this.tempFiles) {
      try {
        await fs.promises.unlink(tempFile);
      } catch (error) {
        log(`Error cleaning up temp file ${tempFile}: ${error}`);
      }
    }
    this.tempFiles.clear();
  }

}
