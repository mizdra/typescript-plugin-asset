import { setTimeout } from 'node:timers/promises';
import { add } from './math.js';

export async function run() {
  // NOTE: ここでちょっと待機しておかないと、vscode のデバッグ機能で実行したときに、
  // 後続の行に仕掛けた breakpoint で止まってくれない。おそらく source map の読み込みが
  // 終わる前に、後続の行に到達してしまい、breakpoint が効かなくなっているのだと思う...
  await setTimeout(1000);

  // MEMO: ↓この行に breakpoint を仕掛けて、デバッグ実行してみよう。
  // eslint-disable-next-line no-console
  console.log('hello world', add(1, 2));
}
