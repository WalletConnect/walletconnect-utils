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

3. Ensure all packages lint, build, and test successfully:

> **For all tests to pass in the following command, you will need your own `TEST_PROJECT_ID` value**,
> which will be generated for you when you set up a new project on [WalletConnect Cloud](https://cloud.walletconnect.com).

```bash
# `check` will call `turbo run prettier lint build test` under the hood.
TEST_PROJECT_ID=YOUR_PROJECT_ID npm run check
```

## Publishing a package

1. To register a change relevant for a package's release, call `changeset`:

```bash
npm run changeset
```

In the interactive shell:

- select the relevant package(s) with the `<space>` bar where changes have been made
- select (via `<space>`) which packages should receive a major/minor/patch version bump. To simply skip a version level, hit `<enter>` without selecting anything.
- Confirm the changes, which will auto-create a changeset file inside the `.changeset` directory

2. Version and publish the changeset of the affected packages:

```bash
# will run `changeset version && turbo pre-publish && changeset publish` under the hood.
npm run npm-publish
```

## License

MIT
