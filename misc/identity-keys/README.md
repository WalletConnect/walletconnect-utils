# `Identity keys`

Utilities to register, resolve and unregister identity keys

## Publishing

1. Bump the version for the specific package and create the equivalent tag, e.g. for a patch:

```sh
npm version patch # will update package.json and package-lock.json
git commit -m "chore(release): 2.x.x"
git tag 2.x.x
```

2. Run the desired `npm-publish` script from the root directory:

```sh
npm run npm-publish # will auto-trigger each pkg's prepare/prepublishOnly scripts
```

#### Publishing Canaries

To publish canary versions under the `canary` dist tag, follow the same steps as above, but set the version using
the last commit's short hash (`git log --oneline | head -n1`), e.g. if the current version is `2.2.2`:

```sh
# ...
npm version 2.2.2-bb147cb
# ...
```

Then from the root directory, run:

```sh
npm run npm-publish:canary # will auto-trigger each pkg's prepare/prepublishOnly scripts
```
