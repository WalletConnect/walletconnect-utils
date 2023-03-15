export interface JwtHeader {
  typ: string;
  alg: string;
}

export interface JwtPayload {
  iss: string;
  sub: string;
  aud?: string;
  ksu?: string;
  pkh?: string;
  pke?: string;
  iat: number;
  exp: number;
}
