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
  let core: ICore;
  let identityKeys: IdentityKeys;

  beforeEach(async () => {
    wallet = Wallet.createRandom();
    accountId = `eip155:1:${wallet.address}`;
    core = new Core({ projectId: PROJECT_ID });

    identityKeys = identityKeys = new IdentityKeys(core, DEFAULT_KEYSERVER_URL);

    await core.start();
    await identityKeys.init();
  });

  it("registers on keyserver", async () => {
    const { message, registerParams } = await identityKeys.prepareRegistration({
      accountId,
      statement,
      domain,
    });

    const signature = await wallet.signMessage(message);

    const identity = await identityKeys.registerIdentity({
      registerParams,
      signature: {
        s: signature,
        t: "eip191",
      },
    });

    const encodedIdentity = encodeEd25519Key(identity).split(":")[2];

    const fetchUrl = `${DEFAULT_KEYSERVER_URL}/identity?publicKey=${encodedIdentity}`;

    const fetchedFromKeyServer = await axios.get(fetchUrl);

    expect(fetchedFromKeyServer.status).eq(200);
  });

  it("does not persist identity keys that failed to register", async () => {
    const { registerParams } = await identityKeys.prepareRegistration({
      accountId,
      statement,
      domain,
    });

    // rejectedWith & rejected are not supported on this version of chai
    let failMessage = "";

    const signature = await wallet.signMessage("otherMessage");
    await identityKeys
      .registerIdentity({
        registerParams,
        signature: {
          s: signature,
          t: "eip191",
        },
      })
      .catch((err) => (failMessage = err.message));

    expect(failMessage).match(
      new RegExp(`Provided an invalid signature. Signature ${signature} by account
            ${accountId} is not a valid signature for message .*`),
    );

    const keys = identityKeys.identityKeys.getAll();
    expect(keys.length).eq(0);
  });

  it("prevents registering with empty signatures", async () => {
    const { registerParams } = await identityKeys.prepareRegistration({
      accountId,
      statement,
      domain,
    });

    // rejectedWith & rejected are not supported on this version of chai
    let failMessage = "";
    await identityKeys
      .registerIdentity({
        registerParams,
        signature: {
          s: "",
          t: "eip191",
        },
      })
      .catch((err) => (failMessage = err.message));

    expect(failMessage).eq("Provided an invalid signature. Expected a string but got: ");

    const keys = identityKeys.identityKeys.getAll();
    expect(keys.length).eq(0);
  });
});
