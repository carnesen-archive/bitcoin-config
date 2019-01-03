# bitcoin-config [![Build Status](https://travis-ci.com/carnesen/bitcoin-config.svg?branch=master)](https://travis-ci.com/carnesen/bitcoin-config)

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

Now the file at `DEFAULT_CONFIG_FILE_PATH` has contents:

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
import { readConfigFiles } from '@carnesen/bitcoin-config';

const config = readConfigFiles();
// ^^ Reads from DEFAULT_CONFIG_FILE_PATH by default

console.log(config);
/*
{ regtest: true,
  daemon: true,
  rpcconnect: '1.2.3.4',
  rpcport: 33333 }
*/
```
Continuing that example, you can take the read config and pass it into the `getRpcHref` utility function to infer the full connection string for bitcoin's remote procedure call (RPC) interface:

```ts
const href = getRpcHref(config);
console.log(href);
// http://__cookie__:53a85a5866adbebbf169a1194aadea9e8ef4e8444634d942b4a3b6a6f9d825b1@1.2.3.4:33333/

const url = new URL(href);
...
```

The above examples are written in TypeScript, but this module is distributed as ES2017 JavaScript (suitable for Node.js version >= 8) with TypeScript type declaration (.d.ts) files. These examples would be almost the same in "normal" Node.js JavaScript, but with the `import ... from` replaced by `const ... = require`.

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
Currently this object has 147 (!) items, and I'll endeavor to keep it up to date with each new release of Bitcoin Core. If there are missing options from older versions of the software or other implementations, please let me know by filing an issue or pull request on this project's repository on GitHub.

[Source](https://github.com/carnesen/bitcoin-config/blob/master/src/options.ts)

### BitcoinConfig
A TypeScript type derived from BITCOIN_CONFIG_OPTIONS. The type's keys are the option names (e.g. `rpcuser`) and the values are TypeScript versions of the option's typeName. The derived type looks like:

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
A TypeScript type interface that extends `BitcoinConfig` with an additional property "sections". As of [Bitcoin Core v0.17.0](https://bitcoincore.org/en/releases/0.17.0/#configuration-sections-for-testnet-and-regtest), configuration files can have [INI](https://en.wikipedia.org/wiki/INI_file#Format) "sections". For example:
```ini
# bitcoin.conf
rpcuser=carnesen
[main]
rpcpassword=abcd1234
[regtest]
rpcpassword=password
```
This means that when the node is running on the "main" chain `rpcpassword` is "abcd1234", but when it's running in "regtest" mode, `rpcpassword` is simply "password". The "sections" property of a `SectionedConfig` represents those chain-specific configuration options. Not all options are allowed in all sections. For example, the chain selection options `regtest` and `testnet` are only allowed at the top of the file above the sections.

### readConfigFiles(filePath = DEFAULT_CONFIG_FILE_PATH)
Reads and parses the bitcoin configuration file at `filePath` and returns an object of type `BitcoinConfig`. The logic for casting and merging values is meant to reproduce as closely as possible that of Bitcoin Core. If the configuration file at `filePath` includes any additional external configuration files using the `includeconf` option, those files are read too and merged into the result. See [here](https://github.com/bitcoin/bitcoin/pull/10267/files) for more information on `includeconf`.`readConfigFiles` merges the current chain's config section into the values defined at the top of the file.

### DEFAULT_CONFIG_FILE_PATH
A platform-dependent string constant that is the absolute path of the default location for the bitcoin server software configuration file.

### getRpcHref(config)
Takes an object of type `BitcoinConfig` as input and returns a [URL-constructable](https://developer.mozilla.org/en-US/docs/Web/API/URL) "href" string with all the information necessary to send requests to bitcoind's http remote procedure call (RPC) interface. The logic in this function is meant to reproduce as closely as possible that of the bitcoin-cli RPC client that ships with the bitcoin server software. Among other things, if the config object does not contain an `rpcpassword`, that means that "cookie-based" authentication is enabled. In that case the function reads the username and password from the `rpccookiefile` file written by bitcoind in its `datadir`.

### writeConfigFile(filePath, config)
Writes to `filePath` a `SectionedConfig` object, `config`. As shown in the [usage](#Usage) section above, the serialized configuration file contains the appropriate `name=value` pairs as well as descriptions of the option's meaning.

### getDefaultConfig(chainName)
Takes a chain name "main", "test", or "regtest" as input and returns an object containing the default configuration for that chain. The result is intelligently typed with literal-specific values. For example, the expression `getDefaultConfig('main').rpcport` has value `8332` and type `8332`, a numeric literal type.

## License

MIT © [Chris Arnesen](https://www.carnesen.com)
