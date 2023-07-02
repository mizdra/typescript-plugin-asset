# @mizdra/typescript-plugin-asset

The tool to generate completion-friendly image `.d.ts` files.

## Install

```console
$ npm install -D @mizdra/typescript-plugin-asset
```

## Usage

```console
$ asset-dts-generator --help
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
```

## Node.js API

See [src/index.ts](https://github.com/mizdra/asset-dts-generator/blob/main/src/index.ts) for available API.

```ts
#!/usr/bin/env ts-node
// scripts/asset-dts-generator.ts

import { run, parseArgv } from '@mizdra/typescript-plugin-asset';
await run({
  patterns: ['assets/**/*.{png,jpg,jpeg,gif,svg}'],
  exportedNameCase: 'constantCase',
  exportedNamePrefix: 'I_',
  // You may also inherit CLI options from `process.argv`.
  // ...parseArgv(process.argv),
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
```
