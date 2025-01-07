import { x25519 } from "@noble/curves/ed25519";
import { concatArrays } from "@walletconnect/encoding";
import {
  KeyPair,
  PNRG,
  Encrypted,
  LENGTH_0,
  KEY_LENGTH,
  IV_LENGTH,
  MAC_LENGTH,
  EncryptOpts,
} from "@walletconnect/crypto";

export function derive(privateKey: Uint8Array, publicKey: Uint8Array): Uint8Array {
  return x25519.getSharedSecret(privateKey, publicKey);
}

export function generatePnrgFromEntropy(entropy: Uint8Array): PNRG {
  return {
    isAvailable: true,
    randomBytes: () => entropy,
  };
}

export function generateKeyPair(privKey?: Uint8Array): KeyPair {
  const privateKey = privKey || x25519.utils.randomPrivateKey();
  return {
    publicKey: x25519.getPublicKey(privateKey),
    privateKey,
  };
}

export function getSenderKeyPair(opts?: Partial<EncryptOpts>) {
  const keyPair = opts?.sender || generateKeyPair();
  return {
    privateKey: keyPair.privateKey,
    publicKey: keyPair.publicKey,
  };
}

export function getSharedKey(privateKey: Uint8Array, publicKey: Uint8Array) {
  return derive(privateKey, publicKey);
}

export function getEncryptionKey(hash: Uint8Array) {
  return new Uint8Array(hash.slice(LENGTH_0, KEY_LENGTH));
}

export function getMacKey(hash: Uint8Array) {
  return new Uint8Array(hash.slice(KEY_LENGTH));
}

export function serialize(opts: Encrypted): Uint8Array {
  return concatArrays(opts.iv, opts.publicKey, opts.mac, opts.ciphertext);
}

export function deserialize(arr: Uint8Array): Encrypted {
  const slice0 = LENGTH_0;
  const slice1 = slice0 + IV_LENGTH;
  const slice2 = slice1 + KEY_LENGTH;
  const slice3 = slice2 + MAC_LENGTH;
  const slice4 = arr.length;
  return {
    iv: arr.slice(slice0, slice1),
    publicKey: arr.slice(slice1, slice2),
    mac: arr.slice(slice2, slice3),
    ciphertext: arr.slice(slice3, slice4),
  };
}
