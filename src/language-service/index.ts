import * as base from '@volar/typescript';
import { AssetPluginOptions } from '../option.js';
import { AssetLanguageServiceHost } from './host.js';
import { createAssetLanguage } from './language.js';

export function createLanguageService(host: AssetLanguageServiceHost, assetPluginOptions: AssetPluginOptions) {
  const languageService = base.createLanguageService(host, [createAssetLanguage(host, assetPluginOptions)]);
  return languageService;
}
