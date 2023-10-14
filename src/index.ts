import { createVirtualFiles } from '@volar/language-core';
import { decorateLanguageService, decorateLanguageServiceHost, searchExternalFiles } from '@volar/typescript';
import type * as ts from 'typescript/lib/tsserverlibrary';
import { createAssetLanguage } from './language-service/language.js';
import { createAssetLanguageServiceHost } from './language-service-host.js';
import { AssetPluginOptions, getAssetPluginOptions } from './option.js';

const externalFileCacheMap = new WeakMap<ts.server.Project, { options: AssetPluginOptions; externalFiles: string[] }>();

const init: ts.server.PluginModuleFactory = (modules) => {
  const { typescript: ts } = modules;
  const pluginModule: ts.server.PluginModule = {
    create(info) {
      const assetPluginOptions = getAssetPluginOptions(info);

      if (!info.project.fileExists(assetPluginOptions.tsConfigPath)) {
        // project name not a tsconfig path, this is a inferred project
        return info.languageService;
      }

      const assetTSLSHost = createAssetLanguageServiceHost(ts.sys, info, assetPluginOptions);
      const assetLanguage = createAssetLanguage(assetTSLSHost, assetPluginOptions);
      const virtualFiles = createVirtualFiles([assetLanguage]);

      externalFileCacheMap.set(info.project, {
        options: assetPluginOptions,
        externalFiles: searchExternalFiles(ts, info.project, assetPluginOptions.extensions),
      });

      decorateLanguageService(virtualFiles, info.languageService, true);
      decorateLanguageServiceHost(virtualFiles, info.languageServiceHost, ts, assetPluginOptions.extensions);

      return info.languageService;
    },
    getExternalFiles(project, updateLevel = -1) {
      if (
        // @ts-expect-error wait for TS 5.3
        (updateLevel >= 1) satisfies ts.ProgramUpdateLevel.RootNamesAndUpdate
      ) {
        const cache = externalFileCacheMap.get(project);
        if (!cache) throw new Error('The project cache not found');

        const { options, externalFiles: oldFiles } = cache;
        const newFiles = searchExternalFiles(ts, project, options.extensions);
        externalFileCacheMap.set(project, { options, externalFiles: newFiles });
        refreshDiagnosticsIfNeeded(project, oldFiles, newFiles);
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return externalFileCacheMap.get(project)!.externalFiles;
    },
  };
  return pluginModule;
};

// ref: https://github.com/vuejs/language-tools/blob/ab7903ca7b59338fa9a36aba54bbcf181ebb22d2/packages/typescript-vue-plugin/src/index.ts#L56
function refreshDiagnosticsIfNeeded(
  project: ts.server.Project,
  oldExternalFiles: string[],
  newExternalFiles: string[],
) {
  let dirty = oldExternalFiles.length !== newExternalFiles.length;
  if (!dirty) {
    const set = new Set(oldExternalFiles);
    for (const file of newExternalFiles) {
      if (!set.has(file)) {
        dirty = true;
        break;
      }
    }
  }
  if (dirty) {
    project.refreshDiagnostics();
  }
}

export = init;
