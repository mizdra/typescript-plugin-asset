import path from 'node:path';
import { ExportedNameCase } from './option.js';
import { changeCase } from './util';

export function getExportedName(
  filePath: string,
  exportedNameCase: ExportedNameCase,
  exportedNamePrefix: string,
): string {
  const { name } = path.parse(filePath);
  const exportedName = changeCase(exportedNamePrefix + name, exportedNameCase);
  return exportedName;
}

export function getDtsContent(
  filePath: string,
  exportedNameCase: ExportedNameCase,
  exportedNamePrefix: string,
): string {
  const fileBasename = path.basename(filePath);
  const exportedName = getExportedName(filePath, exportedNameCase, exportedNamePrefix);
  return `${`
import ${exportedName} from './__ORIGINAL_TYPE__${fileBasename}';
export default ${exportedName};
  `.trim()}\n`;
}
