import { nodeAesEncrypt, nodeAesDecrypt } from "../lib/node";

export async function aesCbcEncrypt(
  iv: Uint8Array,
  key: Uint8Array,
  data: Uint8Array
): Promise<Uint8Array> {
  const result = nodeAesEncrypt(iv, key, data);
  return result;
}

export async function aesCbcDecrypt(
  iv: Uint8Array,
  key: Uint8Array,
  data: Uint8Array
): Promise<Uint8Array> {
  const result = nodeAesDecrypt(iv, key, data);
  return result;
}
