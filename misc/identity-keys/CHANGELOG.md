# @walletconnect/identity-keys

## 2.1.0

### Minor Changes

- Add support for recaps registration

## 2.0.1

### Patch Changes

- Fix bug where chainPrefix is not added for eip1271 calls

## 2.0.0

### Major Changes

- Add support for eip1271 verification
- Change API to accept type alongwith the signature

## 1.0.1

### Patch Changes

- Replace viem with @ethersproject/transactions and @ethersproject/hash to optimize for size

## 1.0.0

### Major Changes

- Refactor registration to be multi function, with the following flow:

  - `prepareRegistration`,
  - sign `message` independently,
  - then pass that `signature` along with `registerParams` from `prepareRegistration` into register.

- Removes `onSign` function, instead passing signature to the second part of a duo function operation.

## 0.2.3

### Patch Changes

- Fix bug with optimistic storage of keys
