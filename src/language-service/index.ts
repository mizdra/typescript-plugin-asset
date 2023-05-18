import { LanguageServiceHost } from '@volar/language-core';
import * as base from '@volar/typescript';
import type * as ts from 'typescript/lib/tsserverlibrary';
import { ParsedAssetPluginOptions } from '../option.js';
import { createAssetLanguage } from './language.js';

export function createLanguageService(
  sys: ts.System,
  host: LanguageServiceHost,
  assetPluginOptions: ParsedAssetPluginOptions,
) {
  const languageService = base.createLanguageService(host, [createAssetLanguage(sys, assetPluginOptions)]);
  return languageService;
}
