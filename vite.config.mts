import { defineConfig } from 'vitest/config';
import GithubActionsReporter from 'vitest-github-actions-reporter';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  test: {
    reporters: process.env['GITHUB_ACTIONS'] ? ['default', new GithubActionsReporter()] : 'default',
  },
});
