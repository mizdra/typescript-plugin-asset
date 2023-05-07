import { LanguageServiceHost } from '@volar/language-core';
import * as base from '@volar/typescript';
import { AssetPluginOptions } from '../option.js';
import { createAssetLanguage } from './language.js';

export function createLanguageService(host: LanguageServiceHost, assetPluginOptions: AssetPluginOptions) {
  const languageService = base.createLanguageService(host, [createAssetLanguage(assetPluginOptions)]);
  return languageService;
}
