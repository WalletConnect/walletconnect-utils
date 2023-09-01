# `mixpanel-pino-transport`

Utility to add mixpanel logs through pino

## Installation
```sh
npm i @walletconnect/mixpanel-pino-transport mixpanel-browser
```

## Usage
```ts
import pino from "pino";
import mixpanel from 'mixpanel-browser'

mixpanel.identity("unique user id")

const logger = pino({
    transport: {
        target: "mixpanel-pino-transport",
        options: {
            token: "<MIXPANEL_TOKEN>"
        }
    },
});
```


