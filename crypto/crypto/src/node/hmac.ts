import { isConstantTime } from "../helpers";

import { nodeHmacSha256Sign, nodeHmacSha512Sign } from "../lib/node";

export async function hmacSha256Sign(
  key: Uint8Array,
  msg: Uint8Array
): Promise<Uint8Array> {
  const result = nodeHmacSha256Sign(key, msg);
  return result;
}

export async function hmacSha256Verify(
  key: Uint8Array,
  msg: Uint8Array,
  sig: Uint8Array
): Promise<boolean> {
  const expectedSig = nodeHmacSha256Sign(key, msg);
  const result = isConstantTime(expectedSig, sig);
  return result;
}

export async function hmacSha512Sign(
  key: Uint8Array,
  msg: Uint8Array
): Promise<Uint8Array> {
  const result = nodeHmacSha512Sign(key, msg);
  return result;
}

export async function hmacSha512Verify(
  key: Uint8Array,
  msg: Uint8Array,
  sig: Uint8Array
): Promise<boolean> {
  const expectedSig = nodeHmacSha512Sign(key, msg);
  const result = isConstantTime(expectedSig, sig);
  return result;
}
