import * as env from "@walletconnect/environment";
import {
  ENCRYPT_OP,
  DECRYPT_OP,
  SIGN_OP,
  VERIFY_OP,
  AES_BROWSER_ALGO,
  AES_LENGTH,
  HMAC_BROWSER_ALGO,
  HMAC_BROWSER,
  HMAC_LENGTH,
  SHA256_BROWSER_ALGO,
  SHA512_BROWSER_ALGO,
  LENGTH_512,
} from "../constants";

export function getAlgo(type: string): AesKeyAlgorithm | HmacImportParams {
  return type === AES_BROWSER_ALGO
    ? { length: AES_LENGTH, name: AES_BROWSER_ALGO }
    : {
        hash: { name: HMAC_BROWSER_ALGO },
        name: HMAC_BROWSER,
      };
}

export function getOps(type: string): string[] {
  return type === AES_BROWSER_ALGO
    ? [ENCRYPT_OP, DECRYPT_OP]
    : [SIGN_OP, VERIFY_OP];
}

export async function browserExportKey(
  cryptoKey: CryptoKey,
  type: string = AES_BROWSER_ALGO
): Promise<Uint8Array> {
  const subtle = env.getSubtleCrypto();
  return new Uint8Array(await subtle.exportKey("raw", cryptoKey));
}

export async function browserImportKey(
  buffer: Uint8Array,
  type: string = AES_BROWSER_ALGO
): Promise<CryptoKey> {
  return (env.getSubtleCrypto() as any).importKey(
    "raw",
    buffer,
    getAlgo(type),
    true,
    getOps(type)
  );
}

export async function browserAesEncrypt(
  iv: Uint8Array,
  key: Uint8Array,
  data: Uint8Array
): Promise<Uint8Array> {
  const subtle = env.getSubtleCrypto();
  const cryptoKey = await browserImportKey(key, AES_BROWSER_ALGO);
  const result = await subtle.encrypt(
    {
      iv,
      name: AES_BROWSER_ALGO,
    },
    cryptoKey,
    data
  );
  return new Uint8Array(result);
}

export async function browserAesDecrypt(
  iv: Uint8Array,
  key: Uint8Array,
  data: Uint8Array
): Promise<Uint8Array> {
  const subtle = env.getSubtleCrypto();
  const cryptoKey = await browserImportKey(key, AES_BROWSER_ALGO);
  const result = await subtle.decrypt(
    {
      iv,
      name: AES_BROWSER_ALGO,
    },
    cryptoKey,
    data
  );
  return new Uint8Array(result);
}

export async function browserHmacSha256Sign(
  key: Uint8Array,
  data: Uint8Array
): Promise<Uint8Array> {
  const subtle = env.getSubtleCrypto();
  const cryptoKey = await browserImportKey(key, HMAC_BROWSER);
  const signature = await subtle.sign(
    {
      length: HMAC_LENGTH,
      name: HMAC_BROWSER,
    },
    cryptoKey,
    data
  );
  return new Uint8Array(signature);
}

export async function browserHmacSha512Sign(
  key: Uint8Array,
  data: Uint8Array
): Promise<Uint8Array> {
  const subtle = env.getSubtleCrypto();
  const cryptoKey = await browserImportKey(key, HMAC_BROWSER);
  const signature = await subtle.sign(
    {
      length: LENGTH_512,
      name: HMAC_BROWSER,
    },
    cryptoKey,
    data
  );
  return new Uint8Array(signature);
}

export async function browserSha256(data: Uint8Array): Promise<Uint8Array> {
  const subtle = env.getSubtleCrypto();
  const result = await subtle.digest(
    {
      name: SHA256_BROWSER_ALGO,
    },
    data
  );
  return new Uint8Array(result);
}

export async function browserSha512(data: Uint8Array): Promise<Uint8Array> {
  const subtle = env.getSubtleCrypto();
  const result = await subtle.digest(
    {
      name: SHA512_BROWSER_ALGO,
    },
    data
  );
  return new Uint8Array(result);
}
