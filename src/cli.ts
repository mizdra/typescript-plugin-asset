import util from 'node:util';
import dedent from 'dedent';

const EXPORTED_NAME_CASES = ['constantCase', 'camelCase', 'pascalCase', 'snakeCase'] as const;
export type ExportedNameCase = (typeof EXPORTED_NAME_CASES)[number];

export type ParseArgvResult = {
  patterns: string[];
  exportedNameCase?: ExportedNameCase | undefined;
  exportedNamePrefix?: string | undefined;
  arbitraryExtensions?: boolean | undefined;
  exclude?: string[] | undefined;
  help?: boolean | undefined;
};

function isExportedNameCase(value: unknown): value is ExportedNameCase {
  return typeof value === 'string' && (EXPORTED_NAME_CASES as readonly string[]).includes(value);
}

function showHelp(): void {
  console.log(dedent`
    Generate TypeScript declaration files for assets.

    asset-dts-generator [options] <glob-pattern>...

    Options:
      --help                           Show help.
      --exported-name-case <case>      Case of exported name. One of ${JSON.stringify(EXPORTED_NAME_CASES)}.
      --exported-name-prefix <prefix>  Prefix of exported name. Default is 'I_'.
      --arbitrary-extensions           Generate \`.d.*.ts\` instead of \`.*.d.ts\`. Default is false.
      --exclude <pattern>...           Exclude files matching the given glob patterns.
    
    Examples:
      asset-dts-generator "assets/**/*.{png,svg,jpg,jpeg,gif,webp,avif,ico}"
      asset-dts-generator --exported-name-case camelCase "assets/**/*.{png,svg,jpg,jpeg,gif,webp,avif,ico}"
      asset-dts-generator --exported-name-prefix "IMG_" "assets/**/*.{png,svg,jpg,jpeg,gif,webp,avif,ico}"
      asset-dts-generator --arbitrary-extensions "assets/**/*.{png,svg,jpg,jpeg,gif,webp,avif,ico}"
      asset-dts-generator --exclude "node_modules/**" "**/*.{png,svg,jpg,jpeg,gif,webp,avif,ico}"
  `);
}

export function parseArgv(argv: string[]): ParseArgvResult {
  const { values, positionals } = util.parseArgs({
    args: argv.slice(2),
    options: {
      'exported-name-case': { type: 'string', default: 'constantCase' },
      'exported-name-prefix': { type: 'string', default: 'I_' },
      'arbitrary-extensions': { type: 'boolean', default: false },
      'exclude': { type: 'string', multiple: true },
      'help': { type: 'boolean', short: 'h' },
    },
    allowPositionals: true,
  });

  // Validate parsed result
  if (values['exported-name-case'] !== undefined && !isExportedNameCase(values['exported-name-case'])) {
    console.error(
      `--exported-name-case must be one of \`[${EXPORTED_NAME_CASES.join(', ')}]\`. Got \`${
        values['exported-name-case']
      }\`.`,
    );
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
  if (positionals.length === 0) {
    console.error(`At least one positional argument is required.`);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
  if (values['help']) {
    showHelp();
    // eslint-disable-next-line n/no-process-exit
    process.exit(0);
  }

  return {
    patterns: positionals,
    exportedNameCase: values['exported-name-case'],
    exportedNamePrefix: values['exported-name-prefix'],
    arbitraryExtensions: values['arbitrary-extensions'],
    exclude: values['exclude'],
  };
}
