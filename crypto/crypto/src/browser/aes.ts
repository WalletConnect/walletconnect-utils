import { browserAesDecrypt, browserAesEncrypt } from "../lib/browser";

export function aesCbcEncrypt(
  iv: Uint8Array,
  key: Uint8Array,
  data: Uint8Array
): Promise<Uint8Array> {
  return browserAesEncrypt(iv, key, data);
}

export function aesCbcDecrypt(
  iv: Uint8Array,
  key: Uint8Array,
  data: Uint8Array
): Promise<Uint8Array> {
  return browserAesDecrypt(iv, key, data);
}
