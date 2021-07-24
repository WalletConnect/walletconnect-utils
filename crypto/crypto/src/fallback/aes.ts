import { fallbackAesEncrypt, fallbackAesDecrypt } from "../lib/fallback";

export async function aesCbcEncrypt(
  iv: Uint8Array,
  key: Uint8Array,
  data: Uint8Array
): Promise<Uint8Array> {
  const result = fallbackAesEncrypt(iv, key, data);
  return result;
}

export async function aesCbcDecrypt(
  iv: Uint8Array,
  key: Uint8Array,
  data: Uint8Array
): Promise<Uint8Array> {
  const result = fallbackAesDecrypt(iv, key, data);
  return result;
}
