import path from 'node:path';
import { createVirtualFiles } from '@volar/language-core';
import { decorateLanguageServiceHost as _decorateLanguageServiceHost } from '@volar/typescript';
import type * as ts from 'typescript/lib/tsserverlibrary';
import { AssetPluginOptions, SuggestionRule } from './option';

export type AssetLanguageServiceHost = {
  getAssetFileNames(): string[];
  isAssetFile(filePath: string): boolean;
  getMatchedSuggestionRule(assetFilePath: string): SuggestionRule | undefined;
};

export function createAssetLanguageServiceHost(
  sys: ts.System,
  info: ts.server.PluginCreateInfo,
  assetPluginOptions: AssetPluginOptions,
): AssetLanguageServiceHost {
  if (sys.watchDirectory === undefined) throw new Error('sys.watchDirectory is undefined');

  const projectRoot = path.dirname(assetPluginOptions.tsConfigPath);

  function isMatchFile(fileName: string, extensions: string[], exclude: string[], include: string[]): boolean {
    if (!extensions.includes(path.extname(fileName))) return false;
    return sys.readDirectory(path.dirname(fileName), extensions, exclude, include, 1).includes(fileName);
  }
  function getAssetFileNameAndRule(): Map<string, SuggestionRule> {
    const assetFileNameAndRule = new Map<string, SuggestionRule>();
    const fileNames = sys.readDirectory(
      path.dirname(assetPluginOptions.tsConfigPath),
      assetPluginOptions.extensions,
      assetPluginOptions.exclude,
      assetPluginOptions.include,
    );
    for (const fileName of fileNames) {
      // TODO: support custom rule
      assetFileNameAndRule.set(fileName, {
        exportedNameCase: assetPluginOptions.exportedNameCase,
        exportedNamePrefix: assetPluginOptions.exportedNamePrefix,
      });
    }
    return assetFileNameAndRule;
  }

  const assetFileNameAndRule = getAssetFileNameAndRule();
  sys.watchDirectory(
    projectRoot,
    (fileName) => {
      if (!isMatchFile(fileName, assetPluginOptions.extensions, assetPluginOptions.exclude, assetPluginOptions.include))
        return;
      if (sys.fileExists(fileName)) {
        // TODO: support custom rule
        assetFileNameAndRule.set(fileName, {
          exportedNameCase: assetPluginOptions.exportedNameCase,
          exportedNamePrefix: assetPluginOptions.exportedNamePrefix,
        });
      } else {
        assetFileNameAndRule.delete(fileName);
      }
      info.project.markAsDirty();
      info.project.updateGraph();
    },
    true,
    { excludeDirectories: assetPluginOptions.exclude },
  );

  return {
    getAssetFileNames() {
      return [...assetFileNameAndRule.keys()];
    },
    isAssetFile(filePath: string) {
      return assetFileNameAndRule.has(filePath);
    },
    getMatchedSuggestionRule(assetFilePath: string) {
      return assetFileNameAndRule.get(assetFilePath);
    },
  };
}

// eslint-disable-next-line max-params
export function decorateLanguageServiceHost(
  assetLanguageServiceHost: AssetLanguageServiceHost,
  project: ts.server.Project,
  virtualFiles: ReturnType<typeof createVirtualFiles>,
  languageServiceHost: ts.LanguageServiceHost,
  ts: typeof import('typescript/lib/tsserverlibrary'),
  extensions: string[],
) {
  _decorateLanguageServiceHost(virtualFiles, languageServiceHost, ts, extensions);

  const getScriptFileNames = project.getScriptFileNames.bind(project);
  languageServiceHost.getScriptFileNames = () => {
    return [...getScriptFileNames(), ...assetLanguageServiceHost.getAssetFileNames()];
  };
}
