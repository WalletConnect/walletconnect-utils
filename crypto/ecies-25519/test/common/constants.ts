export const TEST_MESSAGE_STR = "test message to sign";

export const TEST_FIXED_IV = "64391e133b04b98aa2fb0479242fb60a";

export const TEST_KEY_PAIR = {
  a: {
    privateKey:
      "1fb63fca5c6ac731246f2f069d3bc2454345d5208254aa8ea7bffc6d110c8862",
    publicKey:
      "ff7a7d5767c362b0a17ad92299ebdb7831dcbd9a56959c01368c7404543b3342",
  },
  b: {
    privateKey:
      "36bf507903537de91f5e573666eaa69b1fa313974f23b2b59645f20fea505854",
    publicKey:
      "590c2c627be7af08597091ff80dd41f7fa28acd10ef7191d7e830e116d3a186a",
  },
};

export const TEST_SHARED_KEY =
  "9c87e48e69b33a613907515bcd5b1b4cc10bbaf15167b19804b00f0a9217e607";

export const TEST_ECIES_KEYS = {
  encryptionKey:
    "c2db554a2087ff1bdc8b1f58a96cbeb836b33ddc906ee12c9308a2c495b3b667",
  macKey: "8a29ce04f489258e4e6a9b7564b6a69523e6353becbc932fc1836e5e62252c18",
};

export const TEST_ENCRYPTED =
  "64391e133b04b98aa2fb0479242fb60a590c2c627be7af08597091ff80dd41f7fa28acd10ef7191d7e830e116d3a186a150e1c657e214f91a441a2103f95d1f560035d6c6267b7845adaab569bae76ba566e29d89448f8f8be3740b8737295fea3face5196189fae446c5886f228f136";

export const TEST_DESERIALIZED = {
  iv: "64391e133b04b98aa2fb0479242fb60a",
  publicKey: "590c2c627be7af08597091ff80dd41f7fa28acd10ef7191d7e830e116d3a186a",
  mac: "150e1c657e214f91a441a2103f95d1f560035d6c6267b7845adaab569bae76ba",
  ciphertext:
    "566e29d89448f8f8be3740b8737295fea3face5196189fae446c5886f228f136",
};
