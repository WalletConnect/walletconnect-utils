import { browserSha256, browserSha512 } from "../lib/browser";

export async function sha256(msg: Uint8Array): Promise<Uint8Array> {
  const result = await browserSha256(msg);
  return result;
}

export async function sha512(msg: Uint8Array): Promise<Uint8Array> {
  const result = await browserSha512(msg);
  return result;
}

export async function ripemd160(msg: Uint8Array): Promise<Uint8Array> {
  throw new Error("Not supported for Browser async methods, use sync instead!");
}
