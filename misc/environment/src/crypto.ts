export function getBrowerCrypto(): Crypto {
  // @ts-ignore
  return global?.crypto || global?.msCrypto || {};
}

export function getSubtleCrypto(): SubtleCrypto {
  const browserCrypto = getBrowerCrypto();
  // @ts-ignore
  return browserCrypto.subtle || browserCrypto.webkitSubtle;
}

export function isBrowserCryptoAvailable(): boolean {
  return !!getBrowerCrypto() && !!getSubtleCrypto();
}
