export function getLocalPath(path: string, basePath: string): string {
  return path.replace(basePath, '');
}