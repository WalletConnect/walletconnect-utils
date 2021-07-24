import {
  aesCbcEncryptSync,
  aesCbcDecryptSync,
  hmacSha256SignSync,
  hmacSha256VerifySync,
  randomBytes,
  sha512Sync,
  IV_LENGTH,
  ERROR_BAD_MAC,
  EncryptOpts,
  assert,
} from "@walletconnect/crypto/sync";
import { concatArrays } from "enc-utils";

import {
  getEncryptionKey,
  getMacKey,
  getSharedKey,
  getSenderKeyPair,
  serialize,
  deserialize,
} from "./shared";

function getEciesKeysSync(sharedKey: Uint8Array) {
  const hash = sha512Sync(sharedKey);
  return { encryptionKey: getEncryptionKey(hash), macKey: getMacKey(hash) };
}

export function encryptWithSharedKeySync(
  msg: Uint8Array,
  sharedKey: Uint8Array,
  publicKey: Uint8Array,
  iv: Uint8Array = randomBytes(IV_LENGTH)
) {
  const { encryptionKey, macKey } = getEciesKeysSync(sharedKey);
  const ciphertext = aesCbcEncryptSync(iv, encryptionKey, msg);
  const dataToMac = concatArrays(iv, publicKey, ciphertext);
  const mac = hmacSha256SignSync(macKey, dataToMac);
  return serialize({ iv, publicKey, ciphertext, mac });
}

export function encryptSync(
  msg: Uint8Array,
  receiverPublicKey: Uint8Array,
  opts?: EncryptOpts
): Uint8Array {
  const { publicKey, privateKey } = getSenderKeyPair(opts);
  const sharedKey = getSharedKey(privateKey, receiverPublicKey);
  return encryptWithSharedKeySync(msg, sharedKey, publicKey, opts?.iv);
}

export function decryptWithSharedKeySync(
  encrypted: Uint8Array,
  sharedKey: Uint8Array
) {
  const { iv, publicKey, mac, ciphertext } = deserialize(encrypted);
  const { encryptionKey, macKey } = getEciesKeysSync(sharedKey);
  const dataToMac = concatArrays(iv, publicKey, ciphertext);
  const macTest = hmacSha256VerifySync(macKey, dataToMac, mac);
  assert(macTest, ERROR_BAD_MAC);
  const msg = aesCbcDecryptSync(iv, encryptionKey, ciphertext);
  return msg;
}

export function decryptSync(
  encrypted: Uint8Array,
  privateKey: Uint8Array
): Uint8Array {
  const { publicKey } = deserialize(encrypted);
  const sharedKey = getSharedKey(privateKey, publicKey);
  return decryptWithSharedKeySync(encrypted, sharedKey);
}
