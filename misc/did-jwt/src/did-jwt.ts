import * as ed25519 from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import { decode, encode } from "@stablelib/hex";
import bs58 from "bs58";
import { base58btc } from "multiformats/bases/base58";
import {
  DAY_IN_MS,
  DID_DELIMITER,
  DID_METHOD_KEY,
  DID_METHOD_PKH,
  DID_PREFIX,
  JWT_DELIMITER,
  MULTICODEC_ED25519_HEADER,
  MULTICODEC_X25519_HEADER,
} from "./constants";
import { concatUInt8Arrays, makeBase64UrlSafe, objectToHex } from "./helpers";
import { JwtHeader, JwtPayload } from "./types";

ed25519.etc.sha512Sync = (...m) => sha512(ed25519.etc.concatBytes(...m));
export const composeDidPkh = (accountId: string) => {
  return `${DID_PREFIX}${DID_DELIMITER}${DID_METHOD_PKH}${DID_DELIMITER}${accountId}`;
};

export const jwtExp = (issuedAt: number) => {
  return issuedAt + DAY_IN_MS;
};

export const encodeJwt = (header: JwtHeader, payload: JwtPayload, signature: Uint8Array) => {
  const encodedSignature = makeBase64UrlSafe(Buffer.from(signature).toString("base64"));

  return `${objectToHex(header)}${JWT_DELIMITER}${objectToHex(
    payload,
  )}${JWT_DELIMITER}${encodedSignature}`;
};

export const encodeData = (header: JwtHeader, payload: JwtPayload) => {
  const headerByteArray = objectToHex(header);
  const payloadByteArray = objectToHex(payload);
  return `${headerByteArray}${JWT_DELIMITER}${payloadByteArray}`;
};

export const encodeEd25519Key = (keyHex: string) => {
  const header = bs58.decode(MULTICODEC_ED25519_HEADER);

  const publicKey = decode(keyHex);

  const multicodec = base58btc.encode(concatUInt8Arrays(header, publicKey));

  return `${DID_PREFIX}${DID_DELIMITER}${DID_METHOD_KEY}${DID_DELIMITER}${multicodec}`;
};

export const decodeEd25519Key = (encoded: string) => {
  const encodedSegment = encoded.split(DID_DELIMITER).pop() ?? "";
  const keyHex = encode(base58btc.decode(encodedSegment));

  if (!keyHex.startsWith("ed01")) throw Error("Invalid Ed25519 key");
  const publicKey = decode(keyHex.substring(4));
  return publicKey;
};

export const encodeX25519Key = (keyHex: string) => {
  const header = bs58.decode(MULTICODEC_X25519_HEADER);

  const publicKey = decode(keyHex);

  const multicodec = base58btc.encode(concatUInt8Arrays(header, publicKey));

  return `${DID_PREFIX}${DID_DELIMITER}${DID_METHOD_KEY}${DID_DELIMITER}${multicodec}`;
};

export const decodeX25519Key = (encoded: string) => {
  const encodedSegment = encoded.split(DID_DELIMITER).pop() ?? "";
  const keyHex = encode(base58btc.decode(encodedSegment));
  if (!keyHex.startsWith("ec01")) throw Error("Invalid X25519 key");
  const publicKey = decode(keyHex.substring(4));
  return publicKey;
};

export const generateJWT = async (identityKeyPair: [string, string], payload: JwtPayload) => {
  const [, privateKey] = identityKeyPair;

  const header: JwtHeader = {
    alg: "EdDSA",
    typ: "JWT",
  };

  console.log("Formatting data");
  const data = new TextEncoder().encode(encodeData(header, payload));
  console.log("Data formatted");

  // const signature = sign(decode(privateKey), data);
  const signature = ed25519.sign(encode(data), privateKey);

  return encodeJwt(header, payload, signature);
};
