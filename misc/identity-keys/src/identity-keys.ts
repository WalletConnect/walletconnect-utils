import * as ed25519 from "@noble/ed25519";
import { Cacao, verifySignature } from "@walletconnect/cacao";
import { Store } from "@walletconnect/core";
import {
  JwtPayload,
  composeDidPkh,
  encodeEd25519Key,
  generateJWT,
  jwtExp,
} from "@walletconnect/did-jwt";
import { ICore, IStore } from "@walletconnect/types";
import { formatMessage, generateRandomBytes32 } from "@walletconnect/utils";
import axios from "axios";
import {
  IIdentityKeys,
  IdentityKeychain,
  RegisterIdentityParams,
  ResolveIdentityParams,
  UnregisterIdentityParams,
  GetIdentityParams,
} from "./types";

export const DEFAULT_KEYSERVER_URL = "https://keys.walletconnect.com";
const IDENTITY_KEYS_STORAGE_PREFIX = "wc@2:identityKeys:";

export class IdentityKeys implements IIdentityKeys {
  private keyserverUrl: string;
  public identityKeys: IStore<IdentityKeychain["accountId"], IdentityKeychain>;

  constructor(private core: ICore, private projectId: string, keyServerUrl?: string) {
    this.keyserverUrl = keyServerUrl ?? DEFAULT_KEYSERVER_URL;
    this.identityKeys = new Store(
      core,
      this.core.logger,
      "identityKeys",
      IDENTITY_KEYS_STORAGE_PREFIX,
      (keys: IdentityKeychain) => keys.accountId,
    );
  }

  public init = async () => {
    await this.identityKeys.init();
  };

  public generateIdAuth = async (accountId: string, payload: JwtPayload) => {
    const { identityKeyPub, identityKeyPriv } = this.identityKeys.get(accountId);

    return generateJWT([identityKeyPub, identityKeyPriv], payload);
  };

  public isRegistered(account: string) {
    return this.identityKeys.keys.includes(account);
  }

  public async prepareRegistration({
    domain,
    accountId,
    statement,
  }: {
    domain: string;
    statement?: string;
    accountId: string;
  }) {
    const { privateKey, pubKeyHex } = await this.generateIdentityKey();

    const cacaoPayload = {
      aud: encodeEd25519Key(pubKeyHex),
      statement,
      domain,
      iss: composeDidPkh(accountId),
      nonce: generateRandomBytes32(),
      iat: new Date().toISOString(),
      version: "1",
      resources: [this.keyserverUrl],
    };

    return {
      message: formatMessage(cacaoPayload, composeDidPkh(accountId)),
      registerParams: {
        cacaoPayload,
        privateIdentityKey: privateKey,
      },
    };
  }

  public async registerIdentity({
    registerParams,
    signature,
  }: RegisterIdentityParams): Promise<string> {
    const accountId = registerParams.cacaoPayload.iss.split(":").slice(-3).join(":");

    if (this.isRegistered(accountId)) {
      const storedKeyPair = this.identityKeys.get(accountId);
      return storedKeyPair.identityKeyPub;
    } else {
      try {
        const message = formatMessage(registerParams.cacaoPayload, registerParams.cacaoPayload.iss);

        if (!signature.s) {
          throw new Error(
            `Provided an invalid signature. Expected a string but got: ${signature.s}`,
          );
        }

        const [chainPrefix, chain, address] = accountId.split(":");
        const invalidSignatureError = `Provided an invalid signature. Signature ${signature.s} of type ${signature.t} by account ${accountId} is not a valid signature for message ${message}`;

        let signatureValid = false;

        // account for an invalid signature
        try {
          signatureValid = await verifySignature(
            address,
            message,
            signature,
            `${chainPrefix}:${chain}`,
            this.projectId,
          );
        } catch {
          signatureValid = false;
        }

        if (!signatureValid) {
          throw new Error(invalidSignatureError);
        }

        const url = `${this.keyserverUrl}/identity`;

        const cacao: Cacao = {
          h: {
            t: "eip4361",
          },
          p: registerParams.cacaoPayload,
          s: signature,
        };

        try {
          await axios.post(url, { cacao });
        } catch (e) {
          throw new Error(`Failed to register on keyserver: ${e}`);
        }

        // Persist keys only after successful registration
        const { pubKeyHex, privKeyHex } = await this.getKeyData(registerParams.privateIdentityKey);

        await this.core.crypto.keychain.set(pubKeyHex, privKeyHex);
        await this.identityKeys.set(accountId, {
          identityKeyPriv: privKeyHex,
          identityKeyPub: pubKeyHex,
          accountId,
        });

        return pubKeyHex;
      } catch (error) {
        this.core.logger.error(error);
        throw error;
      }
    }
  }

  public async unregisterIdentity({ account }: UnregisterIdentityParams): Promise<void> {
    try {
      const iat = Date.now();
      const keys = this.identityKeys.get(account);
      const didPublicKey = composeDidPkh(account);
      const unregisterIdentityPayload = {
        iat,
        exp: jwtExp(iat),
        iss: encodeEd25519Key(keys.identityKeyPub),
        aud: this.keyserverUrl,
        pkh: didPublicKey,
        act: "unregister_identity",
        sub: "identity_keys",
      };

      const idAuth = await this.generateIdAuth(account, unregisterIdentityPayload);

      const url = `${this.keyserverUrl}/identity`;

      const response = await axios.delete(url, {
        data: {
          idAuth,
        },
      });

      if (response.status !== 200) {
        throw new Error(`Failed to unregister on keyserver ${response.status}`);
      }

      await this.identityKeys.delete(account, {
        code: -1,
        message: `Account ${account} unregistered`,
      });
    } catch (error) {
      this.core.logger.error(error);
      throw error;
    }
  }

  public async resolveIdentity({ publicKey }: ResolveIdentityParams): Promise<Cacao> {
    const url = `${this.keyserverUrl}/identity?publicKey=${publicKey.split(":")[2]}`;

    try {
      const { data } = await axios.get<{ value: { cacao: Cacao } }>(url);
      return data.value.cacao;
    } catch (e) {
      this.core.logger.error(e);
      throw new Error("Failed to resolve identity key");
    }
  }

  public async getIdentity({ account }: GetIdentityParams): Promise<string> {
    return this.identityKeys.get(account).identityKeyPub;
  }

  public async hasIdentity({ account }: GetIdentityParams): Promise<boolean> {
    return this.identityKeys.keys.includes(account);
  }

  // --------------------------- Private Helpers -----------------------------//

  private generateIdentityKey = () => {
    const privateKey = ed25519.utils.randomPrivateKey();

    return this.getKeyData(privateKey);
  };

  private getKeyHex = (key: Uint8Array) => {
    return ed25519.utils.bytesToHex(key).toLowerCase();
  };

  private getKeyData = async (privateKey: Uint8Array) => {
    const publicKey = await ed25519.getPublicKey(privateKey);

    return {
      publicKey,
      privateKey,
      pubKeyHex: this.getKeyHex(publicKey),
      privKeyHex: this.getKeyHex(privateKey),
    };
  };
}
