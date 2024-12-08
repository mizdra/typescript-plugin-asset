import { createLanguageServicePlugin } from '@volar/typescript/lib/quickstart/createLanguageServicePlugin.js';
import { createAssetLanguagePlugin } from './language-plugin.js';
import { getAssetPluginOptions } from './option.js';

export = createLanguageServicePlugin((ts, info) => {
  const assetPluginOptions = getAssetPluginOptions(info);

  if (!info.project.fileExists(assetPluginOptions.tsConfigPath)) {
    // project name not a tsconfig path, this is a inferred project
    return { languagePlugins: [] };
  }

  return { languagePlugins: [createAssetLanguagePlugin(ts.sys, assetPluginOptions)] };
});
