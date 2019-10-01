export function getRelativePath(path: string, basePath: string): string {
  return path.replace(basePath, '');
}