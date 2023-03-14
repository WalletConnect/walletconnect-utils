import { base58btc } from "multiformats/bases/base58";
import bs58 from "bs58";
import * as ed25519 from "@noble/ed25519";
import { JwtHeader, JwtPayload } from "./types";

export const DAY_IN_MS = 86400 * 1000;

export const DID_METHOD_KEY = "key";
export const DID_DELIMITER = ":";
export const DID_PREFIX = "did";
export const DID_METHOD_PKH = "pkh";

export const JWT_DELIMITER = ".";

export const MULTICODEC_ED25519_HEADER = "K36";
export const MULTICODEC_X25519_HEADER = "Jxg";

// Buffer.toString("base64url") isn't supported in every dev environment, eg it
// might work when run in node, but when built in vite and other
// inconsistencies. This just achieves what base64url already does,
// which is base64 encode the buffer, but instead of +, use - and
// instead of / use _ and remove any padding (=).
const makeBase64UrlSafe = (base64EncodedString: string) => {
  return base64EncodedString
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

const concatUInt8Arrays = (array1: Uint8Array, array2: Uint8Array) => {
  const mergedArray = new Uint8Array(array1.length + array2.length);
  mergedArray.set(array1);
  mergedArray.set(array2, array1.length);

  return mergedArray;
};

const isValidObject = (obj: any) =>
  Object.getPrototypeOf(obj) === Object.prototype && Object.keys(obj).length;

const objectToHex = (obj: unknown) => {
  if (!isValidObject(obj)) {
    throw new Error(`Supplied object is not valid ${JSON.stringify(obj)}`);
  }

  return makeBase64UrlSafe(
    Buffer.from(new TextEncoder().encode(JSON.stringify(obj))).toString("base64"),
  );
};

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

  const publicKey = ed25519.utils.hexToBytes(keyHex);

  const multicodec = base58btc.encode(concatUInt8Arrays(header, publicKey));

  return `${DID_PREFIX}${DID_DELIMITER}${DID_METHOD_KEY}${DID_DELIMITER}${multicodec}`;
};

export const decodeEd25519Key = (encoded: string) => {
  const encodedSegment = encoded.split(DID_DELIMITER).pop() ?? "";
  const keyHex = ed25519.utils.bytesToHex(base58btc.decode(encodedSegment));

  if (!keyHex.startsWith("ed01")) throw Error("Invalid Ed25519 key");
  const publicKey = ed25519.utils.hexToBytes(keyHex.substring(4));
  return publicKey;
};

export const encodeX25519Key = (keyHex: string) => {
  const header = bs58.decode(MULTICODEC_X25519_HEADER);

  const publicKey = ed25519.utils.hexToBytes(keyHex);

  const multicodec = base58btc.encode(concatUInt8Arrays(header, publicKey));

  return `${DID_PREFIX}${DID_DELIMITER}${DID_METHOD_KEY}${DID_DELIMITER}${multicodec}`;
};

export const decodeX25519Key = (encoded: string) => {
  const encodedSegment = encoded.split(DID_DELIMITER).pop() ?? "";
  const keyHex = ed25519.utils.bytesToHex(base58btc.decode(encodedSegment));
  if (!keyHex.startsWith("ec01")) throw Error("Invalid X25519 key");
  const publicKey = ed25519.utils.hexToBytes(keyHex.substring(4));
  return publicKey;
};

export const generateJWT = async (identityKeyPair: [string, string], payload: JwtPayload) => {
  const [, privateKey] = identityKeyPair;

  const header: JwtHeader = {
    alg: "EdDSA",
    typ: "JWT",
  };
  const data = new TextEncoder().encode(encodeData(header, payload));

  const signature = await ed25519.sign(data, privateKey);

  return encodeJwt(header, payload, signature);
};
