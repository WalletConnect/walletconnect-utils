export interface IridiumJWTHeader {
  alg: "EdDSA";
  typ: "JWT";
}

export interface IridiumJWTPayload {
  iss: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
}

export interface IridiumJWTData {
  header: IridiumJWTHeader;
  payload: IridiumJWTPayload;
}

export interface IridiumJWTSigned extends IridiumJWTData {
  signature: Uint8Array;
}

export interface IridiumJWTDecoded extends IridiumJWTSigned {
  data: Uint8Array;
}
