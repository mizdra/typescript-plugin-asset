import { describe, expect, it } from 'vitest';
import { changeCase } from './util.js';

describe('changeCase', () => {
  const testCases = ['foo-bar', 'foo_bar', 'fooBar', 'foo bar', 'foo&bar', '超かっこいい画像Ver2'];
  it('constantCase', () => {
    expect(testCases.map((testCase) => changeCase(testCase, 'constantCase'))).toMatchInlineSnapshot(`
      [
        "FOO_BAR",
        "FOO_BAR",
        "FOO_BAR",
        "FOO_BAR",
        "FOO_BAR",
        "超かっこいい画像VER2",
      ]
    `);
  });
  it('camelCase', () => {
    expect(testCases.map((testCase) => changeCase(testCase, 'camelCase'))).toMatchInlineSnapshot(`
      [
        "fooBar",
        "foo_bar",
        "fooBar",
        "fooBar",
        "fooBar",
        "超かっこいい画像ver2",
      ]
    `);
  });
  it('pascalCase', () => {
    expect(testCases.map((testCase) => changeCase(testCase, 'pascalCase'))).toMatchInlineSnapshot(`
      [
        "FooBar",
        "Foo_bar",
        "FooBar",
        "FooBar",
        "FooBar",
        "超かっこいい画像ver2",
      ]
    `);
  });
  it('snakeCase', () => {
    expect(testCases.map((testCase) => changeCase(testCase, 'snakeCase'))).toMatchInlineSnapshot(`
      [
        "foo_bar",
        "foo_bar",
        "foo_bar",
        "foo_bar",
        "foo_bar",
        "超かっこいい画像ver2",
      ]
    `);
  });
});
