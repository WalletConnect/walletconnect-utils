import { CacaoPayload, Cacao, CacaoSignature } from "@walletconnect/cacao";
import { JwtPayload } from "@walletconnect/did-jwt";

export interface RegisterIdentityParams {
  registerParams: {
    cacaoPayload: CacaoPayload;
    privateIdentityKey: Uint8Array;
  };
  signature: CacaoSignature;
}

export interface ResolveIdentityParams {
  publicKey: string;
}

export interface UnregisterIdentityParams {
  account: string;
}

export interface GetIdentityParams {
  account: string;
}

export interface IdentityKeychain {
  accountId: string;
  identityKeyPub: string;
  identityKeyPriv: string;
}

export abstract class IIdentityKeys {
  public abstract init(): Promise<void>;
  public abstract registerIdentity(params: RegisterIdentityParams): Promise<string>;
  public abstract resolveIdentity(params: ResolveIdentityParams): Promise<Cacao>;
  public abstract unregisterIdentity(params: UnregisterIdentityParams): Promise<void>;
  public abstract generateIdAuth(accountId: string, payload: JwtPayload): Promise<string>;
}
