import _randomBytes from 'randombytes';

export function randomBytes(length: number): Uint8Array {
  return _randomBytes(length);
}
