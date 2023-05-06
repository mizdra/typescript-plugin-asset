#!/usr/bin/env node

import { run, parseArgv } from '../dist/index.js';

run({
  ...parseArgv(process.argv),
}).catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  // eslint-disable-next-line n/no-process-exit
  process.exit(1);
});
