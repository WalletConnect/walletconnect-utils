import { IridiumJWTHeader } from "./types";

// ---------- JWT ----------------------------------------------- //

export const JWT_IRIDIUM_ALG: IridiumJWTHeader["alg"] = "EdDSA";

export const JWT_IRIDIUM_TYP: IridiumJWTHeader["typ"] = "JWT";

export const JWT_DELIMITER = ".";

export const JWT_ENCODING = "base64url";

export const JSON_ENCODING = "utf8";

export const DATA_ENCODING = "utf8";

// ---------- DID ----------------------------------------------- //

export const DID_DELIMITER = ":";

export const DID_PREFIX = "did";

export const DID_METHOD = "key";

// ---------- Multicodec ----------------------------------------------- //

export const MULTICODEC_ED25519_ENCODING = "base58btc";

export const MULTICODEC_ED25519_BASE = "z";

export const MULTICODEC_ED25519_HEADER = "K36";

export const MULTICODEC_ED25519_LENGTH = 32;

// ---------- KeyPair ----------------------------------------------- //

export const KEY_PAIR_SEED_LENGTH = 32;
