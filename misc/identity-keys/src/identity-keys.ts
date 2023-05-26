// import { sha512 } from "@noble/hashes/sha512";
import { generateKeyPairFromSeed } from "@stablelib/ed25519";
import { encode } from "@stablelib/hex";
import { randomBytes } from "@stablelib/random";
import { Cacao } from "@walletconnect/cacao";
import { Store } from "@walletconnect/core";
import {
  composeDidPkh,
  encodeEd25519Key,
  generateJWT,
  jwtExp,
  JwtPayload,
} from "@walletconnect/did-jwt";
import { ICore, IStore } from "@walletconnect/types";
import { formatMessage, generateRandomBytes32 } from "@walletconnect/utils";
import axios from "axios";
import {
  GetIdentityParams,
  IdentityKeychain,
  IIdentityKeys,
  RegisterIdentityParams,
  ResolveIdentityParams,
  UnregisterIdentityParams,
} from "./types";

// Shim sha512Sync for react-native compatibility
// ed25519.etc.sha512Sync = (...m) => sha512(ed25519.etc.concatBytes(...m));

const DEFAULT_KEYSERVER_URL = "https://keys.walletconnect.com";
const IDENTITY_KEYS_STORAGE_PREFIX = "wc@2:identityKeys:";

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
    this.core.logger.debug("IdentityKeys > Generating Key Pair");
    const randomSeed = randomBytes(32);
    const { publicKey, secretKey: privateKey } = generateKeyPairFromSeed(randomSeed);
    this.core.logger.debug("IdentityKeys > Identity Key Pair generated");
    const pubKeyHex = encode(publicKey, true);
    const privKeyHex = encode(privateKey.slice(0, 32), true);
    this.core.logger.debug(
      `IdentityKeys > Keys formatted, pubKeyHex length: ${pubKeyHex.length}, privKeyHex length: ${privKeyHex.length}`,
    );

    this.core.crypto.keychain.set(pubKeyHex, privKeyHex);
    return [pubKeyHex, privKeyHex];
  };

  public generateIdAuth = async (accountId: string, payload: JwtPayload) => {
    const { identityKeyPub, identityKeyPriv } = this.identityKeys.get(accountId);
    this.core.logger.debug("IdentityKeys > Generating JWT");
    const jwt = await generateJWT([identityKeyPub, identityKeyPriv], payload);
    this.core.logger.debug("IdentityKeys > JWT generated successfully");
    return jwt;
  };

  public async registerIdentity({ accountId, onSign }: RegisterIdentityParams): Promise<string> {
    if (this.identityKeys.keys.includes(accountId)) {
      const storedKeyPair = this.identityKeys.get(accountId);
      return storedKeyPair.identityKeyPub;
    } else {
      try {
        const [pubKeyHex, privKeyHex] = await this.generateIdentityKey();
        this.core.logger.debug("IdentityKeys > Identity generated successfully");
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

        if (response.status !== 200) {
          throw new Error(`Failed to register on keyserver ${response.status}`);
        }

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
}
