export interface JwtHeader {
  typ: string;
  alg: string;
}

export interface JwtPayload {
  iss: string;
  sub: string;
  iat: number;
  exp: number;
  act: string;
  aud?: string;
  ksu?: string;
  pkh?: string;
  pke?: string;
}
