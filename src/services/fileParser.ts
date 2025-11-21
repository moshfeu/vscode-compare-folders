import { exec } from 'child_process';
import { promisify } from 'util';
import minimatch from 'minimatch';
import { workspace } from 'vscode';
import { FileParsingRule, getConfiguration } from './configuration';
import { log } from './logger';

const execAsync = promisify(exec);

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

  const command = `${rule.command} ${args.join(' ')}`;
  const workingDirectory = rule.workingDirectory || process.cwd();
  const timeout = rule.timeout;
  const env = { ...process.env, ...rule.env };

  log(`Executing parsing command: ${command} in ${workingDirectory}`);
  if (rule.env && Object.keys(rule.env).length > 0) {
    log(`With environment variables: ${JSON.stringify(rule.env)}`);
  }

  // Set maxBuffer to twice the workbench.editorLargeFileConfirmation value
  const largeFileConfirmation = workspace.getConfiguration('workbench').get<number>('editorLargeFileConfirmation') || 50; // Default 50MB if not set
  const maxBuffer = Math.min(largeFileConfirmation * 2 * 1024 * 1024, 1e9); // Convert MB to bytes and double it, capped at 1GB
  try {
    const { stdout, stderr } = await execAsync(command, {
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
      if (error.message.includes('timeout')) {
        throw new Error(`Command timed out after ${timeout}ms: ${command}`);
      }
      if (error.message.includes('maxBuffer')) {
        throw new Error(`Output too large for file ${filePath}. Consider using a different parsing approach or increasing buffer size.`);
      }
    }
    throw error;
  }
}