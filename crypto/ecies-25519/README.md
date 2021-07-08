# ecies-25519 [![npm version](https://badge.fury.io/js/ecies-25519.svg)](https://badge.fury.io/js/ecies-25519)

Isomorphic Cryptography Library for X25519 ECIES

## Description

This library supports ECIES encryption using Curve25519 Diffie–Hellman key exchange (aka X25519).

AES, HMAC and SHA methods are supported through native NodeJS and Browser APIs when available and fallbacks to vanilla javascript are already provided.

## Usage

### ECIES

```typescript
import * as ecies25519 from 'ecies-25519';
import * as encUtils from 'enc-utils';

const keyPair = ecies25519.generateKeyPair();

const str = 'test message to encrypt';
const msg = encUtils.utf8ToArray(str);

const encrypted = await ecies25519.encrypt(msg, keyPairB.publicKey);

const decrypted = await ecies25519.decrypt(encrypted, keyPairB.privateKey);

// decrypted === msg
```

### ECDH

```typescript
import * as ecies25519 from 'ecies-25519';

const keyPairA = ecies25519.generateKeyPair();
const keyPairB = ecies25519.generateKeyPair();

const sharedKey1 = await ecies25519.derive(
  keyPairA.privateKey,
  keyPairB.publicKey
);

const sharedKey2 = await ecies25519.derive(
  keyPairB.privateKey,
  keyPairA.publicKey
);

// sharedKey1 === sharedKey2
```

### RandomBytes

```typescript
import * as ecies25519 from 'ecies-25519';

const length = 32;
const key = ecies25519.randomBytes(length);

// key.length === length
```

### AES

```typescript
import * as ecies25519 from 'ecies-25519';
import * as encUtils from 'enc-utils';

const key = ecies25519.randomBytes(32);
const iv = ecies25519.randomBytes(16);

const str = 'test message to encrypt';
const msg = encUtils.utf8ToArray(str);

const ciphertext = await ecies25519.aesCbcEncrypt(iv, key, msg);

const decrypted = await ecies25519.aesCbcDecrypt(iv, key, ciphertext);

// decrypted === str
```

### HMAC

```typescript
import * as ecies25519 from 'ecies-25519';
import * as encUtils from 'enc-utils';

const key = ecies25519.randomBytes(32);
const iv = ecies25519.randomBytes(16);

const macKey = encUtils.concatArrays(iv, key);
const dataToMac = encUtils.concatArrays(iv, key, msg);

const mac = await ecies25519.hmacSha256Sign(macKey, dataToMac);

const result = await ecies25519.hmacSha256Verify(macKey, dataToMac, mac);

// result will return true if match
```

### SHA2

```typescript
import * as ecies25519 from 'ecies-25519';
import * as encUtils from 'enc-utils';

// SHA256
const str = 'test message to hash';
const msg = encUtils.utf8ToArray(str);
const hash = await ecies25519.sha256(str);

// SHA512
const str = 'test message to hash';
const msg = encUtils.utf8ToArray(str);
const hash = await ecies25519.sha512(str);
```

## React-Native Support

This library is intended for use in a Browser or NodeJS environment, however it is possible to use in a React-Native environment if NodeJS modules are polyfilled with `react-native-crypto`, read more [here](https://github.com/tradle/react-native-crypto).

## License

[MIT License](LICENSE.md)
