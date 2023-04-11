export interface CacaoPayload {
  iss: string;
  domain: string;
  aud: string;
  version: string;
  nonce: string;
  iat: string;
  nbf?: string;
  exp?: string;
  statement?: string;
  requestId?: string;
  resources?: string[];
}

export interface CacaoHeader {
  t: "eip4361";
}

export interface CacaoSignature {
  t: "eip191" | "eip1271";
  s: string;
  m?: string;
}

export interface Cacao {
  h: CacaoHeader;
  p: CacaoPayload;
  s: CacaoSignature;
}
