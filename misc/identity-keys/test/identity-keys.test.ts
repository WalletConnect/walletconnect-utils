import "mocha";
import { expect } from "chai";
import { Core } from "@walletconnect/core";
import { Wallet } from "@ethersproject/wallet";
import { IdentityKeys, DEFAULT_KEYSERVER_URL } from "../src/";
import { encodeEd25519Key } from "@walletconnect/did-jwt";
import { ICore } from "@walletconnect/types";
import axios from "axios";

const PROJECT_ID = process.env.TEST_PROJECT_ID;

describe("@walletconnect/identity-keys", () => {
  const statement = "Test statement";
  const domain = "example.com";

  let wallet: Wallet;
  let accountId: string;
  let onSign: (m: string) => Promise<string>;
  let core: ICore;
  let identityKeys: IdentityKeys;

  beforeEach(async () => {
    wallet = Wallet.createRandom();
    accountId = `eip155:1:${wallet.address}`;
    onSign = (m) => wallet.signMessage(m);

    core = new Core({ projectId: PROJECT_ID });

    identityKeys = identityKeys = new IdentityKeys(core, DEFAULT_KEYSERVER_URL);

    await core.start();
    await identityKeys.init();
  });

  it("registers on keyserver", async () => {
    const identity = await identityKeys.registerIdentity({
      accountId,
      statement,
      onSign,
      domain,
    });

    const encodedIdentity = encodeEd25519Key(identity).split(":")[2];

    const fetchUrl = `${DEFAULT_KEYSERVER_URL}/identity?publicKey=${encodedIdentity}`;

    const fetchedFromKeyServer = await axios.get(fetchUrl);

    expect(fetchedFromKeyServer.status).eq(200);
  });

  it("does not persist identity keys that failed to register", async () => {
    // rejectedWith & rejected are not supported on this version of chai
    let failMessage = "";
    await identityKeys
      .registerIdentity({
        accountId,
        statement,
        onSign: () => Promise.resolve("badSignature"),
        domain,
      })
      .catch((err) => (failMessage = err.message));

    expect(failMessage).eq(`Failed to register on keyserver: AxiosError: Request failed with status code 400`);

    const keys = identityKeys.identityKeys.getAll();
    expect(keys.length).eq(0);
  });

  it("prevents registering with empty signatures", async () => {
    // rejectedWith & rejected are not supported on this version of chai
    let failMessage = "";
    await identityKeys
      .registerIdentity({
        accountId,
        statement,
        onSign: () => Promise.resolve(""),
        domain,
      })
      .catch((err) => (failMessage = err.message));

    expect(failMessage).eq("Provided an invalid signature. Expected a string but got: ");

    const keys = identityKeys.identityKeys.getAll();
    expect(keys.length).eq(0);
  });
});
