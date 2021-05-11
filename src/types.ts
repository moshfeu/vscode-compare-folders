import { Options } from 'dir-compare';

export type CompareOptions = Options & {
  ignoreExtension?: [[string, string]];
};
