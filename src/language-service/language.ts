import path from 'node:path';
import type { LanguagePlugin } from '@volar/language-core';
import type {} from '@volar/typescript';
import ts from 'typescript/lib/tsserverlibrary';
import { getDtsContent } from '../dts';
import type { AssetPluginOptions } from '../option';

export function createAssetLanguagePlugin(
  sys: ts.System,
  assetPluginOptions: AssetPluginOptions,
): LanguagePlugin<string> {
  return {
    getLanguageId(scriptId) {
      if (isMatchFile(scriptId)) return 'asset';
      return undefined;
    },
    createVirtualCode(scriptId, languageId) {
      if (languageId !== 'asset') return undefined;
      const dtsContent = getDtsContent(
        scriptId,
        assetPluginOptions.exportedNameCase,
        assetPluginOptions.exportedNamePrefix,
      );
      return {
        id: 'main',
        languageId: 'asset',
        snapshot: {
          getText: (start, end) => dtsContent.substring(start, end),
          getLength: () => dtsContent.length,
          getChangeRange: () => undefined,
        },
        mappings: [],
      };
    },
    typescript: {
      extraFileExtensions: assetPluginOptions.extensions.map((ext) => {
        return {
          extension: ext.slice(1),
          isMixedContent: true,
          scriptKind: ts.ScriptKind.TS,
        };
      }),
      getServiceScript(root) {
        return {
          code: root,
          extension: ts.Extension.Ts,
          scriptKind: ts.ScriptKind.TS,
        };
      },
    },
  };

  function isMatchFile(fileName: string): boolean {
    if (!assetPluginOptions.extensions.includes(path.extname(fileName))) return false;
    return sys
      .readDirectory(
        path.dirname(fileName),
        assetPluginOptions.extensions,
        assetPluginOptions.exclude,
        assetPluginOptions.include,
        1,
      )
      .includes(fileName);
  }
}
