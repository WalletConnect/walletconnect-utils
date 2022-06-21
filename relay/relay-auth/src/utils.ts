import { concat } from "uint8arrays/concat";
import { toString } from "uint8arrays/to-string";
import { fromString } from "uint8arrays/from-string";
import { safeJsonParse, safeJsonStringify } from "@walletconnect/safe-json";

import {
  DATA_ENCODING,
  DID_DELIMITER,
  DID_METHOD,
  DID_PREFIX,
  JSON_ENCODING,
  JWT_DELIMITER,
  JWT_ENCODING,
  MULTICODEC_ED25519_BASE,
  MULTICODEC_ED25519_ENCODING,
  MULTICODEC_ED25519_HEADER,
  MULTICODEC_ED25519_LENGTH,
} from "./constants";
import { IridiumJWTData, IridiumJWTSigned } from "./types";

// ---------- JSON ----------------------------------------------- //

export function decodeJSON(str: string): any {
  return safeJsonParse(toString(fromString(str, JWT_ENCODING), JSON_ENCODING));
}

export function encodeJSON(val: any): string {
  return toString(
    fromString(safeJsonStringify(val), JSON_ENCODING),
    JWT_ENCODING
  );
}

// ---------- Issuer ----------------------------------------------- //

export function encodeIss(publicKey: Uint8Array): string {
  const header = fromString(
    MULTICODEC_ED25519_HEADER,
    MULTICODEC_ED25519_ENCODING
  );
  const multicodec =
    MULTICODEC_ED25519_BASE +
    toString(concat([header, publicKey]), MULTICODEC_ED25519_ENCODING);
  return [DID_PREFIX, DID_METHOD, multicodec].join(DID_DELIMITER);
}

export function decodeIss(issuer: string): Uint8Array {
  const [prefix, method, multicodec] = issuer.split(DID_DELIMITER);
  if (prefix !== DID_PREFIX || method !== DID_METHOD) {
    throw new Error(`Issuer must be a DID with method "key"`);
  }
  const base = multicodec.slice(0, 1);
  if (base !== MULTICODEC_ED25519_BASE) {
    throw new Error(`Issuer must be a key in mulicodec format`);
  }
  const bytes = fromString(multicodec.slice(1), MULTICODEC_ED25519_ENCODING);
  const type = toString(bytes.slice(0, 2), MULTICODEC_ED25519_ENCODING);
  if (type !== MULTICODEC_ED25519_HEADER) {
    throw new Error(`Issuer must be a public key with type "Ed25519"`);
  }
  const publicKey = bytes.slice(2);
  if (publicKey.length !== MULTICODEC_ED25519_LENGTH) {
    throw new Error(`Issuer must be a public key with length 32 bytes`);
  }
  return publicKey;
}

// ---------- Signature ----------------------------------------------- //

export function encodeSig(bytes: Uint8Array): string {
  return toString(bytes, JWT_ENCODING);
}

export function decodeSig(encoded: string): Uint8Array {
  return fromString(encoded, JWT_ENCODING);
}

// ---------- Data ----------------------------------------------- //

export function encodeData(params: IridiumJWTData): Uint8Array {
  return fromString(
    [encodeJSON(params.header), encodeJSON(params.payload)].join(JWT_DELIMITER),
    DATA_ENCODING
  );
}

export function decodeData(data: Uint8Array): IridiumJWTData {
  const params = toString(data, DATA_ENCODING).split(JWT_DELIMITER);
  const header = decodeJSON(params[0]);
  const payload = decodeJSON(params[1]);
  return { header, payload };
}

// ---------- JWT ----------------------------------------------- //

export function encodeJWT(params: IridiumJWTSigned): string {
  return [
    encodeJSON(params.header),
    encodeJSON(params.payload),
    encodeSig(params.signature),
  ].join(JWT_DELIMITER);
}

export function decodeJWT(jwt: string): IridiumJWTSigned {
  const params = jwt.split(JWT_DELIMITER);
  const header = decodeJSON(params[0]);
  const payload = decodeJSON(params[1]);
  const signature = decodeSig(params[2]);
  return { header, payload, signature };
}
