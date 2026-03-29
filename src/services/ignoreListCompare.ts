import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as crypto from 'crypto';
import { fileCompareHandlers, type Options } from 'dir-compare';
import type { Stats } from 'fs';

const BINARY_SAMPLE_BYTES = 8192;
const NON_TEXT_RATIO_THRESHOLD = 0.30;

function isBinaryBuffer(buf: Buffer): boolean {
  const len = Math.min(buf.length, BINARY_SAMPLE_BYTES);
  let nonText = 0;
  for (let i = 0; i < len; i++) {
    const b = buf[i];
    if (b === 0x00) {
      return true;
    }
    if (
      (b >= 0x01 && b <= 0x08) ||
      (b >= 0x0e && b <= 0x1f) ||
      b === 0x7f
    ) {
      nonText++;
    }
  }
  return len > 0 && nonText / len > NON_TEXT_RATIO_THRESHOLD;
}

export function normalizeIgnoreList(ignoreList: string[]): string[] {
  return ignoreList
    .filter(s => !s.includes('\r') && !s.includes('\n'))
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .sort((a, b) => b.length - a.length);
}

function buildIgnorePattern(ignoreList: string[]): RegExp {
  const escaped = ignoreList.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(escaped.join('|'), 'g');
}

function applyIgnoreList(content: string, pattern: RegExp): string {
  pattern.lastIndex = 0;
  return content.replace(pattern, '');
}

function makeTempDir(): string {
  const unique = crypto.randomBytes(12).toString('hex');
  const dir = path.join(os.tmpdir(), `cf-ignore-${unique}`);
  fs.mkdirSync(dir);
  return dir;
}

function removeTempDir(dir: string): void {
  try {
    fse.removeSync(dir);
  } catch {
    // ignore cleanup failures
  }
}

export function createIgnoreListHandlers(ignoreList: string[]) {
  const normalized = normalizeIgnoreList(ignoreList);
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
      const content1 = applyIgnoreList(buf1.toString('utf8'), pattern);
      const content2 = applyIgnoreList(buf2.toString('utf8'), pattern);
      tmpDir = makeTempDir();
      const tmp1 = path.join(tmpDir, 'a');
      const tmp2 = path.join(tmpDir, 'b');
      fs.writeFileSync(tmp1, content1, 'utf8');
      fs.writeFileSync(tmp2, content2, 'utf8');
      const tmpStat1 = fs.statSync(tmp1);
      const tmpStat2 = fs.statSync(tmp2);
      return fileCompareHandlers.lineBasedFileCompare.compareSync(tmp1, tmpStat1, tmp2, tmpStat2, options);
    } catch {
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
      const content1 = applyIgnoreList(buf1.toString('utf8'), pattern);
      const content2 = applyIgnoreList(buf2.toString('utf8'), pattern);
      tmpDir = makeTempDir();
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
    } catch {
      return fileCompareHandlers.lineBasedFileCompare.compareAsync(path1, stat1, path2, stat2, options);
    } finally {
      if (tmpDir) {
        removeTempDir(tmpDir);
      }
    }
  }

  return { compareSync, compareAsync };
}
