import { ed25519 } from "@noble/curves/ed25519";
import { randomBytes } from "@noble/hashes/utils";
import { fromMiliseconds } from "@walletconnect/time";
import { JWT_IRIDIUM_ALG, JWT_IRIDIUM_TYP, KEY_PAIR_SEED_LENGTH } from "./constants";

import { decodeIss, decodeJWT, encodeData, encodeIss, encodeJWT } from "./utils";
import { concat } from "uint8arrays/concat";

export interface Keypair {
  secretKey: Uint8Array;
  publicKey: Uint8Array;
}

export function generateKeyPair(
  seed: Uint8Array = randomBytes(KEY_PAIR_SEED_LENGTH),
): Keypair {
  const publicKey = ed25519.getPublicKey(seed);
  const secretKey = concat([seed, publicKey])
  return {
    secretKey: secretKey,
    publicKey: publicKey
  };
}

export async function signJWT(
  sub: string,
  aud: string,
  ttl: number,
  keyPair: Keypair,
  iat: number = fromMiliseconds(Date.now()),
) {
  const header = { alg: JWT_IRIDIUM_ALG, typ: JWT_IRIDIUM_TYP };
  const iss = encodeIss(keyPair.publicKey);
  const exp = iat + ttl;
  const payload = { iss, sub, aud, iat, exp };
  const data = encodeData({ header, payload });
  const signature = ed25519.sign(data, keyPair.secretKey.slice(0, 32));
  return encodeJWT({ header, payload, signature });
}

export async function verifyJWT(jwt: string) {
  const { header, payload, data, signature } = decodeJWT(jwt);
  if (header.alg !== JWT_IRIDIUM_ALG || header.typ !== JWT_IRIDIUM_TYP) {
    throw new Error("JWT must use EdDSA algorithm");
  }
  const publicKey = decodeIss(payload.iss);
  return ed25519.verify(signature, data, publicKey);
}
