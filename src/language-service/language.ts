import { VirtualFile, FileKind, FileCapabilities, FileRangeCapabilities } from '@volar/language-core';
import { Stack } from '@volar/source-map';
import type * as ts from 'typescript/lib/tsserverlibrary';
import { getDtsContent, getDtsFilePath } from '../dts';
import {
  DEFAULT_EXPORTED_NAME_CASE,
  DEFAULT_EXPORTED_NAME_PREFIX,
  ParsedAssetPluginOptions,
  DEFAULT_ALLOW_ARBITRARY_EXTENSIONS,
} from '../option';
import { getMatchedSuggestionRule } from '../util';
import { isAssetFile } from '../util.js';

export class AssetFile implements VirtualFile {
  kind = FileKind.TextFile;
  capabilities = FileCapabilities.full;
  codegenStacks: Stack[] = []; // TODO: what is this?

  fileName!: string;
  mappings!: VirtualFile['mappings'];
  embeddedFiles!: VirtualFile['embeddedFiles'];

  constructor(
    public sourceFileName: string,
    public snapshot: ts.IScriptSnapshot,
    public sys: ts.System,
    public assetPluginOptions: ParsedAssetPluginOptions,
  ) {
    this.fileName = sourceFileName;
    this.onSnapshotUpdated();
  }

  public update(newSnapshot: ts.IScriptSnapshot) {
    this.snapshot = newSnapshot;
    this.onSnapshotUpdated();
  }

  onSnapshotUpdated() {
    const suggestionRule = getMatchedSuggestionRule(this.sourceFileName, this.sys, this.assetPluginOptions);
    if (suggestionRule === undefined) return;

    this.mappings = [
      {
        sourceRange: [0, this.snapshot.getLength()],
        generatedRange: [0, this.snapshot.getLength()],
        data: FileRangeCapabilities.full,
      },
    ];

    const dtsContent = getDtsContent(
      this.sourceFileName,
      suggestionRule.exportedNameCase ?? DEFAULT_EXPORTED_NAME_CASE,
      suggestionRule.exportedNamePrefix ?? DEFAULT_EXPORTED_NAME_PREFIX,
    );
    this.embeddedFiles = [
      {
        fileName: getDtsFilePath(
          this.sourceFileName,
          this.assetPluginOptions.allowArbitraryExtensions ?? DEFAULT_ALLOW_ARBITRARY_EXTENSIONS,
        ),
        kind: FileKind.TypeScriptHostFile,
        snapshot: {
          getText: (start, end) => dtsContent.substring(start, end),
          getLength: () => dtsContent.length,
          getChangeRange: () => undefined, // TODO: what is this?
        },
        mappings: [
          {
            sourceRange: [0, dtsContent.length],
            generatedRange: [0, dtsContent.length],
            data: FileRangeCapabilities.full,
          }, // TODO: what is this?
        ],
        capabilities: FileCapabilities.full,
        embeddedFiles: [],
        codegenStacks: [], // TODO: what is this?
      },
    ];
  }
}

export function createAssetLanguage(sys: ts.System, assetPluginOptions: ParsedAssetPluginOptions) {
  return {
    createVirtualFile(fileName: string, snapshot: ts.IScriptSnapshot) {
      if (isAssetFile(fileName, sys, assetPluginOptions)) {
        return new AssetFile(fileName, snapshot, sys, assetPluginOptions);
      }
      return undefined;
    },
    updateVirtualFile(assetFile: AssetFile, snapshot: ts.IScriptSnapshot) {
      assetFile.update(snapshot);
    },
  };
}
