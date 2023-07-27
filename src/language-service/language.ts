import { VirtualFile, FileKind, FileCapabilities } from '@volar/language-core';
import { Stack } from '@volar/source-map';
import type * as ts from 'typescript/lib/tsserverlibrary';
import { getDtsContent, getDtsFilePath } from '../dts';
import { AssetLanguageServiceHost } from '../language-service-host.js';
import { AssetPluginOptions } from '../option';

export class AssetFile implements VirtualFile {
  kind = FileKind.TypeScriptHostFile;
  capabilities = FileCapabilities.full;
  codegenStacks: Stack[] = []; // TODO: what is this?
  fileName!: string;
  mappings: VirtualFile['mappings'] = [];
  embeddedFiles: VirtualFile['embeddedFiles'] = [];

  constructor(
    public sourceFileName: string,
    public snapshot: ts.IScriptSnapshot,
    public host: AssetLanguageServiceHost,
    public assetPluginOptions: AssetPluginOptions,
  ) {
    this.fileName = getDtsFilePath(this.sourceFileName, this.assetPluginOptions.allowArbitraryExtensions);
    this.update(snapshot);
  }

  public update(newSnapshot: ts.IScriptSnapshot) {
    this.snapshot = newSnapshot;
    const suggestionRule = this.host.getMatchedSuggestionRule(this.sourceFileName);
    if (suggestionRule === undefined) return;

    const dtsContent = getDtsContent(
      this.sourceFileName,
      suggestionRule.exportedNameCase,
      suggestionRule.exportedNamePrefix,
    );
    this.snapshot = {
      getText: (start, end) => dtsContent.substring(start, end),
      getLength: () => dtsContent.length,
      getChangeRange: () => undefined, // TODO: what is this?
    };
  }
}

export function createAssetLanguage(host: AssetLanguageServiceHost, assetPluginOptions: AssetPluginOptions) {
  return {
    createVirtualFile(fileName: string, snapshot: ts.IScriptSnapshot) {
      if (host.isAssetFile(fileName)) {
        return new AssetFile(fileName, snapshot, host, assetPluginOptions);
      }
      return undefined;
    },
    updateVirtualFile(assetFile: AssetFile, snapshot: ts.IScriptSnapshot) {
      assetFile.update(snapshot);
    },
  };
}
