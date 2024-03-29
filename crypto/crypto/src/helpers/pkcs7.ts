/*
 * pkcs7
 * https://github.com/brightcove/pkcs7
 *
 * Copyright (c) 2014 Brightcove
 * Licensed under the apache2 license.
 */

const PADDING: number[][] = [
  [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
  [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15],
  [14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14],
  [13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13],
  [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
  [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11],
  [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
  [9, 9, 9, 9, 9, 9, 9, 9, 9],
  [8, 8, 8, 8, 8, 8, 8, 8],
  [7, 7, 7, 7, 7, 7, 7],
  [6, 6, 6, 6, 6, 6],
  [5, 5, 5, 5, 5],
  [4, 4, 4, 4],
  [3, 3, 3],
  [2, 2],
  [1],
];

export const pkcs7 = {
  /**
   * Returns a new Uint8Array that is padded with PKCS#7 padding.
   *
   * @param plaintext {Uint8Array} the input bytes before encryption
   * @return {Uint8Array} the padded bytes
   * @see http://tools.ietf.org/html/rfc5652
   */
  pad(plaintext: Uint8Array): Uint8Array {
    const padding = PADDING[plaintext.byteLength % 16 || 0];
    const result = new Uint8Array(plaintext.byteLength + padding.length);

    result.set(plaintext);
    result.set(padding, plaintext.byteLength);

    return result;
  },
  /**
   * Returns the subarray of a Uint8Array without PKCS#7 padding.
   *
   * @param padded {Uint8Array} unencrypted bytes that have been padded
   * @return {Uint8Array} the unpadded bytes
   * @see http://tools.ietf.org/html/rfc5652
   */
  unpad(padded: Uint8Array): Uint8Array {
    return padded.subarray(0, padded.byteLength - padded[padded.byteLength - 1]);
  },
};
