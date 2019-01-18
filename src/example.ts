import {
  readConfigFiles,
  writeConfigFile,
  SectionedConfig,
  DEFAULT_CONFIG_FILE_NAME,
  toAbsolute,
} from '.';

const sectionedConfig: SectionedConfig = {
  regtest: true,
  daemon: true,
  rpcconnect: '1.2.3.4',
  sections: {
    regtest: {
      rpcport: 33333,
    },
  },
};

const fileContents = writeConfigFile(
  toAbsolute(DEFAULT_CONFIG_FILE_NAME),
  sectionedConfig,
);
console.log(fileContents);
/*
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
*/

const config = readConfigFiles();
console.log(config);
/*
{ regtest: true,
  daemon: true,
  rpcconnect: '1.2.3.4',
  rpcport: 33333 }
*/
