import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { fileCompareHandlers, type Options } from 'dir-compare';
import type { Stats } from 'fs';

function buildIgnorePattern(ignoreList: string[]): RegExp {
  const escaped = ignoreList.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(escaped.join('|'), 'g');
}

function applyIgnoreList(content: string, pattern: RegExp): string {
  pattern.lastIndex = 0;
  return content.replace(pattern, '');
}

function makeTempPath(suffix: string): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}-${process.pid}`;
  return path.join(os.tmpdir(), `cf-ignore-${unique}-${suffix}`);
}

export function createIgnoreListHandlers(ignoreList: string[]) {
  const pattern = buildIgnorePattern(ignoreList);

  function compareSync(
    path1: string, stat1: Stats,
    path2: string, stat2: Stats,
    options: Options
  ): boolean {
    let tmpPath1: string | undefined;
    let tmpPath2: string | undefined;
    try {
      const raw1 = fs.readFileSync(path1, 'utf8');
      const raw2 = fs.readFileSync(path2, 'utf8');
      const content1 = applyIgnoreList(raw1, pattern);
      const content2 = applyIgnoreList(raw2, pattern);
      tmpPath1 = makeTempPath('1');
      tmpPath2 = makeTempPath('2');
      fs.writeFileSync(tmpPath1, content1, 'utf8');
      fs.writeFileSync(tmpPath2, content2, 'utf8');
      const tmpStat1 = fs.statSync(tmpPath1);
      const tmpStat2 = fs.statSync(tmpPath2);
      return fileCompareHandlers.lineBasedFileCompare.compareSync(tmpPath1, tmpStat1, tmpPath2, tmpStat2, options);
    } catch (err) {
      console.error(`[compare-folders] ignoreList compareSync fallback for "${path1}": ${err}`);
      return fileCompareHandlers.lineBasedFileCompare.compareSync(path1, stat1, path2, stat2, options);
    } finally {
      if (tmpPath1) { try { fs.unlinkSync(tmpPath1); } catch { /* ignore */ } }
      if (tmpPath2) { try { fs.unlinkSync(tmpPath2); } catch { /* ignore */ } }
    }
  }

  async function compareAsync(
    path1: string, stat1: Stats,
    path2: string, stat2: Stats,
    options: Options
  ): Promise<boolean> {
    let tmpPath1: string | undefined;
    let tmpPath2: string | undefined;
    try {
      const [raw1, raw2] = await Promise.all([
        fs.promises.readFile(path1, 'utf8'),
        fs.promises.readFile(path2, 'utf8'),
      ]);
      const content1 = applyIgnoreList(raw1, pattern);
      const content2 = applyIgnoreList(raw2, pattern);
      tmpPath1 = makeTempPath('1');
      tmpPath2 = makeTempPath('2');
      await Promise.all([
        fs.promises.writeFile(tmpPath1, content1, 'utf8'),
        fs.promises.writeFile(tmpPath2, content2, 'utf8'),
      ]);
      const [tmpStat1, tmpStat2] = await Promise.all([
        fs.promises.stat(tmpPath1),
        fs.promises.stat(tmpPath2),
      ]);
      return fileCompareHandlers.lineBasedFileCompare.compareAsync(tmpPath1, tmpStat1, tmpPath2, tmpStat2, options);
    } catch (err) {
      console.error(`[compare-folders] ignoreList compareAsync fallback for "${path1}": ${err}`);
      return fileCompareHandlers.lineBasedFileCompare.compareAsync(path1, stat1, path2, stat2, options);
    } finally {
      if (tmpPath1) { await fs.promises.unlink(tmpPath1).catch(() => { /* ignore */ }); }
      if (tmpPath2) { await fs.promises.unlink(tmpPath2).catch(() => { /* ignore */ }); }
    }
  }

  return { compareSync, compareAsync };
}
