import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as crypto from 'crypto';
import { fileCompareHandlers, type Options } from 'dir-compare';
import type { Stats } from 'fs';
import { isBinaryBuffer } from '../utils/buffer';
import { log } from './logger';

export interface FileCompareHandlerPair {
  compareSync: (path1: string, stat1: Stats, path2: string, stat2: Stats, options: Options) => boolean;
  compareAsync: (path1: string, stat1: Stats, path2: string, stat2: Stats, options: Options) => Promise<boolean>;
}

export function normalizeIgnoreStrings(ignoreStrings: string[]): string[] {
  return [...new Set(
    ignoreStrings
      .map(s => s.replace(/[\r\n]/g, '').trim())
      .filter(s => s.length > 0)
  )].sort((a, b) => b.length - a.length);
}

function buildIgnorePattern(ignoreStrings: string[]): RegExp {
  const escaped = ignoreStrings.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(escaped.join('|'), 'g');
}

function generateTempDirPath(): string {
  return path.join(os.tmpdir(), `cf-ignore-${crypto.randomBytes(12).toString('hex')}`);
}

function makeTempDirSync(): string {
  const dir = generateTempDirPath();
  fs.mkdirSync(dir);
  return dir;
}

async function makeTempDirAsync(): Promise<string> {
  const dir = generateTempDirPath();
  await fs.promises.mkdir(dir);
  return dir;
}

function removeTempDir(dir: string): void {
  try {
    fse.removeSync(dir);
  } catch {
    // ignore cleanup failures
  }
}

export function createIgnoreStringsHandlers(ignoreStrings: string[]): FileCompareHandlerPair {
  const normalized = normalizeIgnoreStrings(ignoreStrings);
  const pattern = normalized.length > 0 ? buildIgnorePattern(normalized) : null;

  function compareSync(
    path1: string, stat1: Stats,
    path2: string, stat2: Stats,
    options: Options
  ): boolean {
    if (!pattern) {
      return fileCompareHandlers.lineBasedFileCompare.compareSync(path1, stat1, path2, stat2, options);
    }
    let tmpDir: string | undefined;
    try {
      const buf1 = fs.readFileSync(path1);
      const buf2 = fs.readFileSync(path2);
      if (isBinaryBuffer(buf1) || isBinaryBuffer(buf2)) {
        return fileCompareHandlers.lineBasedFileCompare.compareSync(path1, stat1, path2, stat2, options);
      }
      const content1 = buf1.toString('utf8').replace(pattern, '');
      const content2 = buf2.toString('utf8').replace(pattern, '');
      tmpDir = makeTempDirSync();
      const tmp1 = path.join(tmpDir, 'a');
      const tmp2 = path.join(tmpDir, 'b');
      fs.writeFileSync(tmp1, content1, 'utf8');
      fs.writeFileSync(tmp2, content2, 'utf8');
      const tmpStat1 = fs.statSync(tmp1);
      const tmpStat2 = fs.statSync(tmp2);
      return fileCompareHandlers.lineBasedFileCompare.compareSync(tmp1, tmpStat1, tmp2, tmpStat2, options);
    } catch (err) {
      log('ignoreStrings: falling back to default compare due to error', err);
      return fileCompareHandlers.lineBasedFileCompare.compareSync(path1, stat1, path2, stat2, options);
    } finally {
      if (tmpDir) {
        removeTempDir(tmpDir);
      }
    }
  }

  async function compareAsync(
    path1: string, stat1: Stats,
    path2: string, stat2: Stats,
    options: Options
  ): Promise<boolean> {
    if (!pattern) {
      return fileCompareHandlers.lineBasedFileCompare.compareAsync(path1, stat1, path2, stat2, options);
    }
    let tmpDir: string | undefined;
    try {
      const [buf1, buf2] = await Promise.all([
        fs.promises.readFile(path1),
        fs.promises.readFile(path2),
      ]);
      if (isBinaryBuffer(buf1) || isBinaryBuffer(buf2)) {
        return fileCompareHandlers.lineBasedFileCompare.compareAsync(path1, stat1, path2, stat2, options);
      }
      const content1 = buf1.toString('utf8').replace(pattern, '');
      const content2 = buf2.toString('utf8').replace(pattern, '');
      tmpDir = await makeTempDirAsync();
      const tmp1 = path.join(tmpDir, 'a');
      const tmp2 = path.join(tmpDir, 'b');
      await Promise.all([
        fs.promises.writeFile(tmp1, content1, 'utf8'),
        fs.promises.writeFile(tmp2, content2, 'utf8'),
      ]);
      const [tmpStat1, tmpStat2] = await Promise.all([
        fs.promises.stat(tmp1),
        fs.promises.stat(tmp2),
      ]);
      return fileCompareHandlers.lineBasedFileCompare.compareAsync(tmp1, tmpStat1, tmp2, tmpStat2, options);
    } catch (err) {
      log('ignoreStrings: falling back to default compare due to error', err);
      return fileCompareHandlers.lineBasedFileCompare.compareAsync(path1, stat1, path2, stat2, options);
    } finally {
      if (tmpDir) {
        removeTempDir(tmpDir);
      }
    }
  }

  return { compareSync, compareAsync };
}

