import { LanguageServiceHost } from '@volar/language-core';
import type * as ts from 'typescript/lib/tsserverlibrary';
import { createLanguageService } from './language-service/index.js';
import { getParsedAssetPluginOptions } from './option.js';
import { getAssetFileNames } from './util';

const init: ts.server.PluginModuleFactory = (modules) => {
  const { typescript: ts } = modules;
  const externalFiles = new Map<ts.server.Project, string[]>();
  const pluginModule: ts.server.PluginModule = {
    create(info) {
      // @ts-expect-error
      globalThis.info = info;
      const assetPluginOptions = getParsedAssetPluginOptions(info);

      if (!info.project.fileExists(assetPluginOptions.tsConfigPath)) {
        // project name not a tsconfig path, this is a inferred project
        return info.languageService;
      }

      const assetFileNames = getAssetFileNames(ts.sys, assetPluginOptions);

      info.project.projectService.logger.info(
        `@init: ${JSON.stringify({ assetPluginOptions, assetsFileNames: assetFileNames }, null, 2)}`,
      );

      // TODO: Can you cover cases where asset files are added later?
      if (!assetFileNames.length) {
        return info.languageService;
      }

      externalFiles.set(info.project, assetFileNames);

      // fix: https://github.com/vuejs/language-tools/issues/205
      // if (!(info.project as any).__asset_getScriptKind) {
      //   // eslint-disable-next-line @typescript-eslint/unbound-method
      //   (info.project as any).__asset_getScriptKind = info.project.getScriptKind;
      //   info.project.getScriptKind = (fileName) => {
      //     if (isAssetFile(fileName, assetPluginOptions)) {
      //       return ts.ScriptKind.Deferred;
      //     }
      //     return (info.project as any).__asset_getScriptKind(fileName);
      //   };
      // }

      const assetTSLSHost: LanguageServiceHost = {
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
        getScriptFileNames: () => [...info.project.getScriptFileNames(), ...assetFileNames],
        getScriptVersion: (fileName) => info.project.getScriptVersion(fileName),
        getScriptSnapshot: (fileName) => info.project.getScriptSnapshot(fileName),
      };
      const assetLS = createLanguageService(ts.sys, assetTSLSHost, assetPluginOptions);

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
    getExternalFiles(project) {
      return externalFiles.get(project) ?? [];
    },
  };
  return pluginModule;
};

export = init;
