import type * as ts from 'typescript/lib/tsserverlibrary.js';

export const EXPORTED_NAME_CASES = ['constantCase', 'camelCase', 'pascalCase', 'snakeCase'] as const;
export type ExportedNameCase = (typeof EXPORTED_NAME_CASES)[number];

export type SuggestionRule = {
  extensions: string[];
  exportedNameCase?: ExportedNameCase | undefined;
  exportedNamePrefix?: string | undefined;
};

export type AssetPluginOptions = {
  include: string[];
  exclude?: string[] | undefined;
  rules: SuggestionRule[];
};

export type ParsedAssetPluginOptions = {
  tsConfigPath: string;
  allowArbitraryExtensions?: boolean | undefined;
  include: string[];
  exclude?: string[] | undefined;
  rules: SuggestionRule[];
};

export const DEFAULT_EXPORTED_NAME_CASE = 'constantCase' as const satisfies SuggestionRule['exportedNameCase'];
export const DEFAULT_EXPORTED_NAME_PREFIX = 'I_' as const satisfies SuggestionRule['exportedNamePrefix'];
export const DEFAULT_ALLOW_ARBITRARY_EXTENSIONS =
  false as const satisfies ParsedAssetPluginOptions['allowArbitraryExtensions'];

export function getParsedAssetPluginOptions(info: ts.server.PluginCreateInfo): ParsedAssetPluginOptions {
  const tsConfigPath = info.project.getProjectName();
  // MEMO: `info.project.getCompilationSettings` is the alias of `info.project.getCompilerOptions`.
  // ref: https://github.com/microsoft/TypeScript/issues/19218
  const allowArbitraryExtensions = info.project.getCompilationSettings().allowArbitraryExtensions;

  const assetPluginConfig = info.config as AssetPluginOptions; // TODO: validate

  return {
    tsConfigPath,
    allowArbitraryExtensions,
    include: assetPluginConfig.include,
    exclude: assetPluginConfig.exclude,
    rules: assetPluginConfig.rules,
  };
}
