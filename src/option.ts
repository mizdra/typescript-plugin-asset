import path from 'node:path';
import type * as ts from 'typescript/lib/tsserverlibrary.js';

export const EXPORTED_NAME_CASES = ['constantCase', 'camelCase', 'pascalCase', 'snakeCase'] as const;
export type ExportedNameCase = (typeof EXPORTED_NAME_CASES)[number];

export type AssetPluginOptions = {
  tsConfigPath: string;
  patterns: string[];
  exportedNameCase?: ExportedNameCase | undefined;
  exportedNamePrefix?: string | undefined;
  arbitraryExtensions?: boolean | undefined; // TODO: read from compilerOptions
  exclude?: string[] | undefined;
};

export const DEFAULT_EXPORTED_NAME_CASE = 'constantCase' as const satisfies AssetPluginOptions['exportedNameCase'];
export const DEFAULT_EXPORTED_NAME_PREFIX = 'I_' as const satisfies AssetPluginOptions['exportedNamePrefix'];

export type ParsedCommandLine = ts.ParsedCommandLine;

function proxyParseConfigHostForExtendConfigPaths(parseConfigHost: ts.ParseConfigHost) {
  const extendConfigPaths: string[] = [];
  const host = new Proxy(parseConfigHost, {
    get(target, key) {
      if (key === 'readFile') {
        return (fileName: string) => {
          if (!fileName.endsWith('/package.json') && !extendConfigPaths.includes(fileName)) {
            extendConfigPaths.push(fileName);
          }
          return target.readFile(fileName);
        };
      }
      return target[key as keyof typeof target];
    },
  });
  return {
    host,
    extendConfigPaths,
  };
}

export function createParsedCommandLine(
  ts: typeof import('typescript/lib/tsserverlibrary.js'),
  parseConfigHost: ts.ParseConfigHost,
  tsConfigPath: string,
  // assetPluginOptions: AssetPluginOptions,
): ParsedCommandLine {
  try {
    const proxyHost = proxyParseConfigHostForExtendConfigPaths(parseConfigHost);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const config = ts.readJsonConfigFile(tsConfigPath, proxyHost.host.readFile);
    ts.parseJsonSourceFileConfigFileContent(config, proxyHost.host, path.dirname(tsConfigPath), {}, tsConfigPath);

    // let vueOptions: Partial<AssetPluginOptions> = {};

    // for (const extendPath of proxyHost.extendConfigPaths.reverse()) {
    //   try {
    //     vueOptions = {
    //       ...vueOptions,
    //     };
    //   } catch (err) {}
    // }

    // const resolvedVueOptions = resolveAssetPluginOptions(vueOptions);
    const extensions = ['.png', '.svg', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.tiff', '.ico']; // TODO: read from config
    const parsed = ts.parseJsonSourceFileConfigFileContent(
      config,
      proxyHost.host,
      path.dirname(tsConfigPath),
      {},
      tsConfigPath,
      undefined,
      extensions.map((extension) => ({
        extension,
        isMixedContent: true,
        scriptKind: ts.ScriptKind.Deferred,
      })),
    );

    // fix https://github.com/vuejs/language-tools/issues/1786
    // https://github.com/microsoft/TypeScript/issues/30457
    // patching ts server broke with outDir + rootDir + composite/incremental
    delete parsed.options['outDir'];

    return {
      ...parsed,
      // vueOptions: resolvedVueOptions,
    };
  } catch (err) {
    console.warn('Failed to resolve tsconfig path:', tsConfigPath, err);
    return {
      fileNames: [],
      options: {},
      // vueOptions: resolveAssetPluginOptions({}),
      errors: [],
    };
  }
}
