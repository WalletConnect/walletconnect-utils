# WalletConnect Utils

Monorepo of JS utility packages for WalletConnect

## Setup

1. Clone the repository:

```bash
git clone https://github.com/WalletConnect/walletconnect-utils.git
```

2. Install all dependencies:

```bash
npm install
```

3. Configure all monorepo packages:

```bash
npm run bootstrap
```

4. Ensure all packages lint, build, and test successfully:

> **For all tests to pass in the following command, you will need your own `TEST_PROJECT_ID` value**,
> which will be generated for you when you set up a new project on [WalletConnect Cloud](https://cloud.walletconnect.com).

```bash
TEST_PROJECT_ID=YOUR_PROJECT_ID npm run check
```

## Publishing a package

1. Navigate to the package you want to publish, e.g.

```bash
cd <package-dir>/<package-name>
```

2. Bump the package version:

```bash
npm version <major|minor|patch>
```

3. Commit the version bump:

```bash
git commit -am "chore(release): <package-name> <version>"
```

4. Publish the package:

```bash
npm publish # this will run test + build first via the `prepublishOnly` hook
```

## License

MIT
