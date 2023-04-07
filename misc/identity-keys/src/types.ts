import { Cacao } from "@walletconnect/cacao";

export interface RegisterIdentityParams {
  accountId: string;
  onSign: (message: string) => Promise<string>;
}

export interface ResolveIdentityParams {
  publicKey: string;
}

export interface UnregisterIdentityParams {
  account: string;
}

export interface IdentityKeychain {
  identityKeyPub: string;
  accountId: string;
  identityKeyPriv: string;
  inviteKeyPub: string;
  inviteKeyPriv: string;
}

export interface JwtHeader {
  typ: string;
  alg: string;
}

export interface IdentityKeyClaims {
  iss: string;
  act: string;
  iat: number;
  exp: number;
  sub?: string;
  aud?: string;
  ksu?: string;
  pkh?: string;
  pke?: string;
}

export abstract class IIdentityKeys {
  public abstract registerIdentity(params: RegisterIdentityParams): Promise<string>;
  public abstract resolveIdentity(params: ResolveIdentityParams): Promise<Cacao>;
  public abstract unregisterIdentity(params: UnregisterIdentityParams): Promise<void>;
  public abstract generateIdAuth(accountId: string, payload: IdentityKeyClaims): Promise<string>;
}
