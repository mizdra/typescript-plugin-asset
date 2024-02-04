import path from 'node:path';
import type * as ts from 'typescript/lib/tsserverlibrary';
import { AssetPluginOptions, SuggestionRule } from './option';

export type AssetLanguageServiceHost = {
  isAssetFile(filePath: string): boolean;
  getMatchedSuggestionRule(assetFilePath: string): SuggestionRule | undefined;
};

export function createAssetLanguageServiceHost(
  sys: ts.System,
  info: ts.server.PluginCreateInfo,
  assetPluginOptions: AssetPluginOptions,
): AssetLanguageServiceHost {
  return {
    isAssetFile(filePath: string) {
      return assetPluginOptions.extensions.includes(path.extname(filePath));
    },
    getMatchedSuggestionRule(_assetFilePath: string) {
      // TODO: support custom rule
      return {
        exportedNameCase: assetPluginOptions.exportedNameCase,
        exportedNamePrefix: assetPluginOptions.exportedNamePrefix,
      };
    },
  };
}
