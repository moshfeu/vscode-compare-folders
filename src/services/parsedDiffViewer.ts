import { commands, Uri, window, extensions } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { FileParserService } from './fileParser';
import { DiffViewTitle, getConfiguration } from './configuration';
import { log } from './logger';
import { compareIgnoredExtension } from './ignoreExtensionTools';
import { ReadonlyContentProvider } from '../providers/readonlyContentProvider';
import { READONLY_SCHEME } from '../utils/consts';

export class ParsedDiffViewer {
  private fileParser: FileParserService;
  private contentProvider: ReadonlyContentProvider;

  constructor(fileParser: FileParserService) {
    this.fileParser = fileParser;
    this.contentProvider = new ReadonlyContentProvider(READONLY_SCHEME);
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
        const uri1 = Uri.file(file1);
        const uri2 = Uri.file(file2);
        const title = this.getTitle(file1, relativePath, compareIgnoredExtension(file1, file2) ? 'full path' : undefined);
        await this.showDiff(uri1, uri2, title);
        return;
      }

      // Parse files and get content
      const [parsed1, parsed2] = await Promise.all([
        shouldParse1 ? this.fileParser.parseFile(file1) : null,
        shouldParse2 ? this.fileParser.parseFile(file2) : null
      ]);

      // Get content for both files (parsed or original)
      const [content1, content2] = await Promise.all([
        this.getFileContent(file1, parsed1),
        this.getFileContent(file2, parsed2)
      ]);

      // Create readonly URIs with in-memory content
      const fileName1 = path.basename(file1);
      const fileName2 = path.basename(file2);
      const [uri1, uri2] = this.contentProvider.createReadonlyUris(content1, content2, fileName1, fileName2);

      // Show diff with parsed content
      const title = this.getParsedTitle(relativePath, {
        parsed1: !!parsed1 && !parsed1.error,
        parsed2: !!parsed2 && !parsed2.error
      });
      await this.showDiff(uri1, uri2, title);

    } catch (error) {
      log(`Error in parsed diff viewer: ${error}`);
      // Fall back to original diff on error
      const uri1 = Uri.file(file1);
      const uri2 = Uri.file(file2);
      const title = this.getTitle(file1, relativePath, compareIgnoredExtension(file1, file2) ? 'full path' : undefined);
      await this.showDiff(uri1, uri2, title);
    }
  }

  /**
   * Show diff between two URIs using either DiffMerge or default VSCode diff
   */
  private async showDiff(uri1: Uri, uri2: Uri, title: string): Promise<void> {
    if (getConfiguration('useDiffMerge')) {
      const diffMergeExtension = extensions.getExtension('moshfeu.diff-merge');
      if (diffMergeExtension) {
        commands.executeCommand('diffMerge.compareSelected', uri1, [uri1, uri2]);
      } else {
        window.showErrorMessage(
          'In order to use "Diff & Merge" extension you should install / enable it'
        );
      }
      return;
    }

    commands.executeCommand('vscode.diff', uri1, uri2, title);
  }

  /**
   * Get file content (parsed or original)
   */
  private async getFileContent(filePath: string, parsedResult: any): Promise<string> {
    if (parsedResult && !parsedResult.error) {
      return parsedResult.parsedContent;
    }
    // Fall back to original content
    return await fs.promises.readFile(filePath, 'utf8');
  }

  /**
   * Get title for parsed diff view
   */
  private getParsedTitle(relativePath: string, metadata: { parsed1: boolean; parsed2: boolean }): string {
    const { parsed1, parsed2 } = metadata;
    
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

  async cleanup(): Promise<void> {
    this.contentProvider.clear();
  }

  dispose(): void {
    this.contentProvider.dispose();
  }

}
