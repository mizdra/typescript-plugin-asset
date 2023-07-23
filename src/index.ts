import { createVirtualFiles } from '@volar/language-core';
import { decorateLanguageService, decorateLanguageServiceHost } from '@volar/typescript';
import type * as ts from 'typescript/lib/tsserverlibrary';
import { createAssetLanguage } from './language-service/language.js';
import { AssetLanguageServiceHost, createAssetLanguageServiceHost } from './language-service-host.js';
import { getAssetPluginOptions } from './option.js';

const projectAssetLSHost = new WeakMap<ts.server.Project, AssetLanguageServiceHost>();

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

      projectAssetLSHost.set(info.project, assetTSLSHost);

      decorateLanguageService(virtualFiles, info.languageService, true);
      decorateLanguageServiceHost(virtualFiles, info.languageServiceHost, ts, assetPluginOptions.extensions);

      return info.languageService;
    },
    getExternalFiles(project) {
      return projectAssetLSHost.get(project)?.getAssetFileNames() ?? [];
    },
  };
  return pluginModule;
};

export = init;
