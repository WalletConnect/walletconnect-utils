import { isConstantTime } from "../helpers";

import {
  fallbackHmacSha256Sign,
  fallbackHmacSha512Sign,
} from "../lib/fallback";

export async function hmacSha256Sign(
  key: Uint8Array,
  msg: Uint8Array
): Promise<Uint8Array> {
  const result = fallbackHmacSha256Sign(key, msg);
  return result;
}

export async function hmacSha256Verify(
  key: Uint8Array,
  msg: Uint8Array,
  sig: Uint8Array
): Promise<boolean> {
  const expectedSig = fallbackHmacSha256Sign(key, msg);
  const result = isConstantTime(expectedSig, sig);
  return result;
}

export async function hmacSha512Sign(
  key: Uint8Array,
  msg: Uint8Array
): Promise<Uint8Array> {
  const result = fallbackHmacSha512Sign(key, msg);
  return result;
}

export async function hmacSha512Verify(
  key: Uint8Array,
  msg: Uint8Array,
  sig: Uint8Array
): Promise<boolean> {
  const expectedSig = fallbackHmacSha512Sign(key, msg);
  const result = isConstantTime(expectedSig, sig);
  return result;
}
