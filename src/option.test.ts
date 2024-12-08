import { describe, expect, it, test } from 'vitest';
import { assertOptions } from './option.js';

describe('assertOptions', () => {
  const baseOptions = { name: '@mizdra/typescript-plugin-asset', include: ['foo'], extensions: ['.png'] };
  it('do not throw when options is correct', () => {
    expect(() => assertOptions(baseOptions)).not.toThrow();
  });
  test('include', () => {
    const { include, ...baseOptionsWithoutInclude } = baseOptions;
    expect(() => assertOptions(baseOptionsWithoutInclude)).toThrowErrorMatchingInlineSnapshot(
      `[AppOptionValidationError: \`include\` is required.]`,
    );
    expect(() => assertOptions({ ...baseOptions, include: 'foo' })).toThrowErrorMatchingInlineSnapshot(
      `[AppOptionValidationError: \`include\` must be string array.]`,
    );
    expect(() => assertOptions({ ...baseOptions, include: [] })).toThrowErrorMatchingInlineSnapshot(
      `[AppOptionValidationError: \`include\` must not be empty.]`,
    );
  });
  test('exclude', () => {
    expect(() => assertOptions({ ...baseOptions, exclude: 'foo' })).toThrowErrorMatchingInlineSnapshot(
      `[AppOptionValidationError: \`exclude\` must be string array.]`,
    );
    expect(() => assertOptions({ ...baseOptions, exclude: [] })).toThrowErrorMatchingInlineSnapshot(
      `[AppOptionValidationError: \`exclude\` must not be empty.]`,
    );
  });
  test('extensions', () => {
    expect(() => assertOptions({ ...baseOptions, extensions: 'foo' })).toThrowErrorMatchingInlineSnapshot(
      `[AppOptionValidationError: \`extensions\` must be string array.]`,
    );
    expect(() => assertOptions({ ...baseOptions, extensions: [] })).toThrowErrorMatchingInlineSnapshot(
      `[AppOptionValidationError: \`extensions\` must not be empty.]`,
    );
    expect(() => assertOptions({ ...baseOptions, extensions: ['foo'] })).toThrowErrorMatchingInlineSnapshot(
      `[AppOptionValidationError: \`extensions\` must start with '.'.]`,
    );
  });
  test('exportedNameCase', () => {
    expect(() => assertOptions({ ...baseOptions, exportedNameCase: 1 })).toThrowErrorMatchingInlineSnapshot(
      `[AppOptionValidationError: \`exportedNameCase\` must be string.]`,
    );
    expect(() => assertOptions({ ...baseOptions, exportedNameCase: 'foo' })).toThrowErrorMatchingInlineSnapshot(
      `[AppOptionValidationError: \`exportedNameCase\` must be one of constantCase, camelCase, pascalCase, snakeCase]`,
    );
  });
  test('exportedNamePrefix', () => {
    expect(() => assertOptions({ ...baseOptions, exportedNamePrefix: 1 })).toThrowErrorMatchingInlineSnapshot(
      `[AppOptionValidationError: \`exportedNamePrefix\` must be string.]`,
    );
    expect(() => assertOptions({ ...baseOptions, exportedNamePrefix: '1' })).toThrowErrorMatchingInlineSnapshot(
      `[AppOptionValidationError: \`exportedNamePrefix\` must begin with a character that is a valid JavaScript identifier.]`,
    );
  });
});
