import { dirname, resolve } from 'node:path';
import { camelCase, constantCase, pascalCase, snakeCase } from 'change-case';
import { minimatch } from 'minimatch';
import type { ExportedNameCase } from './option';
import { AssetPluginOptions } from './option.js';

const CHANGE_CASE_OPTIONS = { stripRegexp: /[^\p{ID_Continue}]/giu };

export function changeCase(str: string, exportedNameCase: ExportedNameCase): string {
  if (exportedNameCase === 'constantCase') return constantCase(str, CHANGE_CASE_OPTIONS);
  if (exportedNameCase === 'camelCase') return camelCase(str, CHANGE_CASE_OPTIONS);
  if (exportedNameCase === 'pascalCase') return pascalCase(str, CHANGE_CASE_OPTIONS);
  if (exportedNameCase === 'snakeCase') return snakeCase(str, CHANGE_CASE_OPTIONS);
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return unreachable(`Unknown exported name case: ${exportedNameCase}`);
}

export function isAssetFile(filePath: string, assetPluginOptions: AssetPluginOptions): boolean {
  const { patterns } = assetPluginOptions;
  return patterns.some((pattern) => minimatch(filePath, resolve(dirname(assetPluginOptions.tsConfigPath), pattern)));
}

function unreachable(message: string): never {
  throw new Error(message);
}
