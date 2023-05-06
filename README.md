# @mizdra/asset-dts-generator

The tool to generate completion-friendly image `.d.ts` files.

## Usage

```console
$ asset-dts-generator --exported-name-case constantCase --exported-name-prefix I_ "assets/**/*.{png,jpg,jpeg,gif,svg}"
```

## Node.js API

See [src/index.ts](https://github.com/mizdra/asset-dts-generator/blob/main/src/index.ts) for available API.

```ts
#!/usr/bin/env ts-node
// scripts/asset-dts-generator.ts

import { run, parseArgv } from '@mizdra/asset-dts-generator';
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
