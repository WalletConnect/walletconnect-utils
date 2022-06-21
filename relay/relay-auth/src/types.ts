export interface IridiumJWTHeader {
  alg: "EdDSA";
  typ: "JWT";
}

export interface IridiumJWTPayload {
  iss: string;
  sub: string;
}

export interface IridiumJWTData {
  header: IridiumJWTHeader;
  payload: IridiumJWTPayload;
}

export interface IridiumJWTSigned extends IridiumJWTData {
  signature: Uint8Array;
}
