export function getFromWindow<T>(name: string): T | undefined {
  let res: T | undefined = undefined;
  if (typeof window !== "undefined" && typeof window[name] !== "undefined") {
    res = window[name];
  }
  return res;
}

export function getFromWindowOrThrow<T>(name: string): T {
  const res = getFromWindow<T>(name);
  if (!res) {
    throw new Error(`${name} is not defined in Window`);
  }
  return res;
}

export function getDocumentOrThrow(): Document {
  return getFromWindowOrThrow<Document>("document");
}

export function getDocument(): Document | undefined {
  return getFromWindow<Document>("document");
}

export function getNavigatorOrThrow(): Navigator {
  return getFromWindowOrThrow<Navigator>("navigator");
}

export function getNavigator(): Navigator | undefined {
  return getFromWindow<Navigator>("navigator");
}

export function getLocationOrThrow(): Location {
  return getFromWindowOrThrow<Location>("location");
}

export function getLocation(): Location | undefined {
  return getFromWindow<Location>("location");
}

export function getCryptoOrThrow(): Crypto {
  return getFromWindowOrThrow<Crypto>("crypto");
}

export function getCrypto(): Crypto | undefined {
  return getFromWindow<Crypto>("crypto");
}

export function getLocalStorageOrThrow(): Storage {
  return getFromWindowOrThrow<Storage>("localStorage");
}

export function getLocalStorage(): Storage | undefined {
  return getFromWindow<Storage>("localStorage");
}
