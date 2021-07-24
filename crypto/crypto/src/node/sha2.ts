import { nodeSha256, nodeSha512, nodeRipemd160 } from "../lib/node";

export async function sha256(msg: Uint8Array): Promise<Uint8Array> {
  const result = nodeSha256(msg);
  return result;
}

export async function sha512(msg: Uint8Array): Promise<Uint8Array> {
  const result = nodeSha512(msg);
  return result;
}

export async function ripemd160(msg: Uint8Array): Promise<Uint8Array> {
  const result = nodeRipemd160(msg);

  return result;
}
