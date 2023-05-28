import path from 'node:path';
import type * as ts from 'typescript/lib/tsserverlibrary.js';

export const EXPORTED_NAME_CASES = ['constantCase', 'camelCase', 'pascalCase', 'snakeCase'] as const;
export type ExportedNameCase = (typeof EXPORTED_NAME_CASES)[number];

export type SuggestionRule = {
  exportedNameCase?: ExportedNameCase | undefined;
  exportedNamePrefix?: string | undefined;
};

export type RawAssetPluginOptions = {
  include: string[];
  exclude?: string[] | undefined;
  extensions: string[];
  exportedNameCase?: ExportedNameCase | undefined;
  exportedNamePrefix?: string | undefined;
};

export type AssetPluginOptions = SuggestionRule & {
  tsConfigPath: string;
  allowArbitraryExtensions: boolean;
  include: string[];
  exclude: string[];
  extensions: string[];
};

export const DEFAULT_EXPORTED_NAME_CASE = 'constantCase' as const satisfies AssetPluginOptions['exportedNameCase'];
export const DEFAULT_EXPORTED_NAME_PREFIX = 'I_' as const satisfies AssetPluginOptions['exportedNamePrefix'];
export const DEFAULT_ALLOW_ARBITRARY_EXTENSIONS =
  false as const satisfies AssetPluginOptions['allowArbitraryExtensions'];
export const DEFAULT_EXCLUDE = ['**/node_modules'] satisfies AssetPluginOptions['exclude'];

export function getParsedAssetPluginOptions(info: ts.server.PluginCreateInfo): AssetPluginOptions {
  const tsConfigPath = info.project.getProjectName();
  // MEMO: `info.project.getCompilationSettings` is the alias of `info.project.getCompilerOptions`.
  // ref: https://github.com/microsoft/TypeScript/issues/19218
  const allowArbitraryExtensions =
    info.project.getCompilationSettings().allowArbitraryExtensions ?? DEFAULT_ALLOW_ARBITRARY_EXTENSIONS;

  const projectRoot = path.dirname(tsConfigPath);
  const assetPluginConfig = info.config as RawAssetPluginOptions; // TODO: validate

  return {
    tsConfigPath,
    allowArbitraryExtensions,
    include: assetPluginConfig.include.map((inc) => path.resolve(projectRoot, inc)),
    exclude: (assetPluginConfig.exclude ?? DEFAULT_EXCLUDE).map((exc) => path.resolve(projectRoot, exc)),
    extensions: assetPluginConfig.extensions,
    exportedNameCase: assetPluginConfig.exportedNameCase,
    exportedNamePrefix: assetPluginConfig.exportedNamePrefix,
  };
}
