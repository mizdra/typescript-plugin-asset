import path from 'node:path';
import { camelCase, constantCase, pascalCase, snakeCase } from 'change-case';
import type * as ts from 'typescript/lib/tsserverlibrary';
import type { ExportedNameCase, ParsedAssetPluginOptions, SuggestionRule } from './option';

const CHANGE_CASE_OPTIONS = { stripRegexp: /[^\p{ID_Continue}]/giu };

export function changeCase(str: string, exportedNameCase: ExportedNameCase): string {
  if (exportedNameCase === 'constantCase') return constantCase(str, CHANGE_CASE_OPTIONS);
  if (exportedNameCase === 'camelCase') return camelCase(str, CHANGE_CASE_OPTIONS);
  if (exportedNameCase === 'pascalCase') return pascalCase(str, CHANGE_CASE_OPTIONS);
  if (exportedNameCase === 'snakeCase') return snakeCase(str, CHANGE_CASE_OPTIONS);
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return unreachable(`Unknown exported name case: ${exportedNameCase}`);
}

export function isAssetFile(filePath: string, sys: ts.System, assetPluginOptions: ParsedAssetPluginOptions): boolean {
  return getAssetFileNames(sys, assetPluginOptions).includes(filePath);
}

export function getAssetFileNames(sys: ts.System, assetPluginOptions: ParsedAssetPluginOptions): string[] {
  const projectRoot = path.dirname(assetPluginOptions.tsConfigPath);
  const fileNames = assetPluginOptions.rules
    .map((rule) =>
      sys.readDirectory(
        projectRoot,
        rule.extensions,
        rule.exclude?.map((e) => path.resolve(projectRoot, e)),
        rule.include.map((i) => path.resolve(projectRoot, i)),
      ),
    )
    .flat();
  return unique(fileNames);
}

export function getMatchedSuggestionRule(
  filePath: string,
  sys: ts.System,
  assetPluginOptions: ParsedAssetPluginOptions,
): SuggestionRule | undefined {
  const projectRoot = path.dirname(assetPluginOptions.tsConfigPath);
  return assetPluginOptions.rules.find((rule) => {
    const fileNames = sys.readDirectory(
      projectRoot,
      rule.extensions,
      rule.exclude?.map((e) => path.resolve(projectRoot, e)),
      rule.include.map((i) => path.resolve(projectRoot, i)),
    );
    // @ts-expect-error
    globalThis.info.project.projectService.logger.info(
      `@getMatchedSuggestionRule: ${JSON.stringify({ filePath, rule, fileNames }, null, 2)}`,
    );
    // console.log({ fileNames });
    return fileNames.includes(filePath);
  });
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

function unreachable(message: string): never {
  throw new Error(message);
}
