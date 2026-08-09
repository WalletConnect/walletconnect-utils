import "mocha";
import { expect } from "chai";
import { formatMessage } from "../src/utils";
import { CacaoPayload } from "../src/types";

const iss = "did:pkh:eip155:1:0x2faf83c542b68f1b4cdc0e770e8cb9f567b08f71";

const base: CacaoPayload = {
  iss,
  domain: "example.com",
  aud: "https://example.com/login",
  version: "1",
  nonce: "12345678",
  iat: "2024-01-01T00:00:00.000Z",
  statement: "I accept the Terms of Service",
};

describe("formatMessage", () => {
  it("formats a normal statement", () => {
    const message = formatMessage(base, iss);
    expect(message).to.include("I accept the Terms of Service");
    expect(message).to.include("URI: https://example.com/login");
  });

  it("rejects statement with embedded newline (field smuggling)", () => {
    expect(() =>
      formatMessage(
        { ...base, statement: "I accept\nURI: https://evil.com" },
        iss,
      ),
    ).to.throw("Statement must not contain line breaks");
  });

  it("rejects statement with carriage return", () => {
    expect(() =>
      formatMessage({ ...base, statement: "I accept\rURI: https://evil.com" }, iss),
    ).to.throw("Statement must not contain line breaks");
  });
});
