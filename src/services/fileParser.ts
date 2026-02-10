import { execFile } from 'child_process';
import { promisify } from 'util';
import minimatch from 'minimatch';
import { workspace } from 'vscode';
import { FileParsingRule, getConfiguration } from './configuration';
import { log } from './logger';
import { PARSING_RULE_EXECUTION_TIMEOUT } from '../utils/consts';

const execFileAsync = promisify(execFile);

export interface ParsedFileResult {
  originalPath: string;
  parsedContent: string;
}

function getParsingRules(): FileParsingRule[] {
  return getConfiguration('fileParsingRules') || [];
}

export function shouldParseFile(filePath: string): boolean {
  const parsingRules = getParsingRules();
  return parsingRules.some(rule =>
    minimatch(filePath, rule.pattern, { matchBase: true })
  );
}

export function hasParsableContent(path1: string, path2?: string): boolean {
  return shouldParseFile(path1) || (!!path2 && shouldParseFile(path2));
}

function getParsingRule(filePath: string): FileParsingRule | undefined {
  const parsingRules = getParsingRules();
  return parsingRules.find(rule =>
    minimatch(filePath, rule.pattern, { matchBase: true })
  );
}

export async function parseFile(filePath: string): Promise<ParsedFileResult> {
  const rule = getParsingRule(filePath);
  if (!rule) {
    throw new Error(`No parsing rule found for file: ${filePath}`);
  }

  try {
    const parsedContent = await executeParsingCommand(filePath, rule);
    const result: ParsedFileResult = {
      originalPath: filePath,
      parsedContent
    };

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Error parsing file ${filePath}: ${errorMessage}`);
    throw new Error(`Failed to parse file ${filePath}: ${errorMessage}`);
  }
}

async function executeParsingCommand(filePath: string, rule: FileParsingRule): Promise<string> {
  const args = rule.args.map(arg =>
    arg.replace('{file}', filePath)
  );

  const workingDirectory = rule.workingDirectory || process.cwd();
  const timeout = rule.timeout || PARSING_RULE_EXECUTION_TIMEOUT;
  const env = { ...process.env, ...rule.env };

  log(`Executing parsing command: ${rule.command} ${args.join(' ')} in ${workingDirectory}`);
  if (rule.env && Object.keys(rule.env).length > 0) {
    log(`With environment variables: ${JSON.stringify(rule.env)}`);
  }

  // Set maxBuffer to twice the workbench.editorLargeFileConfirmation value
  const largeFileConfirmation = workspace.getConfiguration('workbench').get<number>('editorLargeFileConfirmation') || 50; // Default 50MB if not set
  const maxBuffer = Math.min(largeFileConfirmation * 2 * 1024 * 1024, 1e9); // Convert MB to bytes and double it, capped at 1GB
  try {
    const { stdout, stderr } = await execFileAsync(rule.command, args, {
      cwd: workingDirectory,
      timeout,
      env,
      maxBuffer
    });

    if (stderr) {
      log(`Warning: Command stderr for ${filePath}: ${stderr}`);
    }

    return stdout;
  } catch (error) {
    if (error instanceof Error) {
      const commandDisplay = `${rule.command} ${args.join(' ')}`;
      if (error.message.includes('timeout')) {
        throw new Error(`Command timed out after ${timeout}ms: ${commandDisplay}`);
      }
      if (error.message.includes('maxBuffer')) {
        throw new Error(`Output too large for file ${filePath}. Consider using a different parsing approach or increasing buffer size.`);
      }
    }
    throw error;
  }
}