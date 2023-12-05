# @walletconnect/identity-keys

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
