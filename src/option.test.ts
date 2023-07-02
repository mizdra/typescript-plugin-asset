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
      '"`include` is required."',
    );
    expect(() => assertOptions({ ...baseOptions, include: 'foo' })).toThrowErrorMatchingInlineSnapshot(
      '"`include` must be string array."',
    );
    expect(() => assertOptions({ ...baseOptions, include: [] })).toThrowErrorMatchingInlineSnapshot(
      '"`include` must not be empty."',
    );
  });
  test('exclude', () => {
    expect(() => assertOptions({ ...baseOptions, exclude: 'foo' })).toThrowErrorMatchingInlineSnapshot(
      '"`exclude` must be string array."',
    );
    expect(() => assertOptions({ ...baseOptions, exclude: [] })).toThrowErrorMatchingInlineSnapshot(
      '"`exclude` must not be empty."',
    );
  });
  test('extensions', () => {
    expect(() => assertOptions({ ...baseOptions, extensions: 'foo' })).toThrowErrorMatchingInlineSnapshot(
      '"`extensions` must be string array."',
    );
    expect(() => assertOptions({ ...baseOptions, extensions: [] })).toThrowErrorMatchingInlineSnapshot(
      '"`extensions` must not be empty."',
    );
    expect(() => assertOptions({ ...baseOptions, extensions: ['foo'] })).toThrowErrorMatchingInlineSnapshot(
      '"`extensions` must start with \'.\'."',
    );
  });
  test('exportedNameCase', () => {
    expect(() => assertOptions({ ...baseOptions, exportedNameCase: 1 })).toThrowErrorMatchingInlineSnapshot(
      '"`exportedNameCase` must be string."',
    );
    expect(() => assertOptions({ ...baseOptions, exportedNameCase: 'foo' })).toThrowErrorMatchingInlineSnapshot(
      '"`exportedNameCase` must be one of constantCase, camelCase, pascalCase, snakeCase"',
    );
  });
  test('exportedNamePrefix', () => {
    expect(() => assertOptions({ ...baseOptions, exportedNamePrefix: 1 })).toThrowErrorMatchingInlineSnapshot(
      '"`exportedNamePrefix` must be string."',
    );
    expect(() => assertOptions({ ...baseOptions, exportedNamePrefix: '1' })).toThrowErrorMatchingInlineSnapshot(
      '"`exportedNamePrefix` must begin with a character that is a valid JavaScript identifier."',
    );
  });
});
