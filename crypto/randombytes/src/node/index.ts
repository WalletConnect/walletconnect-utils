import { randomBytes as rb } from "@noble/hashes/utils";

export function randomBytes(length: number): Uint8Array {
  return rb(length);
}
