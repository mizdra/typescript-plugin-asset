import path from 'node:path';
import { LanguageServiceHost } from '@volar/language-core';
import type * as ts from 'typescript/lib/tsserverlibrary';
import { AssetPluginOptions, SuggestionRule } from './option';

export type AssetLanguageServiceHost = LanguageServiceHost & {
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
    getNewLine: () => info.project.getNewLine(),
    useCaseSensitiveFileNames: () => info.project.useCaseSensitiveFileNames(),
    readFile: (path) => info.project.readFile(path),
    writeFile: (path, content) => info.project.writeFile(path, content),
    fileExists: (path) => info.project.fileExists(path),
    directoryExists: (path) => info.project.directoryExists(path),
    getDirectories: (path) => info.project.getDirectories(path),
    readDirectory: (path, extensions, exclude, include, depth) =>
      info.project.readDirectory(path, extensions, exclude, include, depth),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    realpath: info.project.realpath ? (path) => info.project.realpath!(path) : undefined,
    getCompilationSettings: () => info.project.getCompilationSettings(),
    getCurrentDirectory: () => info.project.getCurrentDirectory(),
    getDefaultLibFileName: () => info.project.getDefaultLibFileName(),
    getProjectVersion: () => info.project.getProjectVersion(),
    getProjectReferences: () => info.project.getProjectReferences(),
    getScriptFileNames: () => {
      return [...info.project.getScriptFileNames(), ...assetFileNameAndRule.keys()];
    },
    getScriptVersion: (fileName) => info.project.getScriptVersion(fileName),
    getScriptSnapshot: (fileName) => info.project.getScriptSnapshot(fileName),
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
