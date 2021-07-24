import {
  aesCbcEncrypt,
  aesCbcDecrypt,
  hmacSha256Sign,
  hmacSha256Verify,
  randomBytes,
  sha512,
  IV_LENGTH,
  ERROR_BAD_MAC,
  EncryptOpts,
  assert,
} from "@walletconnect/crypto";
import { concatArrays } from "@walletconnect/encoding";

import {
  getEncryptionKey,
  getMacKey,
  getSharedKey,
  getSenderKeyPair,
  serialize,
  deserialize,
} from "./shared";

async function getEciesKeys(sharedKey: Uint8Array) {
  const hash = await sha512(sharedKey);
  return { encryptionKey: getEncryptionKey(hash), macKey: getMacKey(hash) };
}

export async function encryptWithSharedKey(
  msg: Uint8Array,
  sharedKey: Uint8Array,
  publicKey: Uint8Array,
  iv: Uint8Array = randomBytes(IV_LENGTH)
) {
  const { encryptionKey, macKey } = await getEciesKeys(sharedKey);
  const ciphertext = await aesCbcEncrypt(iv, encryptionKey, msg);
  const dataToMac = concatArrays(iv, publicKey, ciphertext);
  const mac = await hmacSha256Sign(macKey, dataToMac);
  return serialize({ iv, publicKey, ciphertext, mac });
}

export async function encrypt(
  msg: Uint8Array,
  receiverPublicKey: Uint8Array,
  opts?: EncryptOpts
): Promise<Uint8Array> {
  const { publicKey, privateKey } = getSenderKeyPair(opts);
  const sharedKey = getSharedKey(privateKey, receiverPublicKey);
  return encryptWithSharedKey(msg, sharedKey, publicKey, opts?.iv);
}

export async function decryptWithSharedKey(
  encrypted: Uint8Array,
  sharedKey: Uint8Array
) {
  const { iv, publicKey, mac, ciphertext } = deserialize(encrypted);
  const { encryptionKey, macKey } = await getEciesKeys(sharedKey);
  const dataToMac = concatArrays(iv, publicKey, ciphertext);
  const macTest = await hmacSha256Verify(macKey, dataToMac, mac);
  assert(macTest, ERROR_BAD_MAC);
  const msg = await aesCbcDecrypt(iv, encryptionKey, ciphertext);
  return msg;
}

export async function decrypt(
  encrypted: Uint8Array,
  privateKey: Uint8Array
): Promise<Uint8Array> {
  const { publicKey } = deserialize(encrypted);
  const sharedKey = getSharedKey(privateKey, publicKey);
  return decryptWithSharedKey(encrypted, sharedKey);
}
