# @carnesen/bitcoin-config [![Build Status](https://travis-ci.com/carnesen/bitcoin-config.svg?branch=master)](https://travis-ci.com/carnesen/bitcoin-config)

Constants, utilities, and TypeScript types for bitcoin server software configuration with Node.js.

## Install

```
$ npm install @carnesen/bitcoin-config
```

## Usage

```ts
import { writeConfigFile, DEFAULT_CONFIG_FILE_PATH } from '@carnesen/bitcoin-config';

writeConfigFile(DEFAULT_CONFIG_FILE_PATH, {
  regtest: true,
  daemon: true,
  rpcconnect: '1.2.3.4',
  sections: {
    regtest: {
      rpcport: 33333,
    },
  },
});
```

Now the file at `DEFAULT_CONFIG_FILE_PATH` (the platform-dependent location where bitcoin looks for its config file, e.g. `~/.bitcoin/bitcoin.conf` on Linux) has contents:

```ini
# This file was written using writeConfigFile from @carnesen/bitcoin-config

# Run this node on its own independent test network.
regtest=1

# By default when the node is launched via the bitcoind executable, the process runs
# in the foreground and outputs its logs to the terminal. When "daemon" to "1" (true)
# bitcoind runs in the background. In both cases, the logs are also written to disk.
daemon=1

# Send commands to node running on <ip>
rpcconnect=1.2.3.4

[regtest]

# Listen for JSON-RPC connections on this port.
rpcport=33333
```

More likely you'll be interested in reading bitcoin configuration files. Here's how:

```ts
import { readConfigFiles, getRpcHref } from '@carnesen/bitcoin-config';

const config = readConfigFiles();
// Reads from DEFAULT_CONFIG_FILE_PATH by default

console.log(config);
/*
{ regtest: true,
  daemon: true,
  rpcconnect: '1.2.3.4',
  rpcport: 33333 }
*/
```
Continuing that example, you can take `config` and pass it into the `getRpcHref` utility function to get a complete "href" connection string for bitcoin's remote procedure call (RPC) interface:

```ts
const href = getRpcHref(config);
console.log(href);
// http://__cookie__:53a85a58f9d825b1@1.2.3.4:33333/
```

The format of that "href" string is `http://<username>:<password>@<hostname>:<port>/` as defined by the [WHATWG URL](https://nodejs.org/api/url.html#url_the_whatwg_url_api) standard. In Node.js >=8, you can parse it as `new require('url').URL(href)`. In Node.js >=10, `URL` is defined globally and it's as easy as `new URL(href)`.

This project is written in TypeScript with as-specific-as-possible typings, and you'll get the most benefit from consuming it from TypeScript. The npm-published code however is ES2017 JavaScript with CommonJS modules suitable use with Node.js >=8. These examples would be almost the same in "vanilla" Node.js, just replace `import ... from` with `const ... = require`.

## Named exports

### BITCOIN_CONFIG_OPTIONS
An object containing specifications for all available bitcoin configuration options. The object's keys are the option names (e.g. `rpcuser`) and the values are of the form:
```ts
{
  longName: 'rpc user',
  typeName: 'string',
  description: ['Specify username for RPC http basic authentication'],
  defaultValue: '',
}
```
Currently this object has 147 (!) items, and we'll endeavor to keep it up to date with each new release of Bitcoin Core. If there are missing options from older versions of the software or other implementations, please let us know by filing an issue or pull request on this project's repository on GitHub.

[See the full list here in the source code](https://github.com/carnesen/bitcoin-config/blob/master/src/options.ts).

### BitcoinConfig
A TypeScript type derived from `BITCOIN_CONFIG_OPTIONS`. The type's keys are the option names (e.g. `rpcuser`) and the values are TypeScript analogs of the typeNames, e.g.:

```ts
type BitcoinConfig = {
  testnet: boolean;
  timeout: number;
  rpcuser: string;
  rpcauth: string[];
  ...
}
```

### SectionedConfig
A TypeScript type interface that extends `BitcoinConfig` with an additional property "sections". As of [Bitcoin Core v0.17.0](https://bitcoincore.org/en/releases/0.17.0/#configuration-sections-for-testnet-and-regtest), configuration files can have [INI](https://en.wikipedia.org/wiki/INI_file#Format) "sections", for example:
```ini
# bitcoin.conf
rpcuser=carnesen
[main]
rpcpassword=abcd1234
[regtest]
rpcpassword=password
```
This means that when the node is running on the "main" chain `rpcpassword` is "abcd1234", but when it's running in "regtest" mode, `rpcpassword` is simply "password". The "sections" property of a `SectionedConfig` represents those chain-specific configuration options. Not all options are allowed in all sections. For example, the chain selection options `regtest` and `testnet` are only allowed at the top of the file above the sections. Other options such as `acceptnonstdtxn` are not allowed in the "main" section. The `config` argument of `writeConfigFile` described below has type `SectionedConfig`.

### DEFAULT_CONFIG_FILE_PATH
A platform-dependent string constant that is the absolute path of the default location for the bitcoin server software configuration file, e.g. `~/.bitcoin/bitcoin.conf` on Linux.

### readConfigFiles(filePath = DEFAULT_CONFIG_FILE_PATH)
Reads and parses the bitcoin configuration file at the absolute path `filePath` and returns an object of type `BitcoinConfig`. The logic for casting and merging values is meant to reproduce as closely as possible that of Bitcoin Core. If the configuration file at `filePath` includes any additional external configuration files using the `includeconf` option, those are read too and merged into the result. See [here](https://github.com/bitcoin/bitcoin/pull/10267/files) for more information on `includeconf`. After reading the provided `filePath` and its `includeconf`s, `readConfigFiles` merges the current chain's config section if there is one into the chain-independent values defined at the top of the files and returns the merged result.

### getRpcHref(config)
Takes an object of type `BitcoinConfig` as input (specifically `datadir`, `regtest`, `testnet`, `rpccookiefile`, `rpcconnect`, `rpcpassword`, `rpcuser`, and `rpcport`) and returns a [URL](https://nodejs.org/api/url.html#url_the_whatwg_url_api) "href" string that can be used to connect to bitcoind's http remote procedure call (RPC) interface. The logic in this function is meant to reproduce as closely as possible that of the bitcoin-cli client that ships with the bitcoin server software. Among other things, if the config object does not contain an `rpcpassword`, that means that "cookie-based" authentication is enabled. In that case `getRpcHref` reads the username and password from the `rpccookiefile` file written to `datadir` on startup.

### writeConfigFile(filePath, config)
Writes to absolute path `filePath` a `SectionedConfig` object, `config`. As shown in the [usage](#Usage) section above, the serialized configuration written to disk contains the appropriate `name=value` pairs as well as descriptions of the options meanings. An option included in `config` with value `undefined` is serialized as a comment `#name=`. The return value of `writeConfigFile` is the serialized configuration string. This function is idempotent in the sense that if an existing file at `filePath` has contents identical to what it's about to write, it does not re-write the file. If the file exists and its contents have changed, it moves the old file to `${filePath}.bak` before writing the new one.

### getDefaultConfig(chainName)
Takes a chain name "main", "test", or "regtest" as input and returns an object containing the default configuration for that chain. The result is intelligently typed with literal-specific values. For example, the expression `getDefaultConfig('main').rpcport` has value `8332` and a [numeric literal type](https://www.typescriptlang.org/docs/handbook/advanced-types.html) `8332`.

## More information
This library has over 80 unit tests with >99% coverage. [The tests](src/__tests__) make assertions not only about its runtime behavior but also about its types using [dtslint](https://github.com/Microsoft/dtslint). If you want to see more examples of how it works, that'd be a good place to start. If you encounter any bugs or have any questions or feature requests, please don't hesitate to file an issue or submit a pull request on this project's repository on GitHub. A quick note about security, this project has zero (non-dev) dependencies, and its maintainer (that's me!) is VERY security conscious, particularly so after recent npm supply-chain attacks targeting bitcoin wallets. I've enabled two-factor authentication on both my GitHub and npm accounts, and I pledge to keep maintaining this project myself for the forseeable future. Happy coding! #BUIDL

## License

MIT © [Chris Arnesen](https://www.carnesen.com)
