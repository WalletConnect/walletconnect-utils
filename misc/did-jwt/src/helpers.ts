// Buffer.toString("base64url") isn't supported in every dev environment, eg it
// might work when run in node, but when built in vite and other
// inconsistencies. This just achieves what base64url already does,
// which is base64 encode the buffer, but instead of +, use - and
// instead of / use _ and remove any padding (=).
export const makeBase64UrlSafe = (base64EncodedString: string) => {
  return base64EncodedString.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

export const concatUInt8Arrays = (array1: Uint8Array, array2: Uint8Array) => {
  const mergedArray = new Uint8Array(array1.length + array2.length);
  mergedArray.set(array1);
  mergedArray.set(array2, array1.length);

  return mergedArray;
};

export const isValidObject = (obj: any) =>
  Object.getPrototypeOf(obj) === Object.prototype && Object.keys(obj).length;

export const objectToHex = (obj: unknown) => {
  if (!isValidObject(obj)) {
    throw new Error(`Supplied object is not valid ${JSON.stringify(obj)}`);
  }

  return makeBase64UrlSafe(
    Buffer.from(new TextEncoder().encode(JSON.stringify(obj))).toString("base64"),
  );
};
