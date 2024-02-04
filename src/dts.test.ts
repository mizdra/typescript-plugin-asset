import { expect, it } from 'vitest';
import { getExportedName, getDtsContent } from './dts.js';

it('getExportedName', () => {
  expect(getExportedName('/dir/foo-bar.png', 'constantCase', 'I_')).toBe('I_FOO_BAR');
  expect(getExportedName('/dir/foo-bar.png', 'constantCase', 'i_')).toBe('I_FOO_BAR');
  expect(getExportedName('/dir/foo-bar.png', 'camelCase', 'i ')).toBe('iFooBar');
});

it('getDtsContent', () => {
  expect(getDtsContent('/dir/foo-bar.png', 'constantCase', 'I_')).toMatchInlineSnapshot(`
    "import I_FOO_BAR from './__ORIGINAL_TYPE__foo-bar.png';
    export default I_FOO_BAR;
    "
  `);
  expect(getDtsContent('/dir/foo-bar.png', 'camelCase', 'i ')).toMatchInlineSnapshot(`
    "import iFooBar from './__ORIGINAL_TYPE__foo-bar.png';
    export default iFooBar;
    "
  `);
});
