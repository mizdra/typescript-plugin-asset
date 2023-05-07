import { LanguageServiceHost } from '@volar/language-core';
import type * as ts from 'typescript/lib/tsserverlibrary';
import { createLanguageService } from './language-service/index.js';
import { AssetPluginOptions, createParsedCommandLine } from './option.js';
import { isAssetFile } from './util';

const init: ts.server.PluginModuleFactory = (modules) => {
  const { typescript: ts } = modules;
  const externalFiles = new Map<ts.server.Project, string[]>();
  const pluginModule: ts.server.PluginModule = {
    create(info) {
      const tsConfigPath = info.project.getProjectName();

      if (!info.project.fileExists(tsConfigPath)) {
        // project name not a tsconfig path, this is a inferred project
        return info.languageService;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const assetPluginOptions = { ...info.config, tsConfigPath } as AssetPluginOptions; // TODO: validate

      const parsed = createParsedCommandLine(ts, ts.sys, tsConfigPath);
      const assetsFileNames = parsed.fileNames.filter((fileName) => isAssetFile(fileName, assetPluginOptions));
      // log
      info.project.projectService.logger.info(
        `@init: ${JSON.stringify(
          {
            projectName: tsConfigPath,
            assetPluginOptions,
            parsed,
            assetsFileNames,
          },
          null,
          2,
        )}`,
      );
      // info.project.projectService.logger.info(`assetFileNames: ${JSON.stringify(assetsFileNames)}}`);
      if (!assetsFileNames.length) {
        // no vue file
        return info.languageService;
      }

      externalFiles.set(info.project, assetsFileNames);

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
        realpath: info.project.realpath ? (path) => info.project.realpath!(path) : undefined,
        getCompilationSettings: () => info.project.getCompilationSettings(),
        getCurrentDirectory: () => info.project.getCurrentDirectory(),
        getDefaultLibFileName: () => info.project.getDefaultLibFileName(),
        getProjectVersion: () => info.project.getProjectVersion(),
        getProjectReferences: () => info.project.getProjectReferences(),
        getScriptFileNames: () => [...info.project.getScriptFileNames(), ...assetsFileNames],
        getScriptVersion: (fileName) => info.project.getScriptVersion(fileName),
        getScriptSnapshot: (fileName) => info.project.getScriptSnapshot(fileName),
      };
      const assetLS = createLanguageService(assetTSLSHost, assetPluginOptions);

      return new Proxy(info.languageService, {
        get: (target: any, property: keyof ts.LanguageService) => {
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
