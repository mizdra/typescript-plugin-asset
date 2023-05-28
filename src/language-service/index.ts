import * as base from '@volar/typescript';
import { AssetLanguageServiceHost } from '../language-service-host.js';
import { AssetPluginOptions } from '../option.js';
import { createAssetLanguage } from './language.js';

export function createLanguageService(host: AssetLanguageServiceHost, assetPluginOptions: AssetPluginOptions) {
  const languageService = base.createLanguageService(host, [createAssetLanguage(host, assetPluginOptions)]);
  return languageService;
}
