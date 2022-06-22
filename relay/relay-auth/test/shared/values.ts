// Client will sign the Server provided nonce as subject
export const TEST_NONCE =
  "c479fe5dc464e771e78b193d239a65b58d278cad1c34bfb0b5716e5bb514928e";

// Test seed to generate the same key pair
export const TEST_SEED =
  "58e0254c211b858ef7896b00e3f36beeb13d568d47c6031c4218b87718061295";

// Expected secret key for above seed
export const EXPECTED_SECRET_KEY =
  "58e0254c211b858ef7896b00e3f36beeb13d568d47c6031c4218b87718061295884ab67f787b69e534bfdba8d5beb4e719700e90ac06317ed177d49e5a33be5a";

export const EXPECTED_PUBLIC_KEY =
  "884ab67f787b69e534bfdba8d5beb4e719700e90ac06317ed177d49e5a33be5a";

// Expected issuer using did:key method
export const EXPECTED_ISS =
  "did:key:z6MkodHZwneVRShtaLf8JKYkxpDGp1vGZnpGmdBpX8M2exxH";

// Expected data encode for given nonce
export const EXPECTED_DATA =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkaWQ6a2V5Ono2TWtvZEhad25lVlJTaHRhTGY4SktZa3hwREdwMXZHWm5wR21kQnBYOE0yZXh4SCIsInN1YiI6ImM0NzlmZTVkYzQ2NGU3NzFlNzhiMTkzZDIzOWE2NWI1OGQyNzhjYWQxYzM0YmZiMGI1NzE2ZTViYjUxNDkyOGUifQ";

// Expected JWT for given nonce
export const EXPECTED_JWT =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkaWQ6a2V5Ono2TWtvZEhad25lVlJTaHRhTGY4SktZa3hwREdwMXZHWm5wR21kQnBYOE0yZXh4SCIsInN1YiI6ImM0NzlmZTVkYzQ2NGU3NzFlNzhiMTkzZDIzOWE2NWI1OGQyNzhjYWQxYzM0YmZiMGI1NzE2ZTViYjUxNDkyOGUifQ.0JkxOM-FV21U7Hk-xycargj_qNRaYV2H5HYtE4GzAeVQYiKWj7YySY5AdSqtCgGzX4Gt98XWXn2kSr9rE1qvCA";

// Expected decoded JWT using did-jwt
export const EXPECTED_DECODED = {
  header: { alg: "EdDSA", typ: "JWT" },
  payload: {
    iss: "did:key:z6MkodHZwneVRShtaLf8JKYkxpDGp1vGZnpGmdBpX8M2exxH",
    sub: "c479fe5dc464e771e78b193d239a65b58d278cad1c34bfb0b5716e5bb514928e",
  },
  signature:
    "0JkxOM-FV21U7Hk-xycargj_qNRaYV2H5HYtE4GzAeVQYiKWj7YySY5AdSqtCgGzX4Gt98XWXn2kSr9rE1qvCA",
  data:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkaWQ6a2V5Ono2TWtvZEhad25lVlJTaHRhTGY4SktZa3hwREdwMXZHWm5wR21kQnBYOE0yZXh4SCIsInN1YiI6ImM0NzlmZTVkYzQ2NGU3NzFlNzhiMTkzZDIzOWE2NWI1OGQyNzhjYWQxYzM0YmZiMGI1NzE2ZTViYjUxNDkyOGUifQ",
};
