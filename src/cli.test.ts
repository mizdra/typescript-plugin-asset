import { describe, it, expect } from 'vitest';
import { EXPORTED_NAME_CASES, parseArgv } from './cli.js';
import { arrayElement } from './test/random.js';

function fakeArgv(...args: string[]) {
  return ['node', 'asset-dts-generator.js', ...args];
}

// TODO: Add test for anomaly systems

describe('parseArgv', () => {
  it('patterns', () => {
    expect(parseArgv(fakeArgv('assets/**/*.png')).patterns).toStrictEqual(['assets/**/*.png']);
    expect(parseArgv(fakeArgv('assets/**/*.png', 'assets/**/*.gif')).patterns).toStrictEqual([
      'assets/**/*.png',
      'assets/**/*.gif',
    ]);
  });
  it('--exported-name-case', () => {
    const exportedNameCase = arrayElement(EXPORTED_NAME_CASES);
    expect(parseArgv(fakeArgv('pattern')).exportedNameCase).toBe('constantCase');
    expect(parseArgv(fakeArgv('--exported-name-case', exportedNameCase, 'pattern')).exportedNameCase).toBe(
      exportedNameCase,
    );
  });
  it('--exported-name-prefix', () => {
    expect(parseArgv(fakeArgv('pattern')).exportedNamePrefix).toBe('I_');
    expect(parseArgv(fakeArgv('--exported-name-prefix', 'i ', 'pattern')).exportedNamePrefix).toBe('i ');
  });
  it('--arbitrary-extensions', () => {
    expect(parseArgv(fakeArgv('pattern')).arbitraryExtensions).toBe(false);
    expect(parseArgv(fakeArgv('--arbitrary-extensions', 'pattern')).arbitraryExtensions).toBe(true);
    // TODO: Support `--arbitrary-extensions=false`
    // expect(parseArgv(fakeArgv('--arbitrary-extensions=false', 'pattern')).arbitraryExtensions).toBe(false);
  });
  it('--exclude', () => {
    expect(parseArgv(fakeArgv('pattern')).exclude).toBe(undefined);
    expect(parseArgv(fakeArgv('--exclude', 'exclude-pattern', 'pattern')).exclude).toStrictEqual(['exclude-pattern']);
    expect(
      parseArgv(fakeArgv('--exclude', 'exclude-pattern1', '--exclude', 'exclude-pattern2', 'pattern')).exclude,
    ).toStrictEqual(['exclude-pattern1', 'exclude-pattern2']);
  });
  // TODO: Add test for `--help`
});
