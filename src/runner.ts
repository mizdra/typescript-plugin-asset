import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import { type ParseArgvResult } from './cli.js';
import { getDtsContent, getDtsFilePath } from './dts.js';

export type RunnerOptions = ParseArgvResult & {
  cwd?: string | undefined;
};

function canonicalizeOptions(options: RunnerOptions) {
  return {
    patterns: options.patterns,
    exportedNameCase: options.exportedNameCase ?? 'constantCase',
    exportedNamePrefix: options.exportedNamePrefix ?? 'I_',
    arbitraryExtensions: options.arbitraryExtensions ?? false,
    exclude: options.exclude ?? [],
    cwd: options.cwd ?? process.cwd(),
  };
}

export async function run(options: RunnerOptions): Promise<void> {
  const { patterns, exportedNameCase, exportedNamePrefix, arbitraryExtensions, exclude, cwd } =
    canonicalizeOptions(options);

  async function processFile(filePath: string) {
    try {
      const dtsFilePath = getDtsFilePath(filePath, arbitraryExtensions);
      const dtsContent = getDtsContent(filePath, exportedNameCase, exportedNamePrefix);
      await fs.writeFile(dtsFilePath, dtsContent);
    } catch (err) {
      throw new Error(`Failed to process file: ${filePath}`, { cause: err });
    }
  }
  async function processAllFiles(filePaths: string[]) {
    const result = await Promise.allSettled(filePaths.map(processFile));
    const errors: unknown[] = [];
    result.forEach((r) => {
      if (r.status === 'rejected') errors.push(r.reason);
    });
    if (errors.length > 0) {
      throw new AggregateError(errors, 'Failed to process some files');
    }
  }

  const filePaths = (await glob(patterns, { dot: true, cwd, ignore: exclude }))
    // convert relative path to absolute path
    .map((file) => path.resolve(cwd, file));
  if (filePaths.length === 0) {
    throw new Error(`No files found for patterns: ${JSON.stringify(patterns)}`);
  }
  await processAllFiles(filePaths);
}
