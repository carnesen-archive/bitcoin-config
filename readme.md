# @carnesen/bitcoin-config [![Build Status](https://travis-ci.com/carnesen/bitcoin-config.svg?branch=master)](https://travis-ci.com/carnesen/bitcoin-config)

A Node.js library for bitcoin server software configuration

## Install

```
$ npm install @carnesen/bitcoin-config
```
The package includes runtime JavaScript files suitable for Node.js >=8 as well as the corresponding TypeScript type declarations.

## Usage

Here's an example that reads and parses the default configuration file (e.g. `~/.bitcoin/bitcoin.conf` on Linux):
```js
const { readConfigFiles, DEFAULT_CONFIG_FILE_PATH } = require('@carnesen/bitcoin-config');

const config = readConfigFiles(DEFAULT_CONFIG_FILE_PATH);

console.log(config);
/*
{ regtest: true,
  daemon: true,
  rpcconnect: '1.2.3.4',
  rpcport: 33333 }
*/
```
In TypeScript, the returned config object is intelligently typed, e.g. `regtest` has type `boolean`.

Here's an example of writing a configuration file:
```ts
const { writeConfigFile, DEFAULT_CONFIG_FILE_PATH } = require('@carnesen/bitcoin-config');

const { changed } = writeConfigFile(DEFAULT_CONFIG_FILE_PATH, {
  regtest: true,
  rpcconnect: '1.2.3.4',
  sections: {
    regtest: {
      rpcport: 33333,
    },
  },
});

const message = changed
  ? `Wrote "${DEFAULT_CONFIG_FILE_PATH}"`
  : `File "${DEFAULT_CONFIG_FILE_PATH}" has not changed`;

console.log(message);
```

Now the file at `DEFAULT_CONFIG_FILE_PATH` has contents:

```ini
# This is a bitcoin configuration file written using @carnesen/bitcoin-config

# Run this node on its own independent test network.
regtest=1

# Send commands to node running on <ip>
rpcconnect=1.2.3.4

[regtest]

# Listen for JSON-RPC connections on this port.
rpcport=33333
```

Suppose now we want to update the configuration file:
```js
const { updateConfigFile, DEFAULT_CONFIG_FILE_PATH } = require('@carnesen/bitcoin-config');

updateConfigFile(DEFAULT_CONFIG_FILE_PATH, {
  daemon: true,
  rpcconnect: null,
});
```
This update means "set the `daemon` property to `true` and unset (delete) the `rpcconnect` property".

## API

### DEFAULT_CONFIG_FILE_PATH
`string`. The (platform-dependent) default path of the bitcoin configuration file, e.g. `~/.bitcoin/bitcoin.conf` on Linux.

### BITCOIN_CONFIG_OPTIONS
`{[optionName: string]: {longName, typeName, description, defaultValue}}`. An object containing all available bitcoin configuration options. The keys are the option names (e.g. `rpcuser`) and the values are objects containing `typeName` etc. Currently there are [147 items](https://github.com/carnesen/bitcoin-config/blob/master/src/bitcoin-config-options.ts) in `BITCOIN_CONFIG_OPTIONS`. If an option is missing, please file an issue or submit a pull request on this project's repository on GitHub.

### BitcoinConfig
A TypeScript type derived from [`BITCOIN_CONFIG_OPTIONS`](#bitcoin_config_options). The type's keys are the option names (e.g. `rpcuser`) and the values are TypeScript analogs of the typeNames. Effectively,

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
A TypeScript interface that extends [`BitcoinConfig`](#bitcoinconfig) with an additional property `sections`. As of [Bitcoin Core v0.17.0](https://bitcoincore.org/en/releases/0.17.0/#configuration-sections-for-testnet-and-regtest), configuration files can have [INI](https://en.wikipedia.org/wiki/INI_file#Format) "sections", for example:
```ini
# bitcoin.conf
rpcuser=carnesen
[main]
rpcpassword=abcd1234
[regtest]
rpcpassword=password
```
This means that when the node is running on the "main" chain `rpcpassword` is "abcd1234", but when it's running in "regtest" mode, `rpcpassword` is simply "password". The `sections` property of a `SectionedConfig` represents those chain-specific configuration options. Not all options are allowed in all sections. For example, the chain selection options `regtest` and `testnet` are only allowed at the top of the file above the sections. Other options such as `acceptnonstdtxn` are not allowed in the "main" section. The `config` argument of `writeConfigFile` described below has type `SectionedConfig`.

### readConfigFile(filePath): sectionedConfig
Reads and parses a bitcoin configuration file from disk

#### filePath
`string`. Absolute path of a bitcoin configuration file.

#### sectionedConfig
`SectionedConfig`. As described [above](#sectionedconfig). The return value represents the full contents of a single bitcoin configuration file.

### readConfigFiles(filePath): bitcoinConfig
Reads, parses, and merges a bitcoin configuration file together with all its [`includeconf`](https://github.com/bitcoin/bitcoin/pull/10267/files) files.

#### filePath
`string`. Absolute path of a bitcoin configuration file.

#### bitcoinConfig
[`BitcoinConfig`](#bitcoinconfig). Whereas `readConfigFile` returns the full contents of a single file, `readConfigFiles` returns the merged content of (potentially) several files. If the configuration file at `filePath` specifies any `includeconf`s, those are read and merged into the original. What makes the result a `BitcoinConfig` not a `SectionedConfig` is that if there is a configuration section for the currently-active chain, that gets merged into the any-chain values from the top part of the config files above the sections. The logic for casting and merging values is meant to reproduce as closely as possible that of Bitcoin Core. So you're getting as a return value the effective "active" configuration.

### writeConfigFile(filePath, sectionedConfig): {changed, serializedConfig, backupFilePath}
Serializes a configuration object and writes it to disk

#### filePath
`string`. Absolute path of a bitcoin configuration file.

#### sectionedConfig
`SectionedConfig`. A configuration object to serialize and write to disk

#### changed
`boolean`. The `writeConfigFile` function is idempotent in the sense that if an existing file at `filePath` has contents identical to what it's about to write, it does not re-write the file. Instead it just returns `changed` as `false` and leaves the file alone.

#### serializedConfig
`string`. The serialized representation of the passed configuration object

#### backupFilePath
`string`. When `writeConfigFile` writes a file to disk, it first move an existing file at that location to `${filePath}.bak`. `backupFilePath` is the absolute path of the backup file.

### getChainName(config): chainName
Extracts a "chain name" (`'main' | 'test' | 'regtest'`) from boolean properties `regtest` and `testnet`.

#### config
```ts
{
  regtest?: boolean;
  testnet?: boolean;
}
```

#### chainName
`'main' | 'test' | 'regtest'`

### setChainName(config, chainName): nextConfig
Returns a new configuration object with the boolean properties `regtest` and `testnet` set appropriately based on the provided "chain name" (`'main' | 'test' | 'regtest'`).

### getDefaultConfig(chainName): defaultConfig
Returns an object containing the default configuration for the specified chain
#### chainName
`'main' | 'test' | 'regtest'`

#### defaultConfig
`DefaultConfig`. A [literal-specific](https://www.typescriptlang.org/docs/handbook/advanced-types.html) object type with default values for the specified chain. For example, the expression `getDefaultConfig('main').rpcport` has value `8332` and a numeric literal type `8332`.

### parseConfig(serializedConfig): sectionedConfig
#### serializedConfig
`string`. A serialized `SectionConfig`.
#### sectionedConfig
`SectionedConfig`. A configuration object parsed from `serializedConfig`.

### serializeConfig(sectionedConfig): serializedConfig
#### sectionedConfig
`SectionedConfig`. A configuration object.
#### serializedConfig
`string`. An INI-serialized version of `sectionedConfig`.

### updateConfigFile(filePath, delta): returnValue
Updates or creates a bitcoin configuration file

#### filePath
`string`. Absolute path of a bitcoin configuration file. Will be created if it does not exist.

#### delta
`NullableSectionedConfig`. Basically a `SectionedConfig` but where every property's type includes `null`. A `delta` property value `null` means "delete this property".

#### returnValue
Same as `writeConfigFile` above.

### toAbsolute(filePath, datadir?, chainName?): absoluteFilePath
Converts a datadir-relative file path into an absolute one.

#### filePath 
`string`. An absolute path (e.g. `'/home/carnesen/.bitcoin/bitcoin.conf'`) or a relative one (e.g. `'bitcoin.conf'`.

#### datadir
`string` (optional). Absolute path of a bitcoin data directory. Default value is platform dependent, e.g. `~/.bitcoin` on Linux.

#### chainName
`'main' | 'regtest' | 'test'` (optional). If provided, `''`, `'/regtest'`, or `'/testnet3'`, respectively, is appended to the absolute path. Blocks and other data is written to these subdirectories.

#### absoluteFilePath
`string`. An absolute file path string.

## More information
This library has over 80 unit tests with >98% coverage. [The tests](src/__tests__) make assertions not only about its runtime behavior but also about its types using [dtslint](https://github.com/Microsoft/dtslint). If you want to see more examples of how it works, that'd be a good place to start. If you encounter any bugs or have any questions or feature requests, please don't hesitate to file an issue or submit a pull request on this project's repository on GitHub.

## License

MIT © [Chris Arnesen](https://www.carnesen.com)
