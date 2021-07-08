import crypto from 'crypto';
import { bufferToArray } from 'enc-utils';

export function randomBytes(length: number): Uint8Array {
  const buf = crypto.randomBytes(length);
  return bufferToArray(buf);
}
