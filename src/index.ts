import type * as ts from 'typescript/lib/tsserverlibrary';
import { createLanguageService } from './language-service/index.js';
import { createAssetLanguageServiceHost } from './language-service-host.js';
import { getAssetPluginOptions } from './option.js';

const init: ts.server.PluginModuleFactory = (modules) => {
  const { typescript: ts } = modules;
  const pluginModule: ts.server.PluginModule = {
    create(info) {
      const assetPluginOptions = getAssetPluginOptions(info);

      if (!info.project.fileExists(assetPluginOptions.tsConfigPath)) {
        // project name not a tsconfig path, this is a inferred project
        return info.languageService;
      }

      info.project.projectService.logger.info(`@init: ${JSON.stringify({ assetPluginOptions }, null, 2)}`);

      const assetTSLSHost = createAssetLanguageServiceHost(ts.sys, info, assetPluginOptions);
      const assetLS = createLanguageService(assetTSLSHost, assetPluginOptions);

      return new Proxy(info.languageService, {
        get: (target: ts.LanguageService, property: keyof ts.LanguageService) => {
          if (
            property === 'getSemanticDiagnostics' ||
            property === 'getEncodedSemanticClassifications' ||
            property === 'getCompletionsAtPosition' ||
            property === 'getCompletionEntryDetails' ||
            property === 'getCompletionEntrySymbol' ||
            property === 'getQuickInfoAtPosition' ||
            property === 'getSignatureHelpItems' ||
            property === 'getRenameInfo' ||
            property === 'findRenameLocations' ||
            property === 'getDefinitionAtPosition' ||
            property === 'getDefinitionAndBoundSpan' ||
            property === 'getTypeDefinitionAtPosition' ||
            property === 'getImplementationAtPosition' ||
            property === 'getReferencesAtPosition' ||
            property === 'findReferences'
          ) {
            return assetLS[property];
          }
          return target[property];
        },
      });
    },
    // MEMO: `getExternalFiles` is not required in modern times.
    // ref: https://github.com/angular/vscode-ng-language-service/issues/473
    // getExternalFiles(project) {
    //   return assetFileNames ?? [];
    // },
  };
  return pluginModule;
};

export = init;
