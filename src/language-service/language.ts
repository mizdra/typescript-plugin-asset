import { VirtualFile, FileKind, FileCapabilities, FileRangeCapabilities } from '@volar/language-core';
import { Stack } from '@volar/source-map';
import type * as ts from 'typescript/lib/tsserverlibrary';
import { getDtsContent, getDtsFilePath } from '../dts';
import { DEFAULT_EXPORTED_NAME_CASE, DEFAULT_EXPORTED_NAME_PREFIX } from '../option';
import { AssetPluginOptions } from '../option.js';
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
    public assetPluginOptions: AssetPluginOptions,
  ) {
    this.fileName = sourceFileName;
    this.onSnapshotUpdated();
  }

  public update(newSnapshot: ts.IScriptSnapshot) {
    this.snapshot = newSnapshot;
    this.onSnapshotUpdated();
  }

  onSnapshotUpdated() {
    this.mappings = [
      {
        sourceRange: [0, this.snapshot.getLength()],
        generatedRange: [0, this.snapshot.getLength()],
        data: FileRangeCapabilities.full,
      },
    ];
    const dtsContent = getDtsContent(
      this.sourceFileName,
      this.assetPluginOptions.exportedNameCase ?? DEFAULT_EXPORTED_NAME_CASE,
      this.assetPluginOptions.exportedNamePrefix ?? DEFAULT_EXPORTED_NAME_PREFIX,
    );
    this.embeddedFiles = [
      {
        fileName: getDtsFilePath(this.sourceFileName, false), // TODO: support arbitraryExtensions
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

export function createAssetLanguage(assetPluginOptions: AssetPluginOptions) {
  return {
    createVirtualFile(fileName: string, snapshot: ts.IScriptSnapshot) {
      if (isAssetFile(fileName, assetPluginOptions)) {
        return new AssetFile(fileName, snapshot, assetPluginOptions);
      }
      return undefined;
    },
    updateVirtualFile(assetFile: AssetFile, snapshot: ts.IScriptSnapshot) {
      assetFile.update(snapshot);
    },
  };
}
