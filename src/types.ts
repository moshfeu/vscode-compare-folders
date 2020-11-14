import { Options } from 'dir-compare';

export type CompreOptions = Options & {
  ignoreExtension?: [[string, string]];
};
