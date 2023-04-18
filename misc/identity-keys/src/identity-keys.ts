import * as ed25519 from "@noble/ed25519";
import { Cacao } from "@walletconnect/cacao";
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
} from "./types";

const DEFAULT_KEYSERVER_URL = "https://keys.walletconnect.com";
const IDENTITY_KEYS_STORAGE_PREFIX = "wc@2:identityKeys";

export class IdentityKeys implements IIdentityKeys {
  private keyserverUrl: string;
  private identityKeys: IStore<IdentityKeychain["accountId"], IdentityKeychain>;

  constructor(private core: ICore, keyServerUrl?: string) {
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

  private generateIdentityKey = async () => {
    const privateKey = ed25519.utils.randomPrivateKey();
    const publicKey = await ed25519.getPublicKey(privateKey);

    const pubKeyHex = ed25519.utils.bytesToHex(publicKey).toLowerCase();
    const privKeyHex = ed25519.utils.bytesToHex(privateKey).toLowerCase();
    this.core.crypto.keychain.set(pubKeyHex, privKeyHex);
    return [pubKeyHex, privKeyHex];
  };

  public generateIdAuth = async (accountId: string, payload: JwtPayload) => {
    const { identityKeyPub, identityKeyPriv } = this.identityKeys.get(accountId);

    return generateJWT([identityKeyPub, identityKeyPriv], payload);
  };

  public async registerIdentity({ accountId, onSign }: RegisterIdentityParams): Promise<string> {
    if (this.identityKeys.keys.includes(accountId)) {
      const storedKeyPair = this.identityKeys.get(accountId);
      return storedKeyPair.identityKeyPub;
    } else {
      try {
        const [pubKeyHex, privKeyHex] = await this.generateIdentityKey();
        const didKey = encodeEd25519Key(pubKeyHex);

        const cacao: Cacao = {
          h: {
            t: "eip4361",
          },
          p: {
            aud: this.keyserverUrl,
            statement: "Test",
            domain: this.keyserverUrl,
            iss: composeDidPkh(accountId),
            nonce: generateRandomBytes32(),
            iat: new Date().toISOString(),
            version: "1",
            resources: [didKey],
          },
          s: {
            t: "eip191",
            s: "",
          },
        };

        const cacaoMessage = formatMessage(cacao.p, composeDidPkh(accountId));

        const signature = await onSign(cacaoMessage);

        // Storing keys after signature creation to prevent having false statement
        // Eg, onSign failing / never resolving but having identity keys stored.
        this.identityKeys.set(accountId, {
          identityKeyPriv: privKeyHex,
          identityKeyPub: pubKeyHex,
          accountId,
        });

        const url = `${this.keyserverUrl}/identity`;

        const response = await axios.post(url, {
          cacao: {
            ...cacao,
            s: {
              ...cacao.s,
              s: signature,
            },
          },
        });

        if (response.status === 200) {
          return didKey;
        }

        throw new Error(`Failed to register on keyserver ${response.status}`);
      } catch (error) {
        this.core.logger.error(error);
        throw error;
      }
    }
  }

  public async unregisterIdentity({ account }: UnregisterIdentityParams): Promise<void> {
    try {
      const iat = Date.now();
      const keys = this.identityKeys.get(`${account}_identityKeys`);
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
}
