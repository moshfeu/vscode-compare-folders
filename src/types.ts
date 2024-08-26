import type { Options } from 'dir-compare';

export type DiffPaths = [path1: string, path2: string][];
export type ViewOnlyPath = [path: string][];

export type CompareOptions = Options & {
  ignoreExtension?: [[string, string]];
};

export type IncludeExcludePathsResult = Pick<Options, 'includeFilter' | 'excludeFilter'>;

export type IncludeExcludePathsCalculation = {
  [key in keyof Required<IncludeExcludePathsResult>]: Set<string>;
};
