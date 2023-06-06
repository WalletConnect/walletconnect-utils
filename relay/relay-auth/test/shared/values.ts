// Client will sign a unique identifier as the subject
export const TEST_SUBJECT = "c479fe5dc464e771e78b193d239a65b58d278cad1c34bfb0b5716e5bb514928e";

// Client will include the server endpoint as audience
export const TEST_AUDIENCE = "wss://relay.walletconnect.com";

// Client will use the JWT for 24 hours
export const TEST_TTL = 86400;

// Test issued at timestamp in seconds
export const TEST_IAT = 1656910097;

// Test seed to generate the same key pair
export const TEST_SEED = "58e0254c211b858ef7896b00e3f36beeb13d568d47c6031c4218b87718061295";

// Expected secret key for above seed
export const EXPECTED_SECRET_KEY =
  "58e0254c211b858ef7896b00e3f36beeb13d568d47c6031c4218b87718061295884ab67f787b69e534bfdba8d5beb4e719700e90ac06317ed177d49e5a33be5a";

export const EXPECTED_PUBLIC_KEY =
  "884ab67f787b69e534bfdba8d5beb4e719700e90ac06317ed177d49e5a33be5a";

// Expected issuer using did:key method
export const EXPECTED_ISS = "did:key:z6MkodHZwneVRShtaLf8JKYkxpDGp1vGZnpGmdBpX8M2exxH";

// Expected expiry given injected issued at
export const EXPECTED_EXP = TEST_IAT + TEST_TTL;

// Expected data encode for given payload
export const EXPECTED_DATA =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkaWQ6a2V5Ono2TWtvZEhad25lVlJTaHRhTGY4SktZa3hwREdwMXZHWm5wR21kQnBYOE0yZXh4SCIsInN1YiI6ImM0NzlmZTVkYzQ2NGU3NzFlNzhiMTkzZDIzOWE2NWI1OGQyNzhjYWQxYzM0YmZiMGI1NzE2ZTViYjUxNDkyOGUiLCJhdWQiOiJ3c3M6Ly9yZWxheS53YWxsZXRjb25uZWN0LmNvbSIsImlhdCI6MTY1NjkxMDA5NywiZXhwIjoxNjU2OTk2NDk3fQ";

// Expected signature for given data
export const EXPECTED_SIG =
  "bAKl1swvwqqV_FgwvD4Bx3Yp987B9gTpZctyBviA-EkAuWc8iI8SyokOjkv9GJESgid4U8Tf2foCgrQp2qrxBA";

// Expected JWT for given payload
export const EXPECTED_JWT =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkaWQ6a2V5Ono2TWtvZEhad25lVlJTaHRhTGY4SktZa3hwREdwMXZHWm5wR21kQnBYOE0yZXh4SCIsInN1YiI6ImM0NzlmZTVkYzQ2NGU3NzFlNzhiMTkzZDIzOWE2NWI1OGQyNzhjYWQxYzM0YmZiMGI1NzE2ZTViYjUxNDkyOGUiLCJhdWQiOiJ3c3M6Ly9yZWxheS53YWxsZXRjb25uZWN0LmNvbSIsImlhdCI6MTY1NjkxMDA5NywiZXhwIjoxNjU2OTk2NDk3fQ.bAKl1swvwqqV_FgwvD4Bx3Yp987B9gTpZctyBviA-EkAuWc8iI8SyokOjkv9GJESgid4U8Tf2foCgrQp2qrxBA";

// Expected decoded JWT using did-jwt
export const EXPECTED_DECODED = {
  header: { alg: "EdDSA", typ: "JWT" },
  payload: {
    iss: EXPECTED_ISS,
    sub: TEST_SUBJECT,
    aud: TEST_AUDIENCE,
    iat: TEST_IAT,
    exp: EXPECTED_EXP,
  },
  signature: EXPECTED_SIG,
  data: EXPECTED_DATA,
};
