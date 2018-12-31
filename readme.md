# bitcoin-config [![Build Status](https://travis-ci.com/carnesen/bitcoin-config.svg?branch=master)](https://travis-ci.com/carnesen/bitcoin-config)

Constants and utilities related to bitcoin configuration

## Install

```
$ npm install bitcoin-config
```

## Usage

```js
const { readConfigFiles } = require('bitcoin-config');

readConfigFiles();
//=> { rpcuser: 'carnesen', rpcpassword: '12345678' }
```

## API

### readConfigFiles(options = {})

#### options.datadir

Type: `string`

Absolute path to a directory containing bitcoin configuration files.

#### options.conf

Type: `string`

Absolute or datadir-relative path to a configuration file.


## Related

## License

MIT © [Chris Arnesen](https://www.carnesen.com)
