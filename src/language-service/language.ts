import type { LanguagePlugin } from '@volar/language-core';
import path from 'node:path';
import type * as ts from 'typescript/lib/tsserverlibrary';
import { getDtsContent } from '../dts';
import { AssetPluginOptions } from '../option';

export function createAssetLanguage(sys: ts.System, assetPluginOptions: AssetPluginOptions): LanguagePlugin {
  return {
    createVirtualCode(fileId) {
      const fileName = fileId.includes('://') ? fileId.split('://')[1]! : fileId;
      if (isMatchFile(
        fileName,
        assetPluginOptions.extensions,
        assetPluginOptions.exclude,
        assetPluginOptions.include
      )) {
        const dtsContent = getDtsContent(
          fileName,
          assetPluginOptions.exportedNameCase,
          assetPluginOptions.exportedNamePrefix,
        );
        return {
          id: 'main',
          mappings: [],
          embeddedCodes: [],
          languageId: 'typescript',
          snapshot: {
            getText: (start, end) => dtsContent.substring(start, end),
            getLength: () => dtsContent.length,
            getChangeRange: () => undefined,
          },
        }
      }
    },
    updateVirtualCode(_fileId, virtualCode) {
      return virtualCode; // asset file content update does not affect virtual code
    },
    typescript: {
      extraFileExtensions: assetPluginOptions.extensions.map(ext => ({ extension: ext.slice(1), isMixedContent: true, scriptKind: 7 })),
      getScript(virtualCode) {
        return {
          code: virtualCode,
          extension: '.ts',
          scriptKind: 3,
        };
      },
    }
  };

  function isMatchFile(fileName: string, extensions: string[], exclude: string[], include: string[]): boolean {
    if (!extensions.includes(path.extname(fileName))) return false;
    return sys.readDirectory(path.dirname(fileName), extensions, exclude, include, 1).includes(fileName);
  }
}
