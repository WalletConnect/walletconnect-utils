import * as env from '@pedrouid/environment';

export function randomBytes(length: number): Uint8Array {
  const browserCrypto = env.getBrowerCrypto();
  return browserCrypto.getRandomValues(new Uint8Array(length));
}
