import * as ed25519 from "@noble/ed25519";
import { Cacao } from "@walletconnect/cacao";
import { ICore } from "@walletconnect/types";
import { formatMessage, generateRandomBytes32 } from "@walletconnect/utils";
import axios from "axios";
import {
  IIdentityKeys,
  IdentityKeyClaim,
  IdentityKeychain,
  RegisterIdentityParams,
  UnregisterIdentityParams,
} from "./types";
import { composeDidPkh, encodeEd25519Key, generateJWT, jwtExp } from "./utils";

const DEFAULT_KEYSERVER_URL = "https://keys.walletconnect.com/";

interface IClient {
  identityKeys: {
    get: (key: string) => IdentityKeychain;
    set: (key: string, value: IdentityKeychain) => Promise<void>;
  };
  core: ICore;
  keyserverUrl?: string;
}

export class IdentityKeys<T extends IClient> implements IIdentityKeys {
  private keyserverUrl = this.client.keyserverUrl || DEFAULT_KEYSERVER_URL;

  constructor(private client: T) {}

  private generateIdentityKey = async () => {
    const privateKey = ed25519.utils.randomPrivateKey();
    const publicKey = await ed25519.getPublicKey(privateKey);

    const pubKeyHex = ed25519.utils.bytesToHex(publicKey).toLowerCase();
    const privKeyHex = ed25519.utils.bytesToHex(privateKey).toLowerCase();
    this.client.core.crypto.keychain.set(pubKeyHex, privKeyHex);
    return [pubKeyHex, privKeyHex];
  };

  private generateIdAuth = (accountId: string, payload: IdentityKeyClaim) => {
    const { identityKeyPub, identityKeyPriv } = this.client.identityKeys.get(accountId);

    return generateJWT([identityKeyPub, identityKeyPriv], payload);
  };

  public async registerIdentity({ accountId, onSign }: RegisterIdentityParams): Promise<string> {
    try {
      const storedKeyPair = this.client.identityKeys.get(accountId);
      return storedKeyPair.identityKeyPub;
    } catch {
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
      this.client.identityKeys.set(accountId, {
        identityKeyPriv: privKeyHex,
        identityKeyPub: pubKeyHex,
        accountId,
        inviteKeyPriv: "",
        inviteKeyPub: "",
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
    }
  }

  public async unregisterIdentity({ account }: UnregisterIdentityParams): Promise<void> {
    const iat = Date.now();
    const keys = this.client.identityKeys.get(account);
    const didPublicKey = composeDidPkh(account);
    const unregisterIdentityPayload = {
      iat,
      exp: jwtExp(iat),
      iss: encodeEd25519Key(keys.identityKeyPub),
      aud: this.keyserverUrl,
      pkh: didPublicKey,
      act: "unregister_identity",
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
  }

  public async resolveIdentity(params: RegisterIdentityParams): Promise<Cacao> {
    return {} as any;
  }
}
