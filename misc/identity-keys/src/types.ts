import { Cacao } from "@walletconnect/cacao";

export interface RegisterIdentityParams {
  accountId: string;
  onSign: (message: string) => Promise<string>;
  keyserverUrl?: string;
}

export interface ResolveIdentityParams {
  publicKey: string;
  keyserverUrl?: string;
}

export interface UnregisterIdentityParams {
  account: string;
  identityKeyPub: string;
  keyserverUrl?: string;
}

export interface IdentityKeychain {
  identityKeyPub: string;
  accountId: string;
  identityKeyPriv: string;
  inviteKeyPub: string;
  inviteKeyPriv: string;
}

export interface IdentityKeyClaim {
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  pkh: string;
  act: string;
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
  public abstract resolveIdentity(params: RegisterIdentityParams): Promise<Cacao>;
  public abstract unregisterIdentity(params: UnregisterIdentityParams): Promise<void>;
}
