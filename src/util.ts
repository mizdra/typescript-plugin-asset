import { camelCase, constantCase, pascalCase, snakeCase } from 'change-case';
import type { ExportedNameCase } from './option';

const CHANGE_CASE_OPTIONS = { stripRegexp: /[^\p{ID_Continue}]/giu };

export function changeCase(str: string, exportedNameCase: ExportedNameCase): string {
  if (exportedNameCase === 'constantCase') return constantCase(str, CHANGE_CASE_OPTIONS);
  if (exportedNameCase === 'camelCase') return camelCase(str, CHANGE_CASE_OPTIONS);
  if (exportedNameCase === 'pascalCase') return pascalCase(str, CHANGE_CASE_OPTIONS);
  if (exportedNameCase === 'snakeCase') return snakeCase(str, CHANGE_CASE_OPTIONS);
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return unreachable(`Unknown exported name case: ${exportedNameCase}`);
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function unreachable(message: string): never {
  throw new Error(message);
}
