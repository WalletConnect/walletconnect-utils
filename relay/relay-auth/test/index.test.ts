// import * from "mocha";
import * as chai from "chai";

import * as didJWT from "did-jwt";
import * as ed25519 from "@stablelib/ed25519";
import { fromString } from "uint8arrays/from-string";

import {
  TEST_SUBJECT,
  TEST_SEED,
  EXPECTED_ISS,
  EXPECTED_DATA,
  EXPECTED_JWT,
  EXPECTED_DECODED,
  EXPECTED_PUBLIC_KEY,
  EXPECTED_SECRET_KEY,
  TEST_AUDIENCE,
  TEST_TTL,
  TEST_IAT,
} from "./shared";

import {
  decodeIss,
  encodeData,
  encodeIss,
  generateKeyPair,
  signJWT,
  verifyJWT,
} from "../src";

describe("Relay Auth", () => {
  let keyPair: ed25519.KeyPair;
  before(() => {
    const seed = fromString(TEST_SEED, "base16");
    keyPair = generateKeyPair(seed);
  });
  it("should generate random ed25519 key pair", async () => {
    const randomKeyPair = generateKeyPair();
    chai.expect(randomKeyPair.publicKey.length).to.eql(32);

    chai.expect(randomKeyPair.secretKey.length).to.eql(64);
  });
  it("should generate same ed25519 key pair", async () => {
    chai
      .expect(keyPair.publicKey)
      .to.eql(fromString(EXPECTED_PUBLIC_KEY, "base16"));

    chai
      .expect(keyPair.secretKey)
      .to.eql(fromString(EXPECTED_SECRET_KEY, "base16"));
  });
  it("encode and decode issuer", async () => {
    const iss = encodeIss(keyPair.publicKey);
    chai.expect(iss).to.eql(EXPECTED_ISS);
    const publicKey = decodeIss(iss);
    chai.expect(publicKey).to.eql(keyPair.publicKey);
  });
  it("encode and decode data", async () => {
    const { header, payload } = EXPECTED_DECODED as any;
    const data = encodeData({ header, payload });
    chai.expect(data).to.eql(fromString(EXPECTED_DATA, "utf8"));
  });
  it("sign and verify JWT", async () => {
    const seed = fromString(TEST_SEED, "base16");
    const keyPair = generateKeyPair(seed);
    const sub = TEST_SUBJECT;
    const aud = TEST_AUDIENCE;
    const ttl = TEST_TTL;
    // injected issued at for deterministic jwt
    const iat = TEST_IAT;
    const jwt = await signJWT(sub, aud, ttl, keyPair, iat);
    chai.expect(jwt).to.eql(EXPECTED_JWT);
    const verified = await verifyJWT(jwt);
    chai.expect(verified).to.eql(true);
    const decoded = didJWT.decodeJWT(jwt);
    chai.expect(decoded).to.eql(EXPECTED_DECODED);
    // FIXME: currently errors with 'Unknown file extension ".ts"'
    // const resolver = new Resolver(KeyDIDResolver.getResolver());
    // const response = await didJWT.verifyJWT(jwt, { resolver });
    // // eslint-disable-next-line
    // console.log("response", response);
  });
});
