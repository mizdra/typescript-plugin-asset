import { randomInt } from 'node:crypto';

export function arrayElement<T>(array: readonly T[]): T {
  const index = randomInt(0, array.length);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return array[index]!;
}
