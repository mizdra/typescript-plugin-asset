import { camelCase, constantCase, pascalCase, snakeCase } from 'change-case';
import type { ExportedNameCase } from './cli.js';

export function changeCase(str: string, exportedNameCase: ExportedNameCase): string {
  if (exportedNameCase === 'constantCase') return constantCase(str);
  if (exportedNameCase === 'camelCase') return camelCase(str);
  if (exportedNameCase === 'pascalCase') return pascalCase(str);
  if (exportedNameCase === 'snakeCase') return snakeCase(str);
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return unreachable(`Unknown exported name case: ${exportedNameCase}`);
}

function unreachable(message: string): never {
  throw new Error(message);
}
