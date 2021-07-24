import {
  fallbackSha256,
  fallbackSha512,
  fallbackRipemd160,
} from "../lib/fallback";

export async function sha256(msg: Uint8Array): Promise<Uint8Array> {
  const result = fallbackSha256(msg);
  return result;
}

export async function sha512(msg: Uint8Array): Promise<Uint8Array> {
  const result = fallbackSha512(msg);
  return result;
}

export async function ripemd160(msg: Uint8Array): Promise<Uint8Array> {
  const result = fallbackRipemd160(msg);

  return result;
}
