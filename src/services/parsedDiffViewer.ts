import { Uri } from 'vscode';
import * as path from 'path';
import { shouldParseFile, parseFile } from './fileParser';
import { ReadonlyContentProviderSingleton } from '../providers/readonlyContentProvider';

export const readonlyContentProvider = ReadonlyContentProviderSingleton.getInstance();

export async function prepareParsedDiff([file1, file2]: [string, string], relativePath: string): Promise<{ uri1: Uri; uri2: Uri; title: string }> {
  if (!shouldParseFile(file1)) {
    throw new Error(`prepareParsedDiff called for file that should not be parsed: ${file1}`);
  }

  const [parsed1, parsed2] = await Promise.all([
    parseFile(file1),
    parseFile(file2)
  ]);

  const fileName1 = path.basename(file1);
  const fileName2 = path.basename(file2);
  const [uri1, uri2] = readonlyContentProvider.createReadonlyUris(fileName1, parsed1.parsedContent, fileName2, parsed2.parsedContent);

  const title = getParsedTitle(relativePath);

  return { uri1, uri2, title };
}

function getParsedTitle(relativePath: string): string {
  return `${relativePath} (parsed)`;
}

export function cleanup(): void {
  const contentProvider = ReadonlyContentProviderSingleton.getInstance();
  contentProvider.clear();
}
